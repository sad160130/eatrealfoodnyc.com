import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connUrl = new URL(process.env.DATABASE_URL!)

  // Use individual connection params so we can force IPv4 via hostname override
  const pool = new pg.Pool({
    host: connUrl.hostname,
    port: parseInt(connUrl.port || "6543"),
    user: connUrl.username,
    password: decodeURIComponent(connUrl.password),
    database: connUrl.pathname.slice(1),
    max: 5,
    ssl: { rejectUnauthorized: false },
    // Force IPv4 by setting the lookup function
    lookup: (hostname: string, options: object, callback: Function) => {
      const dns = require("node:dns")
      dns.lookup(hostname, { ...options, family: 4 }, callback)
    },
  } as pg.PoolConfig)

  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
