import { createHmac, timingSafeEqual } from "node:crypto"

const TOLERANCE_SECONDS = 300

export class StripeSignatureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StripeSignatureError"
  }
}

/**
 * Verify a Stripe webhook signature (t + v1 HMAC).
 * STRIPE_WEBHOOK_SECRET is the endpoint secret, not the API key.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): void {
  if (!header) throw new StripeSignatureError("missing signature")
  if (!secret) throw new StripeSignatureError("missing secret")

  const parts = new Map<string, string[]>()
  for (const piece of header.split(",")) {
    const eq = piece.indexOf("=")
    if (eq <= 0) continue
    const key = piece.slice(0, eq)
    const value = piece.slice(eq + 1)
    const list = parts.get(key) ?? []
    list.push(value)
    parts.set(key, list)
  }

  const timestamps = parts.get("t") ?? []
  const signatures = parts.get("v1") ?? []
  if (timestamps.length !== 1 || signatures.length === 0) {
    throw new StripeSignatureError("malformed signature")
  }

  const timestamp = Number(timestamps[0])
  if (!Number.isFinite(timestamp)) throw new StripeSignatureError("bad timestamp")
  if (Math.abs(nowSeconds - timestamp) > TOLERANCE_SECONDS) {
    throw new StripeSignatureError("stale signature")
  }

  const expected = createHmac("sha256", secret).update(`${timestamps[0]}.${payload}`, "utf8").digest("hex")
  const expectedBuf = Buffer.from(expected, "utf8")
  const ok = signatures.some((signature) => {
    const actual = Buffer.from(signature, "utf8")
    if (actual.length !== expectedBuf.length) return false
    return timingSafeEqual(actual, expectedBuf)
  })
  if (!ok) throw new StripeSignatureError("signature mismatch")
}
