/**
 * STRIPE_SECRET_KEY is a restricted live key with read access only:
 * Customers, Subscriptions, Checkout Sessions, Prices, Products, Invoices.
 * This module only issues GET requests. It does not create, update, or
 * cancel anything in Stripe.
 */

const READ_PREFIXES = [
  "/customers/",
  "/subscriptions/",
  "/checkout/sessions/",
  "/invoices/",
  "/prices/",
  "/products/",
]

export function assertStripeReadPath(path: string): void {
  if (!path.startsWith("/") || path.includes("?") || path.includes("..") || path.endsWith("/")) {
    throw new Error("Stripe read path rejected")
  }
  if (!READ_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    throw new Error("Stripe read path rejected")
  }
  const id = path.slice(path.lastIndexOf("/") + 1)
  if (!/^[A-Za-z0-9_]+$/.test(id)) throw new Error("Stripe read path rejected")
}

export async function stripeGet(path: string): Promise<unknown> {
  assertStripeReadPath(path)
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!response.ok) {
    throw new Error(`Stripe read failed (${response.status})`)
  }
  return response.json() as Promise<unknown>
}
