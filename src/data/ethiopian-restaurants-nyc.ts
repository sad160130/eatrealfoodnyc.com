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
import rawRows from "@/data/ethiopian-inspections-43nn-pn8j.json"
import ntaNames from "@/data/fall-2026-neighborhoods.json"

/**
 * Ethiopian restaurants in NYC Open Data dataset 43nn-pn8j.
 * Pulled 2026-11-26 (America/New_York). The raw rows are the
 * cuisine_description = 'Ethiopian' extract. Dataset record_date and the
 * newest inspection_date are the file-level maxima from that same pull,
 * not the maxima inside the Ethiopian subset.
 * Do not invent dishes, prices, hours, or quotes.
 */

export const ETHIOPIAN_PATH = "/guides/ethiopian-restaurants-nyc"
export const ETHIOPIAN_KEYWORD = GUIDE_KEYWORDS["ethiopian-restaurants-nyc"]
export const ETHIOPIAN_TITLE = "Ethiopian Restaurants NYC: Inspection Grades Checked (2026)"
export const ETHIOPIAN_SHORT_TITLE = "Ethiopian Restaurants NYC"
export const ETHIOPIAN_PUBLISHED = "2026-11-26"
export const ETHIOPIAN_UPDATED = "2026-11-26"
export const DOHMH_DATASET_ID = "43nn-pn8j"
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
export const DOHMH_RECORD_DATE = "2026-11-25T06:00:23.000"
export const DOHMH_NEWEST_INSPECTION_DATE = "2026-11-23"
export const DOHMH_FILE_ROWS = 295389
export const AWASH_CAMIS = "41653556"
export const AWASH_SLUG = "awash"

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
  inspection_type?: string
  nta?: string
  record_date?: string
}

export interface ListingMatch {
  camis: string
  slug: string
  listingName: string
  type: string
  neighborhood: string
  borough: string
  rating: number
  reviews: number
  tags: string[]
}

/**
 * Published operational listings matched to one CAMIS on 2026-11-26.
 * Name plus address, or the same street number and phone when the city
 * DBA spelling differs. Unmatched CAMIS values stay as plain text.
 */
export const ETHIOPIAN_LISTING_MATCHES: ListingMatch[] = [
  {
    camis: "50139223",
    slug: "addey-ababa",
    listingName: "Addey Ababa",
    type: "Ethiopian restaurant",
    neighborhood: "Washington Heights",
    borough: "Manhattan",
    rating: 4.9,
    reviews: 249,
    tags: ["vegetarian"],
  },
  {
    camis: "41426727",
    slug: "awash-ethiopian-restaurant",
    listingName: "Awash Ethiopian Restaurant",
    type: "Ethiopian restaurant",
    neighborhood: "Morningside Heights",
    borough: "Manhattan",
    rating: 4.4,
    reviews: 658,
    tags: ["vegetarian"],
  },
  {
    camis: AWASH_CAMIS,
    slug: AWASH_SLUG,
    listingName: "Awash",
    type: "Ethiopian restaurant",
    neighborhood: "Cobble Hill",
    borough: "Brooklyn",
    rating: 4.4,
    reviews: 507,
    tags: ["vegetarian"],
  },
  {
    camis: "50136827",
    slug: "bersi-ethiopian-restaurant",
    listingName: "Bersi Ethiopian Restaurant",
    type: "Vegan restaurant",
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    rating: 4.8,
    reviews: 220,
    tags: ["dairy-free", "vegan", "vegetarian"],
  },
  {
    camis: "50065115",
    slug: "benyam",
    listingName: "Benyam",
    type: "Ethiopian restaurant",
    neighborhood: "Hamilton Heights",
    borough: "Manhattan",
    rating: 4.8,
    reviews: 437,
    tags: ["vegan", "vegetarian"],
  },
  {
    camis: "50006264",
    slug: "bunna-cafe",
    listingName: "Bunna Cafe",
    type: "Ethiopian restaurant",
    neighborhood: "Bushwick",
    borough: "Brooklyn",
    rating: 4.7,
    reviews: 1945,
    tags: ["vegan", "vegetarian"],
  },
  {
    camis: "41717628",
    slug: "haile",
    listingName: "Haile",
    type: "Ethiopian restaurant",
    neighborhood: "East Village",
    borough: "Manhattan",
    rating: 4.6,
    reviews: 555,
    tags: ["vegetarian"],
  },
  {
    camis: "40388091",
    slug: "massawa",
    listingName: "Massawa",
    type: "Ethiopian restaurant",
    neighborhood: "Morningside Heights",
    borough: "Manhattan",
    rating: 4.5,
    reviews: 729,
    tags: ["vegetarian"],
  },
  {
    camis: "40792697",
    slug: "meskerem",
    listingName: "Meskerem",
    type: "Ethiopian restaurant",
    neighborhood: "Greenwich Village",
    borough: "Manhattan",
    rating: 4.1,
    reviews: 596,
    tags: ["vegetarian"],
  },
  {
    camis: "50103964",
    slug: "ras-plant-based",
    listingName: "RAS Plant Based",
    type: "Vegan restaurant",
    neighborhood: "Crown Heights",
    borough: "Brooklyn",
    rating: 4.8,
    reviews: 1311,
    tags: ["dairy-free", "vegan", "vegetarian"],
  },
  {
    camis: "50170694",
    slug: "zoma-express",
    listingName: "Zoma Express",
    type: "Ethiopian restaurant",
    neighborhood: "Morningside Heights",
    borough: "Manhattan",
    rating: 5,
    reviews: 31,
    tags: ["vegetarian"],
  },
]

