/**
 * Re-sync inspection grades from NYC Open Data 43nn-pn8j without DATABASE_URL.
 *
 * Uses the same planner as the daily cron (full lookback, latest graded
 * inspection, address key, then a guarded same-ZIP match). Reads and writes
 * the `restaurants` table through Supabase REST:
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Dry-run by default. --apply writes in batches after saving
 * data/grade-backup-YYYY-MM-DD.json. That file is local. Do not commit it.
 * The only rename is rhk-marketplace (id 8752) to "Red Hook Kitchenette".
 * The slug stays. Other name mismatches are printed and left alone.
 *
 *   npx tsx src/scripts/reconcile-dohmh-rest.ts
 *   npx tsx src/scripts/reconcile-dohmh-rest.ts --since=2022-11-25
 *   npx tsx src/scripts/reconcile-dohmh-rest.ts --apply
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"
import {
  applyRestaurantRestWrites,
  buildGradeBackup,
  buildReconcilePlan,
  executeReconcile,
  gradeBackupFileName,
  loadRestaurantsFromRest,
  reconcileSummary,
  redactSecrets,
} from "../lib/dohmh-reconcile"
import {
  DOHMH_SCRIPT_MAX_ROWS,
  DOHMH_SCRIPT_PAGE_SIZE,
  dohmhLookbackStart,
  fetchDohmhInspections,
  snapshotsFromInspections,
} from "../lib/dohmh-refresh"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

function sinceDate(): string {
  const arg = process.argv.find((value) => value.startsWith("--since="))
  if (!arg) return dohmhLookbackStart()
  const since = arg.slice("--since=".length)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error("invalid --since date")
  return since
}

function restEnv(): { baseUrl: string; key: string } {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. This script does not use DATABASE_URL."
    )
  }
  return { baseUrl, key }
}

async function main() {
  const apply = process.argv.includes("--apply")
  const since = sinceDate()
  const env = restEnv()
  console.log(apply ? "Mode: APPLY" : "Mode: dry run — no rows will be changed")
  console.log(`Grouped inspections on or after ${since}`)

  const [restaurants, inspections] = await Promise.all([
    loadRestaurantsFromRest(env),
    fetchDohmhInspections({
      since,
      token: process.env.DOHMH_APP_TOKEN,
      pageSize: DOHMH_SCRIPT_PAGE_SIZE,
      maxRows: DOHMH_SCRIPT_MAX_ROWS,
      grouped: true,
      onPage: ({ offset, pageRows }) => {
        console.log(`Fetched ${pageRows} grouped rows (offset ${offset})`)
      },
    }),
  ])
  const snapshots = snapshotsFromInspections(inspections)
  const built = buildReconcilePlan(restaurants, snapshots)
  const restaurantById = new Map(restaurants.map((row) => [row.id, { slug: row.slug, name: row.name }]))
  for (const line of reconcileSummary({
    dry: !apply,
    since,
    restaurantCount: restaurants.length,
    rowsFetched: inspections.length,
    snapshotCount: snapshots.length,
    inspection: built.inspection,
    nameFixes: built.nameFixes,
    restaurantById,
  })) {
    console.log(line)
  }

  const backupDir = path.join(process.cwd(), "data")
  const result = await executeReconcile({
    dry: !apply,
    writes: built.writes,
    writeBackup: () => {
      const file = gradeBackupFileName(backupDir, new Date(), (filePath) => fs.existsSync(filePath))
      fs.mkdirSync(path.dirname(file), { recursive: true })
      const backup = buildGradeBackup({
        generatedAt: new Date().toISOString(),
        since,
        restaurants,
        gradeWrites: built.inspection.writes,
        nameFixes: built.nameFixes.fixes,
      })
      fs.writeFileSync(file, JSON.stringify(backup, null, 2))
      console.log(`Wrote backup ${file} (${backup.rows.length} rows) before any update. Do not commit it.`)
    },
    applyWrites: (writes) => applyRestaurantRestWrites({ ...env, writes }),
  })

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write. Name-only matches stay unchanged.")
    return
  }
  console.log(`\nUpdated ${result.written} restaurants.`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "reconcile failed"
  console.error(redactSecrets(message, [process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.DOHMH_APP_TOKEN]))
  process.exit(1)
})
