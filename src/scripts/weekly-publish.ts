import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"
import { existsSync } from "node:fs"
import { config } from "dotenv"
import { getNextPublishBatch } from "../lib/next-publish-batch"

if (existsSync(".env.local")) config({ path: ".env.local", override: true })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 2,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ["error"] })

async function main() {
  console.log("\n=== WEEKLY PUBLISH ===\n")

  // Selection logic lives in src/lib/next-publish-batch.ts. This script and
  // list-next-publish-batch.ts MUST select the same rows — anything else
  // bypasses the routing/approval gate.
  const batch = await getNextPublishBatch(prisma)

  if (batch.length === 0) {
    console.log("All restaurants are already published!")
    await prisma.$disconnect()
    await pool.end()
    return
  }

  await prisma.restaurant.updateMany({
    where: { id: { in: batch.map((r) => r.id) } },
    data: { is_published: true },
  })

  console.log(`Published ${batch.length} new restaurants:\n`)
  batch.forEach((r) => console.log(`  + ${r.name} (/restaurants/${r.slug})`))

  const published = await prisma.restaurant.count({ where: { is_published: true } })
  const total = await prisma.restaurant.count()
  console.log(`\nTotal published: ${published} / ${total}`)
  console.log(`Remaining: ${total - published}`)

  await prisma.$disconnect()
  await pool.end()
}

main().catch(console.error)
