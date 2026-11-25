import path from "node:path"
import type { GradeSnapshot, InspectionTarget, InspectionWrite } from "./dohmh-grade"
import { planInspectionUpdates } from "./dohmh-grade"

/**
 * One listed rename. The refresh does not rename in bulk. This id is
 * rhk-marketplace; the slug stays. A second run finds the name already set.
 */
export const DOHMH_EXPLICIT_NAME_FIXES = [
  { id: 8752, slug: "rhk-marketplace", name: "Red Hook Kitchenette" },
] as const

export const RECONCILE_PAGE_SIZE = 1_000
export const RECONCILE_WRITE_BATCH = 50
const RECONCILE_PAGE_CAP = 40

export const RESTAURANT_RECONCILE_COLUMNS = [
  "id",
  "slug",
  "name",
  "borough",
  "address",
  "inspection_grade",
  "inspection_score",
  "inspection_date",
] as const

export interface DirectoryRestaurantRow extends InspectionTarget {
  slug: string
}

export interface ExplicitNameFix {
  id: number
  slug: string
  fromName: string
  toName: string
}

export interface NameFixPlan {
  fixes: ExplicitNameFix[]
  skipped: number
  alreadyApplied: number
}

/** Grade columns are omitted when only the name changes, so a name fix cannot clear a grade. */
export interface RestaurantRestWrite {
  id: number
  name?: string
  inspection_grade?: string | null
  inspection_score?: number | null
  inspection_date?: string | null
}

export interface GradeBackupFile {
  generatedAt: string
  since: string
  rows: Array<{
    id: number
    slug: string | null
    matchedBy: string | null
    camis: string | null
    previous: {
      name: string | null
      inspection_grade: string | null
      inspection_score: number | null
      inspection_date: string | null
    }
    next: {
      name?: string
      inspection_grade?: string | null
      inspection_score?: number | null
      inspection_date?: string | null
    }
  }>
}

export function restaurantReadQuery(offset: number, limit = RECONCILE_PAGE_SIZE): string {
  return `restaurants?select=${RESTAURANT_RECONCILE_COLUMNS.join(",")}&order=id.asc&limit=${limit}&offset=${offset}`
}

export function restaurantWriteQuery(): string {
  return "restaurants?on_conflict=id"
}

export function redactSecrets(message: string, secrets: Array<string | undefined>): string {
  let text = message.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[redacted]")
  for (const secret of secrets) {
    if (secret && secret.length >= 8) text = text.split(secret).join("[redacted]")
  }
  return text.slice(0, 300)
}

export function planExplicitNameFixes(restaurants: Array<Pick<DirectoryRestaurantRow, "id" | "slug" | "name">>): NameFixPlan {
  const byId = new Map(restaurants.map((row) => [row.id, row]))
  const fixes: ExplicitNameFix[] = []
  let skipped = 0
  let alreadyApplied = 0
  for (const fix of DOHMH_EXPLICIT_NAME_FIXES) {
    const row = byId.get(fix.id)
    if (!row || row.slug !== fix.slug) {
      skipped += 1
      continue
    }
    if (row.name === fix.name) {
      alreadyApplied += 1
      continue
    }
    fixes.push({ id: row.id, slug: row.slug, fromName: row.name, toName: fix.name })
  }
  return { fixes, skipped, alreadyApplied }
}

export function restWritesFromPlan(gradeWrites: InspectionWrite[], nameFixes: ExplicitNameFix[]): RestaurantRestWrite[] {
  const byId = new Map<number, RestaurantRestWrite>()
  for (const write of gradeWrites) {
    byId.set(write.id, {
      id: write.id,
      inspection_grade: write.toGrade,
      inspection_score: write.toScore,
      inspection_date: write.toDate,
    })
  }
  for (const fix of nameFixes) {
    const current = byId.get(fix.id) ?? { id: fix.id }
    current.name = fix.toName
    byId.set(fix.id, current)
  }
  return [...byId.values()].sort((a, b) => a.id - b.id)
}

export function buildReconcilePlan(restaurants: DirectoryRestaurantRow[], snapshots: GradeSnapshot[]) {
  const inspection = planInspectionUpdates(restaurants, snapshots, { replaceOlder: true })
  const nameFixes = planExplicitNameFixes(restaurants)
  const writes = restWritesFromPlan(inspection.writes, nameFixes.fixes)
  return { inspection, nameFixes, writes }
}

