import { getCanonicalUrl } from "@/config/seo"
import { ANCHOR_TEXT } from "@/lib/internal-links"
import { formatLongDate, parseInspectionDate } from "@/lib/inspection-dates"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

/** Seven calendar days, ending on the issue date, inclusive. */
export const NEWSLETTER_WINDOW_DAYS = 7

/**
 * There is no inspection-history table. The current grade and date are the
 * only DOHMH fields on a listing, so an issue cannot report grade changes.
 */
export const GRADE_CHANGE_HISTORY = false

export const NEWSLETTER_SPONSOR_LABEL = "Sponsored" as const
export const NEWSLETTER_SPONSOR_TEXT = "Want this spot? Sponsor Grade A Eats This Week"
export const NEWSLETTER_SPONSOR_PATH = "/partner-with-us#more-ways"

const DAY_MS = 86_400_000

export type NewsletterSourceRow = {
  name: string
  slug: string
  borough: string | null
  neighborhood: string | null
  inspection_grade: string | null
  inspection_date: string | null
  inspection_score?: number | null
  /** Omitted rows are treated as published. Explicit false is excluded. */
  is_published?: boolean
}

export type NewsletterGradeAItem = {
  name: string
  slug: string
  borough: string | null
  neighborhood: string | null
  inspectionDate: string
  inspectionDateLabel: string
  inspectionScore: number | null
  path: string
  href: string
}

export type NewsletterNeighborhoodPick = {
  borough: string
  neighborhood: string
  count: number
  anchor: string
  path: string
  href: string
}

export type NewsletterSponsoredSlot = {
  label: typeof NEWSLETTER_SPONSOR_LABEL
  text: typeof NEWSLETTER_SPONSOR_TEXT
  path: typeof NEWSLETTER_SPONSOR_PATH
  href: string
}

export type NewsletterIssue = {
  issueDate: string
  issueDateLabel: string
  windowStart: string
  windowEnd: string
  windowLabel: string
  campaign: string
  gradeA: NewsletterGradeAItem[]
  neighborhoodPick: NewsletterNeighborhoodPick | null
  /** Always null. Grade changes are not derivable from the current row. */
  gradeChanges: null
  sponsored: NewsletterSponsoredSlot
  subject: string
  html: string
  text: string
}

export type NewsletterArchiveEntry = {
  date: string
  label: string
  gradeACount: number
  neighborhood: string | null
  borough: string | null
}

/** Calendar day for an M/D/YYYY (or ISO) inspection date. Overflow dates are rejected. */
export function parseInspectionDay(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  const parsed = parseInspectionDate(trimmed)
  if (!parsed) return null
  const iso = parsed.toISOString().slice(0, 10)
  const [year, month, day] = iso.split("-").map(Number)

  const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) {
    if (Number(mdy[3]) !== year || Number(mdy[1]) !== month || Number(mdy[2]) !== day) return null
    return iso
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!isoMatch) return null
  if (Number(isoMatch[1]) < 2000) return null
  if (iso !== `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`) return null
  return iso
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return parseInspectionDay(value) === value
}

export function addIsoDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day) + days * DAY_MS).toISOString().slice(0, 10)
}

export function issueWindow(issueDate: string): { start: string; end: string } {
  return { start: addIsoDays(issueDate, -(NEWSLETTER_WINDOW_DAYS - 1)), end: issueDate }
}

function weekdayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** Thursday is weekday 4. Returns the Thursday on or before `iso`. */
export function thursdayOnOrBefore(iso: string): string {
  const sinceThursday = (weekdayIndex(iso) + 7 - 4) % 7
  return addIsoDays(iso, -sinceThursday)
}

/** Thursday is weekday 4. Returns the Thursday on or after `iso`. */
export function thursdayOnOrAfter(iso: string): string {
  const untilThursday = (4 - weekdayIndex(iso) + 7) % 7
  return addIsoDays(iso, untilThursday)
}

export function utcDayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** The Thursday send date for `now` (UTC). Cron runs Thursday 14:00 UTC. */
export function currentIssueDate(now = new Date()): string {
  return thursdayOnOrBefore(utcDayIso(now))
}

/** Public archive dates are Thursdays on or before today (UTC). */
export function isIssueDate(date: string, now = new Date()): boolean {
  if (!isIsoDate(date)) return false
  if (date > utcDayIso(now)) return false
  return thursdayOnOrBefore(date) === date
}

/**
 * Thursday issues treated as recent, ending on currentIssueDate.
 * That is the current Thursday plus the eleven before it. The Thursday
 * twelve weeks earlier is outside the window.
 */
export const NEWSLETTER_RECENT_WEEKS = 12

/** Published Grade A listings required before a recent issue is indexable. */
export const NEWSLETTER_INDEX_MIN_GRADE_A = 3

/** Oldest Thursday in the recent window. Issue dates are seven days apart. */
export function recentNewsletterIssueStart(now = new Date()): string {
  return addIsoDays(currentIssueDate(now), -(NEWSLETTER_RECENT_WEEKS - 1) * 7)
}

/**
 * Index an issue only when it falls in the last 12 weeks relative to
 * currentIssueDate and it has at least 3 Grade A listings. Every other
 * valid Thursday stays reachable and is omitted from the sitemap.
 */
export function isNewsletterIssueIndexable(issueDate: string, gradeACount: number, now = new Date()): boolean {
  if (!isIssueDate(issueDate, now)) return false
  if (issueDate < recentNewsletterIssueStart(now)) return false
  return Number.isInteger(gradeACount) && gradeACount >= NEWSLETTER_INDEX_MIN_GRADE_A
}

/** Split archive rows into the recent 12 weeks and everything older. Order is preserved. */
export function partitionNewsletterArchive<T extends { date: string }>(
  entries: T[],
  now = new Date(),
): { recent: T[]; older: T[] } {
  const start = recentNewsletterIssueStart(now)
  const current = currentIssueDate(now)
  const recent: T[] = []
  const older: T[] = []
  for (const entry of entries) {
    if (entry.date >= start && entry.date <= current) recent.push(entry)
    else older.push(entry)
  }
  return { recent, older }
}

export function formatIssueLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function newsletterCampaign(issueDate: string): string {
  return `grade-a-weekly-${issueDate}`
}

export function newsletterTrackedUrl(path: string, issueDate: string): string {
  const hashAt = path.indexOf("#")
  const hash = hashAt >= 0 ? path.slice(hashAt + 1) : ""
  const withoutHash = hashAt >= 0 ? path.slice(0, hashAt) : path
  const url = new URL(getCanonicalUrl(withoutHash))
  url.searchParams.set("utm_source", "newsletter")
  url.searchParams.set("utm_medium", "email")
  url.searchParams.set("utm_campaign", newsletterCampaign(issueDate))
  if (hash) url.hash = hash
  return url.toString()
}

export function issuePageTitle(issueDate: string): string {
  return `Grade A Eats: ${formatIssueLabel(issueDate)}`
}

export function issuePageDescription(issueDate: string): string {
  const label = formatLongDate(new Date(`${issueDate}T00:00:00.000Z`))
  return `New NYC DOHMH Grade A restaurants for the week ending ${label}, from published listings on Eat Real Food NYC.`
}

