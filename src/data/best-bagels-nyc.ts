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
import { boroughToSlug } from "@/lib/utils"
import rawRows from "@/data/bagel-inspections-43nn-pn8j.json"
import listingMatches from "@/data/bagel-listing-matches.json"
import unmatchedListings from "@/data/bagel-unmatched-listings.json"
import ntaNames from "@/data/fall-2026-neighborhoods.json"
import pullMeta from "@/data/nta-letter-grades-2026-11-25.json"

/**
 * Bagel shops from NYC Open Data 43nn-pn8j.
 * Filter: cuisine_description = Bagels/Pretzels, or DBA contains "bagel".
 * Latest grade is the newest inspection with a letter or a score.
 * Published listings are linked only when the name and building number match.
 */

export const BAGEL_PATH = "/guides/best-bagels-nyc"
export const BAGEL_KEYWORD = GUIDE_KEYWORDS["best-bagels-nyc"]
export const BAGEL_TITLE = "Best Bagels in NYC by Inspection Grade (2026)"
export const BAGEL_SHORT_TITLE = "Best Bagels in NYC"
export const BAGEL_PUBLISHED = "2026-11-26"
export const BAGEL_UPDATED = "2026-11-26"
export const DOHMH_DATASET_ID = pullMeta.datasetId
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
export const DOHMH_RECORD_DATE = pullMeta.recordDate
export const DOHMH_NEWEST_INSPECTION_DATE = pullMeta.newestInspectionDate
export const DOHMH_FILE_ROWS = pullMeta.fileRows
export const BAGEL_PULLED_ON = pullMeta.pulledOn
export const BAGEL_WHERE = pullMeta.bagelWhere

const BOROUGH_ORDER: string[] = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

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

export interface BagelShop {
  rank: number
  camis: string
  name: string
  officialDba: string
  borough: string
  neighborhood: string | null
  place: string
  address: string
  cuisine: string
  nameContainsBagel: boolean
  kind: PickedInspection["kind"]
  gradeCode: string | null
  gradeLabel: string
  score: number | null
  inspectionDate: string | null
  inspectionDateLabel: string | null
  slug: string | null
  rating: number | null
  reviews: number | null
  factualLine: string
}

function labelIso(iso: string): string {
  const date = parseInspectionDate(iso)
  if (!date) throw new Error(`bad date ${iso}`)
  return formatLongDate(date)
}

export const DOHMH_RECORD_DATE_LABEL = labelIso(DOHMH_RECORD_DATE)
export const DOHMH_NEWEST_INSPECTION_LABEL = labelIso(DOHMH_NEWEST_INSPECTION_DATE)
export const BAGEL_PULLED_ON_LABEL = labelIso(BAGEL_PULLED_ON)

const NTA_NAMES = new Map(ntaNames.map((row) => [row.code, row.name]))
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

function factualLine(match: ListingMatch | undefined, cuisine: string): string {
  if (!match) return `City cuisine description: ${cuisine}. No published listing matched this name and building number.`
  const rating = match.rating == null ? "" : `, rated ${formatRating(match.rating)} from ${formatCount(match.reviews ?? 0)} reviews`
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

function compareShops(a: BagelShop, b: BagelShop): number {
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

function buildShops(): BagelShop[] {
  const rows = rawRows as RawRow[]
  const byCamis = new Map<string, RawRow[]>()
  for (const row of rows) {
    const cuisine = row.cuisine_description ?? ""
    const nameHasBagel = (row.dba ?? "").toUpperCase().includes("BAGEL")
    if (cuisine !== "Bagels/Pretzels" && !nameHasBagel) {
      throw new Error(`row ${row.camis} is outside the bagel filter`)
    }
    const list = byCamis.get(row.camis) ?? []
    list.push(row)
    byCamis.set(row.camis, list)
  }

  const built: BagelShop[] = []
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
    const ntaName = nta ? NTA_NAMES.get(nta) ?? null : null
    const neighborhood = match?.neighborhood ?? ntaName
    const borough = (source.boro ?? "").trim()
    const cuisine = source.cuisine_description || group.find((row) => row.cuisine_description)?.cuisine_description || "Cuisine not on the city record"
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
      cuisine,
      nameContainsBagel: source.dba.toUpperCase().includes("BAGEL") || group.some((row) => (row.dba ?? "").toUpperCase().includes("BAGEL")),
      kind: picked.kind,
      gradeCode: picked.grade,
      gradeLabel: inspectionGradeLabel(picked.kind, picked.grade),
      score: picked.score,
      inspectionDate: picked.inspectionDate,
      inspectionDateLabel: picked.inspectionDate ? labelIso(picked.inspectionDate) : null,
      slug: match?.slug ?? null,
      rating: match?.rating ?? null,
      reviews: match?.reviews ?? null,
      factualLine: factualLine(match, cuisine),
    })
  }
  return built
}

const builtShops = buildShops()

export const BAGEL_BOROUGHS = [...BOROUGH_ORDER, ...builtShops.map((row) => row.borough).filter((borough) => !BOROUGH_ORDER.includes(borough))]
  .filter((borough, index, list) => borough && list.indexOf(borough) === index)
  .map((borough) => {
    const shops = builtShops.filter((row) => row.borough === borough).sort(compareShops)
    shops.forEach((shop, index) => {
      shop.rank = index + 1
    })
    return {
      borough,
      href: `/nyc/${boroughToSlug(borough)}/healthy-restaurants`,
      shops,
      gradeA: shops.filter((shop) => shop.gradeCode === "A").length,
    }
  })
  .filter((group) => group.shops.length > 0)

