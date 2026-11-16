import { createHmac } from "node:crypto"
import {
  NEWSLETTER_CONFIRM_TTL_SECONDS,
  NEWSLETTER_TOKEN_SKEW_SECONDS,
  signNewsletterToken,
  verifyNewsletterToken,
} from "../lib/newsletter-token"
import { NEWSLETTER_RATE_WINDOW_MS, allowNewsletterConfirmResend, releaseNewsletterConfirmResend } from "../lib/newsletter-rate-limit"
import {
  NEWSLETTER_BATCH_LIMIT,
  NEWSLETTER_DAILY_LIMIT,
  noteNewsletterQuotaUsed,
  releaseNewsletterSendQuota,
  resetNewsletterQuotaForTests,
  takeNewsletterSendQuota,
} from "../lib/newsletter-quota"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

const secret = "test-cron-secret"
const nowMs = 1_700_000_000_000
const email = "Ada@Example.com"

function sign(purpose: "confirm" | "unsubscribe", at = nowMs, address = email) {
  const token = signNewsletterToken({ email: address, purpose, issuedAt: at, secret })
  if (!token) throw new Error("expected a token")
  return token
}

const confirm = sign("confirm")
const [body, sig] = confirm.split(".")
const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
  email: string
  purpose: string
  iat: number
}
assert(payload.email === "ada@example.com", "payload email is normalized")
assert(payload.purpose === "confirm", "payload purpose is confirm")
assert(payload.iat === Math.floor(nowMs / 1000), "payload issued-at is unix seconds")
assert(
  sig === createHmac("sha256", secret).update(body).digest("base64url"),
  "signature is HMAC-SHA256 of the payload"
)
assert(!confirm.includes(secret), "the token does not contain the secret")

const verified = verifyNewsletterToken(confirm, { secret, now: nowMs, purpose: "confirm" })
assert(verified.ok && verified.email === "ada@example.com" && verified.purpose === "confirm", "a fresh confirm token verifies")

const unsubscribe = sign("unsubscribe")
const unsub = verifyNewsletterToken(unsubscribe, { secret, now: nowMs, purpose: "unsubscribe" })
assert(unsub.ok && unsub.purpose === "unsubscribe", "an unsubscribe token verifies")
assert(!verifyNewsletterToken(confirm, { secret, now: nowMs, purpose: "unsubscribe" }).ok, "a confirm token is not an unsubscribe token")
assert(!verifyNewsletterToken(unsubscribe, { secret, now: nowMs, purpose: "confirm" }).ok, "an unsubscribe token is not a confirm token")

const flipped = `${body}.${sig.slice(0, -1)}${sig.endsWith("a") ? "b" : "a"}`
assert(verifyNewsletterToken(flipped, { secret, now: nowMs }).reason === "invalid", "a tampered signature is rejected")

const tamperedBody = Buffer.from(JSON.stringify({ ...payload, email: "other@example.com" }), "utf8").toString("base64url")
assert(
  verifyNewsletterToken(`${tamperedBody}.${sig}`, { secret, now: nowMs }).reason === "invalid",
  "a tampered email is rejected"
)
assert(verifyNewsletterToken(confirm, { secret: "other-secret", now: nowMs }).reason === "invalid", "the wrong secret is rejected")
assert(verifyNewsletterToken("", { secret, now: nowMs }).reason === "invalid", "an empty token is rejected")
assert(verifyNewsletterToken("not-a-token", { secret, now: nowMs }).reason === "invalid", "a token without a signature is rejected")
assert(verifyNewsletterToken("a.b.c", { secret, now: nowMs }).reason === "invalid", "a token with an extra dot is rejected")
assert(signNewsletterToken({ email: "not-an-email", purpose: "confirm", secret }) === null, "an unusable address is not signed")
assert(signNewsletterToken({ email, purpose: "confirm", secret: "" }) === null, "an empty secret does not sign")

