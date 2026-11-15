/**
 * Unpublish listings that are clearly outside New York City or clearly not
 * restaurants. Chain locations that are still restaurants stay published.
 *
 * Dry-run by default. --apply sets is_published false and writes
 * data/noindex-2026-11-15.json.
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const { prisma } = require("../lib/db") as {
  prisma: {
    restaurant: {
      findMany: (args: unknown) => Promise<Row[]>
      updateMany: (args: unknown) => Promise<{ count: number }>
    }
    $disconnect: () => Promise<void>
  }
}

interface Row {
  id: number
  slug: string
  name: string
  type: string | null
  borough: string | null
  city: string | null
  state: string | null
  address: string
}

const OUTSIDE_CITY = /^(jersey city|hoboken|newark|new hyde park|yonkers|montclair|union city|fort lee|edgewater|secaucus|bayonne|elizabeth|paramus|hackensack|weehawken|weehawken township|cliffside park|north bergen|west new york|palisades park|clifton|paterson|bloomfield|passaic|teaneck|guttenberg|east newark|wayne|fort lee)$/i

const NON_RESTAURANT_TYPE = /department store|pet store|supermarket|grocery store|shopping mall|\bhotel\b|lodging|\buniversity\b|\bcollege\b|pharmacy|convenience store|museum|movie theater|cinema/i

const NON_RESTAURANT_NAME = /^(walmart|petco|bloomingdale|trader joe|whole foods market|queens center)/i

function reason(row: Row): string | null {
  const state = (row.state ?? "").trim().toLowerCase()
  const city = (row.city ?? "").trim()
  if (state === "nj" || state === "new jersey") return `state is ${row.state}`
  if (OUTSIDE_CITY.test(city)) return `city is ${city}`
  if (row.type && NON_RESTAURANT_TYPE.test(row.type)) return `type is ${row.type}`
  if (NON_RESTAURANT_NAME.test(row.name)) return "name is not a restaurant"
  return null
}

async function main() {
  const apply = process.argv.includes("--apply")
  const rows = await prisma.restaurant.findMany({
    where: { is_published: true },
    select: { id: true, slug: true, name: true, type: true, borough: true, city: true, state: true, address: true },
    orderBy: { slug: "asc" },
  })
  const flagged = rows.flatMap((row) => {
    const why = reason(row)
    return why ? [{ slug: row.slug, name: row.name, type: row.type, why, id: row.id }] : []
  })
  console.log(`Published scanned: ${rows.length}`)
  console.log(`Clear out-of-scope: ${flagged.length}`)
  for (const row of flagged) console.log(`${row.slug}\t${row.why}\t${row.type ?? ""}\t${row.name}`)
  const payload = {
    date: "2026-11-15",
    action: "is_published set to false",
    note: "Clear out-of-NYC or non-restaurant listings. Chain restaurant groups were not merged. Re-publish by setting is_published true. Rows were not deleted.",
    count: flagged.length,
    slugs: flagged.map((row) => row.slug),
  }
  const out = path.join(process.cwd(), "data/noindex-2026-11-15.json")
  if (!apply) {
    console.log("\nDry run. Pass --apply to unpublish and write the slug list.")
    await prisma.$disconnect()
    return
  }
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n")
  if (flagged.length === 0) {
    console.log(`Wrote ${out} with an empty list.`)
    await prisma.$disconnect()
    return
  }
  const result = await prisma.restaurant.updateMany({
    where: { id: { in: flagged.map((row) => row.id) }, is_published: true },
    data: { is_published: false },
  })
  console.log(`Unpublished ${result.count}. Wrote ${out}`)
  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