export const BAGEL_SHOPS = BAGEL_BOROUGHS.flatMap((group) => group.shops)
export const BAGEL_ESTABLISHMENT_COUNT = BAGEL_SHOPS.length
export const BAGEL_GRADE_A_COUNT = BAGEL_SHOPS.filter((shop) => shop.gradeCode === "A").length
export const BAGEL_CUISINE_COUNT = BAGEL_SHOPS.filter((shop) => shop.cuisine === "Bagels/Pretzels").length
export const BAGEL_NAME_ONLY_COUNT = BAGEL_SHOPS.filter((shop) => shop.nameContainsBagel && shop.cuisine !== "Bagels/Pretzels").length
export const BAGEL_LINKED_COUNT = BAGEL_SHOPS.filter((shop) => shop.slug).length
export const BAGEL_ROW_COUNT = (rawRows as RawRow[]).length
export const BAGEL_UNMATCHED = unmatchedListings as UnmatchedListing[]

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const BAGEL_ANSWER = `Best bagels in NYC: ${formatCount(BAGEL_ESTABLISHMENT_COUNT)} establishments in the NYC inspection file have cuisine Bagels/Pretzels or a name containing bagel, and ${formatCount(BAGEL_GRADE_A_COUNT)} hold a Grade A as of ${DOHMH_RECORD_DATE_LABEL} (dataset ${DOHMH_DATASET_ID}).`

export const BAGEL_DESCRIPTION = `${formatCount(BAGEL_ESTABLISHMENT_COUNT)} NYC shops have cuisine Bagels/Pretzels or bagel in the name. ${formatCount(BAGEL_GRADE_A_COUNT)} hold a Grade A. Dataset ${DOHMH_DATASET_ID}, ${DOHMH_RECORD_DATE_LABEL}.`

export const BAGEL_LINKED = BAGEL_SHOPS.filter((shop): shop is BagelShop & { slug: string } => Boolean(shop.slug))

export const BAGEL_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How many bagel shops are in the NYC inspection file?",
    answer: `The NYC Open Data restaurant inspection file, dataset ${DOHMH_DATASET_ID}, lists ${formatCount(BAGEL_ESTABLISHMENT_COUNT)} distinct CAMIS values with cuisine description Bagels/Pretzels or a DBA containing bagel. ${formatCount(BAGEL_CUISINE_COUNT)} use the cuisine Bagels/Pretzels. ${formatCount(BAGEL_NAME_ONLY_COUNT)} have bagel in the name and a different cuisine. The dataset record_date is ${DOHMH_RECORD_DATE_LABEL} (${DOHMH_RECORD_DATE}). The newest inspection_date in the file is ${DOHMH_NEWEST_INSPECTION_LABEL}.`,
  },
  {
    question: "How many NYC bagel shops hold a Grade A?",
    answer: `${formatCount(BAGEL_GRADE_A_COUNT)} of the ${formatCount(BAGEL_ESTABLISHMENT_COUNT)} hold a Grade A on the latest inspection that has a letter or a score. ${FOOD_SAFETY_SENTENCE} It is not a taste claim. A later visit that has a score and no letter is not counted as an A.`,
  },
  {
    question: "Which borough has the most bagel shops in the city file?",
    answer: BAGEL_BOROUGHS.map((group) => `${group.borough} has ${formatCount(group.shops.length)}, including ${formatCount(group.gradeA)} with a Grade A`).join(". ") + ".",
  },
  {
    question: "Does a Grade A mean the bagels taste better?",
    answer: `No. ${FOOD_SAFETY_SENTENCE} It is not a taste claim. This page ranks by the latest letter, then the lowest score on that inspection, then Google rating and review count when a published listing matched the name and building number.`,
  },
]

export function camisUrl(camis: string): string {
  return `https://a816-health.nyc.gov/ABCEats/Restaurant/Detail/${camis}`
}

export function restaurantHref(slug: string): string {
  return `/restaurants/${slug}`
}

export const BAGEL_RELATED_HREFS = [
  "/guides/healthy-breakfast-nyc",
  "/guides/nyc-health-grades-explained",
  "/guides/nyc-restaurant-inspection-process",
  "/healthy-restaurants/grade-a",
  "/nyc/manhattan/healthy-restaurants",
  "/nyc/brooklyn/healthy-restaurants",
  "/nyc/queens/healthy-restaurants",
  "/nyc/bronx/healthy-restaurants",
  "/nyc/staten-island/healthy-restaurants",
  "/about/our-data",
] as const

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>(BAGEL_RELATED_HREFS)
  for (const shop of BAGEL_SHOPS) {
    if (shop.slug) hrefs.add(restaurantHref(shop.slug))
  }
  for (const listing of BAGEL_UNMATCHED) hrefs.add(restaurantHref(listing.slug))
  for (const group of BAGEL_BOROUGHS) hrefs.add(group.href)
  return [...hrefs]
}

export function itemListSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: BAGEL_TITLE,
    description: BAGEL_DESCRIPTION,
    numberOfItems: BAGEL_LINKED.length,
    itemListElement: BAGEL_LINKED.map((shop, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: shop.name,
      url: `${siteUrl}${restaurantHref(shop.slug)}`,
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
  const url = `${siteUrl}${BAGEL_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: BAGEL_TITLE,
    description: BAGEL_DESCRIPTION,
    datePublished: BAGEL_PUBLISHED,
    dateModified: BAGEL_UPDATED,
    author: guideAuthors(),
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BAGEL_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
