const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

const attempts = new Map<string, number[]>()

/** Best-effort limiter. Each server instance keeps its own window. */
export function allowNewsletterSignup(key: string): boolean {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS)
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent)
    return false
  }
  recent.push(now)
  attempts.set(key, recent)
  return true
}
