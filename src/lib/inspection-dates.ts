/**
 * NYC DOHMH dates in this database are stored as M/D/YYYY text.
 * "9/30/2026" sorts after "11/10/2026" as a string, so newest-date and
 * "last 7 days" logic must parse the calendar day. Impossible days
 * (February 31) are rejected instead of rolling into the next month.
 */
function utcCalendarDay(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date
}

export function parseInspectionDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const trimmed = value.trim()
  const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) {
    const month = Number(mdy[1])
    const day = Number(mdy[2])
    const year = Number(mdy[3])
    if (year < 2000) return null
    return utcCalendarDay(year, month, day)
  }
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!iso) return null
  return utcCalendarDay(Number(iso[1]), Number(iso[2]), Number(iso[3]))
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function latestInspectionDate(values: Array<string | null | undefined>): Date | null {
  let latest: Date | null = null
  for (const value of values) {
    const parsed = parseInspectionDate(value)
    if (!parsed) continue
    if (!latest || parsed.getTime() > latest.getTime()) latest = parsed
  }
  return latest
}
