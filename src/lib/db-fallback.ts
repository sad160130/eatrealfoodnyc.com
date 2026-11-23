import { isTransientConnectionError } from "@/lib/connection-retry"

/**
 * Graceful degradation for ISR pages when Postgres is out of connections.
 *
 * - `softRead` turns a transient connection failure on secondary data
 *   (reviews, nearby lists, hub membership) into a fallback value, so the page
 *   still renders instead of returning a 500.
 * - Any degraded render calls `shortenRevalidate()`, a tiny fetch with
 *   `next.revalidate = DEGRADED_REVALIDATE_SECONDS`. Next.js uses the lowest
 *   fetch revalidate of a render for ISR, so a degraded page is regenerated
 *   within minutes instead of staying cached for the route's 24 hours.
 * - `restSelect` reads a table through Supabase's HTTP Data API (PostgREST).
 *   That path does not use a Supavisor client slot, so it still works when
 *   the pooler reports EMAXCONN.
 *
 * Non-connection errors are rethrown unchanged.
 */
export const DEGRADED_REVALIDATE_SECONDS = 300
const REST_TIMEOUT_MS = 6_000

function restConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/+$/, ""), key }
}

export function errorLabel(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code
    const message = error.message.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[redacted]").slice(0, 120)
    return `${error.name}${typeof code === "string" ? ` ${code}` : ""}: ${message}`
  }
  return String(error).slice(0, 120)
}

/** GET rows from PostgREST. `query` is the part after `/rest/v1/`. */
export async function restSelect<T>(
  query: string,
  options: { revalidate?: number } = {}
): Promise<T[]> {
  const config = restConfig()
  if (!config) throw new Error("Supabase REST fallback is not configured")
  const response = await fetch(`${config.url}/rest/v1/${query}`, {
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      accept: "application/json",
    },
    signal: AbortSignal.timeout(REST_TIMEOUT_MS),
    next: { revalidate: options.revalidate ?? DEGRADED_REVALIDATE_SECONDS },
  })
  if (!response.ok) throw new Error(`Supabase REST ${response.status}`)
  return (await response.json()) as T[]
}

/** Mark this render as degraded so ISR regenerates it soon. Never throws. */
export async function shortenRevalidate(): Promise<void> {
  try {
    await restSelect("restaurants?select=id&limit=1")
  } catch {
    // The marker is best effort. The fallback content still renders.
  }
}

export async function softRead<T>(
  label: string,
  load: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await load()
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error
    console.error(`[db-degraded] ${label} fell back after a connection error (${errorLabel(error)})`)
    await shortenRevalidate()
    return fallback
  }
}