const atSevenDays = sign("confirm", nowMs - NEWSLETTER_CONFIRM_TTL_SECONDS * 1000)
assert(
  verifyNewsletterToken(atSevenDays, { secret, now: nowMs, purpose: "confirm" }).ok,
  "a confirm link is valid at 7 days"
)
const afterSevenDays = sign("confirm", nowMs - (NEWSLETTER_CONFIRM_TTL_SECONDS + 1) * 1000)
assert(
  verifyNewsletterToken(afterSevenDays, { secret, now: nowMs, purpose: "confirm" }).reason === "expired",
  "a confirm link expires after 7 days"
)
const oldUnsubscribe = sign("unsubscribe", nowMs - 30 * 24 * 60 * 60 * 1000)
assert(
  verifyNewsletterToken(oldUnsubscribe, { secret, now: nowMs, purpose: "unsubscribe" }).ok,
  "an unsubscribe link still works after 7 days"
)

const aheadOk = sign("confirm", nowMs + 4 * 60 * 1000)
assert(verifyNewsletterToken(aheadOk, { secret, now: nowMs }).ok, "a few minutes of clock skew is accepted")
const aheadBad = sign("confirm", nowMs + (NEWSLETTER_TOKEN_SKEW_SECONDS + 60) * 1000)
assert(verifyNewsletterToken(aheadBad, { secret, now: nowMs }).reason === "invalid", "a future token beyond skew is rejected")

const previousSecret = process.env.CRON_SECRET
process.env.CRON_SECRET = secret
try {
  const fromEnv = signNewsletterToken({ email, purpose: "confirm", issuedAt: nowMs })
  assert(fromEnv !== null && verifyNewsletterToken(fromEnv, { now: nowMs }).ok, "CRON_SECRET signs and verifies when no secret is passed")
} finally {
  if (previousSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = previousSecret
}

const resendEmail = "resend-window@example.com"
assert(allowNewsletterConfirmResend(resendEmail, 1_000), "the first duplicate resend is allowed")
assert(!allowNewsletterConfirmResend(resendEmail, 1_000 + 60_000), "a second resend inside the window is blocked")
assert(
  allowNewsletterConfirmResend(resendEmail, 1_000 + NEWSLETTER_RATE_WINDOW_MS),
  "a resend is allowed after the window"
)
const released = "release-window@example.com"
assert(allowNewsletterConfirmResend(released, 5_000), "a resend slot can be taken")
releaseNewsletterConfirmResend(released)
assert(allowNewsletterConfirmResend(released, 5_100), "a skipped send releases the resend slot")

const day = new Date("2026-11-16T23:00:00.000Z")
const nextDay = new Date("2026-11-17T00:00:00.000Z")
resetNewsletterQuotaForTests()
assert(takeNewsletterSendQuota(40, day) === 40, "quota grants a request inside the daily cap")
assert(takeNewsletterSendQuota(70, day) === 60, "quota stops at 100 for the UTC day")
assert(takeNewsletterSendQuota(1, day) === 0, "the daily cap blocks another send the same day")
assert(takeNewsletterSendQuota(100, nextDay) === 100, "the cap resets the next UTC day")
resetNewsletterQuotaForTests()
assert(takeNewsletterSendQuota(250, day) === NEWSLETTER_BATCH_LIMIT, "one call cannot exceed the batch size")
assert(NEWSLETTER_DAILY_LIMIT === 100, "the daily guard is the free-tier cap of 100")
resetNewsletterQuotaForTests()
assert(takeNewsletterSendQuota(100, day) === 100, "a full day can be reserved")
releaseNewsletterSendQuota(100, day)
assert(takeNewsletterSendQuota(10, day) === 10, "a failed send returns its quota")
assert(takeNewsletterSendQuota(0, day) === 0, "a zero request reserves nothing")
assert(takeNewsletterSendQuota(-5, day) === 0, "a negative request reserves nothing")
resetNewsletterQuotaForTests()
assert(takeNewsletterSendQuota(10, day) === 10, "a small send is reserved")
noteNewsletterQuotaUsed(40, day)
assert(takeNewsletterSendQuota(70, day) === 60, "Resend's reported usage counts toward the daily cap")
