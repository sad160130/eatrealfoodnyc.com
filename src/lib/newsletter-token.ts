import { createHmac, timingSafeEqual } from "node:crypto"

/** Confirm links stop working after 7 days. Unsubscribe links do not expire. */
export const NEWSLETTER_CONFIRM_TTL_SECONDS = 7 * 24 * 60 * 60
/** Clock skew allowed when a token's issued-at is slightly ahead of this server. */
export const NEWSLETTER_TOKEN_SKEW_SECONDS = 5 * 60

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_TOKEN_LENGTH = 2000

export type NewsletterPurpose = "confirm" | "unsubscribe"

export type NewsletterToken =
  | { ok: true; email: string; purpose: NewsletterPurpose; issuedAt: number }
  | { ok: false; reason: "invalid" | "expired" }

type Payload = {
  email: string
  purpose: NewsletterPurpose
  iat: number
}

export function isNewsletterEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && EMAIL.test(value)
}

function signingSecret(secret: string | undefined): string | null {
  const value = secret === undefined ? process.env.CRON_SECRET : secret
  if (!value) return null
  return value
}

function encodePayload(payload: Payload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
}

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url")
}

function signaturesMatch(actual: string, expected: string): boolean {
  const left = Buffer.from(actual)
  const right = Buffer.from(expected)
  if (left.length !== right.length || left.length === 0) return false
  return timingSafeEqual(left, right)
}

function invalid(): NewsletterToken {
  return { ok: false, reason: "invalid" }
}

function readPayload(body: string): Payload | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
    if (!parsed || typeof parsed !== "object") return null
    const record = parsed as Record<string, unknown>
    if (typeof record.email !== "string" || !isNewsletterEmail(record.email)) return null
    if (record.purpose !== "confirm" && record.purpose !== "unsubscribe") return null
    if (typeof record.iat !== "number" || !Number.isInteger(record.iat) || record.iat < 0) return null
    return { email: record.email, purpose: record.purpose, iat: record.iat }
  } catch {
    return null
  }
}

/**
 * Stateless token: base64url(JSON { email, purpose, iat }) + HMAC-SHA256.
 * `issuedAt` is unix milliseconds. The payload stores unix seconds.
 * Returns null when the address is unusable or CRON_SECRET is missing.
 */
export function signNewsletterToken(input: {
  email: string
  purpose: NewsletterPurpose
  issuedAt?: number
  secret?: string
}): string | null {
  const secret = signingSecret(input.secret)
  const email = input.email.trim().toLowerCase()
  if (!secret || !isNewsletterEmail(email)) return null
  const issuedAt = input.issuedAt ?? Date.now()
  if (!Number.isFinite(issuedAt) || issuedAt < 0) return null
  const payload: Payload = {
    email,
    purpose: input.purpose,
    iat: Math.floor(issuedAt / 1000),
  }
  const body = encodePayload(payload)
  return `${body}.${signBody(body, secret)}`
}

/** Verify a token. Pass `purpose` to reject a confirm link used as unsubscribe, or the reverse. */
export function verifyNewsletterToken(
  token: string,
  options?: { secret?: string; now?: number; purpose?: NewsletterPurpose }
): NewsletterToken {
  if (typeof token !== "string") return invalid()
  const trimmed = token.trim()
  if (!trimmed || trimmed.length > MAX_TOKEN_LENGTH) return invalid()
  const dot = trimmed.indexOf(".")
  if (dot <= 0 || dot !== trimmed.lastIndexOf(".")) return invalid()
  const secret = signingSecret(options?.secret)
  if (!secret) return invalid()

  const body = trimmed.slice(0, dot)
  const signature = trimmed.slice(dot + 1)
  if (!signaturesMatch(signature, signBody(body, secret))) return invalid()

  const payload = readPayload(body)
  if (!payload) return invalid()
  if (options?.purpose && payload.purpose !== options.purpose) return invalid()

  const nowSec = Math.floor((options?.now ?? Date.now()) / 1000)
  if (payload.iat > nowSec + NEWSLETTER_TOKEN_SKEW_SECONDS) return invalid()
  if (
    payload.purpose === "confirm" &&
    nowSec - payload.iat > NEWSLETTER_CONFIRM_TTL_SECONDS
  ) {
    return { ok: false, reason: "expired" }
  }

  return { ok: true, email: payload.email, purpose: payload.purpose, issuedAt: payload.iat }
}
