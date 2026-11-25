/**
 * Holiday party catering landing (/catering/holiday-party-catering-nyc).
 *
 * The restaurants table has no catering flag. Lists on that page are published
 * Grade A restaurants for group orders, grouped from borough, neighborhood,
 * Google Maps type, rating, and review count. Nothing here is a price.
 */

import { fitDescription, renderedTitleLength, TITLE_MAX, withBrand } from "@/lib/seo-titles"

export const HOLIDAY_CATERING_PATH = "/catering/holiday-party-catering-nyc"
export const HOLIDAY_CATERING_SOURCE = "holiday_landing"
export const HOLIDAY_GROUP_ORDER_HEADING = "Grade A restaurants for group orders"
export const HOLIDAY_NEIGHBORHOODS_PER_BOROUGH = 3
export const HOLIDAY_RESTAURANTS_PER_NEIGHBORHOOD = 4

/** In-page form the hero button scrolls to. */
export const HOLIDAY_HERO_FORM_ID = "holiday-catering-request"
export const HOLIDAY_HERO_HEADING = "Holiday party catering NYC from a Grade A kitchen"
export const HOLIDAY_HERO_CTA_LABEL = "Send a free catering request"
export const HOLIDAY_HERO_CAVEAT = "No prices. No booking. A restaurant decides whether it caters."

const HOLIDAY_DIETARY_NEEDS = "vegan, vegetarian, gluten-free, kosher, halal, or nut-free"

export interface HolidayHeroCopyInput {
  /** Published operational listings whose stored grade is A. Same count as the homepage. */
  gradeA: number
  /** Boroughs of the Grade A restaurants this page lists, in display order. */
  boroughs: string[]
  /** Long date from the directory snapshot, or null when no inspection date is on file. */
  latestInspectionLabel: string | null
}

export interface HolidayHeroCopy {
  heading: string
  subhead: string
  ctaLabel: string
  caveat: string
}

function speakBorough(name: string): string {
  return name === "Bronx" ? "the Bronx" : name
}

function joinSeries(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ""
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

function listedBoroughs(boroughs: string[]): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  for (const borough of boroughs) {
    const trimmed = borough.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    names.push(speakBorough(trimmed))
  }
  return names
}

/**
 * Hero copy for the holiday catering page.
 * Counts, boroughs, and the inspection date are passed in from queries the
 * page already renders. A missing date is omitted. A zero Grade A count does
 * not claim one exists. Nothing here says a restaurant will cater, quotes a
 * price, or promises a reply time.
 */
export function holidayHeroCopy(input: HolidayHeroCopyInput): HolidayHeroCopy {
  const parts: string[] = []
  const gradeA = Number.isInteger(input.gradeA) ? input.gradeA : 0
  if (gradeA > 0) {
    const noun = gradeA === 1 ? "published listing holds" : "published listings hold"
    parts.push(
      `${gradeA.toLocaleString("en-US")} ${noun} a NYC Department of Health Grade A.`
    )
    const boroughs = listedBoroughs(input.boroughs)
    if (boroughs.length > 0) {
      parts.push(`Listed below by borough: ${joinSeries(boroughs)}.`)
    }
  }
  if (input.latestInspectionLabel) {
    parts.push(`The newest inspection date on a published listing is ${input.latestInspectionLabel}.`)
  }
  parts.push(`The request is free, and you can include ${HOLIDAY_DIETARY_NEEDS} needs.`)
  return {
    heading: HOLIDAY_HERO_HEADING,
    subhead: parts.join(" "),
    ctaLabel: HOLIDAY_HERO_CTA_LABEL,
    caveat: HOLIDAY_HERO_CAVEAT,
  }
}

const BOROUGH_ORDER = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

/** Keyword stays first. pageMeta appends the brand because this has no pipe. */
export const HOLIDAY_CATERING_TITLE = "Holiday Party Catering NYC"

export function holidayCateringDescription(): string {
  return fitDescription(
    ["Holiday party catering in NYC, including office parties and Thanksgiving week."],
    [
      "Grade A restaurants for group orders. The request is free.",
      "Grade A restaurants for group orders.",
    ]
  )
}

export function holidayCateringTitleLength(): number {
  return renderedTitleLength(HOLIDAY_CATERING_TITLE)
}

export function holidayCateringTitleFits(): boolean {
  const rendered = withBrand(HOLIDAY_CATERING_TITLE)
  return rendered.length <= TITLE_MAX && !HOLIDAY_CATERING_TITLE.includes("|")
}

export interface HolidayCateringRestaurant {
  name: string
  slug: string
  type: string | null
  borough: string | null
  neighborhood: string | null
  rating: number | null
  reviews: number | null
  dietary_tags: string | null
}

export interface HolidayNeighborhoodGroup {
  borough: string
  neighborhood: string
  /** Published Grade A restaurants in this neighborhood, including ones not shown. */
  gradeACount: number
  restaurants: HolidayCateringRestaurant[]
}

export interface HolidayBoroughGroup {
  borough: string
  /** Published Grade A restaurants in this borough, including ones not shown. */
  gradeACount: number
  neighborhoods: HolidayNeighborhoodGroup[]
}

export interface HolidayGroupOrders {
  /** Rows with a borough. This is the number the page may print. */
  total: number
  /** Grade A rows dropped because borough is blank. */
  withoutBorough: number
  boroughs: HolidayBoroughGroup[]
}

