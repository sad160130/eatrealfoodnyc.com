import { createHmac } from "node:crypto"
import { assertStripeReadPath } from "../lib/stripe-read"
import { StripeSignatureError, verifyStripeSignature } from "../lib/stripe-signature"
import {
  inspectionLeadCsv,
  isNewOpening,
  leadReasons,
  newOpeningCsv,
  type RestaurantFileRow,
} from "../lib/compliance-csv"
import { applyStripeEvent, planForPrices, type StoredSubscription } from "../lib/compliance-event"
import { complianceSubject, deliverComplianceWeek, mondayKey, mondayLabel } from "../lib/compliance-mail"
import { cronAuthorized } from "../lib/compliance-weekly"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

const secret = "whsec_test_secret"
const now = 1_700_000_000

function sign(payload: string, timestamp = now): string {
  const v1 = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex")
  return `t=${timestamp},v1=${v1}`
}

verifyStripeSignature("{}", sign("{}"), secret, now)
assert(true, "a matching signature verifies")

let rejected = false
try {
  verifyStripeSignature("{}", sign("nope"), secret, now)
} catch (error) {
  rejected = error instanceof StripeSignatureError
}
assert(rejected, "a tampered body is rejected")

rejected = false
try {
  verifyStripeSignature("{}", sign("{}", now - 301), secret, now)
} catch (error) {
  rejected = error instanceof StripeSignatureError
}
assert(rejected, "a stale signature is rejected")

assert(cronAuthorized("Bearer monday", "monday"), "the cron bearer matches")
assert(!cronAuthorized("Bearer monday", "other"), "a wrong cron secret is rejected")
assert(!cronAuthorized(null, "monday"), "a missing cron header is rejected")
assert(!cronAuthorized("Bearer monday", undefined), "a missing CRON_SECRET is rejected")

let pathRejected = false
try {
  assertStripeReadPath("/charges/ch_123")
} catch {
  pathRejected = true
}
assert(pathRejected, "a Stripe write-shaped path is rejected")
pathRejected = false
try {
  assertStripeReadPath("/customers/cus_123?expand[]=sources")
} catch {
  pathRejected = true
}
assert(pathRejected, "a Stripe read cannot carry a query")
assertStripeReadPath("/subscriptions/sub_123")
assert(true, "a subscription read path is allowed")

const base: RestaurantFileRow = {
  name: "Sample",
  address: "1 Main St",
  borough: "Brooklyn",
  neighborhood: "Williamsburg",
  phone: "2125550100",
  inspection_grade: "A",
  inspection_score: 10,
  inspection_date: "11/10/2024",
  business_status: "OPERATIONAL",
  is_published: true,
}

assert(leadReasons(base).length === 0, "a Grade A operational restaurant is not a lead")
assert(
  leadReasons({ inspection_grade: "Z", inspection_score: 30, business_status: "CLOSED" }).join("|") ===
    "grade-pending|high-score|not-operational",
  "a pending high-score closure lists every reason"
)
assert(leadReasons({ inspection_grade: "P", inspection_score: null, business_status: "OPERATIONAL" }).join("|") === "grade-pending", "P is grade pending")
assert(leadReasons({ inspection_grade: "A", inspection_score: 28, business_status: "OPERATIONAL" }).join("|") === "high-score", "28 points is a lead")
assert(leadReasons({ inspection_grade: "A", inspection_score: null, business_status: null }).length === 0, "a missing status is not a closure")
assert(leadReasons({ inspection_grade: "A", inspection_score: null, business_status: "" }).join("|") === "not-operational", "a blank status is present and not operational")

assert(!isNewOpening(base), "a dated Grade A is not an opening")
assert(
  isNewOpening({ ...base, inspection_date: null, inspection_grade: "N" }),
  "a published operational listing with no date and no letter grade is an opening"
)
assert(!isNewOpening({ ...base, is_published: false, inspection_date: null, inspection_grade: null }), "an unpublished restaurant is not an opening")
assert(!isNewOpening({ ...base, inspection_date: "", inspection_grade: "A" }), "Grade A with a blank date is not an opening")
assert(isNewOpening({ ...base, inspection_date: "  ", inspection_grade: "Z" }), "a blank date with grade Z is an opening")

