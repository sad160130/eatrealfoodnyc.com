import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"
import { existsSync } from "node:fs"
import { config } from "dotenv"

// Load .env.local if it exists
if (existsSync(".env.local")) config({ path: ".env.local", override: true })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 2,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ["error"] })

async function main() {
  const published = await prisma.restaurant.count({ where: { is_published: true } })
  const total = await prisma.restaurant.count()
  const remaining = total - published

  console.log("\n=== PUBLISH STATUS ===\n")
  console.log(`Published: ${published} / ${total}`)
  console.log(`Remaining: ${remaining}`)
  console.log(`Weeks to complete at 100/week: ${Math.ceil(remaining / 100)}`)
  console.log()

  await prisma.$disconnect()
  await pool.end()
}

main().catch(console.error)
