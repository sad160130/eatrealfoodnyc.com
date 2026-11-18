import { formatLongDate, latestInspectionDate } from "@/lib/inspection-dates"

/**
 * Counts for the health-grades guide. Every input row is already a published
 * listing. Dates are M/D/YYYY strings; string order is not chronological.
 */
export interface PublishedGradeSnapshot {
  published: number
  A: number
  B: number
  C: number
  pendingZ: number
  pendingP: number
  pending: number
  /** Published listings with no A, B, C, Z, or P on file. */
  ungraded: number
  /** Grade A divided by published listings, rounded to the nearest percent. */
  gradeAShareOfPublished: number
  latestInspectionIso: string | null
  latestInspectionLabel: string | null
}

export function summarizePublishedGrades(
  rows: Array<{ inspection_grade: string | null; inspection_date?: string | null }>,
): PublishedGradeSnapshot {
  let A = 0
  let B = 0
  let C = 0
  let pendingZ = 0
  let pendingP = 0
  const dates: Array<string | null | undefined> = []

  for (const row of rows) {
    const code = (row.inspection_grade ?? "").trim().toUpperCase()
    if (code === "A") A += 1
    else if (code === "B") B += 1
    else if (code === "C") C += 1
    else if (code === "Z") pendingZ += 1
    else if (code === "P") pendingP += 1
    dates.push(row.inspection_date)
  }

  const published = rows.length
  const pending = pendingZ + pendingP
  const latest = latestInspectionDate(dates)

  return {
    published,
    A,
    B,
    C,
    pendingZ,
    pendingP,
    pending,
    ungraded: published - A - B - C - pending,
    gradeAShareOfPublished: published > 0 ? Math.round((A / published) * 100) : 0,
    latestInspectionIso: latest ? latest.toISOString().slice(0, 10) : null,
    latestInspectionLabel: latest ? formatLongDate(latest) : null,
  }
}
