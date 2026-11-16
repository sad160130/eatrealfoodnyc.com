export const NEWSLETTER_RATE_WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

const attempts = new Map<string, number[]>()
const confirmResends = new Map<string, number>()

/** Best-effort limiter. Each server instance keeps its own window. */
export function allowNewsletterSignup(key: string): boolean {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < NEWSLETTER_RATE_WINDOW_MS)
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent)
    return false
  }
  recent.push(now)
  attempts.set(key, recent)
  return true
}

/**
 * Duplicate signups may resend the confirmation email once per rate-limit window.
 * The slot is taken immediately. Call `releaseNewsletterConfirmResend` if no email was attempted.
 */
export function allowNewsletterConfirmResend(email: string, now = Date.now()): boolean {
  const key = email.trim().toLowerCase()
  if (!key) return false
  const previous = confirmResends.get(key)
  if (previous !== undefined && now - previous < NEWSLETTER_RATE_WINDOW_MS) return false
  confirmResends.set(key, now)
  return true
}

export function releaseNewsletterConfirmResend(email: string): void {
  confirmResends.delete(email.trim().toLowerCase())
}
