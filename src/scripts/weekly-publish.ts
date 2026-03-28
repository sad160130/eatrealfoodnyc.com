import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"
import { existsSync } from "node:fs"
import { config } from "dotenv"

if (existsSync(".env.local")) config({ path: ".env.local", override: true })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 2,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ["error"] })

async function main() {
  console.log("\n=== WEEKLY PUBLISH ===\n")

  const batch = await prisma.restaurant.findMany({
    where: { is_published: false, business_status: "OPERATIONAL" },
    orderBy: [{ reviews: "desc" }, { rating: "desc" }],
    take: 100,
    select: { id: true, name: true, slug: true },
  })

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
