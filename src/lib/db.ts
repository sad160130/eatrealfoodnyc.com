import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { attachDatabasePool } from "@vercel/functions"
import pg from "pg"
import { withConnectionRetry } from "@/lib/connection-retry"

/**
 * One client per function instance. `globalThis` is shared even when the
 * bundler evaluates this module more than once. Caching only in development
 * let production create a pool per copy.
 *
 * Supavisor transaction mode (port 6543) is the runtime URL. `DIRECT_URL`
 * (port 5432) is read only by prisma.config.ts for migrations.
 * `@prisma/adapter-pg` sends unnamed queries (no `name`), which transaction
 * mode accepts. Do not add a statement-name generator.
 *
 * Expected live connections ≈ active instances × DB_POOL_MAX. Idle clients
 * close after DB_POOL_IDLE_MS, and on Fluid `attachDatabasePool` keeps the
 * instance awake long enough for that timer to run before suspension.
 */
export const DB_POOL_MAX = 2
export const DB_POOL_IDLE_MS = 5_000
export const DB_POOL_CONNECT_MS = 5_000

export function selectRuntimeDatabaseUrl(env: NodeJS.ProcessEnv): string | undefined {
  return env.DATABASE_URL
}

export function buildRuntimePoolConfig(
  connectionString: string | undefined,
  options: { vercel?: boolean } = {}
): pg.PoolConfig {
  const poolConfig: pg.PoolConfig = {
    connectionString,
    max: DB_POOL_MAX,
    idleTimeoutMillis: DB_POOL_IDLE_MS,
    connectionTimeoutMillis: DB_POOL_CONNECT_MS,
    allowExitOnIdle: true,
    ssl: { rejectUnauthorized: false },
  }

  // On Vercel, force IPv4 resolution to avoid IPv6 ENETUNREACH.
  if (options.vercel && connectionString) {
    try {
      const url = new URL(connectionString)
      poolConfig.host = url.hostname
      poolConfig.port = parseInt(url.port || "6543", 10)
      poolConfig.user = url.username
      poolConfig.password = decodeURIComponent(url.password)
      poolConfig.database = url.pathname.slice(1)
      delete poolConfig.connectionString
      const dns = require("node:dns")
      ;(poolConfig as Record<string, unknown>).lookup = (
        hostname: string,
        opts: Record<string, unknown>,
        cb: Function
      ) => {
        dns.lookup(hostname, { ...opts, family: 4 }, cb)
      }
    } catch {
      // Fall back to the connection string.
    }
  }

  return poolConfig
}

function warnIfDirectPort(connectionString: string | undefined) {
  if (!process.env.VERCEL || !connectionString) return
  try {
    const port = new URL(connectionString).port
    if (port === "5432" || port === "") {
      console.error(
        "Runtime DATABASE_URL is not on the pooled Supavisor port 6543. DIRECT_URL is only for migrations."
      )
    }
  } catch {
    // A malformed URL fails on the first query. Don't crash module init.
  }
}

type AppPrisma = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma?: AppPrisma
  pool?: pg.Pool
}

function getPool(): pg.Pool {
  if (globalForPrisma.pool) return globalForPrisma.pool
  const connectionString = selectRuntimeDatabaseUrl(process.env)
  warnIfDirectPort(connectionString)
  const pool = new pg.Pool(buildRuntimePoolConfig(connectionString, { vercel: Boolean(process.env.VERCEL) }))
  try {
    attachDatabasePool(pool)
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error"
    console.error(`attachDatabasePool failed (${name})`)
  }
  globalForPrisma.pool = pool
  return pool
}

function createPrismaClient() {
  const adapter = new PrismaPg(getPool())
  const base = new PrismaClient({
    adapter,
    log: ["error"],
    // partner_status is added by a later migration. Omit it from default
    // selects so prerender does not fail before that column exists.
    // Read it through loadPartnerStatuses(), which tolerates the missing column.
    omit: {
      restaurant: {
        partner_status: true,
      },
    },
  })
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        return withConnectionRetry(() => query(args))
      },
    },
  })
}

export const prisma: AppPrisma = globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma
