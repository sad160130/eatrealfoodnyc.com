import { BOROUGH_MAP } from "@/config/boroughs"
import { boroughToSlug, parseDietaryTags, parseTimeToMinutes } from "@/lib/utils"
import { formatLongDate, latestInspectionDate } from "@/lib/inspection-dates"

/**
 * A listing is an early opener when it is open at 8:00 AM on every weekday.
 * "Open 24 hours" counts. A range counts when it opens at or before 8:00 AM
 * and is still open at 8:00 AM, so "6AM-7AM" does not. A missing weekday,
 * "Closed", or an unparseable day excludes the listing.
 *
 * Google-style hours often drop the first meridiem: "5-10PM" is 5:00 PM,
 * "7-11AM" is 7:00 AM, "8-10AM" is 8:00 AM. The first clock inherits the
 * second meridiem, and flips when that would put the opening at or after
 * the close ("11-1AM" is 11:00 PM–1:00 AM).
 */

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const
export const EARLY_OPEN_CUTOFF_MINUTES = 8 * 60
export const BREAKFAST_LIST_LIMIT = 10
export const BREAKFAST_PREFERRED_TAGS = [
  "whole-foods",
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
] as const

const PREFERRED = new Set<string>(BREAKFAST_PREFERRED_TAGS)
const BOROUGH_NAMES = Object.values(BOROUGH_MAP)

export interface BreakfastSourceRow {
  name: string
  slug: string
  borough: string | null
  neighborhood: string | null
  dietary_tags: string | null
  rating: number | null
  reviews: number | null
  inspection_grade: string | null
  inspection_score: number | null
  inspection_date: string | null
  working_hours: string | null
}

export interface BreakfastSpot {
  slug: string
  name: string
  borough: string
  neighborhood: string | null
  rating: number | null
  reviews: number | null
  inspectionScore: number | null
  inspectionDateLabel: string
  weekdayOpenLabel: string
  weekdayOpenDetail: string
}

export interface BreakfastBorough {
  borough: string
  href: string
  earlyOpeners: number
  gradeA: number
  shown: BreakfastSpot[]
}

export interface BreakfastGuideData {
  earlyOpeners: number
  gradeA: number
  newestInspection: Date | null
  newestInspectionLabel: string | null
  boroughs: BreakfastBorough[]
  unassignedEarlyOpeners: number
  unassignedGradeA: number
  listed: BreakfastSpot[]
}

type DayOpening = { day: (typeof WEEKDAYS)[number]; open: number | "24h" }

export interface WeekdayOpening {
  days: DayOpening[]
  label: string
  detail: string
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24
  const min = minutes % 60
  const period = h24 >= 12 ? "PM" : "AM"
  const h12 = h24 % 12 || 12
  return `${h12}:${String(min).padStart(2, "0")} ${period}`
}

export function formatWeekdayOpening(days: DayOpening[]): { label: string; detail: string } {
  const detail = days
    .map((day) => `${day.day} ${day.open === "24h" ? "Open 24 hours" : formatClock(day.open)}`)
    .join(", ")
  if (days.every((day) => day.open === "24h")) return { label: "Open 24 hours", detail }
  const clocks = days.flatMap((day) => (day.open === "24h" ? [] : [day.open]))
  const earliest = Math.min(...clocks)
  const latest = Math.max(...clocks)
  const has24 = days.some((day) => day.open === "24h")
  if (!has24 && earliest === latest) return { label: formatClock(earliest), detail }
  if (!has24) {
    const start = formatClock(earliest)
    const end = formatClock(latest)
    const label = start.endsWith(" AM") && end.endsWith(" AM") ? `${start.slice(0, -3)}–${end}` : `${start}–${end}`
    return { label, detail }
  }
  return { label: `Open 24 hours or by ${formatClock(latest)}`, detail }
}

function clockMinutes(clock: string, meridiem: "AM" | "PM"): number | null {
  const minutes = parseTimeToMinutes(`${clock}${meridiem}`)
  if (minutes === null || minutes >= 24 * 60) return null
  return minutes
}

function parsePiece(piece: string): { open: number | "24h"; close: number } | null {
  const text = piece.trim()
  if (!text || /^closed$/i.test(text)) return null
  if (/24\s*hours/i.test(text) || /^open\s*24/i.test(text)) return { open: "24h", close: 24 * 60 }
  const parts = text.replace(/[–—]/g, "-").split("-").map((part) => part.trim())
  if (parts.length !== 2) return null
  const start = parts[0].toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/)
  const end = parts[1].toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/)
  if (!start || !end || !end[3]) return null
  const startHour = Number(start[1])
  const endHour = Number(end[1])
  const startMinute = start[2] ? Number(start[2]) : 0
  const endMinute = end[2] ? Number(end[2]) : 0
  if (startHour < 1 || startHour > 12 || endHour < 1 || endHour > 12 || startMinute > 59 || endMinute > 59) return null
  const startClock = `${start[1]}${start[2] ? `:${start[2]}` : ""}`
  const endClock = `${end[1]}${end[2] ? `:${end[2]}` : ""}`
  const endMeridiem = end[3].toUpperCase() as "AM" | "PM"
  let startMeridiem = (start[3]?.toUpperCase() as "AM" | "PM" | undefined) ?? endMeridiem
  let open = clockMinutes(startClock, startMeridiem)
  const closeClock = clockMinutes(endClock, endMeridiem)
  if (open === null || closeClock === null) return null
  if (!start[3] && open >= closeClock) {
    startMeridiem = startMeridiem === "AM" ? "PM" : "AM"
    open = clockMinutes(startClock, startMeridiem)
    if (open === null) return null
  }
  let close = closeClock
  if (close <= open) close += 24 * 60
  return { open, close }
}