const leads = inspectionLeadCsv([
  { ...base, name: "Beta, Cafe", inspection_grade: "Z", inspection_score: 4 },
  { ...base, name: "Alpha", inspection_grade: "A", inspection_score: 28, phone: null },
])
assert(leads.startsWith("lead_type,name,address,borough,neighborhood,phone,inspection_grade,inspection_score,inspection_date,business_status\n"), "lead header matches")
assert(leads.includes("\nhigh-score,Alpha,1 Main St,Brooklyn,Williamsburg,,A,28,11/10/2024,OPERATIONAL\n"), "a high score row keeps a blank phone")
assert(leads.includes('"Beta, Cafe"'), "a comma in the name is quoted")
assert(leads.indexOf("Alpha") < leads.indexOf("Beta"), "lead rows are sorted by name")

const openings = newOpeningCsv([
  { ...base, name: "New Spot", inspection_date: null, inspection_grade: null },
  base,
])
const openingLines = openings.trim().split("\n")
assert(openingLines.length === 2, "Grade A is left out of openings")
assert(openingLines[1].split(",")[5] === "", "pre_permit is empty")
assert(openingLines[0].startsWith("name,address,borough,neighborhood,phone,pre_permit,inspection_grade,inspection_date"), "opening header matches")

assert(planForPrices(["price_monthly"], { monthly: "price_monthly", yearly: "price_yearly" }) === "monthly", "the monthly price matches")
assert(planForPrices(["price_yearly"], { monthly: "price_monthly", yearly: "price_yearly" }) === "yearly", "the yearly price matches")
assert(planForPrices(["price_other"], { monthly: "price_monthly", yearly: "price_yearly" }) === null, "another product is ignored")

const prices = { monthly: "price_monthly", yearly: "price_yearly" }
const mondayUtc = new Date("2026-11-16T13:00:00.000Z")
assert(mondayKey(mondayUtc) === "2026-11-16", "the Monday key uses the New York date")
assert(mondayLabel(mondayUtc) === "Nov 16, 2026", "the subject date is Mon D, YYYY")
assert(mondayKey(new Date("2026-11-16T04:00:00.000Z")) === "2026-11-15", "early Monday UTC is still Sunday in New York")
assert(complianceSubject(mondayUtc) === "NYC Restaurant Compliance Weekly, Nov 16, 2026", "the subject names the Monday")

async function apply(event: Parameters<typeof applyStripeEvent>[0], get: (path: string) => Promise<unknown>) {
  const saved: StoredSubscription[] = []
  const result = await applyStripeEvent(event, {
    get,
    prices,
    existingEmail: async () => null,
    save: async (row) => {
      saved.push(row)
    },
  })
  return { result, saved }
}

async function main() {
const payment = await apply(
  { type: "checkout.session.completed", data: { object: { mode: "payment" } } },
  async () => {
    throw new Error("should not read Stripe")
  }
)
assert(payment.result === "ignored" && payment.saved.length === 0, "a one-time checkout is ignored")

const stored = await apply(
  {
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        current_period_end: 1_800_000_000,
        items: { data: [{ price: { id: "price_monthly" } }] },
      },
    },
  },
  async (path) => {
    assert(path === "/customers/cus_123", "the customer email is a read")
    return { email: "buyer@example.com" }
  }
)
assert(stored.result === "stored" && stored.saved[0]?.plan === "monthly" && stored.saved[0]?.email === "buyer@example.com", "a monthly subscription is stored")
assert(stored.saved[0]?.current_period_end?.toISOString() === "2027-01-15T08:00:00.000Z", "the period end is stored")

