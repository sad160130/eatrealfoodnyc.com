import { dohmhSourceUrl } from "@/lib/dohmh-source-url"
import { guideAuthors } from "@/lib/founders"
import { formatLongDate, parseInspectionDate } from "@/lib/inspection-dates"
import {
  gradeRank,
  inspectionGradeLabel,
  pickLatestInspection,
  type PickedInspection,
} from "@/lib/latest-scored-inspection"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import { GUIDE_KEYWORDS } from "@/config/keywords"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import rawRows from "@/data/peruvian-inspections-43nn-pn8j.json"
import listingMatches from "@/data/peruvian-listing-matches.json"
import unmatchedListings from "@/data/peruvian-unmatched-listings.json"
import ntaNames from "@/data/fall-2026-neighborhoods.json"
import nta2010Names from "@/data/nta-2010-names.json"

/**
 * Peruvian restaurants in NYC Open Data dataset 43nn-pn8j.
 * Pulled 2026-11-27 (America/New_York). Filter: cuisine_description
 * containing Peruvian. This pull returned cuisine description Peruvian only.
 * Dataset record_date and the newest inspection_date are the file-level
 * maxima from that same pull, not the maxima inside the Peruvian subset.
 * January 1, 1900 rows are the city's not-yet-inspected placeholder and are
 * excluded from inspected counts.
 * Published listings were matched on 2026-11-27 when the normalized name and
 * building number agreed with one CAMIS in the same borough.
 * Do not invent dishes, prices, hours, or quotes.
 */

export const PERUVIAN_PATH = "/guides/peruvian-restaurants-nyc"
export const PERUVIAN_KEYWORD = GUIDE_KEYWORDS["peruvian-restaurants-nyc"]
export const PERUVIAN_TITLE = "Peruvian Restaurants NYC: Inspection Grades Checked (2026)"
export const PERUVIAN_SHORT_TITLE = "Peruvian Restaurants NYC"
export const PERUVIAN_PUBLISHED = "2026-11-27"
export const PERUVIAN_UPDATED = "2026-11-27"
export const DOHMH_DATASET_ID = "43nn-pn8j"
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
export const DOHMH_RECORD_DATE = "2026-11-26T06:00:29.000"
export const DOHMH_NEWEST_INSPECTION_DATE = "2026-11-24"
export const DOHMH_FILE_ROWS = 295608
export const PERUVIAN_PULLED_ON = "2026-11-27"
export const PERUVIAN_WHERE = "upper(cuisine_description) like '%PERUVIAN%'"
export const JORA_CAMIS = "50164818"
export const JORA_SLUG = "jora"
export const JORA_SHORT_VIDEO_ID = "IO-jklIxngQ"
export const QUEENS_HUB = "/nyc/queens/healthy-restaurants"
export const LIC_HUB = `/nyc/queens/${neighborhoodToSlug("Long Island City")}/healthy-restaurants`

const BOROUGH_ORDER = ["Queens", "Manhattan", "Brooklyn", "Bronx", "Staten Island"]

interface RawRow {
  camis: string
  dba: string
  boro?: string
  building?: string
  street?: string
  zipcode?: string
  phone?: string
  cuisine_description?: string
  inspection_date?: string
  grade?: string
  score?: string
  nta?: string
}

export interface ListingMatch {
  camis: string
  slug: string
  listingName: string
  type: string
  neighborhood: string
  borough: string
  rating: number | null
  reviews: number | null
  tags: string[]
}

export interface UnmatchedListing {
  slug: string
  name: string
  type: string | null
  neighborhood: string | null
  borough: string | null
}

export interface PeruvianRestaurant {
  rank: number
  camis: string
  name: string
  officialDba: string
  borough: string
  neighborhood: string | null
  place: string
  address: string
  gradeCode: string | null
  gradeLabel: string
  score: number | null
  inspectionDate: string | null
  inspectionDateLabel: string | null
  kind: PickedInspection["kind"]
  slug: string | null
  factualLine: string
  olderGrade: PickedInspection["olderGrade"]
  skippedBlankDate: string | null
}

function labelIso(iso: string): string {
  const date = parseInspectionDate(iso)
  if (!date) throw new Error(`bad date ${iso}`)
  return formatLongDate(date)
}

export const DOHMH_RECORD_DATE_LABEL = labelIso(DOHMH_RECORD_DATE)
export const DOHMH_NEWEST_INSPECTION_LABEL = labelIso(DOHMH_NEWEST_INSPECTION_DATE)
export const PERUVIAN_PULLED_ON_LABEL = labelIso(PERUVIAN_PULLED_ON)