export function archivePageDescription(): string {
  return "Weekly Grade A roundups, rebuilt from published listings and the NYC DOHMH inspection date on each one. The email edition started in November 2026."
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function isGradeA(value: string | null): boolean {
  return (value ?? "").trim().toUpperCase() === "A"
}

function listingCount(count: number): string {
  return count === 1 ? "1 new Grade A listing" : `${count} new Grade A listings`
}

function placeLine(item: { neighborhood: string | null; borough: string | null }): string | null {
  if (item.neighborhood && item.borough) return `${item.neighborhood}, ${item.borough}`
  return item.neighborhood ?? item.borough
}

function renderEmail(issue: Omit<NewsletterIssue, "subject" | "html" | "text"> & { subject: string }): { html: string; text: string } {
  const intro = `Published restaurants whose current NYC DOHMH grade is A and whose inspection date falls in the seven days ending ${issue.issueDateLabel}.`
  const text: string[] = [
    "Grade A Eats This Week",
    `Week ending ${issue.issueDateLabel}`,
    "",
    intro,
    "",
  ]
  const html: string[] = [
    `<div style="margin:0;padding:24px;background:#F8F6F1;color:#1B3A2D;font-family:Georgia,serif;">`,
    `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#2D6A4F;">Grade A Eats This Week</p>`,
    `<p style="margin:0 0 12px;font-size:28px;font-weight:bold;line-height:1.2;">Week ending ${escapeHtml(issue.issueDateLabel)}</p>`,
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.5;">${escapeHtml(intro)}</p>`,
  ]

  if (issue.gradeA.length > 0) {
    text.push("New Grade A", "")
    html.push(`<p style="margin:24px 0 8px;font-size:20px;font-weight:bold;">New Grade A</p>`)
    for (const item of issue.gradeA) {
      const place = placeLine(item)
      const score = item.inspectionScore != null ? `, inspection score ${item.inspectionScore}` : ""
      const detail = [place, `inspected ${item.inspectionDateLabel}`, "Grade A"].filter(Boolean).join(" · ")
      text.push(item.name)
      text.push(`${detail}${score}`)
      text.push(item.href)
      text.push("")
      html.push(
        `<p style="margin:0 0 4px;font-size:16px;line-height:1.5;"><a href="${escapeHtml(item.href)}" style="color:#2D6A4F;font-weight:bold;">${escapeHtml(item.name)}</a></p>`
      )
      html.push(
        `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;">${escapeHtml(detail)}${score ? escapeHtml(score) : ""}</p>`
      )
    }
  } else {
    const empty = "No published restaurant has a current NYC DOHMH Grade A inspection date in this seven-day window."
    text.push(empty, "")
    html.push(`<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${escapeHtml(empty)}</p>`)
  }

  if (issue.neighborhoodPick) {
    const pick = issue.neighborhoodPick
    const sentence = `The neighborhood with the most new Grade A listings this week is ${pick.neighborhood}, ${pick.borough}: ${listingCount(pick.count)}.`
    text.push("Neighborhood pick", sentence, pick.href, "")
    html.push(`<p style="margin:24px 0 8px;font-size:20px;font-weight:bold;">Neighborhood pick</p>`)
    html.push(`<p style="margin:0 0 8px;font-size:16px;line-height:1.5;">${escapeHtml(sentence)}</p>`)
    html.push(
      `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;"><a href="${escapeHtml(pick.href)}" style="color:#2D6A4F;">${escapeHtml(pick.anchor)}</a></p>`
    )
  }

  text.push(
    NEWSLETTER_SPONSOR_LABEL,
    NEWSLETTER_SPONSOR_TEXT,
    issue.sponsored.href,
    "",
    "Grades and dates: NYC Department of Health and Mental Hygiene, as matched on Eat Real Food NYC.",
    getCanonicalUrl("/")
  )
  html.push(`<p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#2D6A4F;">${NEWSLETTER_SPONSOR_LABEL}</p>`)
  html.push(
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;"><a href="${escapeHtml(issue.sponsored.href)}" style="color:#2D6A4F;">${escapeHtml(NEWSLETTER_SPONSOR_TEXT)}</a></p>`
  )
  html.push(
    `<p style="margin:24px 0 0;font-size:14px;line-height:1.5;">Grades and dates: NYC Department of Health and Mental Hygiene, as matched on Eat Real Food NYC.</p>`
  )
  html.push(`</div>`)

  return { text: text.join("\n"), html: html.join("") }
}

/**
 * Assemble one issue from listing rows. Pure: no database and no network.
 * Grade changes are omitted because the table stores only the current grade.
 */
export function buildNewsletterIssue(rows: NewsletterSourceRow[], issueDate: string): NewsletterIssue {
  if (!isIsoDate(issueDate)) throw new Error("invalid issue date")
  const window = issueWindow(issueDate)
  const gradeA: NewsletterGradeAItem[] = []

  for (const row of rows) {
    if (row.is_published === false) continue
    if (!row.name.trim() || !row.slug.trim()) continue
    if (!isGradeA(row.inspection_grade)) continue
    const inspectionDate = parseInspectionDay(row.inspection_date)
    if (!inspectionDate) continue
    if (inspectionDate < window.start || inspectionDate > window.end) continue
    const slug = row.slug.trim()
    const score = typeof row.inspection_score === "number" && Number.isFinite(row.inspection_score)
      ? row.inspection_score
      : null
    gradeA.push({
      name: row.name.trim(),
      slug,
      borough: row.borough?.trim() || null,
      neighborhood: row.neighborhood?.trim() || null,
      inspectionDate,
      inspectionDateLabel: formatLongDate(new Date(`${inspectionDate}T00:00:00.000Z`)),
      inspectionScore: score,
      path: `/restaurants/${slug}`,
      href: newsletterTrackedUrl(`/restaurants/${slug}`, issueDate),
    })
  }

  gradeA.sort((a, b) => {
    if (a.inspectionDate !== b.inspectionDate) return a.inspectionDate < b.inspectionDate ? 1 : -1
    const byName = a.name.localeCompare(b.name)
    if (byName !== 0) return byName
    return a.slug.localeCompare(b.slug)
  })

  const groups = new Map<string, NewsletterNeighborhoodPick>()
  for (const item of gradeA) {
    if (!item.borough || !item.neighborhood) continue
    const key = `${item.borough}\u0000${item.neighborhood}`
    const existing = groups.get(key)
    if (existing) {
      existing.count += 1
      continue
    }
    const path = `/nyc/${boroughToSlug(item.borough)}/${neighborhoodToSlug(item.neighborhood)}/healthy-restaurants`
    groups.set(key, {
      borough: item.borough,
      neighborhood: item.neighborhood,
      count: 1,
      anchor: ANCHOR_TEXT.neighborhoodHub(item.neighborhood, item.borough),
      path,
      href: newsletterTrackedUrl(path, issueDate),
    })
  }

  const ranked = [...groups.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    const byName = a.neighborhood.localeCompare(b.neighborhood)
    if (byName !== 0) return byName
    return a.borough.localeCompare(b.borough)
  })

  const issueDateLabel = formatLongDate(new Date(`${issueDate}T00:00:00.000Z`))
  const sponsored: NewsletterSponsoredSlot = {
    label: NEWSLETTER_SPONSOR_LABEL,
    text: NEWSLETTER_SPONSOR_TEXT,
    path: NEWSLETTER_SPONSOR_PATH,
    href: newsletterTrackedUrl(NEWSLETTER_SPONSOR_PATH, issueDate),
  }
  const draft: Omit<NewsletterIssue, "html" | "text"> = {
    issueDate,
    issueDateLabel,
    windowStart: window.start,
    windowEnd: window.end,
    windowLabel: `${formatLongDate(new Date(`${window.start}T00:00:00.000Z`))} through ${issueDateLabel}`,
    campaign: newsletterCampaign(issueDate),
    gradeA,
    neighborhoodPick: ranked[0] ?? null,
    gradeChanges: null,
    sponsored,
    subject: `Grade A Eats This Week — ${issueDateLabel}`,
  }
  const rendered = renderEmail(draft)
  return { ...draft, html: rendered.html, text: rendered.text }
}

export function newsletterWebPageSchema(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: getCanonicalUrl(input.path),
  }
}

/** Thursday issue dates that contain a parsed Grade A inspection, plus the current Thursday. */
export function archivedIssueDates(values: Array<string | null | undefined>, now = new Date()): string[] {
  const current = currentIssueDate(now)
  const dates = new Set<string>([current])
  for (const value of values) {
    const day = parseInspectionDay(value)
    if (!day) continue
    const issueDate = thursdayOnOrAfter(day)
    if (issueDate <= current) dates.add(issueDate)
  }
  return [...dates].sort((a, b) => (a < b ? 1 : -1))
}

export function summarizeNewsletterArchive(rows: NewsletterSourceRow[], now = new Date()): NewsletterArchiveEntry[] {
  const dates = archivedIssueDates(
    rows.map((row) => row.inspection_date),
    now
  )
  return dates.map((date) => {
    const issue = buildNewsletterIssue(rows, date)
    return {
      date,
      label: issue.issueDateLabel,
      gradeACount: issue.gradeA.length,
      neighborhood: issue.neighborhoodPick?.neighborhood ?? null,
      borough: issue.neighborhoodPick?.borough ?? null,
    }
  })
}
