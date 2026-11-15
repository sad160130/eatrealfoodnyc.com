/**
 * Dates that come from stored data. Never returns the current request time.
 * Inspection dates in this database are strings; unparseable values are omitted.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export interface ParsedDay {
  /** UTC midnight for the calendar day. */
  date: Date
  /** YYYY-MM-DD */
  iso: string
  /** "Mar 2026" */
  monthYear: string
  /** "March 2026" */
  monthYearLong: string
}

function fromParts(year: number, monthIndex: number, day: number): ParsedDay | null {
  if (year < 1990 || year > 2100) return null
  if (monthIndex < 0 || monthIndex > 11) return null
  if (day < 1 || day > 31) return null
  const date = new Date(Date.UTC(year, monthIndex, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== monthIndex || date.getUTCDate() !== day) {
    return null
  }
  const iso = date.toISOString().slice(0, 10)
  const monthYear = `${MONTHS[monthIndex]} ${year}`
  const monthYearLong = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
  return { date, iso, monthYear, monthYearLong }
}

/** Parse a stored inspection_date or ISO timestamp. Returns null when the value is missing or not a real date. */
export function parseStoredDate(raw: string | Date | null | undefined): ParsedDay | null {
  if (raw == null) return null
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null
    return fromParts(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
  }
  const value = raw.trim()
  if (!value) return null

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return fromParts(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))

  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (us) return fromParts(Number(us[3]), Number(us[1]) - 1, Number(us[2]))

  return null
}

export function formatInspectionMonth(raw: string | Date | null | undefined): string | null {
  return parseStoredDate(raw)?.monthYear ?? null
}

/** Prefer the inspection day. Fall back to the row's updated_at. Never the request clock. */
export function recordStamp(
  inspectionDate: string | Date | null | undefined,
  updatedAt: string | Date | null | undefined
): Date | null {
  return parseStoredDate(inspectionDate)?.date ?? parseStoredDate(updatedAt)?.date ?? null
}

export function laterDate(current: Date | null, next: Date | null): Date | null {
  if (!next) return current
  if (!current || next.getTime() > current.getTime()) return next
  return current
}

/** Later of two stored dates, ignoring anything that does not parse. */
export function latestStoredDate(
  values: Array<string | Date | null | undefined>
): ParsedDay | null {
  let best: ParsedDay | null = null
  for (const value of values) {
    const parsed = parseStoredDate(value)
    if (!parsed) continue
    if (!best || parsed.date.getTime() > best.date.getTime()) best = parsed
  }
  return best
}
