import { prisma } from "@/lib/db"
import { applyStripeEvent, compliancePricesFromEnv, type StripeEvent } from "@/lib/compliance-event"
import { stripeGet } from "@/lib/stripe-read"
import { StripeSignatureError, verifyStripeSignature } from "@/lib/stripe-signature"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const payload = await request.text()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: "webhook secret is not set" }, { status: 500 })
  }
  try {
    verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)
  } catch (error) {
    if (error instanceof StripeSignatureError) {
      return Response.json({ error: "invalid signature" }, { status: 400 })
    }
    throw error
  }

  let event: StripeEvent
  try {
    event = JSON.parse(payload) as StripeEvent
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 })
  }

  try {
    const result = await applyStripeEvent(event, {
      get: stripeGet,
      prices: compliancePricesFromEnv(),
      existingEmail: async (subscriptionId) => {
        const row = await prisma.complianceSubscription.findUnique({
          where: { stripe_subscription_id: subscriptionId },
          select: { email: true },
        })
        return row?.email ?? null
      },
      save: async (row) => {
        await prisma.complianceSubscription.upsert({
          where: { stripe_subscription_id: row.stripe_subscription_id },
          create: row,
          update: {
            stripe_customer_id: row.stripe_customer_id,
            email: row.email,
            plan: row.plan,
            status: row.status,
            current_period_end: row.current_period_end,
          },
        })
      },
    })
    console.info(JSON.stringify({ event: "compliance_webhook", id: event.id ?? null, type: event.type ?? null, result }))
    return Response.json({ received: true, result })
  } catch (error) {
    console.error(JSON.stringify({ event: "compliance_webhook_failed", id: event.id ?? null, type: event.type ?? null }))
    const message = error instanceof Error ? error.message : "webhook failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
