import { latestInspectionDate } from "./inspection-dates"
import {
  latestGradedInspection,
  planInspectionUpdates,
  addressKeyFromDohmh,
  type DohmhInspection,
  type GradeSnapshot,
  type InspectionTarget,
  type InspectionWrite,
} from "./dohmh-grade"

/** NYC Open Data: DOHMH New York City Restaurant Inspection Results. */
export const DOHMH_SODA_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"

/**
 * The scheduled refresh used to read 14 days. Inspections published before
 * the first window were never backfilled. The cron now pulls at least three
 * years so a missed day heals on the next run. Four years stays inside the
 * grouped row cap (one row per inspection date, about two pages).
 */
export const DOHMH_REFRESH_LOOKBACK_YEARS = 4

/** Kept for a caller that wants a short floor. The cron does not use it. */
export const DOHMH_REFRESH_WINDOW_DAYS = 14

export const DOHMH_CRON_PAGE_SIZE = 50_000
export const DOHMH_CRON_MAX_ROWS = 200_000
export const DOHMH_FETCH_ATTEMPTS = 4

/** Manual full lookback. The cron must not use these. */
export const DOHMH_SCRIPT_PAGE_SIZE = 50_000
export const DOHMH_SCRIPT_MAX_ROWS = 2_000_000

const GRADE_FILTER = "grade in('A','B','C','Z','P','N')"

export function dohmhWindowStart(now = new Date(), days = DOHMH_REFRESH_WINDOW_DAYS): string {
  if (!Number.isInteger(days) || days < 1 || days > 3650) throw new Error("invalid window")
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

/**
 * SoQL filter. Parentheses are required: AND binds tighter than OR.
 * `record_date` is included so a row published during the window is eligible.
 * `inspection_date` is also floored at the same day. The open dataset restamps
 * `record_date` on historical inspections, so an unbounded record_date
 * predicate downloads the graded file rather than an incremental window.
 */
export function dohmhInspectionWhere(since: string, recordDate = false): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error("invalid since date")
  const stamp = `${since}T00:00:00.000`
  if (!recordDate) return `inspection_date >= '${stamp}' AND ${GRADE_FILTER}`
  return `(inspection_date >= '${stamp}' OR record_date >= '${stamp}') AND inspection_date >= '${stamp}' AND ${GRADE_FILTER}`
}

export function dohmhInspectionsUrl(since: string, offset: number, limit: number, recordDate = false): string {
  const url = new URL(DOHMH_SODA_URL)
  url.searchParams.set("$select", "camis,dba,boro,grade,score,inspection_date,building,street,zipcode")
  url.searchParams.set("$where", dohmhInspectionWhere(since, recordDate))
  url.searchParams.set("$order", "inspection_date DESC")
  url.searchParams.set("$limit", String(limit))
  url.searchParams.set("$offset", String(offset))
  return url.toString()
}

/**
 * One row per establishment per inspection date. Aliases must not reuse the
 * column names `score` and `grade`; SODA returns 400 when they do.
 * `score IS NOT NULL` drops empty violation shells. Blank grades stay in the
 * pull so the latest-graded rule can ignore them.
 */
export function dohmhGroupedWhere(since: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error("invalid since date")
  return `inspection_date >= '${since}T00:00:00.000' AND score IS NOT NULL`
}

export const DOHMH_GROUPED_SELECT =
  "camis,dba,boro,building,street,zipcode,inspection_date,max(score) as sc,max(grade) as gr"

export const DOHMH_GROUPED_GROUP = "camis,dba,boro,building,street,zipcode,inspection_date"

export function dohmhGroupedInspectionsUrl(since: string, offset: number, limit: number): string {
  const url = new URL(DOHMH_SODA_URL)
  url.searchParams.set("$select", DOHMH_GROUPED_SELECT)
  url.searchParams.set("$group", DOHMH_GROUPED_GROUP)
  url.searchParams.set("$where", dohmhGroupedWhere(since))
  url.searchParams.set("$order", DOHMH_GROUPED_GROUP)
  url.searchParams.set("$limit", String(limit))
  url.searchParams.set("$offset", String(offset))
  return url.toString()
}

export function dohmhLookbackStart(now = new Date(), years = DOHMH_REFRESH_LOOKBACK_YEARS): string {
  if (!Number.isInteger(years) || years < 3 || years > 10) throw new Error("invalid lookback")
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  date.setUTCFullYear(date.getUTCFullYear() - years)
  return date.toISOString().slice(0, 10)
}

export function dohmhCronFetchConfig(token?: string): {
  token?: string
  pageSize: number
  maxRows: number
  grouped: true
} {
  return {
    token: token || undefined,
    pageSize: DOHMH_CRON_PAGE_SIZE,
    maxRows: DOHMH_CRON_MAX_ROWS,
    grouped: true,
  }
}

function field(row: unknown, key: string): string | null {
  if (!row || typeof row !== "object") return null
  const value = (row as Record<string, unknown>)[key]
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return null
}

export function parseDohmhRow(row: unknown): DohmhInspection | null {
  const camis = field(row, "camis")
  const name = field(row, "dba")
  if (!camis || !name) return null
  const scoreRaw = field(row, "score") ?? field(row, "sc")
  const score = scoreRaw == null ? null : Number(scoreRaw)
  return {
    camis,
    name,
    borough: field(row, "boro"),
    grade: field(row, "grade") ?? field(row, "gr"),
    score: score != null && Number.isFinite(score) ? score : null,
    inspectionDate: field(row, "inspection_date"),
    building: field(row, "building"),
    street: field(row, "street"),
    zip: field(row, "zipcode"),
  }
}

