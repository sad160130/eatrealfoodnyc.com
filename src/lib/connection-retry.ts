/**
 * Up to three retries for connection-acquisition failures, with growing
 * backoff and jitter so a crawl burst spreads out instead of retrying in
 * lockstep. The last failure is rethrown so ISR keeps the last good page
 * instead of storing an error response. Unique-constraint and query errors
 * are not retried.
 */
export const CONNECTION_RETRY_DELAY_MS = 300
export const CONNECTION_RETRY_DELAYS_MS = [CONNECTION_RETRY_DELAY_MS, 1_000, 2_500] as const

const TRANSIENT =
  /EMAXCONN|max client connections|too many clients|remaining connection slots|timeout exceeded when trying to connect|Connection terminated|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|socket hang up|Can't reach database server|Server has closed the connection|Timed out fetching a new connection|Unable to start a transaction in the given time|53300|P1001|P1017|P2024/i

function textOf(error: unknown): string {
  const parts: string[] = []
  const seen = new Set<unknown>()
  let current: unknown = error
  while (current && typeof current === "object" && !seen.has(current) && parts.length < 8) {
    seen.add(current)
    const record = current as Record<string, unknown>
    if (typeof record.name === "string") parts.push(record.name)
    if (typeof record.code === "string") parts.push(record.code)
    if (typeof record.message === "string") parts.push(record.message)
    if (record.meta && typeof record.meta === "object") parts.push(JSON.stringify(record.meta))
    current = record.cause
  }
  if (parts.length === 0) parts.push(String(error))
  return parts.join(" ")
}

export function isTransientConnectionError(error: unknown): boolean {
  return TRANSIENT.test(textOf(error))
}

function defaultSleep(ms: number): Promise<void> {
  const jitter = Math.floor(Math.random() * Math.max(200, ms / 2))
  return new Promise((resolve) => setTimeout(resolve, ms + jitter))
}

export async function withConnectionRetry<T>(
  run: () => Promise<T>,
  sleep: (ms: number) => Promise<void> = defaultSleep
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    } catch (error) {
      if (!isTransientConnectionError(error)) throw error
      const delay = CONNECTION_RETRY_DELAYS_MS[attempt]
      if (delay === undefined) throw error
      await sleep(delay)
    }
  }
}
