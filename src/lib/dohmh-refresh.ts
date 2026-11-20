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
 * Lookback for the scheduled refresh. Long enough to cover the Thursday
 * newsletter's seven-day window plus a late SODA publish, short enough to
 * finish inside the function duration cap.
 */
export const DOHMH_REFRESH_WINDOW_DAYS = 14

export const DOHMH_CRON_PAGE_SIZE = 5_000
export const DOHMH_CRON_MAX_ROWS = 100_000

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
  const scoreRaw = field(row, "score")
  const score = scoreRaw == null ? null : Number(scoreRaw)
  return {
    camis,
    name,
    borough: field(row, "boro"),
    grade: field(row, "grade"),
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

export async function fetchDohmhInspections(options: {
  since: string
  token?: string
  fetchImpl?: typeof fetch
  pageSize?: number
  maxRows?: number
  /** Cron pulls. The manual script leaves this off and filters on inspection_date only. */
  recordDate?: boolean
  onPage?: (info: { offset: number; pageRows: number }) => void
}): Promise<DohmhInspection[]> {
  const pageSize = options.pageSize ?? DOHMH_CRON_PAGE_SIZE
  const maxRows = options.maxRows ?? DOHMH_CRON_MAX_ROWS
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50_000) throw new Error("invalid page size")
  if (!Number.isInteger(maxRows) || maxRows < pageSize) throw new Error("invalid row cap")
  const fetchImpl = options.fetchImpl ?? fetch
  const headers: Record<string, string> = {}
  if (options.token) headers["X-App-Token"] = options.token
  const rows: DohmhInspection[] = []

  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const response = await fetchImpl(dohmhInspectionsUrl(options.since, offset, pageSize, options.recordDate === true), { headers })
    if (!response.ok) throw new Error(`DOHMH request failed (${response.status}) at offset ${offset}`)
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
  unchanged: number
}

/**
 * Incremental refresh. Does not insert restaurants. A second call with the
 * same city rows and the same stored grades writes nothing.
 * `replaceOlder` stays false: a 14-day window must not overwrite a newer
 * stored inspection with an older row from that window.
 */
export async function runDohmhRefresh(options: {
  dry: boolean
  now?: Date
  windowDays?: number
  fetchInspections: (since: string) => Promise<DohmhInspection[]>
  loadRestaurants: () => Promise<InspectionTarget[]>
  applyWrites: (writes: InspectionWrite[]) => Promise<number>
}): Promise<DohmhRefreshResult> {
  const since = dohmhWindowStart(options.now, options.windowDays ?? DOHMH_REFRESH_WINDOW_DAYS)
  const [restaurants, inspections] = await Promise.all([
    options.loadRestaurants(),
    options.fetchInspections(since),
  ])
  const plan = planInspectionUpdates(restaurants, snapshotsFromInspections(inspections), { replaceOlder: false })
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
    unchanged: plan.unchanged,
  }
}