function boroughRank(borough: string): number {
  const index = BOROUGH_ORDER.indexOf(borough)
  return index === -1 ? BOROUGH_ORDER.length : index
}

function compareRestaurants(a: HolidayCateringRestaurant, b: HolidayCateringRestaurant): number {
  const rating = (b.rating ?? -1) - (a.rating ?? -1)
  if (rating !== 0) return rating
  const reviews = (b.reviews ?? 0) - (a.reviews ?? 0)
  if (reviews !== 0) return reviews
  return a.slug.localeCompare(b.slug)
}

/**
 * Group published Grade A rows for the holiday page.
 * Borough count is every row in that borough. Neighborhood sections are the
 * ones with the most Grade A rows. Within a neighborhood, order is Google
 * rating, then review count, then slug. partner_status is not an input.
 */
export function groupGradeAForHoliday(
  rows: HolidayCateringRestaurant[],
  options?: { neighborhoodsPerBorough?: number; restaurantsPerNeighborhood?: number }
): HolidayGroupOrders {
  const neighborhoodsPerBorough = options?.neighborhoodsPerBorough ?? HOLIDAY_NEIGHBORHOODS_PER_BOROUGH
  const restaurantsPerNeighborhood = options?.restaurantsPerNeighborhood ?? HOLIDAY_RESTAURANTS_PER_NEIGHBORHOOD
  const located: HolidayCateringRestaurant[] = []
  let withoutBorough = 0
  for (const row of rows) {
    const borough = row.borough?.trim() ?? ""
    if (!borough) {
      withoutBorough += 1
      continue
    }
    located.push({ ...row, borough })
  }

  const byBorough = new Map<string, HolidayCateringRestaurant[]>()
  for (const row of located) {
    const borough = row.borough as string
    const list = byBorough.get(borough) ?? []
    list.push(row)
    byBorough.set(borough, list)
  }

  const boroughs = [...byBorough.entries()]
    .sort(([a], [b]) => boroughRank(a) - boroughRank(b) || a.localeCompare(b))
    .map(([borough, boroughRows]) => {
      const byNeighborhood = new Map<string, HolidayCateringRestaurant[]>()
      for (const row of boroughRows) {
        const neighborhood = row.neighborhood?.trim() ?? ""
        if (!neighborhood) continue
        const list = byNeighborhood.get(neighborhood) ?? []
        list.push(row)
        byNeighborhood.set(neighborhood, list)
      }
      const neighborhoods = [...byNeighborhood.entries()]
        .sort(([nameA, rowsA], [nameB, rowsB]) => rowsB.length - rowsA.length || nameA.localeCompare(nameB))
        .slice(0, neighborhoodsPerBorough)
        .map(([neighborhood, neighborhoodRows]) => ({
          borough,
          neighborhood,
          gradeACount: neighborhoodRows.length,
          restaurants: [...neighborhoodRows].sort(compareRestaurants).slice(0, restaurantsPerNeighborhood),
        }))
      return {
        borough,
        gradeACount: boroughRows.length,
        neighborhoods,
      }
    })

  return { total: located.length, withoutBorough, boroughs }
}

export function formatGoogleRating(rating: number | null, reviews: number | null): string | null {
  if (rating == null || Number.isNaN(rating)) return null
  const score = rating.toFixed(1)
  if (reviews == null) return score
  return `${score} · ${reviews.toLocaleString("en-US")} Google reviews`
}

export const HOLIDAY_CATERING_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How much lead time do I need for holiday party catering in NYC?",
    answer:
      "The directory does not store a catering lead time. Put the event date on the form, including a Thanksgiving date or a December office party. We save that date and may share the request with restaurants. A restaurant decides whether the date is still open. This page does not hold a slot.",
  },
  {
    question: "What group size can I put on an office holiday catering request?",
    answer:
      "The form accepts a headcount from 1 to 5,000. That number is the size of the request, not a capacity we have checked. We do not know how large a group a restaurant can serve.",
  },
  {
    question: "Can a holiday catering request include dietary needs?",
    answer:
      "Yes. The form asks about vegan, vegetarian, gluten-free, kosher, halal, nut-free, and other needs, and it requires at least one choice. Dietary tags on a listing are applied only when a restaurant identifies that way or has substantial dedicated menu coverage. A tag is not a catering menu.",
  },
  {
    question: "How do NYC health grades work on this page?",
    answer:
      "A Grade A on this page is the letter we have matched from NYC Department of Health and Mental Hygiene inspection data. A Grade A is a score of 0 to 13 points on the initial inspection or the reinspection. It describes a sanitary inspection. It is not a catering certification. The guide NYC restaurant health grades explained covers how A, B, and C are assigned.",
  },
  {
    question: "Does it cost anything to request holiday party catering?",
    answer:
      "Sending the request is free for the person filling out the form. Eat Real Food NYC does not collect payment on this page. Restaurant prices are not listed here, and this form does not quote a menu price.",
  },
  {
    question: "Do the restaurants listed here offer Thanksgiving and holiday catering?",
    answer:
      "The directory does not record whether a restaurant offers catering, a holiday menu, or delivery. The lists are published Grade A restaurants for group orders, grouped by borough and neighborhood. Cuisine is the Google Maps type on the listing. Being listed is not a statement that the restaurant will cater a Thanksgiving meal or an office party.",
  },
]
