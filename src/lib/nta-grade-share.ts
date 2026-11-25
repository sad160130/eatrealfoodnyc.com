import { FALL_2026_REPORT as REPORT } from "@/data/fall-2026-inspection-report"
import { boroughToSlug } from "@/lib/utils"

/** NTAs below this letter-graded count are not in the report table. */
export const NTA_MIN_LETTER_GRADED = 80

export const INSPECTION_REPORT_PATH = "/data/nyc-restaurant-health-grade-report"
export const FOOD_SAFETY_SENTENCE = "Grade A is a food-safety grade, not a health claim."

const BOROUGH_PREFIX: Record<string, string> = {
  Manhattan: "MN",
  Brooklyn: "BK",
  Queens: "QN",
  Bronx: "BX",
  "Staten Island": "SI",
}

/**
 * Directory names that are not a 2010 NTA name or a hyphen segment of one.
 * Each target is a single NTA in the report table.
 */
const NTA_ALIASES: Record<string, string> = {
  williamsburg: "North Side-South Side",
  "hells kitchen": "Clinton",
  "greenwich village": "West Village",
  flatiron: "Hudson Yards-Chelsea-Flat Iron-Union Square",
  "flatiron district": "Hudson Yards-Chelsea-Flat Iron-Union Square",
  "financial district": "Battery Park City-Lower Manhattan",
  tribeca: "SoHo-TriBeCa-Civic Center-Little Italy",
  soho: "SoHo-TriBeCa-Civic Center-Little Italy",
  "little italy": "SoHo-TriBeCa-Civic Center-Little Italy",
  "throgs neck": "Schuylerville-Throgs Neck-Edgewater Park",
  "throggs neck": "Schuylerville-Throgs Neck-Edgewater Park",
}

export interface GradeShareLink {
  place: string
  share: string
  citywide: string
  href: string
  kind: "nta" | "borough"
  recordDate: string
}

export interface NtaExtreme {
  code: string
  name: string
  a: number
  letterGraded: number
  share: string
}

function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/&/g, " and ")
    .replace(/[.]/g, "")
    .replace(/[-/]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function ntaRows(borough: string) {
  const prefix = BOROUGH_PREFIX[borough]
  if (!prefix) return []
  return REPORT.neighborhoods.filter(
    (row) =>
      row.code !== "Missing" &&
      row.code.startsWith(prefix) &&
      row.letterGraded >= NTA_MIN_LETTER_GRADED
  )
}

export function matchNta(neighborhood: string, borough: string) {
  const key = norm(neighborhood)
  if (!key || key === "missing") return null
  const rows = ntaRows(borough)
  const exact = rows.filter((row) => norm(row.name) === key)
  if (exact.length === 1) return exact[0]
  const segments = rows.filter((row) => row.name.split("-").some((part) => norm(part) === key))
  if (segments.length === 1) return segments[0]
  const alias = NTA_ALIASES[key]
  if (!alias) return null
  return rows.find((row) => row.name === alias) ?? null
}

function boroughRow(borough: string) {
  return REPORT.boroughs.find((row) => row.name === borough && row.share) ?? null
}

/**
 * NTA line when the directory neighborhood maps to one report NTA with at
 * least 80 letter-graded restaurants. Otherwise the borough line.
 */
export function placeGradeShare(
  neighborhood: string | null | undefined,
  borough: string | null | undefined
): GradeShareLink | null {
  const boroughName = borough?.trim() ?? ""
  const neighborhoodName = neighborhood?.trim() ?? ""
  if (neighborhoodName && boroughName) {
    const nta = matchNta(neighborhoodName, boroughName)
    if (nta) {
      const same = norm(neighborhoodName) === norm(nta.name)
      return {
        place: same ? nta.name : `${neighborhoodName} (${nta.name})`,
        share: nta.share,
        citywide: REPORT.gradeAShare,
        href: `${INSPECTION_REPORT_PATH}#neighborhoods`,
        kind: "nta",
        recordDate: "November 13, 2026",
      }
    }
  }
  const row = boroughRow(boroughName)
  if (!row || !row.share) return null
  return {
    place: row.name,
    share: row.share,
    citywide: REPORT.gradeAShare,
    href: `${INSPECTION_REPORT_PATH}#boroughs`,
    kind: "borough",
    recordDate: "November 13, 2026",
  }
}

/** Borough hub line. The anchor is the borough row, not the section. */
export function boroughGradeShare(borough: string): GradeShareLink | null {
  const row = boroughRow(borough)
  if (!row || !row.share) return null
  return {
    place: row.name,
    share: row.share,
    citywide: REPORT.gradeAShare,
    href: `${INSPECTION_REPORT_PATH}#${boroughToSlug(row.name)}`,
    kind: "borough",
    recordDate: "November 13, 2026",
  }
}

export function boroughTopGuide(borough: string): { href: string; label: string } {
  const slug = boroughToSlug(borough)
  if (slug === "bronx" || slug === "staten-island") {
    const place = slug === "bronx" ? "Bronx" : "Staten Island"
    return {
      href: "/guides/best-healthy-neighborhoods-nyc#bronx-staten-island",
      label: `top ${place} neighborhoods for healthy dining`,
    }
  }
  return {
    href: `/guides/best-healthy-neighborhoods-nyc#top-${slug}`,
    label: `top ${borough} neighborhoods for healthy dining`,
  }
}

export function ntaExtremes(count = 10): { lowest: NtaExtreme[]; highest: NtaExtreme[] } {
  const rows = REPORT.neighborhoods.filter(
    (row) => row.code !== "Missing" && row.letterGraded >= NTA_MIN_LETTER_GRADED
  )
  return {
    lowest: rows.slice(0, count).map(toExtreme),
    highest: rows.slice(-count).reverse().map(toExtreme),
  }
}

function toExtreme(row: (typeof REPORT.neighborhoods)[number]): NtaExtreme {
  return {
    code: row.code,
    name: row.name,
    a: row.a,
    letterGraded: row.letterGraded,
    share: row.share,
  }
}

export function reportBoroughRows() {
  return REPORT.boroughs.filter((row) => row.share).map((row) => ({
    name: row.name,
    letterGraded: row.letterGraded,
    a: row.a,
    share: row.share as string,
    anchor: boroughToSlug(row.name),
  }))
}

export const REPORT_RECORD = {
  datasetId: REPORT.datasetId,
  recordDate: "November 13, 2026",
  recordStored: REPORT.extractRecordedAt,
  inspectionCutoff: REPORT.inspectionCutoff,
  citywideShare: REPORT.gradeAShare,
  letterGraded: REPORT.letterGraded,
  gradeA: REPORT.gradeA,
} as const
