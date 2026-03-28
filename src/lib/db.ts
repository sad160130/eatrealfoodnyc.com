import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { execSync } from "node:child_process"

// Resolve hostname to IPv4 — Vercel build can't reach Supabase over IPv6
function forceIPv4(connectionString: string): string {
  try {
    const url = new URL(connectionString)
    const ipv4 = execSync(
      `node -e "require('dns').lookup('${url.hostname}', { family: 4 }, (e, a) => process.stdout.write(a || ''))"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim()
    if (ipv4 && /^\d+\.\d+\.\d+\.\d+$/.test(ipv4)) {
      url.hostname = ipv4
      return url.toString()
    }
  } catch {}
  return connectionString
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: forceIPv4(process.env.DATABASE_URL!),
    max: 5,
    ssl: { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
