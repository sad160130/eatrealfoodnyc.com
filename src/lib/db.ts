import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

function createPrismaClient() {
  const connString = process.env.DATABASE_URL!

  const poolConfig: pg.PoolConfig = {
    connectionString: connString,
    max: 5,
    ssl: { rejectUnauthorized: false },
  }

  // On Vercel, force IPv4 resolution to avoid IPv6 ENETUNREACH
  if (process.env.VERCEL) {
    try {
      const url = new URL(connString)
      poolConfig.host = url.hostname
      poolConfig.port = parseInt(url.port || "6543")
      poolConfig.user = url.username
      poolConfig.password = decodeURIComponent(url.password)
      poolConfig.database = url.pathname.slice(1)
      delete poolConfig.connectionString
      // Override DNS lookup to force IPv4
      const dns = require("node:dns")
      ;(poolConfig as Record<string, unknown>).lookup = (
        hostname: string,
        opts: Record<string, unknown>,
        cb: Function
      ) => {
        dns.lookup(hostname, { ...opts, family: 4 }, cb)
      }
    } catch {
      // Fall back to connection string
    }
  }

  const pool = new pg.Pool(poolConfig)
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
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
}

type AppPrisma = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrisma | undefined
}

export const prisma: AppPrisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
