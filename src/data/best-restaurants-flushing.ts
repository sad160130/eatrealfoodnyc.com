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
import { FALL_2026_REPORT } from "@/data/fall-2026-inspection-report"
import rawRows from "@/data/flushing-inspections-43nn-pn8j.json"
import listingMatches from "@/data/flushing-listing-matches.json"
import pullMeta from "@/data/nta-letter-grades-2026-11-25.json"

/**
 * Flushing is NTA QN22. The Grade A share uses one latest A, B, or C per
 * CAMIS by grade_date, for NTAs with at least 80 letter-graded restaurants.
 * Picks are published listings matched on name and building number, ranked
 * by the latest inspection that has a letter or a score.
 */

export const FLUSHING_PATH = "/guides/best-restaurants-flushing"
export const FLUSHING_KEYWORD = GUIDE_KEYWORDS["best-restaurants-flushing"]
export const FLUSHING_TITLE = "Grade A Restaurants in Flushing, Queens (2026)"
export const FLUSHING_SHORT_TITLE = "Grade A Restaurants in Flushing"
export const FLUSHING_PUBLISHED = "2026-11-26"
export const FLUSHING_UPDATED = "2026-11-26"
export const FLUSHING_NTA = "QN22"
export const DOHMH_DATASET_ID = pullMeta.datasetId
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
export const DOHMH_RECORD_DATE = pullMeta.recordDate
export const DOHMH_NEWEST_INSPECTION_DATE = pullMeta.newestInspectionDate
export const DOHMH_FILE_ROWS = pullMeta.fileRows
export const FLUSHING_PULLED_ON = pullMeta.pulledOn
export const QUEENS_HUB = "/nyc/queens/healthy-restaurants"
export const REPORT_NEIGHBORHOODS = "/data/nyc-restaurant-health-grade-report#neighborhoods"

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

export interface FlushingRestaurant {
  camis: string
  name: string
  officialDba: string
  cuisine: string
  address: string
  kind: PickedInspection["kind"]
  gradeCode: string | null
  gradeLabel: string
  score: number | null
  inspectionDate: string | null
  inspectionDateLabel: string | null
  slug: string | null
  rating: number | null
  reviews: number | null
  listingType: string | null
  factualLine: string
}

function labelIso(iso: string): string {
  const date = parseInspectionDate(iso)
  if (!date) throw new Error(`bad date ${iso}`)
  return formatLongDate(date)
}

export const DOHMH_RECORD_DATE_LABEL = labelIso(DOHMH_RECORD_DATE)
export const DOHMH_NEWEST_INSPECTION_LABEL = labelIso(DOHMH_NEWEST_INSPECTION_DATE)
export const FLUSHING_PULLED_ON_LABEL = labelIso(FLUSHING_PULLED_ON)
export const PRIOR_RECORD_DATE_LABEL = labelIso(FALL_2026_REPORT.extractRecordedAt)

const PRIOR = FALL_2026_REPORT.neighborhoods.find((row) => row.code === FLUSHING_NTA)
if (!PRIOR) throw new Error("November report is missing Flushing QN22")
export const PRIOR_FLUSHING = PRIOR

const MATCHES = new Map((listingMatches as ListingMatch[]).map((match) => [match.camis, match]))

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&"
      if (/^\d/.test(word)) return word
      const lower = word.toLowerCase()
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

function addressFrom(row: RawRow): string {
  const street = row.street ? titleCase(row.street) : ""
  const building = row.building?.trim() ?? ""
  const line = [building, street].filter(Boolean).join(" ")
  const zip = row.zipcode?.trim()
  const tail = zip ? `Queens, NY ${zip}` : "Queens"
  return [line, tail].filter(Boolean).join(", ")
}

function compareRestaurants(a: FlushingRestaurant, b: FlushingRestaurant): number {
  const byGrade = gradeRank(a.kind, a.gradeCode) - gradeRank(b.kind, b.gradeCode)
  if (byGrade !== 0) return byGrade
  const scoreA = a.score ?? Number.POSITIVE_INFINITY
  const scoreB = b.score ?? Number.POSITIVE_INFINITY
  if (scoreA !== scoreB) return scoreA - scoreB
  const ratingA = a.rating ?? Number.NEGATIVE_INFINITY
  const ratingB = b.rating ?? Number.NEGATIVE_INFINITY
  if (ratingA !== ratingB) return ratingB - ratingA
  const reviewsA = a.reviews ?? -1
  const reviewsB = b.reviews ?? -1
  if (reviewsA !== reviewsB) return reviewsB - reviewsA
  return a.name.localeCompare(b.name)
}

