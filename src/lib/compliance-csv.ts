/** Grade C starts at 28 violation points. */
export const HIGH_SCORE = 28

export const LEAD_HEADERS = [
  "lead_type",
  "name",
  "address",
  "borough",
  "neighborhood",
  "phone",
  "inspection_grade",
  "inspection_score",
  "inspection_date",
  "business_status",
] as const

export const OPENING_HEADERS = [
  "name",
  "address",
  "borough",
  "neighborhood",
  "phone",
  "pre_permit",
  "inspection_grade",
  "inspection_date",
] as const

export type LeadReason = "grade-pending" | "high-score" | "not-operational"

export type RestaurantFileRow = {
  name: string
  address: string
  borough: string | null
  neighborhood: string | null
  phone: string | null
  inspection_grade: string | null
  inspection_score: number | null
  inspection_date: string | null
  business_status: string | null
  is_published: boolean
}

export function leadReasons(row: Pick<RestaurantFileRow, "inspection_grade" | "inspection_score" | "business_status">): LeadReason[] {
  const reasons: LeadReason[] = []
  if (row.inspection_grade === "Z" || row.inspection_grade === "P") reasons.push("grade-pending")
  if (row.inspection_score != null && row.inspection_score >= HIGH_SCORE) reasons.push("high-score")
  if (row.business_status != null && row.business_status !== "OPERATIONAL") reasons.push("not-operational")
  return reasons
}

export function isInspectionLead(row: Pick<RestaurantFileRow, "inspection_grade" | "inspection_score" | "business_status">): boolean {
  return leadReasons(row).length > 0
}

/** Published, operational, no inspection date, and no A, B, or C. */
export function isNewOpening(row: Pick<RestaurantFileRow, "is_published" | "business_status" | "inspection_date" | "inspection_grade">): boolean {
  if (!row.is_published) return false
  if (row.business_status !== "OPERATIONAL") return false
  if (row.inspection_date != null && row.inspection_date.trim() !== "") return false
  const grade = row.inspection_grade?.trim() ?? ""
  return grade !== "A" && grade !== "B" && grade !== "C"
}

export function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function toCsv(headers: readonly string[], rows: Array<Array<string | number | null | undefined>>): string {
  const lines = [headers.join(",")]
  for (const row of rows) lines.push(row.map(csvCell).join(","))
  return `${lines.join("\n")}\n`
}

export function inspectionLeadCsv(rows: RestaurantFileRow[]): string {
  const included = rows
    .map((row) => ({ row, reasons: leadReasons(row) }))
    .filter((item) => item.reasons.length > 0)
    .sort((a, b) => a.row.name.localeCompare(b.row.name))
  return toCsv(
    LEAD_HEADERS,
    included.map(({ row, reasons }) => [
      reasons.join("|"),
      row.name,
      row.address,
      row.borough,
      row.neighborhood,
      row.phone,
      row.inspection_grade,
      row.inspection_score,
      row.inspection_date,
      row.business_status,
    ])
  )
}

export function newOpeningCsv(rows: RestaurantFileRow[]): string {
  const included = rows.filter(isNewOpening).sort((a, b) => a.name.localeCompare(b.name))
  return toCsv(
    OPENING_HEADERS,
    included.map((row) => [
      row.name,
      row.address,
      row.borough,
      row.neighborhood,
      row.phone,
      "",
      row.inspection_grade,
      row.inspection_date,
    ])
  )
}