export function buildGradeBackup(options: {
  generatedAt: string
  since: string
  restaurants: Array<
    Pick<DirectoryRestaurantRow, "id" | "slug" | "name" | "inspection_grade" | "inspection_score" | "inspection_date">
  >
  gradeWrites: InspectionWrite[]
  nameFixes: ExplicitNameFix[]
}): GradeBackupFile {
  const byId = new Map(options.restaurants.map((row) => [row.id, row]))
  const gradeById = new Map(options.gradeWrites.map((write) => [write.id, write]))
  const nameById = new Map(options.nameFixes.map((fix) => [fix.id, fix]))
  const ids = [...new Set([...gradeById.keys(), ...nameById.keys()])].sort((a, b) => a - b)
  return {
    generatedAt: options.generatedAt,
    since: options.since,
    rows: ids.map((id) => {
      const row = byId.get(id)
      const grade = gradeById.get(id)
      const name = nameById.get(id)
      const next: GradeBackupFile["rows"][number]["next"] = {}
      if (grade) {
        next.inspection_grade = grade.toGrade
        next.inspection_score = grade.toScore
        next.inspection_date = grade.toDate
      }
      if (name) next.name = name.toName
      return {
        id,
        slug: row?.slug ?? null,
        matchedBy: grade?.matchedBy ?? null,
        camis: grade?.camis ?? null,
        previous: {
          name: row?.name ?? null,
          inspection_grade: row?.inspection_grade ?? null,
          inspection_score: row?.inspection_score ?? null,
          inspection_date: row?.inspection_date ?? null,
        },
        next,
      }
    }),
  }
}

/** `data/grade-backup-YYYY-MM-DD.json`, with a time suffix when that file is already there. */
export function gradeBackupFileName(directory: string, now: Date, exists: (file: string) => boolean): string {
  const day = now.toISOString().slice(0, 10)
  const primary = path.join(directory, `grade-backup-${day}.json`)
  if (!exists(primary)) return primary
  const stamp = now.toISOString().slice(11, 19).replace(/:/g, "")
  return path.join(directory, `grade-backup-${day}-${stamp}.json`)
}

export function reconcileSummary(input: {
  dry: boolean
  since: string
  restaurantCount: number
  rowsFetched: number
  snapshotCount: number
  inspection: ReturnType<typeof planInspectionUpdates>
  nameFixes: NameFixPlan
  restaurantById: Map<number, { slug: string; name: string }>
  sampleLimit?: number
}): string[] {
  const limit = input.sampleLimit ?? 15
  const letterChanges = input.inspection.writes.filter((write) => write.fromGrade !== write.toGrade).length
  const lines = [
    input.dry ? "Mode: dry run — no rows will be changed" : "Mode: APPLY",
    `Since: ${input.since}`,
    `Grouped inspection rows: ${input.rowsFetched}`,
    `Establishments with a grade code: ${input.snapshotCount}`,
    `Restaurants: ${input.restaurantCount}`,
    `Matched: ${input.inspection.matched}`,
    `Unmatched: ${input.inspection.unmatched}`,
    `Ambiguous matches skipped: ${input.inspection.skippedAmbiguous}`,
    `Name-only matches skipped: ${input.inspection.skippedNameOnly}`,
    `Older inspections skipped: ${input.inspection.skippedOlder}`,
    `Unchanged: ${input.inspection.unchanged}`,
    `Grade rows to write: ${input.inspection.writes.length}`,
    `Grade letter would change: ${letterChanges}`,
    `Name mismatches logged, not renamed: ${input.inspection.nameMismatches}`,
    `Explicit name fixes to apply: ${input.nameFixes.fixes.length}`,
    `Explicit name fixes already applied: ${input.nameFixes.alreadyApplied}`,
    `Explicit name fixes skipped: ${input.nameFixes.skipped}`,
  ]
  if (input.inspection.nameMismatchSample.length > 0) {
    lines.push("Name mismatch sample:")
    for (const sample of input.inspection.nameMismatchSample) {
      lines.push(`  ${sample.id} ${sample.listingName} -> city ${sample.cityName} (CAMIS ${sample.camis})`)
    }
  }
  for (const fix of input.nameFixes.fixes) {
    lines.push(`Name fix: ${fix.slug} (${fix.id}) "${fix.fromName}" -> "${fix.toName}"`)
  }
  lines.push(`Sample grade changes (${Math.min(limit, input.inspection.writes.length)}):`)
  for (const write of input.inspection.writes.slice(0, limit)) {
    const row = input.restaurantById.get(write.id)
    lines.push(
      `  ${row?.slug ?? write.id}: ${write.fromGrade ?? "—"}/${write.fromScore ?? "—"}/${write.fromDate ?? "—"} -> ${write.toGrade ?? "—"}/${write.toScore ?? "—"}/${write.toDate} via ${write.matchedBy}`
    )
  }
  return lines
}