export interface EthiopianRestaurant {
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
export const ETHIOPIAN_PULLED_ON = "2026-11-26"
export const ETHIOPIAN_PULLED_ON_LABEL = labelIso(ETHIOPIAN_PULLED_ON)

const NTA_NAMES = new Map(ntaNames.map((row) => [row.code, row.name]))

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&"
      if (/^\d/.test(word)) return word
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
  if (!match) return "City cuisine description: Ethiopian. No published listing matched this name and address."
  return `Published as ${match.listingName} in ${match.neighborhood}, ${match.borough}, ${article(match.type)} ${match.type}, rated ${formatRating(match.rating)} from ${formatCount(match.reviews)} reviews${tagPhrase(match.tags)}.`
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

function buildRestaurants(): EthiopianRestaurant[] {
  const rows = rawRows as RawRow[]
  const byCamis = new Map<string, RawRow[]>()
  for (const row of rows) {
    if (row.cuisine_description !== "Ethiopian") {
      throw new Error(`row ${row.camis} is not Ethiopian`)
    }
    const list = byCamis.get(row.camis) ?? []
    list.push(row)
    byCamis.set(row.camis, list)
  }
  const matches = new Map(ETHIOPIAN_LISTING_MATCHES.map((match) => [match.camis, match]))
  const built: EthiopianRestaurant[] = []

  for (const [camis, group] of byCamis) {
    const picked = pickLatestInspection(
      group.map((row) => ({
        inspectionDate: row.inspection_date,
        grade: row.grade,
        score: row.score,
      }))
    )
    const chosenDay = picked.inspectionDate
    const onDay = chosenDay
      ? group.filter((row) => row.inspection_date?.slice(0, 10) === chosenDay)
      : []
    const source = onDay.find((row) => row.dba && row.street) ?? onDay[0] ?? group.find((row) => row.dba) ?? group[0]
    const borough = (source.boro ?? "").trim()
    const match = matches.get(camis)
    const nta = source.nta || group.find((row) => row.nta)?.nta || null
    const ntaName = nta ? NTA_NAMES.get(nta) ?? null : null
    const neighborhood = match?.neighborhood ?? ntaName
    const place = neighborhood ? `${neighborhood}, ${borough}` : borough
    built.push({
      rank: 0,
      camis,
      name: titleCase(source.dba),
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
      slug: match?.slug ?? null,
      factualLine: factualLine(match),
      olderGrade: picked.olderGrade,
      skippedBlankDate: picked.skippedBlankDate,
    })
  }

  built.sort((a, b) => {
    const rankA = gradeRank(a.gradeCode === null && a.gradeLabel === "Not yet inspected" ? "not-yet-inspected" : "inspection", a.gradeCode)
    const rankB = gradeRank(b.gradeCode === null && b.gradeLabel === "Not yet inspected" ? "not-yet-inspected" : "inspection", b.gradeCode)
    if (rankA !== rankB) return rankA - rankB
    const scoreA = a.score ?? Number.POSITIVE_INFINITY
    const scoreB = b.score ?? Number.POSITIVE_INFINITY
    if (scoreA !== scoreB) return scoreA - scoreB
    const dateA = a.inspectionDate ?? ""
    const dateB = b.inspectionDate ?? ""
    if (dateA !== dateB) return dateA < dateB ? 1 : -1
    return a.name.localeCompare(b.name)
  })
  built.forEach((row, index) => {
    row.rank = index + 1
  })
  return built
}

export const ETHIOPIAN_RESTAURANTS = buildRestaurants()
export const ETHIOPIAN_ESTABLISHMENT_COUNT = ETHIOPIAN_RESTAURANTS.length
export const ETHIOPIAN_GRADE_A_COUNT = ETHIOPIAN_RESTAURANTS.filter((row) => row.gradeCode === "A").length
export const ETHIOPIAN_NOT_YET_INSPECTED_COUNT = ETHIOPIAN_RESTAURANTS.filter(
  (row) => row.gradeLabel === "Not yet inspected"
).length
export const ETHIOPIAN_BOROUGH_ONLY = ETHIOPIAN_RESTAURANTS.filter((row) => !row.neighborhood)
export const ETHIOPIAN_ROW_COUNT = (rawRows as RawRow[]).length
export const ETHIOPIAN_DESCRIPTION = `${ETHIOPIAN_ESTABLISHMENT_COUNT} Ethiopian restaurants are in the NYC inspection file. ${ETHIOPIAN_GRADE_A_COUNT} hold a Grade A on the latest scored visit. DOHMH dataset ${DOHMH_DATASET_ID}, record date ${DOHMH_RECORD_DATE_LABEL}.`

export const ETHIOPIAN_INTRO = `Ethiopian restaurants NYC: the city inspection file lists ${ETHIOPIAN_ESTABLISHMENT_COUNT} establishments with cuisine description Ethiopian, and ${ETHIOPIAN_GRADE_A_COUNT} hold a Grade A. ${FOOD_SAFETY_SENTENCE}`

function olderGradePhrase(grade: string): string {
  if (grade === "A" || grade === "B" || grade === "C") return `Grade ${grade}`
  if (grade === "Z" || grade === "P") return "Grade Pending"
  return `grade code ${grade}`
}

function olderGradeSentence(row: EthiopianRestaurant): string | null {
  if (!row.olderGrade) return null
  const score = row.olderGrade.score == null ? "no score" : `score ${row.olderGrade.score}`
  return `${row.name} also has an older ${olderGradePhrase(row.olderGrade.grade)}, ${score}, on ${labelIso(row.olderGrade.inspectionDate)}. The table uses the later visit.`
}

function skippedBlankSentence(row: EthiopianRestaurant): string | null {
  if (!row.skippedBlankDate) return null
  return `${row.name} has a later row on ${labelIso(row.skippedBlankDate)} with no grade and no score. That row is not used. The table uses ${row.inspectionDateLabel}.`
}

export const ETHIOPIAN_EXCEPTIONS = ETHIOPIAN_RESTAURANTS.flatMap((row) => {
  const lines = [olderGradeSentence(row), skippedBlankSentence(row)].filter((line): line is string => Boolean(line))
  return lines
})

const notGradeA = ETHIOPIAN_RESTAURANTS.filter((row) => row.gradeCode !== "A")

export const ETHIOPIAN_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How many Ethiopian restaurants are in NYC?",
    answer: `The NYC Open Data restaurant inspection file, dataset ${DOHMH_DATASET_ID}, lists ${ETHIOPIAN_ESTABLISHMENT_COUNT} distinct CAMIS values with cuisine description Ethiopian. That count is establishments in the city file, not the number of published listings on this site. The dataset record_date is ${DOHMH_RECORD_DATE_LABEL} (${DOHMH_RECORD_DATE}). The newest inspection_date in the file is ${DOHMH_NEWEST_INSPECTION_LABEL}.`,
  },
  {
    question: "How many Ethiopian restaurants in NYC hold a Grade A?",
    answer: `${ETHIOPIAN_GRADE_A_COUNT} of the ${ETHIOPIAN_ESTABLISHMENT_COUNT} hold a Grade A on the latest inspection that has a letter or a score. ${FOOD_SAFETY_SENTENCE} On this page a Grade A is the letter A on that inspection. A later visit that has a score and no letter is not counted as an A.`,
  },
  {
    question: "Is a score of 13 still a Grade A?",
    answer: `Yes. A score of 13 is the last point of the A band. A score of 14 starts the B band. Awash at 242 Court Street, Cobble Hill, Brooklyn, CAMIS ${AWASH_CAMIS}, scored 13 on September 16, 2026, and the letter on that inspection is A.`,
  },
  {
    question: "Which Ethiopian restaurants in the city file are not Grade A?",
    answer: `${notGradeA.length} of the ${ETHIOPIAN_ESTABLISHMENT_COUNT} are not Grade A on that latest inspection. ${notGradeA
      .map((row) => {
        const score = row.score == null ? "no score" : `score ${row.score}`
        const date = row.inspectionDateLabel ?? "no inspection date"
        return `${row.name} is ${row.gradeLabel}, ${score}, on ${date}`
      })
      .join(". ")}.`,
  },
]

export function camisUrl(camis: string): string {
  return dohmhSourceUrl({ name: "", camis })
}

export function restaurantHref(slug: string): string {
  return `/restaurants/${slug}`
}

export const ETHIOPIAN_RELATED_HREFS = [
  "/guides/nyc-health-grades-explained",
  "/data/nyc-restaurant-score-13-cliff",
  "/data/nyc-restaurant-health-grade-report",
  "/nyc/brooklyn/healthy-restaurants",
  "/nyc/manhattan/healthy-restaurants",
  "/nyc/queens/healthy-restaurants",
  "/guides/nyc-restaurant-inspection-process",
  "/healthy-restaurants/grade-a",
  "/about/our-data",
] as const

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>(ETHIOPIAN_RELATED_HREFS)
  for (const row of ETHIOPIAN_RESTAURANTS) {
    if (row.slug) hrefs.add(restaurantHref(row.slug))
  }
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
  const url = `${siteUrl}${ETHIOPIAN_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ETHIOPIAN_TITLE,
    description: ETHIOPIAN_DESCRIPTION,
    datePublished: ETHIOPIAN_PUBLISHED,
    dateModified: ETHIOPIAN_UPDATED,
    author: guideAuthors(),
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ETHIOPIAN_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