const NTA_NAMES = new Map(ntaNames.map((row) => [row.code, row.name]))
const NTA_2010 = new Map(nta2010Names.map((row) => [row.code, row.name]))
const MATCHES = new Map((listingMatches as ListingMatch[]).map((match) => [match.camis, match]))

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&"
      const ordinal = word.match(/^(\d+)(st|nd|rd|th)$/i)
      if (ordinal) return `${ordinal[1]}${ordinal[2].toLowerCase()}`
      if (/^\d/.test(word)) return word
      if (/^[ivx]+$/i.test(word) && word.length <= 4) return word.toUpperCase()
      const lower = word.toLowerCase()
      if (lower.startsWith("mac") && lower.length > 4) {
        return `Mac${lower.charAt(3).toUpperCase()}${lower.slice(4)}`
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value)
}

function tagPhrase(tags: string[]): string {
  if (tags.length === 0) return ""
  if (tags.length === 1) return `, with the ${tags[0]} tag`
  if (tags.length === 2) return `, with ${tags[0]} and ${tags[1]} tags`
  return `, with ${tags.slice(0, -1).join(", ")}, and ${tags[tags.length - 1]} tags`
}

function article(type: string): string {
  return /^[aeiou]/i.test(type) ? "an" : "a"
}

function factualLine(match: ListingMatch | undefined): string {
  if (!match) return "City cuisine description: Peruvian. No published listing matched this name and address."
  const rating =
    match.rating == null || match.reviews == null
      ? ""
      : `, rated ${formatRating(match.rating)} from ${formatCount(match.reviews)} reviews`
  return `Published as ${match.listingName} in ${match.neighborhood}, ${match.borough}, ${article(match.type)} ${match.type}${rating}${tagPhrase(match.tags)}.`
}

function addressFrom(row: RawRow): string {
  const street = row.street ? titleCase(row.street) : ""
  const building = row.building?.trim() ?? ""
  const line = [building, street].filter(Boolean).join(" ")
  const borough = row.boro?.trim() || ""
  const zip = row.zipcode?.trim()
  const tail = zip ? `${borough}, NY ${zip}` : borough
  return [line, tail].filter(Boolean).join(", ")
}

function containsPeruvian(value: string | undefined): boolean {
  return (value ?? "").toUpperCase().includes("PERUVIAN")
}

function buildRestaurants(): PeruvianRestaurant[] {
  const rows = rawRows as RawRow[]
  const byCamis = new Map<string, RawRow[]>()
  for (const row of rows) {
    if (!containsPeruvian(row.cuisine_description)) {
      throw new Error(`row ${row.camis} is outside the Peruvian filter`)
    }
    const list = byCamis.get(row.camis) ?? []
    list.push(row)
    byCamis.set(row.camis, list)
  }

  const built: PeruvianRestaurant[] = []
  for (const [camis, group] of byCamis) {
    const picked = pickLatestInspection(
      group.map((row) => ({
        inspectionDate: row.inspection_date,
        grade: row.grade,
        score: row.score,
      }))
    )
    const chosenDay = picked.inspectionDate
    const onDay = chosenDay ? group.filter((row) => row.inspection_date?.slice(0, 10) === chosenDay) : []
    const source = onDay.find((row) => row.dba && row.street) ?? onDay[0] ?? group.find((row) => row.dba) ?? group[0]
    const match = MATCHES.get(camis)
    const nta = source.nta || group.find((row) => row.nta)?.nta || null
    const ntaName = nta ? NTA_NAMES.get(nta) ?? NTA_2010.get(nta) ?? null : null
    const neighborhood = match?.neighborhood ?? ntaName
    const borough = (source.boro ?? "").trim()
    const place = neighborhood ? `${neighborhood}, ${borough}` : borough
    built.push({
      rank: 0,
      camis,
      name: match?.listingName ?? titleCase(source.dba),
      officialDba: source.dba,
      borough,
      neighborhood,
      place,
      address: addressFrom(source),
      gradeCode: picked.grade,
      gradeLabel: inspectionGradeLabel(picked.kind, picked.grade),
      score: picked.score,
      inspectionDate: picked.inspectionDate,
      inspectionDateLabel: picked.inspectionDate ? labelIso(picked.inspectionDate) : null,
      kind: picked.kind,
      slug: match?.slug ?? null,
      factualLine: factualLine(match),
      olderGrade: picked.olderGrade,
      skippedBlankDate: picked.skippedBlankDate,
    })
  }
  return built
}

function compareRestaurants(a: PeruvianRestaurant, b: PeruvianRestaurant): number {
  const byGrade = gradeRank(a.kind, a.gradeCode) - gradeRank(b.kind, b.gradeCode)
  if (byGrade !== 0) return byGrade
  const scoreA = a.score ?? Number.POSITIVE_INFINITY
  const scoreB = b.score ?? Number.POSITIVE_INFINITY
  if (scoreA !== scoreB) return scoreA - scoreB
  const dateA = a.inspectionDate ?? ""
  const dateB = b.inspectionDate ?? ""
  if (dateA !== dateB) return dateA < dateB ? 1 : -1
  return a.name.localeCompare(b.name)
}

