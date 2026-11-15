/**
 * Re-sync inspection_grade from NYC Open Data 43nn-pn8j.
 *
 * Root cause: restaurants.inspection_grade is a single column copied at
 * ingest. The city dataset keeps every inspection. A later ungraded visit
 * (blank grade) must not hide the newest row that actually has a grade code,
 * and a Google Maps marketing name often does not equal the DOHMH DBA, so
 * address is the first match key.
 *
 * Dry-run by default. --apply writes only address matches (building, street,
 * zip, and borough when both sides have one). Name-only matches are skipped.
 * The restaurants table has no CAMIS column, so there is no CAMIS join.
 * Before any write, the previous grade fields are saved to
 * data/grade-backup-2026-11-15.json.
 *
 *   npx tsx src/scripts/refresh-dohmh-inspections.ts
 *   npx tsx src/scripts/refresh-dohmh-inspections.ts --since=2024-01-01
 *   npx tsx src/scripts/refresh-dohmh-inspections.ts --apply
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"
import {
  latestGradedInspection,
  matchLatestGrades,
  addressKeyFromDohmh,
  type DohmhInspection,
  type GradeSnapshot,
} from "../lib/dohmh-grade"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

const SODA = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
const PAGE = 50000

function sinceDate(): string {
  const arg = process.argv.find((value) => value.startsWith("--since="))
  if (arg) return arg.slice("--since=".length)
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - 4)
  return date.toISOString().slice(0, 10)
}

async function fetchInspections(since: string): Promise<DohmhInspection[]> {
  const token = process.env.DOHMH_APP_TOKEN
  const rows: DohmhInspection[] = []
  for (let offset = 0; offset < 2_000_000; offset += PAGE) {
    const url = new URL(SODA)
    url.searchParams.set("$select", "camis,dba,boro,grade,score,inspection_date,building,street,zipcode")
    url.searchParams.set(
      "$where",
      `inspection_date >= '${since}T00:00:00.000' AND grade in('A','B','C','Z','P','N')`
    )
    url.searchParams.set("$order", "inspection_date DESC")
    url.searchParams.set("$limit", String(PAGE))
    url.searchParams.set("$offset", String(offset))
    const response = await fetch(url, { headers: token ? { "X-App-Token": token } : {} })
    if (!response.ok) throw new Error(`DOHMH request failed (${response.status}) at offset ${offset}`)
    const page = (await response.json()) as Array<Record<string, string>>
    for (const row of page) {
      if (!row.camis || !row.dba) continue
      const score = Number(row.score)
      rows.push({
        camis: row.camis,
        name: row.dba,
        borough: row.boro ?? null,
        grade: row.grade ?? null,
        score: Number.isFinite(score) ? score : null,
        inspectionDate: row.inspection_date ?? null,
        building: row.building ?? null,
        street: row.street ?? null,
        zip: row.zipcode ?? null,
      })
    }
    console.log(`Fetched ${page.length} graded rows (offset ${offset})`)
    if (page.length < PAGE) break
  }
  return rows
}

function snapshotsFrom(rows: DohmhInspection[]): GradeSnapshot[] {
  const byCamis = new Map<string, DohmhInspection[]>()
  for (const row of rows) {
    const list = byCamis.get(row.camis) ?? []
    list.push(row)
    byCamis.set(row.camis, list)
  }
  const snapshots: GradeSnapshot[] = []
  for (const group of byCamis.values()) {
    const latest = latestGradedInspection(group)
    if (!latest) continue
    const source = group.find((row) => row.inspectionDate?.slice(0, 10) === latest.inspectionDate) ?? group[0]
    latest.addressKey = addressKeyFromDohmh(source)
    snapshots.push(latest)
  }
  return snapshots
}

async function main() {
  const apply = process.argv.includes("--apply")
  const since = sinceDate()
  console.log(apply ? "Mode: APPLY" : "Mode: dry run — no rows will be changed")
  console.log(`Graded inspections on or after ${since}`)

  const [restaurants, inspections] = await Promise.all([
    prisma.restaurant.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        borough: true,
        address: true,
        inspection_grade: true,
        inspection_score: true,
        inspection_date: true,
      },
    }),
    fetchInspections(since),
  ])
  const snapshots = snapshotsFrom(inspections)
  const { changes, matched, unmatched } = matchLatestGrades(restaurants, snapshots)

  console.log(`Graded inspection rows: ${inspections.length}`)
  console.log(`Establishments with a grade code: ${snapshots.length}`)
  console.log(`Restaurants: ${restaurants.length}`)
  console.log(`Matched: ${matched}`)
  console.log(`Unmatched: ${unmatched}`)
  const addressChanges = changes.filter((change) => change.matchedBy === "address")
  const nameChanges = changes.filter((change) => change.matchedBy === "name")
  console.log(`Grade would change: ${changes.length}`)
  console.log(`Address matches eligible to write: ${addressChanges.length}`)
  console.log(`Name-only matches skipped: ${nameChanges.length}`)
  console.log("CAMIS matches: 0 (restaurants has no CAMIS column)")
  const interesting = changes.filter((change) =>
    /chamoun|ras plant|coletta|loaded|tap brazilian/i.test(
      restaurants.find((row) => row.id === change.id)?.name ?? ""
    )
  )
  console.log("\nNamed examples:")
  for (const change of interesting) {
    const name = restaurants.find((row) => row.id === change.id)?.name
    console.log(`  ${name}: ${change.fromGrade ?? "—"} -> ${change.toGrade ?? "—"} (${change.inspectionDate}, via ${change.matchedBy})`)
  }
  console.log("\nSample of other changes:")
  for (const change of changes.filter((change) => !interesting.includes(change)).slice(0, 12)) {
    const name = restaurants.find((row) => row.id === change.id)?.name
    console.log(`  ${name}: ${change.fromGrade ?? "—"} -> ${change.toGrade ?? "—"} on ${change.inspectionDate}`)
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write address matches. Name-only matches stay unchanged.")
    await prisma.$disconnect()
    return
  }

  const byId = new Map(restaurants.map((row) => [row.id, row]))
  const backup = {
    generatedAt: new Date().toISOString(),
    since,
    applied: addressChanges.length,
    skippedNameOnly: nameChanges.length,
    camisMatches: 0,
    rows: addressChanges.map((change) => {
      const row = byId.get(change.id)
      return {
        id: change.id,
        slug: row?.slug ?? null,
        name: row?.name ?? null,
        matchedBy: change.matchedBy,
        camis: change.camis,
        previous: {
          inspection_grade: row?.inspection_grade ?? null,
          inspection_score: row?.inspection_score ?? null,
          inspection_date: row?.inspection_date ?? null,
        },
        next: {
          inspection_grade: change.toGrade,
          inspection_score: change.score,
          inspection_date: change.inspectionDate,
        },
      }
    }),
    skippedNameOnlySample: nameChanges.slice(0, 10).map((change) => ({
      id: change.id,
      name: byId.get(change.id)?.name ?? null,
      fromGrade: change.fromGrade,
      toGrade: change.toGrade,
      camis: change.camis,
    })),
  }
  const backupPath = path.join(process.cwd(), "data", "grade-backup-2026-11-15.json")
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`Wrote backup ${backupPath} (${backup.rows.length} rows) before any update.`)

  let written = 0
  for (const change of addressChanges) {
    await prisma.restaurant.update({
      where: { id: change.id },
      data: {
        inspection_grade: change.toGrade,
        inspection_score: change.score,
        inspection_date: change.inspectionDate,
      },
    })
    written += 1
  }
  console.log(`\nUpdated ${written} address-matched restaurants. Skipped ${nameChanges.length} name-only matches.`)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
