import { presentGrade } from "@/lib/grade-display"
import { parseInspectionDate } from "@/lib/inspection-dates"

export type BadgeKind = "grade-a" | "listed"

const SIZES = {
  default: { width: 180, height: 60 },
  small: { width: 140, height: 47 },
} as const

export function badgeSize(value: string | null | undefined) {
  return value === "small" ? { name: "small" as const, ...SIZES.small } : { name: "default" as const, ...SIZES.default }
}

/** Same letter the restaurant page shows. The page has no age cutoff, so an A stays an A. */
export function badgeKind(grade: string | null | undefined): BadgeKind {
  return presentGrade(grade).dataGrade === "A" ? "grade-a" : "listed"
}

export function inspectionLabel(raw: string | null | undefined): string | null {
  const date = parseInspectionDate(raw ?? null)
  if (!date || date.getUTCFullYear() < 2000) return null
  const month = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(date)
  return `Inspected ${month}`
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function renderBadgeSvg(input: {
  kind: BadgeKind
  inspected: string | null
  theme: "light" | "dark"
  width: number
  height: number
}): string {
  const dark = input.theme === "dark"
  const bg = dark ? "#1B3A2D" : "#F8F6F1"
  const ink = dark ? "#F8F6F1" : "#1B3A2D"
  const accent = dark ? "#52B788" : "#2D6A4F"
  const title = input.kind === "grade-a" ? "Grade A on Eat Real Food NYC" : "Listed on Eat Real Food NYC"
  const desc = input.kind === "grade-a"
    ? `Official NYC Health Department Grade A${input.inspected ? `, ${input.inspected}` : ""}.`
    : "This restaurant is listed on Eat Real Food NYC. The badge does not claim a Grade A."
  const headline = input.kind === "grade-a" ? "Grade A" : "Listed on"
  const sub = input.kind === "grade-a" ? "NYC Health Dept. grade" : "Eat Real Food NYC"
  const foot = input.kind === "grade-a"
    ? [input.inspected, "Eat Real Food NYC"].filter(Boolean).join(" · ")
    : "Eat Real Food NYC"
  const mark = input.kind === "grade-a" ? "A" : "•"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="0 0 180 60" role="img">
  <title>${escapeXml(title)}</title>
  <desc>${escapeXml(desc)}</desc>
  <rect width="180" height="60" rx="4" fill="${bg}"/>
  <rect x="6" y="6" width="48" height="48" fill="${dark ? "#F8F6F1" : "#F8F6F1"}" stroke="${ink}" stroke-width="1"/>
  <text x="30" y="38" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="700" fill="#1B3A2D">${escapeXml(mark)}</text>
  <text x="62" y="24" font-family="Georgia, serif" font-size="16" font-weight="700" fill="${ink}">${escapeXml(headline)}</text>
  <text x="62" y="38" font-family="Arial, sans-serif" font-size="9" fill="${accent}">${escapeXml(sub)}</text>
  <text x="62" y="51" font-family="Arial, sans-serif" font-size="8" fill="${ink}">${escapeXml(foot)}</text>
</svg>`
}

export function badgeSnippet(slug: string, kind: BadgeKind) {
  const alt = kind === "grade-a" ? "Grade A on Eat Real Food NYC" : "Listed on Eat Real Food NYC"
  return `<a href="https://www.eatrealfoodnyc.com/restaurants/${slug}?ref=badge">
  <img src="https://www.eatrealfoodnyc.com/badge/${slug}.svg"
       alt="${alt}" width="180" height="60">
</a>`
}