export function snapshotsFromInspections(rows: DohmhInspection[]): GradeSnapshot[] {
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

export function newestInspectionIso(rows: Array<Pick<DohmhInspection, "inspectionDate">>): string | null {
  const latest = latestInspectionDate(rows.map((row) => row.inspectionDate))
  return latest ? latest.toISOString().slice(0, 10) : null
}

const RETRY_STATUSES = new Set([429, 502, 503])

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchDohmhPage(options: {
  url: string
  headers: Record<string, string>
  fetchImpl: typeof fetch
  offset: number
  attempts: number
  retryDelayMs: number
}): Promise<Response> {
  let lastStatus = 0
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      const response = await options.fetchImpl(options.url, { headers: options.headers })
      if (response.ok) return response
      lastStatus = response.status
      if (!RETRY_STATUSES.has(response.status) || attempt === options.attempts) break
    } catch {
      lastStatus = 0
      if (attempt === options.attempts) {
        throw new Error(`DOHMH request failed (network) at offset ${options.offset}`)
      }
    }
    if (options.retryDelayMs > 0) await sleep(options.retryDelayMs * 2 ** (attempt - 1))
  }
  throw new Error(`DOHMH request failed (${lastStatus || "network"}) at offset ${options.offset}`)
}

export async function fetchDohmhInspections(options: {
  since: string
  token?: string
  fetchImpl?: typeof fetch
  pageSize?: number
  maxRows?: number
  /** Ungrouped pulls. Ignored when `grouped` is set. */
  recordDate?: boolean
  /** One row per inspection date. The cron and the backfill script use this. */
  grouped?: boolean
  attempts?: number
  retryDelayMs?: number
  onPage?: (info: { offset: number; pageRows: number }) => void
}): Promise<DohmhInspection[]> {
  const pageSize = options.pageSize ?? DOHMH_CRON_PAGE_SIZE
  const maxRows = options.maxRows ?? DOHMH_CRON_MAX_ROWS
  const attempts = options.attempts ?? DOHMH_FETCH_ATTEMPTS
  const retryDelayMs = options.retryDelayMs ?? 300
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50_000) throw new Error("invalid page size")
  if (!Number.isInteger(maxRows) || maxRows < pageSize) throw new Error("invalid row cap")
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6) throw new Error("invalid attempts")
  const fetchImpl = options.fetchImpl ?? fetch
  const headers: Record<string, string> = {}
  if (options.token) headers["X-App-Token"] = options.token
  const rows: DohmhInspection[] = []

  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const url = options.grouped
      ? dohmhGroupedInspectionsUrl(options.since, offset, pageSize)
      : dohmhInspectionsUrl(options.since, offset, pageSize, options.recordDate === true)
    const response = await fetchDohmhPage({ url, headers, fetchImpl, offset, attempts, retryDelayMs })
    const page: unknown = await response.json()
    if (!Array.isArray(page)) throw new Error(`DOHMH response was not a list at offset ${offset}`)
    for (const row of page) {
      const parsed = parseDohmhRow(row)
      if (parsed) rows.push(parsed)
    }
    options.onPage?.({ offset, pageRows: page.length })
    if (page.length < pageSize) return rows
    if (offset + pageSize >= maxRows) throw new Error("DOHMH refresh exceeded the row cap")
  }
  return rows
}

export interface DohmhRefreshResult {
  dryRun: boolean
  since: string
  rowsFetched: number
  restaurantsUpdated: number
  plannedUpdates: number
  newestInspectionDate: string | null
  matched: number
  skippedNameOnly: number
  skippedOlder: number
  skippedAmbiguous: number
  skippedNameConflict: number
  nameConflictSample: Array<{
    id: number
    listingName: string
    cityName: string
    camis: string
  }>
  unchanged: number
  nameMismatches: number
  nameMismatchSample: Array<{
    id: number
    listingName: string
    cityName: string
    camis: string
  }>
}

/**
 * Full-lookback refresh. Does not insert restaurants and does not rename
 * them. The fetched latest graded inspection replaces an older stored date
 * only when the listing name and the city DBA agree. A second call with the
 * same city rows and the same stored grades writes nothing. `?dry=1` plans
 * the writes and does not apply them.
 */
export async function runDohmhRefresh(options: {
  dry: boolean
  now?: Date
  lookbackYears?: number
  fetchInspections: (since: string) => Promise<DohmhInspection[]>
  loadRestaurants: () => Promise<InspectionTarget[]>
  applyWrites: (writes: InspectionWrite[]) => Promise<number>
}): Promise<DohmhRefreshResult> {
  const since = dohmhLookbackStart(options.now, options.lookbackYears ?? DOHMH_REFRESH_LOOKBACK_YEARS)
  const [restaurants, inspections] = await Promise.all([
    options.loadRestaurants(),
    options.fetchInspections(since),
  ])
  const plan = planInspectionUpdates(restaurants, snapshotsFromInspections(inspections), { replaceOlder: true })
  const restaurantsUpdated = options.dry || plan.writes.length === 0 ? 0 : await options.applyWrites(plan.writes)
  return {
    dryRun: options.dry,
    since,
    rowsFetched: inspections.length,
    restaurantsUpdated,
    plannedUpdates: plan.writes.length,
    newestInspectionDate: newestInspectionIso(inspections),
    matched: plan.matched,
    skippedNameOnly: plan.skippedNameOnly,
    skippedOlder: plan.skippedOlder,
    skippedAmbiguous: plan.skippedAmbiguous,
    skippedNameConflict: plan.skippedNameConflict,
    nameConflictSample: plan.nameConflictSample,
    unchanged: plan.unchanged,
    nameMismatches: plan.nameMismatches,
    nameMismatchSample: plan.nameMismatchSample,
  }
}