function buildRestaurants(): FlushingRestaurant[] {
  const rows = rawRows as RawRow[]
  const byCamis = new Map<string, RawRow[]>()
  for (const row of rows) {
    if (row.nta !== FLUSHING_NTA) throw new Error(`row ${row.camis} is not ${FLUSHING_NTA}`)
    const list = byCamis.get(row.camis) ?? []
    list.push(row)
    byCamis.set(row.camis, list)
  }
  const built: FlushingRestaurant[] = []
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
    const cuisine = source.cuisine_description || group.find((row) => row.cuisine_description)?.cuisine_description || "Cuisine not on the city record"
    const rating = match?.rating == null ? "" : `, rated ${formatRating(match.rating)} from ${formatCount(match.reviews ?? 0)} reviews`
    const factualLine = match
      ? `Published as ${match.listingName} in ${match.neighborhood}, ${match.borough}, ${article(match.type)} ${match.type}${rating}${tagPhrase(match.tags)}.`
      : `City cuisine description: ${cuisine}. No published listing matched this name and building number.`
    built.push({
      camis,
      name: match?.listingName ?? titleCase(source.dba),
      officialDba: source.dba,
      cuisine,
      address: addressFrom(source),
      kind: picked.kind,
      gradeCode: picked.grade,
      gradeLabel: inspectionGradeLabel(picked.kind, picked.grade),
      score: picked.score,
      inspectionDate: picked.inspectionDate,
      inspectionDateLabel: picked.inspectionDate ? labelIso(picked.inspectionDate) : null,
      slug: match?.slug ?? null,
      rating: match?.rating ?? null,
      reviews: match?.reviews ?? null,
      listingType: match?.type ?? null,
      factualLine,
    })
  }
  return built
}

export const FLUSHING_RESTAURANTS = buildRestaurants()
export const FLUSHING_ESTABLISHMENT_COUNT = FLUSHING_RESTAURANTS.length
export const FLUSHING_SHARE = pullMeta.flushing
export const FLUSHING_CITYWIDE = pullMeta.citywide
export const FLUSHING_NTA_COUNT = pullMeta.flushing.ntaCount
export const FLUSHING_LETTER_TIES = pullMeta.letterTiesExcluded

export const FLUSHING_LINKED = FLUSHING_RESTAURANTS.filter((row): row is FlushingRestaurant & { slug: string } => Boolean(row.slug))
  .sort(compareRestaurants)

const gradeALinked = FLUSHING_LINKED.filter((row) => row.gradeCode === "A")

export interface CuisinePicks {
  cuisine: string
  picks: Array<FlushingRestaurant & { slug: string }>
  gradeALinked: number
}

export const FLUSHING_CUISINE_PICKS: CuisinePicks[] = [...new Set(gradeALinked.map((row) => row.cuisine))]
  .map((cuisine) => {
    const rows = gradeALinked.filter((row) => row.cuisine === cuisine).sort(compareRestaurants)
    return { cuisine, picks: rows.slice(0, 3), gradeALinked: rows.length }
  })
  .filter((group) => group.picks.length > 0)
  .sort((a, b) => b.gradeALinked - a.gradeALinked || a.cuisine.localeCompare(b.cuisine))

export const FLUSHING_GRADE_A_LINKED = gradeALinked
export const FLUSHING_NOT_GRADE_A = FLUSHING_LINKED.filter((row) => row.gradeCode !== "A")

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const FLUSHING_ANSWER = FLUSHING_SHARE.uniqueLowest
  ? `Restaurants in Flushing: the Grade A share is the lowest of ${formatCount(FLUSHING_NTA_COUNT)} NYC NTAs with at least 80 letter-graded restaurants, at ${FLUSHING_SHARE.share} (${formatCount(FLUSHING_SHARE.a)} of ${formatCount(FLUSHING_SHARE.letterGraded)}) on ${DOHMH_RECORD_DATE_LABEL}. Source: NYC Open Data ${DOHMH_DATASET_ID}.`
  : `Restaurants in Flushing: the Grade A share is ${FLUSHING_SHARE.share} (${formatCount(FLUSHING_SHARE.a)} of ${formatCount(FLUSHING_SHARE.letterGraded)}) on ${DOHMH_RECORD_DATE_LABEL}, rank ${FLUSHING_SHARE.rank} of ${formatCount(FLUSHING_NTA_COUNT)} NYC NTAs. Source: NYC Open Data ${DOHMH_DATASET_ID}.`

export const FLUSHING_DESCRIPTION = FLUSHING_SHARE.uniqueLowest
  ? `Flushing has the lowest NYC NTA Grade A share: ${FLUSHING_SHARE.share} (${formatCount(FLUSHING_SHARE.a)} of ${formatCount(FLUSHING_SHARE.letterGraded)}). Dataset ${DOHMH_DATASET_ID}, ${DOHMH_RECORD_DATE_LABEL}.`
  : `Flushing's NYC NTA Grade A share is ${FLUSHING_SHARE.share} (${formatCount(FLUSHING_SHARE.a)} of ${formatCount(FLUSHING_SHARE.letterGraded)}). Dataset ${DOHMH_DATASET_ID}, ${DOHMH_RECORD_DATE_LABEL}.`

