/** Resend's free transactional quota is 100 emails per UTC day. */
export const NEWSLETTER_DAILY_LIMIT = 100
/** The batch endpoint accepts at most 100 emails per request. */
export const NEWSLETTER_BATCH_LIMIT = 100

type QuotaState = { day: string; used: number }

let state: QuotaState = { day: "", used: 0 }

function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10)
}

/** How many sends this server instance may still make on the UTC day. Best-effort, like the signup limiter. */
export function newsletterQuotaRemaining(now = new Date()): number {
  if (state.day !== utcDay(now)) return NEWSLETTER_DAILY_LIMIT
  return Math.max(0, NEWSLETTER_DAILY_LIMIT - state.used)
}

/**
 * Reserve up to `requested` sends. Never more than the daily room or one batch.
 * A second call the same UTC day on this instance only gets what is left of 100.
 */
export function takeNewsletterSendQuota(requested: number, now = new Date()): number {
  if (!Number.isFinite(requested) || requested <= 0) return 0
  const day = utcDay(now)
  if (state.day !== day) state = { day, used: 0 }
  const room = NEWSLETTER_DAILY_LIMIT - state.used
  if (room <= 0) return 0
  const granted = Math.min(Math.floor(requested), room, NEWSLETTER_BATCH_LIMIT)
  state.used += granted
  return granted
}

/** Give back a reservation when the request was not accepted. */
export function releaseNewsletterSendQuota(count: number, now = new Date()): void {
  if (!Number.isFinite(count) || count <= 0) return
  if (state.day !== utcDay(now)) return
  state.used = Math.max(0, state.used - Math.floor(count))
}

/** Raise the local counter to Resend's reported daily usage, capped at the free-tier limit. */
export function noteNewsletterQuotaUsed(used: number, now = new Date()): void {
  if (!Number.isFinite(used) || used < 0) return
  const day = utcDay(now)
  if (state.day !== day) state = { day, used: 0 }
  state.used = Math.max(state.used, Math.min(NEWSLETTER_DAILY_LIMIT, Math.floor(used)))
}

export function resetNewsletterQuotaForTests(): void {
  state = { day: "", used: 0 }
}
