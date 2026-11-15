/**
 * Unpublish listings outside the five boroughs, or that are clearly not
 * restaurants. Chain locations that are still restaurants stay published.
 *
 * A row is in New York City only when the state is New York, the borough
 * is one of the five, and the ZIP on the address is an NYC ZIP. See
 * src/config/nyc-location.ts. Borough labels alone keep Nassau "Inwood"
 * and Westchester rows that were stored as Queens or the Bronx.
 *
 * Dry-run by default. --apply sets is_published false and writes
 * data/noindex-2026-11-15b.json. The earlier pass remains in
 * data/noindex-2026-11-15.json.
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"
import { outsideFiveBoroughs } from "../config/nyc-location"

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

const NON_RESTAURANT_TYPE = /department store|pet store|supermarket|grocery store|shopping mall|\bhotel\b|lodging|\buniversity\b|\bcollege\b|pharmacy|convenience store|museum|movie theater|cinema/i

const NON_RESTAURANT_NAME = /^(walmart|petco|bloomingdale|trader joe|whole foods market|queens center)/i

const ROLLBACK = "data/noindex-2026-11-15b.json"

function reason(row: Row): string | null {
  const location = outsideFiveBoroughs(row)
  if (location) return location
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
    note: "Strict five-borough allowlist: New York state, a NYC borough, and an NYC ZIP. Non-restaurant names and types are included. Chain restaurant groups were not merged. Re-publish by setting is_published true. Rows were not deleted.",
    count: flagged.length,
    slugs: flagged.map((row) => row.slug),
  }
  const out = path.join(process.cwd(), ROLLBACK)
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
