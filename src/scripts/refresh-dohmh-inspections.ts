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
 * A grade that stays the same still updates when the inspection date or
 * score changed. This full lookback trusts the fetched latest even when
 * that calendar day is older than the stored text. The daily cron does not:
 * it only reads the last 14 days and will not replace a newer stored date.
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
import { planInspectionUpdates } from "../lib/dohmh-grade"
import {
  DOHMH_SCRIPT_MAX_ROWS,
  DOHMH_SCRIPT_PAGE_SIZE,
  fetchDohmhInspections,
  snapshotsFromInspections,
} from "../lib/dohmh-refresh"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

function sinceDate(): string {
  const arg = process.argv.find((value) => value.startsWith("--since="))
  if (arg) return arg.slice("--since=".length)
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - 4)
  return date.toISOString().slice(0, 10)
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
    fetchDohmhInspections({
      since,
      token: process.env.DOHMH_APP_TOKEN,
      pageSize: DOHMH_SCRIPT_PAGE_SIZE,
      maxRows: DOHMH_SCRIPT_MAX_ROWS,
      onPage: ({ offset, pageRows }) => {
        console.log(`Fetched ${pageRows} graded rows (offset ${offset})`)
      },
    }),
  ])
  const snapshots = snapshotsFromInspections(inspections)
  const plan = planInspectionUpdates(restaurants, snapshots, { replaceOlder: true })

  console.log(`Graded inspection rows: ${inspections.length}`)
  console.log(`Establishments with a grade code: ${snapshots.length}`)
  console.log(`Restaurants: ${restaurants.length}`)
  console.log(`Matched: ${plan.matched}`)
  console.log(`Unmatched: ${plan.unmatched}`)
  const gradeChanges = plan.writes.filter((write) => write.fromGrade !== write.toGrade)
  console.log(`Address rows to write: ${plan.writes.length}`)
  console.log(`Grade letter would change: ${gradeChanges.length}`)
  console.log(`Name-only matches skipped: ${plan.skippedNameOnly}`)
  console.log("CAMIS matches: 0 (restaurants has no CAMIS column)")
  const byId = new Map(restaurants.map((row) => [row.id, row]))
  const interesting = plan.writes.filter((write) =>
    /chamoun|ras plant|coletta|loaded|tap brazilian/i.test(byId.get(write.id)?.name ?? "")
  )
  console.log("\nNamed examples:")
  for (const write of interesting) {
    const name = byId.get(write.id)?.name
    console.log(`  ${name}: ${write.fromGrade ?? "—"} -> ${write.toGrade ?? "—"} (${write.toDate}, via address)`)
  }
  console.log("\nSample of other writes:")
  for (const write of plan.writes.filter((row) => !interesting.includes(row)).slice(0, 12)) {
    const name = byId.get(write.id)?.name
    console.log(
      `  ${name}: ${write.fromGrade ?? "—"} -> ${write.toGrade ?? "—"} on ${write.toDate} (was ${write.fromDate ?? "—"})`
    )
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write address matches. Name-only matches stay unchanged.")
    await prisma.$disconnect()
    return
  }

  const backup = {
    generatedAt: new Date().toISOString(),
    since,
    applied: plan.writes.length,
    skippedNameOnly: plan.skippedNameOnly,
    camisMatches: 0,
    rows: plan.writes.map((write) => {
      const row = byId.get(write.id)
      return {
        id: write.id,
        slug: row?.slug ?? null,
        name: row?.name ?? null,
        matchedBy: write.matchedBy,
        camis: write.camis,
        previous: {
          inspection_grade: row?.inspection_grade ?? null,
          inspection_score: row?.inspection_score ?? null,
          inspection_date: row?.inspection_date ?? null,
        },
        next: {
          inspection_grade: write.toGrade,
          inspection_score: write.toScore,
          inspection_date: write.toDate,
        },
      }
    }),
    skippedNameOnlySample: plan.nameOnlySample,
  }
  const backupPath = path.join(process.cwd(), "data", "grade-backup-2026-11-15.json")
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`Wrote backup ${backupPath} (${backup.rows.length} rows) before any update.`)

  let written = 0
  for (const write of plan.writes) {
    await prisma.restaurant.update({
      where: { id: write.id },
      data: {
        inspection_grade: write.toGrade,
        inspection_score: write.toScore,
        inspection_date: write.toDate,
      },
    })
    written += 1
  }
  console.log(`\nUpdated ${written} address-matched restaurants. Skipped ${plan.skippedNameOnly} name-only matches.`)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