/**
 * Dry runs do not write a backup or call the database.
 * An apply writes the backup first, then the batches.
 */
export async function executeReconcile(options: {
  dry: boolean
  writes: RestaurantRestWrite[]
  writeBackup: () => Promise<void> | void
  applyWrites: (writes: RestaurantRestWrite[]) => Promise<number>
}): Promise<{ written: number; backupWritten: boolean }> {
  if (options.dry || options.writes.length === 0) return { written: 0, backupWritten: false }
  await options.writeBackup()
  const written = await options.applyWrites(options.writes)
  return { written, backupWritten: true }
}

function restRoot(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "")
}

function restHeaders(key: string, write: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: key,
    authorization: `Bearer ${key}`,
    accept: "application/json",
  }
  if (write) {
    headers["content-type"] = "application/json"
    headers.prefer = "resolution=merge-duplicates,return=minimal"
  }
  return headers
}

export function parseRestaurantRestRow(row: unknown): DirectoryRestaurantRow | null {
  if (!row || typeof row !== "object") return null
  const record = row as Record<string, unknown>
  const id = typeof record.id === "number" ? record.id : Number(record.id)
  if (!Number.isInteger(id)) return null
  if (typeof record.slug !== "string" || typeof record.name !== "string" || !record.slug || !record.name) return null
  const score = record.inspection_score
  const parsedScore = score == null || score === "" ? null : Number(score)
  return {
    id,
    slug: record.slug,
    name: record.name,
    borough: typeof record.borough === "string" ? record.borough : null,
    address: typeof record.address === "string" ? record.address : null,
    inspection_grade: typeof record.inspection_grade === "string" ? record.inspection_grade : null,
    inspection_score: parsedScore != null && Number.isFinite(parsedScore) ? Math.trunc(parsedScore) : null,
    inspection_date: typeof record.inspection_date === "string" ? record.inspection_date : null,
  }
}

export async function loadRestaurantsFromRest(options: {
  baseUrl: string
  key: string
  fetchImpl?: typeof fetch
  pageSize?: number
}): Promise<DirectoryRestaurantRow[]> {
  const pageSize = options.pageSize ?? RECONCILE_PAGE_SIZE
  const fetchImpl = options.fetchImpl ?? fetch
  const root = restRoot(options.baseUrl)
  const rows: DirectoryRestaurantRow[] = []
  for (let page = 0; page < RECONCILE_PAGE_CAP; page += 1) {
    const offset = page * pageSize
    const response = await fetchImpl(`${root}/rest/v1/${restaurantReadQuery(offset, pageSize)}`, {
      headers: restHeaders(options.key, false),
    })
    if (!response.ok) throw new Error(`Supabase REST read failed (${response.status})`)
    const body: unknown = await response.json()
    if (!Array.isArray(body)) throw new Error("Supabase REST read was not a list")
    for (const row of body) {
      const parsed = parseRestaurantRestRow(row)
      if (parsed) rows.push(parsed)
    }
    if (body.length < pageSize) return rows
  }
  throw new Error("Supabase REST read exceeded the page cap")
}

/**
 * Batched upsert of only the columns in each object. `updated_at` is left
 * alone: it is the publish clock, not the inspection date.
 */
export async function applyRestaurantRestWrites(options: {
  baseUrl: string
  key: string
  writes: RestaurantRestWrite[]
  fetchImpl?: typeof fetch
  batchSize?: number
}): Promise<number> {
  const batchSize = options.batchSize ?? RECONCILE_WRITE_BATCH
  const fetchImpl = options.fetchImpl ?? fetch
  const root = restRoot(options.baseUrl)
  let written = 0
  for (let offset = 0; offset < options.writes.length; offset += batchSize) {
    const batch = options.writes.slice(offset, offset + batchSize)
    const response = await fetchImpl(`${root}/rest/v1/${restaurantWriteQuery()}`, {
      method: "POST",
      headers: restHeaders(options.key, true),
      body: JSON.stringify(batch),
    })
    if (!response.ok) throw new Error(`Supabase REST write failed (${response.status}) after ${written} rows`)
    written += batch.length
  }
  return written
}
