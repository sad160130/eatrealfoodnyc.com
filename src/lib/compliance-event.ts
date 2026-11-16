export type CompliancePlan = "monthly" | "yearly"

export type CompliancePrices = {
  monthly: string
  yearly: string
}

export function compliancePricesFromEnv(env: NodeJS.ProcessEnv = process.env): CompliancePrices {
  const monthly = env.STRIPE_PRICE_MONTHLY?.trim() ?? ""
  const yearly = env.STRIPE_PRICE_YEARLY?.trim() ?? ""
  if (!monthly || !yearly) {
    throw new Error("STRIPE_PRICE_MONTHLY and STRIPE_PRICE_YEARLY are required")
  }
  return { monthly, yearly }
}

export function planForPrices(priceIds: string[], prices: CompliancePrices): CompliancePlan | null {
  if (priceIds.includes(prices.monthly)) return "monthly"
  if (priceIds.includes(prices.yearly)) return "yearly"
  return null
}

export type StripeEvent = {
  id?: string
  type?: string
  data?: { object?: Record<string, unknown> }
}

export type StoredSubscription = {
  stripe_customer_id: string
  stripe_subscription_id: string
  email: string
  plan: CompliancePlan
  status: string
  current_period_end: Date | null
}

export type StripeGetter = (path: string) => Promise<unknown>

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" ? (value as Record<string, unknown>) : null
}

function stripeId(value: unknown, prefix: string): string | null {
  if (typeof value === "string") {
    return value.startsWith(prefix) && /^[A-Za-z0-9_]+$/.test(value) ? value : null
  }
  const record = asRecord(value)
  return record ? stripeId(record.id, prefix) : null
}

function priceIdsOf(subscription: Record<string, unknown>): string[] {
  const ids: string[] = []
  const items = asRecord(subscription.items)
  const data = Array.isArray(items?.data) ? items.data : []
  for (const item of data) {
    const record = asRecord(item)
    if (!record) continue
    const price = record.price
    if (typeof price === "string") ids.push(price)
    else {
      const priceId = stripeId(price, "price_")
      if (priceId) ids.push(priceId)
    }
    const planId = stripeId(record.plan, "price_")
    if (planId) ids.push(planId)
  }
  const planId = stripeId(subscription.plan, "price_")
  if (planId) ids.push(planId)
  return ids
}

function periodEnd(subscription: Record<string, unknown>): Date | null {
  const top = subscription.current_period_end
  const items = asRecord(subscription.items)
  const first = Array.isArray(items?.data) ? asRecord(items.data[0]) : null
  const unix = typeof top === "number" ? top : typeof first?.current_period_end === "number" ? first.current_period_end : null
  if (unix == null || !Number.isFinite(unix)) return null
  return new Date(unix * 1000)
}

function emailHint(record: Record<string, unknown>): string | null {
  if (typeof record.customer_email === "string") return record.customer_email
  const details = asRecord(record.customer_details)
  if (typeof details?.email === "string") return details.email
  return null
}

function usableEmail(value: string | null | undefined): string | null {
  const email = value?.trim() ?? ""
  return email.includes("@") ? email : null
}

async function customerEmail(customerId: string, get: StripeGetter, hint: string | null): Promise<string | null> {
  const hinted = usableEmail(hint)
  if (hinted) return hinted
  const customer = asRecord(await get(`/customers/${customerId}`))
  if (!customer || customer.deleted === true) return null
  return usableEmail(typeof customer.email === "string" ? customer.email : null)
}

async function subscriptionFrom(value: unknown, get: StripeGetter): Promise<Record<string, unknown>> {
  const id = stripeId(value, "sub_")
  if (!id) throw new Error("Stripe subscription id missing")
  const record = asRecord(value)
  if (record && typeof record.status === "string" && priceIdsOf(record).length > 0) return record
  const fetched = asRecord(await get(`/subscriptions/${id}`))
  if (!fetched) throw new Error("Stripe subscription missing")
  return fetched
}

export async function applyStripeEvent(
  event: StripeEvent,
  deps: {
    get: StripeGetter
    prices: CompliancePrices
    existingEmail: (subscriptionId: string) => Promise<string | null>
    save: (row: StoredSubscription) => Promise<void>
  }
): Promise<"stored" | "ignored"> {
  const type = event.type
  const object = event.data?.object
  if (!type || !object) throw new Error("Stripe event is missing a type or object")

  let subscriptionValue: unknown = null
  let hint: string | null = null

  if (type === "checkout.session.completed") {
    if (object.mode !== "subscription") return "ignored"
    subscriptionValue = object.subscription
    hint = emailHint(object)
  } else if (
    type === "customer.subscription.created" ||
    type === "customer.subscription.updated" ||
    type === "customer.subscription.deleted"
  ) {
    subscriptionValue = object
  } else if (type === "invoice.paid" || type === "invoice.payment_failed") {
    if (!object.subscription) return "ignored"
    subscriptionValue = object.subscription
    hint = emailHint(object)
  } else {
    return "ignored"
  }

  const subscription = await subscriptionFrom(subscriptionValue, deps.get)
  const subscriptionId = stripeId(subscription.id, "sub_")
  const customerId = stripeId(subscription.customer, "cus_")
  if (!subscriptionId || !customerId) throw new Error("Stripe subscription is missing ids")
  if (typeof subscription.status !== "string" || subscription.status.length === 0) {
    throw new Error("Stripe subscription is missing a status")
  }

  const plan = planForPrices(priceIdsOf(subscription), deps.prices)
  if (!plan) return "ignored"

  const email = (await customerEmail(customerId, deps.get, hint)) ?? (await deps.existingEmail(subscriptionId))
  if (!email) throw new Error("Stripe customer is missing an email")

  await deps.save({
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    email,
    plan,
    status: subscription.status,
    current_period_end: periodEnd(subscription),
  })
  return "stored"
}
