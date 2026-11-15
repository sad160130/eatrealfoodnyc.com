/**
 * Refresh NYC DOHMH inspection grade, score, and date on restaurant rows.
 *
 * Dry-run by default. Prints how many rows would change and does not write.
 * Pass --apply to update inspection_grade, inspection_score, and inspection_date.
 *
 *   npx tsx src/scripts/refresh-dohmh-inspections.ts
 *   npx tsx src/scripts/refresh-dohmh-inspections.ts --since=2024-01-01
 *   npx tsx src/scripts/refresh-dohmh-inspections.ts --apply
 *
 * Optional: set DOHMH_APP_TOKEN to a NYC Open Data app token to raise the
 * Socrata rate limit. Do not commit the token.
 *
 * Source: https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j
 *
 * Matching is name + borough, and coordinates within 150 meters when several
 * CAMIS ids share that name. Ambiguous rows are skipped. This does not insert
 * restaurants and does not change is_published.
 */
import * as path from "path"
import dotenv from "dotenv"
import {
  matchInspections,
  type DohmhRecord,
} from "../lib/dohmh-match"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

const SODA = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
const PAGE_SIZE = 50000

function sinceDate(): string {
  const arg = process.argv.find((value) => value.startsWith("--since="))
  if (arg) return arg.slice("--since=".length)
  const date = new Date()
  date.setUTCMonth(date.getUTCMonth() - 18)
  return date.toISOString().slice(0, 10)
}

function toGrade(value: unknown): "A" | "B" | "C" | null {
  if (value === "A" || value === "B" || value === "C") return value
  return null
}

async function fetchRecords(since: string): Promise<DohmhRecord[]> {
  const records: DohmhRecord[] = []
  const token = process.env.DOHMH_APP_TOKEN
  for (let offset = 0; offset < 1_000_000; offset += PAGE_SIZE) {
    const url = new URL(SODA)
    url.searchParams.set("$select", "camis,dba,boro,grade,score,grade_date,latitude,longitude")
    url.searchParams.set("$where", `grade in ('A','B','C') AND grade_date >= '${since}T00:00:00.000'`)
    url.searchParams.set("$order", "grade_date DESC")
    url.searchParams.set("$limit", String(PAGE_SIZE))
    url.searchParams.set("$offset", String(offset))
    const response = await fetch(url, {
      headers: token ? { "X-App-Token": token } : {},
    })
    if (!response.ok) {
      throw new Error(`DOHMH request failed (${response.status}) at offset ${offset}`)
    }
    const page = (await response.json()) as Array<Record<string, string>>
    for (const row of page) {
      const grade = toGrade(row.grade)
      if (!grade || !row.camis || !row.dba || !row.grade_date) continue
      const score = Number(row.score)
      records.push({
        camis: row.camis,
        name: row.dba,
        borough: row.boro ?? null,
        grade,
        score: Number.isFinite(score) ? score : null,
        gradeDate: row.grade_date.slice(0, 10),
        latitude: row.latitude ? Number(row.latitude) : null,
        longitude: row.longitude ? Number(row.longitude) : null,
      })
    }
    console.log(`Fetched ${page.length} inspection rows (offset ${offset})`)
    if (page.length < PAGE_SIZE) break
  }
  return records
}

function toMdy(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-")
  return `${Number(month)}/${Number(day)}/${year}`
}

async function main() {
  const apply = process.argv.includes("--apply")
  const since = sinceDate()
  console.log(apply ? "Mode: APPLY" : "Mode: dry run — no rows will be changed")
  console.log(`Inspection grades with grade_date on or after ${since}`)

  const [restaurants, records] = await Promise.all([
    prisma.restaurant.findMany({
      select: { id: true, name: true, borough: true, latitude: true, longitude: true, inspection_grade: true, inspection_date: true, inspection_score: true },
    }),
    fetchRecords(since),
  ])

  const { updates, matched, ambiguous, unmatched } = matchInspections(restaurants, records)
  const current = new Map(restaurants.map((row) => [row.id, row]))
  const changes = updates.filter((update) => {
    const row = current.get(update.id)
    if (!row) return false
    const nextDate = toMdy(update.gradeDate)
    return row.inspection_grade !== update.grade || row.inspection_date !== nextDate || row.inspection_score !== update.score
  })

  console.log(`DOHMH rows fetched: ${records.length}`)
  console.log(`Restaurants: ${restaurants.length}`)
  console.log(`Matched: ${matched}`)
  console.log(`Would change: ${changes.length}`)
  console.log(`Ambiguous (skipped): ${ambiguous}`)
  console.log(`Unmatched: ${unmatched}`)
  console.log("\nSample changes:")
  for (const change of changes.slice(0, 15)) {
    const row = current.get(change.id)
    console.log(
      `  ${row?.name}: ${row?.inspection_grade ?? "—"} ${row?.inspection_date ?? ""} -> ${change.grade} ${toMdy(change.gradeDate)}`
    )
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write inspection_grade, inspection_score, and inspection_date.")
    await prisma.$disconnect()
    return
  }

  let written = 0
  for (const change of changes) {
    await prisma.restaurant.update({
      where: { id: change.id },
      data: {
        inspection_grade: change.grade,
        inspection_score: change.score,
        inspection_date: toMdy(change.gradeDate),
      },
    })
    written += 1
  }
  console.log(`\nUpdated ${written} restaurants.`)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