const builtRestaurants = buildRestaurants()

export const PERUVIAN_BOROUGHS = [...BOROUGH_ORDER, ...builtRestaurants.map((row) => row.borough).filter((borough) => !BOROUGH_ORDER.includes(borough))]
  .filter((borough, index, list) => borough && list.indexOf(borough) === index)
  .map((borough) => {
    const restaurants = builtRestaurants.filter((row) => row.borough === borough).sort(compareRestaurants)
    restaurants.forEach((row, index) => {
      row.rank = index + 1
    })
    return {
      borough,
      href: `/nyc/${boroughToSlug(borough)}/healthy-restaurants`,
      restaurants,
      gradeA: restaurants.filter((row) => row.gradeCode === "A").length,
      inspected: restaurants.filter((row) => row.kind === "inspection").length,
    }
  })
  .filter((group) => group.restaurants.length > 0)

export const PERUVIAN_RESTAURANTS = PERUVIAN_BOROUGHS.flatMap((group) => group.restaurants)
export const PERUVIAN_ESTABLISHMENT_COUNT = PERUVIAN_RESTAURANTS.length
export const PERUVIAN_INSPECTED_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.kind === "inspection").length
export const PERUVIAN_NOT_YET_INSPECTED_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.kind === "not-yet-inspected").length
export const PERUVIAN_GRADE_A_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.gradeCode === "A").length
export const PERUVIAN_GRADE_B_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.gradeCode === "B").length
export const PERUVIAN_GRADE_C_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.gradeCode === "C").length
export const PERUVIAN_GRADE_PENDING_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.gradeLabel === "Grade Pending").length
export const PERUVIAN_NOT_YET_GRADED_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.gradeLabel === "Not Yet Graded").length
export const PERUVIAN_PLACEHOLDER_ROW_COUNT = (rawRows as RawRow[]).filter((row) => (row.inspection_date ?? "").slice(0, 10) < "1901-01-01" && (row.inspection_date ?? "").length > 0).length
export const PERUVIAN_ROW_COUNT = (rawRows as RawRow[]).length
export const PERUVIAN_LINKED_COUNT = PERUVIAN_RESTAURANTS.filter((row) => row.slug).length
export const PERUVIAN_BOROUGH_ONLY = PERUVIAN_RESTAURANTS.filter((row) => !row.neighborhood)
export const PERUVIAN_UNMATCHED = unmatchedListings as UnmatchedListing[]

export const PERUVIAN_DESCRIPTION = `${formatCount(PERUVIAN_ESTABLISHMENT_COUNT)} Peruvian restaurants are in the NYC inspection file. ${formatCount(PERUVIAN_GRADE_A_COUNT)} hold a Grade A on the latest scored visit. DOHMH dataset ${DOHMH_DATASET_ID}, record date ${DOHMH_RECORD_DATE_LABEL}.`

export const PERUVIAN_INTRO = `peruvian restaurants nyc: the city inspection file lists ${formatCount(PERUVIAN_ESTABLISHMENT_COUNT)} establishments with cuisine description Peruvian, and ${formatCount(PERUVIAN_GRADE_A_COUNT)} hold a Grade A. ${formatCount(PERUVIAN_INSPECTED_COUNT)} have an inspection date after the January 1, 1900 placeholder. ${FOOD_SAFETY_SENTENCE}`

function olderGradePhrase(grade: string): string {
  if (grade === "A" || grade === "B" || grade === "C") return `Grade ${grade}`
  if (grade === "Z" || grade === "P") return "Grade Pending"
  return `grade code ${grade}`
}

function olderGradeSentence(row: PeruvianRestaurant): string | null {
  if (!row.olderGrade) return null
  const score = row.olderGrade.score == null ? "no score" : `score ${row.olderGrade.score}`
  return `${row.name} also has an older ${olderGradePhrase(row.olderGrade.grade)}, ${score}, on ${labelIso(row.olderGrade.inspectionDate)}. The table uses the later visit.`
}

function skippedBlankSentence(row: PeruvianRestaurant): string | null {
  if (!row.skippedBlankDate) return null
  return `${row.name} has a later row on ${labelIso(row.skippedBlankDate)} with no grade and no score. That row is not used. The table uses ${row.inspectionDateLabel}.`
}

export const PERUVIAN_EXCEPTIONS = PERUVIAN_RESTAURANTS.flatMap((row) => {
  const lines = [olderGradeSentence(row), skippedBlankSentence(row)].filter((line): line is string => Boolean(line))
  return lines
})

