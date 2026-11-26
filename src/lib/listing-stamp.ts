import { parseInspectionDate } from "@/lib/inspection-dates"

/**
 * Per-record sitemap and dateModified stamp.
 * The inspection day is the record date. updated_at is only the fallback when
 * no inspection date is stored, so a shared import timestamp does not replace it.
 */
export function listingStamp(row: {
  updated_at?: Date | string | null
  inspection_date?: string | null
}): Date | undefined {
  const inspection = parseInspectionDate(row.inspection_date ?? null)
  if (inspection) return inspection
  if (!row.updated_at) return undefined
  const updated = row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at)
  return Number.isNaN(updated.getTime()) ? undefined : updated
}

export function latestStamp(dates: Array<Date | undefined>): Date | undefined {
  let max = 0
  for (const date of dates) {
    if (!date) continue
    const time = date.getTime()
    if (time > max) max = time
  }
  return max > 0 ? new Date(max) : undefined
}