const other = await apply(
  {
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_999",
        customer: "cus_999",
        status: "active",
        items: { data: [{ price: { id: "price_other" } }] },
      },
    },
  },
  async () => {
    throw new Error("should not read a customer for another product")
  }
)
assert(other.result === "ignored", "a subscription for another price is ignored")

const failed = await apply(
  { type: "invoice.payment_failed", data: { object: { subscription: "sub_123", customer_email: "buyer@example.com" } } },
  async (path) => {
    assert(path === "/subscriptions/sub_123", "a failed invoice reads the subscription")
    return {
      id: "sub_123",
      customer: "cus_123",
      status: "past_due",
      items: { data: [{ price: { id: "price_yearly" }, current_period_end: 1_800_000_000 }] },
    }
  }
)
assert(failed.saved[0]?.status === "past_due" && failed.saved[0]?.plan === "yearly", "a failed invoice stores the subscription status")

const noInvoiceSub = await apply(
  { type: "invoice.paid", data: { object: { customer_email: "buyer@example.com" } } },
  async () => {
    throw new Error("should not read Stripe")
  }
)
assert(noInvoiceSub.result === "ignored", "an invoice with no subscription is ignored")

const canceled = await apply(
  {
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_123",
        customer: "cus_123",
        status: "canceled",
        items: { data: [{ price: { id: "price_monthly" } }] },
      },
    },
  },
  async () => ({ email: "buyer@example.com" })
)
assert(canceled.saved[0]?.status === "canceled", "a deleted subscription is stored as canceled")

let missingEmail = false
try {
  await apply(
    {
      type: "checkout.session.completed",
      data: { object: { mode: "subscription", subscription: "sub_123" } },
    },
    async (path) => {
      if (path === "/subscriptions/sub_123") {
        return { id: "sub_123", customer: "cus_123", status: "active", items: { data: [{ price: { id: "price_monthly" } }] } }
      }
      return { email: null }
    }
  )
} catch {
  missingEmail = true
}
assert(missingEmail, "a subscription with no email is not stored")

const delivery = await deliverComplianceWeek({
  now: mondayUtc,
  subscribers: [
    { stripe_subscription_id: "sub_sent", email: "sent@example.com" },
    { stripe_subscription_id: "sub_new", email: "new@example.com" },
    { stripe_subscription_id: "sub_fail", email: "fail@example.com" },
  ],
  alreadySent: async (id) => id === "sub_sent",
  send: async (email) => {
    if (email === "fail@example.com") throw new Error("resend down")
  },
  record: async (id) => {
    assert(id !== "sub_fail", "a failed send is not recorded")
  },
})
assert(delivery.sent === 1 && delivery.skipped === 1 && delivery.failed === 1, "a retry skips recorded sends and keeps failures unrecorded")

process.env.STRIPE_WEBHOOK_SECRET = secret
process.env.STRIPE_PRICE_MONTHLY = prices.monthly
process.env.STRIPE_PRICE_YEARLY = prices.yearly
const { POST } = await import("../app/api/stripe/compliance-weekly/route")
const bad = await POST(
  new Request("https://www.eatrealfoodnyc.com/api/stripe/compliance-weekly", {
    method: "POST",
    body: "{}",
    headers: { "stripe-signature": sign("{}", now - 1000) },
  })
)
assert(bad.status === 400, "the webhook route returns 400 for a bad signature")

const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { mode: "payment" } } })
const current = Math.floor(Date.now() / 1000)
const ok = await POST(
  new Request("https://www.eatrealfoodnyc.com/api/stripe/compliance-weekly", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": sign(payload, current) },
  })
)
assert(ok.status === 200, "a verified non-subscription event is acknowledged")
const body = (await ok.json()) as { result?: string }
assert(body.result === "ignored", "the acknowledged event is ignored")

const { GET } = await import("../app/api/cron/compliance-weekly/route")
const denied = await GET(new Request("https://www.eatrealfoodnyc.com/api/cron/compliance-weekly"))
assert(denied.status === 401, "the cron route rejects a request without CRON_SECRET")
}

main()