const jora = PERUVIAN_RESTAURANTS.find((row) => row.camis === JORA_CAMIS)
if (!jora) throw new Error("Jora CAMIS missing from the Peruvian extract")
if (jora.gradeCode !== "A" || jora.score !== 9 || jora.inspectionDate !== "2026-10-17") {
  throw new Error(`Jora record changed: ${jora.gradeCode} ${jora.score} ${jora.inspectionDate}`)
}

export const JORA = jora

export const PERUVIAN_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How many Peruvian restaurants are in NYC?",
    answer: `The NYC Open Data restaurant inspection file, dataset ${DOHMH_DATASET_ID}, lists ${formatCount(PERUVIAN_ESTABLISHMENT_COUNT)} distinct CAMIS values whose cuisine description contains Peruvian. Every row in this extract has cuisine description Peruvian. That count is establishments in the city file, not the number of published listings on this site. The dataset record_date is ${DOHMH_RECORD_DATE_LABEL} (${DOHMH_RECORD_DATE}). The newest inspection_date in the file is ${DOHMH_NEWEST_INSPECTION_LABEL}.`,
  },
  {
    question: "How many Peruvian restaurants in NYC hold a Grade A?",
    answer: `${formatCount(PERUVIAN_GRADE_A_COUNT)} of the ${formatCount(PERUVIAN_ESTABLISHMENT_COUNT)} hold a Grade A on the latest inspection that has a letter or a score. ${FOOD_SAFETY_SENTENCE} On this page a Grade A is the letter A on that inspection. A later visit that has a score and no letter is not counted as an A. The other current results are ${formatCount(PERUVIAN_GRADE_B_COUNT)} Grade B, ${formatCount(PERUVIAN_GRADE_PENDING_COUNT)} Grade Pending, and ${formatCount(PERUVIAN_NOT_YET_GRADED_COUNT)} Not Yet Graded. Grade C on that latest inspection: ${formatCount(PERUVIAN_GRADE_C_COUNT)}.`,
  },
  {
    question: "What is Jora's latest NYC inspection grade?",
    answer: `Jora at ${JORA.address}, ${JORA.place}, CAMIS ${JORA_CAMIS}, scored ${JORA.score} on ${JORA.inspectionDateLabel}, and the letter on that inspection is ${JORA.gradeCode}. A score of ${JORA.score} is inside the Grade A band of 0 to 13. A score of 13 is the last point of the A band. A score of 14 starts the B band. The November 26, 2026 YouTube Short describes this record.`,
  },
  {
    question: "Which borough has the most Peruvian restaurants in the city file?",
    answer:
      PERUVIAN_BOROUGHS.map(
        (group) =>
          `${group.borough} has ${formatCount(group.restaurants.length)}, including ${formatCount(group.gradeA)} with a Grade A and ${formatCount(group.inspected)} inspected`
      ).join(". ") + ".",
  },
  {
    question: "How many Peruvian restaurants in this file are still uninspected?",
    answer: `${formatCount(PERUVIAN_NOT_YET_INSPECTED_COUNT)} of the ${formatCount(PERUVIAN_ESTABLISHMENT_COUNT)} have only the January 1, 1900 placeholder, so they are not counted as inspected. ${formatCount(PERUVIAN_INSPECTED_COUNT)} have an inspection date after that placeholder. The Peruvian extract has ${formatCount(PERUVIAN_PLACEHOLDER_ROW_COUNT)} rows dated January 1, 1900.`,
  },
]

export function camisUrl(camis: string): string {
  return dohmhSourceUrl({ name: "", camis })
}

export function restaurantHref(slug: string): string {
  return `/restaurants/${slug}`
}

export const PERUVIAN_RELATED_HREFS = [
  "/guides/nyc-health-grades-explained",
  "/guides/nyc-restaurant-inspection-process",
  "/data/nyc-restaurant-score-13-cliff",
  "/data/nyc-restaurant-health-grade-report",
  QUEENS_HUB,
  LIC_HUB,
  "/healthy-restaurants/grade-a",
  "/about/our-data",
] as const

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>(PERUVIAN_RELATED_HREFS)
  for (const row of PERUVIAN_RESTAURANTS) {
    if (row.slug) hrefs.add(restaurantHref(row.slug))
  }
  for (const listing of PERUVIAN_UNMATCHED) hrefs.add(restaurantHref(listing.slug))
  for (const group of PERUVIAN_BOROUGHS) hrefs.add(group.href)
  return [...hrefs]
}

export function organizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eat Real Food NYC",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
  }
}

export function articleSchema(siteUrl: string) {
  const url = `${siteUrl}${PERUVIAN_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: PERUVIAN_TITLE,
    description: PERUVIAN_DESCRIPTION,
    datePublished: PERUVIAN_PUBLISHED,
    dateModified: PERUVIAN_UPDATED,
    author: guideAuthors(),
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PERUVIAN_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