export const FLUSHING_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What share of Flushing restaurants hold a Grade A?",
    answer: `On the ${DOHMH_RECORD_DATE_LABEL} NYC Open Data file, dataset ${DOHMH_DATASET_ID}, Flushing (NTA ${FLUSHING_NTA}) has a Grade A share of ${FLUSHING_SHARE.share}: ${formatCount(FLUSHING_SHARE.a)} of ${formatCount(FLUSHING_SHARE.letterGraded)} restaurants whose latest letter is A, B, or C. ${FLUSHING_SHARE.uniqueLowest ? `That is the lowest share among ${formatCount(FLUSHING_NTA_COUNT)} Neighborhood Tabulation Areas with at least 80 letter-graded restaurants.` : `That rank is ${FLUSHING_SHARE.rank} of ${formatCount(FLUSHING_NTA_COUNT)} Neighborhood Tabulation Areas with at least 80 letter-graded restaurants.`} ${FOOD_SAFETY_SENTENCE} It is not a taste claim. The November 13, 2026 report listed Flushing at ${PRIOR_FLUSHING.share} (${formatCount(PRIOR_FLUSHING.a)} of ${formatCount(PRIOR_FLUSHING.letterGraded)}).`,
  },
  {
    question: "How many restaurants are in the Flushing inspection file?",
    answer: `NTA ${FLUSHING_NTA} (Flushing) has ${formatCount(FLUSHING_ESTABLISHMENT_COUNT)} distinct CAMIS values in dataset ${DOHMH_DATASET_ID}. The dataset record_date is ${DOHMH_RECORD_DATE_LABEL} (${DOHMH_RECORD_DATE}). The newest inspection_date in the file is ${DOHMH_NEWEST_INSPECTION_LABEL}. The letter-graded share above uses a latest A, B, or C, so it is not a count of every CAMIS.`,
  },
  {
    question: "Which published Flushing restaurants hold a current Grade A?",
    answer:
      FLUSHING_GRADE_A_LINKED.length === 0
        ? "None of the published listings that matched a Flushing CAMIS on name and building number hold a Grade A on the latest inspection that has a letter or a score."
        : `${formatCount(FLUSHING_GRADE_A_LINKED.length)} published listings matched to NTA ${FLUSHING_NTA} hold a Grade A on the latest inspection that has a letter or a score: ${FLUSHING_GRADE_A_LINKED.map((row) => `${row.name} (${row.cuisine}, score ${row.score == null ? "not on file" : row.score})`).join("; ")}.`,
  },
  {
    question: "Does Grade A mean a Flushing restaurant is healthier or tastes better?",
    answer: `No. ${FOOD_SAFETY_SENTENCE} It is not a taste claim. The letter is the sanitary score from the NYC Department of Health and Mental Hygiene.`,
  },
]

export function camisUrl(camis: string): string {
  return dohmhSourceUrl({ name: "", camis })
}

export function restaurantHref(slug: string): string {
  return `/restaurants/${slug}`
}

export const FLUSHING_RELATED_HREFS = [
  QUEENS_HUB,
  REPORT_NEIGHBORHOODS,
  "/guides/nyc-health-grades-explained",
  "/guides/nyc-restaurant-inspection-process",
  "/guides/grade-a-restaurants-by-borough-nyc",
  "/healthy-restaurants/grade-a",
  "/about/our-data",
  "/nyc/queens/flushing/healthy-restaurants",
] as const

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>(FLUSHING_RELATED_HREFS)
  for (const row of FLUSHING_LINKED) hrefs.add(restaurantHref(row.slug))
  return [...hrefs]
}

export function itemListSchema(siteUrl: string) {
  const items = FLUSHING_GRADE_A_LINKED.length > 0 ? FLUSHING_GRADE_A_LINKED : FLUSHING_LINKED
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: FLUSHING_TITLE,
    description: FLUSHING_DESCRIPTION,
    numberOfItems: items.length,
    itemListElement: items.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: row.name,
      url: `${siteUrl}${restaurantHref(row.slug)}`,
    })),
  }
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
  const url = `${siteUrl}${FLUSHING_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: FLUSHING_TITLE,
    description: FLUSHING_DESCRIPTION,
    datePublished: FLUSHING_PUBLISHED,
    dateModified: FLUSHING_UPDATED,
    author: guideAuthors(),
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FLUSHING_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
