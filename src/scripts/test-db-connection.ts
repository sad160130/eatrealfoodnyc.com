import { attachDatabasePool } from "@vercel/functions"
import pg from "pg"
import {
  CONNECTION_RETRY_DELAY_MS,
  isTransientConnectionError,
  withConnectionRetry,
} from "../lib/connection-retry"
import {
  DB_POOL_CONNECT_MS,
  DB_POOL_IDLE_MS,
  DB_POOL_MAX,
  buildRuntimePoolConfig,
  selectRuntimeDatabaseUrl,
} from "../lib/db"
import { memoizeSuccess, type SuccessMemoStore } from "../lib/success-memo"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

function store(): SuccessMemoStore {
  return { values: new Map(), inflight: new Map() }
}

async function main() {
  assert(DB_POOL_MAX >= 1 && DB_POOL_MAX <= 3, "the runtime pool max stays between 1 and 3")
  assert(DB_POOL_IDLE_MS >= 5_000 && DB_POOL_IDLE_MS <= 10_000, "idle clients close within 5 to 10 seconds")
  assert(DB_POOL_CONNECT_MS > 0 && DB_POOL_CONNECT_MS <= 10_000, "waiting for a pool slot fails fast")
  assert(CONNECTION_RETRY_DELAY_MS >= 100 && CONNECTION_RETRY_DELAY_MS <= 1_000, "the connection retry backoff stays short")

  const pooled = "postgresql://user:p%40ss@aws-0-pooler.supabase.com:6543/postgres"
  const direct = "postgresql://user:secret@db.supabase.co:5432/postgres"
  assert(
    selectRuntimeDatabaseUrl({ DATABASE_URL: pooled, DIRECT_URL: direct }) === pooled,
    "runtime queries use DATABASE_URL, not DIRECT_URL"
  )
  assert(
    selectRuntimeDatabaseUrl({ DIRECT_URL: direct }) === undefined,
    "a missing pooled URL does not fall back to the direct migration URL"
  )

  const local = buildRuntimePoolConfig(pooled)
  assert(local.max === DB_POOL_MAX && local.idleTimeoutMillis === DB_POOL_IDLE_MS, "the pool config carries the cap and idle timeout")
  assert(local.connectionTimeoutMillis === DB_POOL_CONNECT_MS && local.allowExitOnIdle === true, "the pool config fails fast and can go idle")
  assert(local.connectionString === pooled, "off Vercel the pool keeps the pooled connection string")

  const vercel = buildRuntimePoolConfig(pooled, { vercel: true })
  assert(vercel.host === "aws-0-pooler.supabase.com" && vercel.port === 6543, "on Vercel the pool dials the pooled host over IPv4 settings")
  assert(vercel.password === "p@ss" && vercel.database === "postgres", "the pooled URL is split without dropping the database")
  assert(vercel.connectionString === undefined && typeof vercel.lookup === "function", "the Vercel pool forces an IPv4 lookup")
  assert(vercel.max === DB_POOL_MAX, "the IPv4 override keeps the small pool cap")

  const broken = buildRuntimePoolConfig("not a url", { vercel: true })
  assert(broken.connectionString === "not a url", "a malformed URL keeps the connection string")

  const pool = new pg.Pool(buildRuntimePoolConfig("postgresql://user:pass@127.0.0.1:1/postgres"))
  attachDatabasePool(pool)
  await pool.end()
  assert(true, "attachDatabasePool accepts the runtime pg pool")

  const driver = Object.assign(new Error("(EMAXCONN) max client connections reached, limit: 200"), {
    name: "DriverAdapterError",
  })
  assert(isTransientConnectionError(driver), "a DriverAdapterError EMAXCONN is retried")
  const wrapped = new Error("Raw query failed")
  wrapped.cause = driver
  assert(isTransientConnectionError(wrapped), "a wrapped EMAXCONN is retried")
  assert(
    isTransientConnectionError({
      name: "PrismaClientKnownRequestError",
      code: "P2010",
      message: "Raw query failed",
      meta: { message: "(EMAXCONN) max client connections reached, limit: 200" },
    }),
    "a P2010 raw-query failure is retried only when the cause is EMAXCONN"
  )
  assert(
    !isTransientConnectionError({ name: "PrismaClientKnownRequestError", code: "P2002", message: "Unique constraint failed" }),
    "a unique constraint is not a connection error"
  )
  assert(
    !isTransientConnectionError({ name: "PrismaClientKnownRequestError", code: "P2010", message: "Raw query failed. Code: `42601`." }),
    "a raw query syntax error is not retried"
  )

  let attempts = 0
  let slept = 0
  const recovered = await withConnectionRetry(async () => {
    attempts += 1
    if (attempts === 1) throw driver
    return "ok"
  }, async (ms) => {
    slept = ms
  })
  assert(recovered === "ok" && attempts === 2 && slept === CONNECTION_RETRY_DELAY_MS, "a connection error is retried once")

  attempts = 0
  let threw = false
  try {
    await withConnectionRetry(async () => {
      attempts += 1
      throw driver
    }, async () => {})
  } catch {
    threw = true
  }
  assert(threw && attempts === 2, "a second connection error is thrown")

  attempts = 0
  threw = false
  try {
    await withConnectionRetry(async () => {
      attempts += 1
      throw new Error("Unique constraint failed")
    }, async () => {})
  } catch {
    threw = true
  }
  assert(threw && attempts === 1, "a non-connection error is not retried")

  const memo = store()
  let loads = 0
  const first = memoizeSuccess("counts", 60_000, async () => {
    loads += 1
    await new Promise((resolve) => setTimeout(resolve, 20))
    return 7
  }, { store: memo })
  const second = memoizeSuccess("counts", 60_000, async () => {
    loads += 1
    return 8
  }, { store: memo })
  const [left, right] = await Promise.all([first, second])
  assert(left === 7 && right === 7 && loads === 1, "concurrent callers share one in-flight load")
  const third = await memoizeSuccess("counts", 60_000, async () => {
    loads += 1
    return 9
  }, { store: memo })
  assert(third === 7 && loads === 1, "a successful load is reused until the ttl")

  let clock = 0
  const timed = store()
  await memoizeSuccess("snapshot", 1_000, async () => "fresh", { store: timed, now: () => clock })
  clock = 1_001
  const refreshed = await memoizeSuccess("snapshot", 1_000, async () => "newer", { store: timed, now: () => clock })
  assert(refreshed === "newer", "an expired success is loaded again")

  const failing = store()
  let failures = 0
  await memoizeSuccess("grades", 60_000, async () => {
    failures += 1
    throw new Error("EMAXCONN")
  }, { store: failing }).catch(() => undefined)
  const afterFailure = await memoizeSuccess("grades", 60_000, async () => {
    failures += 1
    return "recovered"
  }, { store: failing })
  assert(afterFailure === "recovered" && failures === 2, "a failed load is not cached")

  console.log("\nDB connection tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
