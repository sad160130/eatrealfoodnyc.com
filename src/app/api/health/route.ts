import { prisma } from "@/lib/db"
import { errorLabel, restSelect } from "@/lib/db-fallback"
import { isTransientConnectionError } from "@/lib/connection-retry"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CHECK_TIMEOUT_MS = 4_000
/** Per-instance memo so a burst of health checks costs one query. */
const MEMO_MS = 10_000

type Check = { ok: boolean; ms: number; error?: string; connectionError?: boolean }
type Health = {
  status: "ok" | "degraded" | "down"
  postgres: Check
  rest: Check
  checkedAt: string
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

async function timed(run: () => Promise<unknown>): Promise<Check> {
  const started = Date.now()
  try {
    await withTimeout(run(), CHECK_TIMEOUT_MS)
    return { ok: true, ms: Date.now() - started }
  } catch (error) {
    return {
      ok: false,
      ms: Date.now() - started,
      error: errorLabel(error),
      connectionError: isTransientConnectionError(error),
    }
  }
}

function summarize(postgres: Check, rest: Check): Health["status"] {
  if (postgres.ok) return "ok"
  return rest.ok ? "degraded" : "down"
}

let memo: { at: number; body: Health } | null = null

async function runChecks(): Promise<Health> {
  const [postgres, rest] = await Promise.all([
    timed(() => prisma.$queryRaw`SELECT 1`),
    timed(() => restSelect("restaurants?select=id&limit=1", { revalidate: 1 })),
  ])
  return { status: summarize(postgres, rest), postgres, rest, checkedAt: new Date().toISOString() }
}

/**
 * Database health for monitoring. 200 when Postgres answers; 503 when it does
 * not ("degraded" means listing pages still render through the Supabase HTTP
 * fallback, "down" means both paths failed). Never cached by the CDN.
 */
export async function GET() {
  if (!memo || Date.now() - memo.at > MEMO_MS) {
    memo = { at: Date.now(), body: await runChecks() }
  }
  const body = memo.body
  return Response.json(body, {
    status: body.status === "ok" ? 200 : 503,
    headers: { "cache-control": "no-store, max-age=0" },
  })
}