function dayOpening(ranges: string[] | undefined): number | "24h" | null {
  if (!ranges || ranges.length === 0) return null
  let earliest: number | null = null
  let allDay = false
  let parsed = false
  for (const range of ranges) {
    for (const piece of range.split(",")) {
      const span = parsePiece(piece)
      if (!span) continue
      parsed = true
      if (span.open === "24h") {
        allDay = true
        continue
      }
      if (span.open <= EARLY_OPEN_CUTOFF_MINUTES && span.close > EARLY_OPEN_CUTOFF_MINUTES) {
        if (earliest === null || span.open < earliest) earliest = span.open
      }
    }
  }
  if (allDay) return "24h"
  if (!parsed || earliest === null) return null
  return earliest
}

/** Null when the listing is not open by 8:00 AM on every weekday. */
export function weekdayOpening(raw: string | null | undefined): WeekdayOpening | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
  const byDay = new Map<string, string[]>()
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue
    byDay.set(key.toLowerCase(), value.map((item) => String(item)))
  }
  const days: DayOpening[] = []
  for (const day of WEEKDAYS) {
    const open = dayOpening(byDay.get(day.toLowerCase()))
    if (open === null) return null
    days.push({ day, open })
  }
  const formatted = formatWeekdayOpening(days)
  return { days, label: formatted.label, detail: formatted.detail }
}

function isGradeA(grade: string | null | undefined): boolean {
  return (grade ?? "").trim().toUpperCase() === "A"
}

function hasPreferredTag(tags: string | null): boolean {
  return parseDietaryTags(tags).some((tag) => PREFERRED.has(tag.toLowerCase()))
}

function compareSpots(a: BreakfastSourceRow, b: BreakfastSourceRow): number {
  const preferred = Number(hasPreferredTag(b.dietary_tags)) - Number(hasPreferredTag(a.dietary_tags))
  if (preferred !== 0) return preferred
  const rating = (b.rating ?? -1) - (a.rating ?? -1)
  if (rating !== 0) return rating
  const reviews = (b.reviews ?? 0) - (a.reviews ?? 0)
  if (reviews !== 0) return reviews
  return a.name.localeCompare(b.name, "en")
}

function toSpot(row: BreakfastSourceRow, opening: WeekdayOpening): BreakfastSpot {
  const parsed = row.inspection_date ? latestInspectionDate([row.inspection_date]) : null
  return {
    slug: row.slug,
    name: row.name,
    borough: row.borough ?? "",
    neighborhood: row.neighborhood,
    rating: row.rating,
    reviews: row.reviews,
    inspectionScore: row.inspection_score,
    inspectionDateLabel: parsed ? formatLongDate(parsed) : "Date not on file",
    weekdayOpenLabel: opening.label,
    weekdayOpenDetail: opening.detail,
  }
}

/**
 * Rows must already be published and operational. Hours and grades are
 * read from the stored listing. Nothing here is a hardcoded count.
 */
export function buildBreakfastGuideData(rows: BreakfastSourceRow[]): BreakfastGuideData {
  const early: Array<{ row: BreakfastSourceRow; opening: WeekdayOpening }> = []
  for (const row of rows) {
    const opening = weekdayOpening(row.working_hours)
    if (opening) early.push({ row, opening })
  }

  const newest = latestInspectionDate(early.map((item) => item.row.inspection_date))
  const known = new Set<string>(BOROUGH_NAMES)
  const buckets = new Map<string, Array<{ row: BreakfastSourceRow; opening: WeekdayOpening }>>()
  for (const name of BOROUGH_NAMES) buckets.set(name, [])
  let unassignedEarlyOpeners = 0
  let unassignedGradeA = 0

  for (const item of early) {
    const borough = item.row.borough && known.has(item.row.borough) ? item.row.borough : null
    if (!borough) {
      unassignedEarlyOpeners += 1
      if (isGradeA(item.row.inspection_grade)) unassignedGradeA += 1
      continue
    }
    buckets.get(borough)!.push(item)
  }

  const boroughs: BreakfastBorough[] = BOROUGH_NAMES.map((borough) => {
    const items = buckets.get(borough) ?? []
    const gradeAItems = items
      .filter((item) => isGradeA(item.row.inspection_grade))
      .sort((a, b) => compareSpots(a.row, b.row))
    return {
      borough,
      href: `/nyc/${boroughToSlug(borough)}/healthy-restaurants`,
      earlyOpeners: items.length,
      gradeA: gradeAItems.length,
      shown: gradeAItems.slice(0, BREAKFAST_LIST_LIMIT).map((item) => toSpot(item.row, item.opening)),
    }
  })

  return {
    earlyOpeners: early.length,
    gradeA: early.filter((item) => isGradeA(item.row.inspection_grade)).length,
    newestInspection: newest,
    newestInspectionLabel: newest ? formatLongDate(newest) : null,
    boroughs,
    unassignedEarlyOpeners,
    unassignedGradeA,
    listed: boroughs.flatMap((borough) => borough.shown),
  }
}
