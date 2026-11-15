/** NYC DOHMH dates in this database are stored as M/D/YYYY strings. */
export function parseInspectionDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const trimmed = value.trim()
  const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) {
    const month = Number(mdy[1])
    const day = Number(mdy[2])
    const year = Number(mdy[3])
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000) return null
    return new Date(Date.UTC(year, month - 1, day))
  }
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!iso) return null
  return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
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
