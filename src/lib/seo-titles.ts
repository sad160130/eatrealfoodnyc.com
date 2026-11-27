/**
 * Title tag formula: Keyword | Benefit | Brand.
 *
 * The root layout template appends " | Eat Real Food NYC", so this module
 * returns the keyword and the benefit only. The rendered <title> is
 * `${inner} | Eat Real Food NYC` and is kept at or under 60 characters.
 * A benefit is included only when it fits and the caller has a true value
 * (a real Grade A count, a stored inspection month). Missing data drops
 * the benefit instead of inventing one.
 */

import { parseInspectionDate } from "./inspection-dates"

export function shortMonth(date: Date | null | undefined): string | null {
  if (!date) return null
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(date)
}

export function formatInspectionMonth(raw: string | null | undefined): string | null {
  const date = parseInspectionDate(raw ?? null)
  if (!date) return null
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(date)
}

export const BRAND_NAME = "Eat Real Food NYC"
export const TITLE_TEMPLATE_SUFFIX = ` | ${BRAND_NAME}`
export const TITLE_MAX = 60
export const TITLE_CAP = 65
export const DESCRIPTION_MAX = 160

export function fitTitle(
  rungs: Array<string | null | undefined>,
  options?: { allowBrand?: boolean; max?: number; cap?: number }
): string {
  const max = options?.max ?? TITLE_MAX
  const cap = options?.cap ?? TITLE_CAP
  const allowBrand = options?.allowBrand ?? false
  const cleaned = rungs
    .map((rung) => rung?.replace(/\s+/g, " ").trim())
    .filter((rung): rung is string => Boolean(rung))
  const branded = (rung: string) => {
    if (!allowBrand || rung.endsWith(BRAND_NAME)) return rung
    const withBrand = `${rung}${TITLE_TEMPLATE_SUFFIX}`
    return withBrand.length <= max ? withBrand : rung
  }
  for (const rung of cleaned) {
    const title = branded(rung)
    if (title.length <= max) return title
  }
  for (const rung of cleaned) {
    const title = branded(rung)
    if (title.length <= cap) {
      console.warn(`title ${title.length} chars (over ${max}): ${title}`)
      return title
    }
  }
  const bare = cleaned[cleaned.length - 1] ?? ""
  if (bare.length > cap) console.warn(`title exceeds ${cap}: ${bare}`)
  return bare
}

export function fitDescription(head: string[], tails: string[], max = DESCRIPTION_MAX): string {
  const sentences = head.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean)
  while (sentences.length > 1 && sentences.join(" ").length > max) sentences.pop()
  let text = sentences.join(" ")
  for (const tail of tails) {
    const next = `${text} ${tail}`.replace(/\s+/g, " ").trim()
    if (next.length <= max) return next
  }
  return text
}

const INNER_MAX = TITLE_MAX - TITLE_TEMPLATE_SUFFIX.length

export function withBrand(inner: string): string {
  return `${inner}${TITLE_TEMPLATE_SUFFIX}`
}

export function renderedTitleLength(inner: string): number {
  return withBrand(inner).length
}

/**
 * Keep a restaurant title at or under `max` characters.
 * A " | " inside the name is a suffix: drop whole suffixes before cutting a word.
 */
export function clipListingTitle(text: string, max = TITLE_MAX): string {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) return cleaned
  const parts = cleaned.split(" | ")
  let kept = ""
  for (const part of parts) {
    const next = kept ? `${kept} | ${part}` : part
    if (next.length > max) break
    kept = next
  }
  if (kept && kept.length <= max && kept.length < cleaned.length) return kept
  const slice = cleaned.slice(0, max)
  const space = slice.lastIndexOf(" ")
  const base = (space > 12 ? slice.slice(0, space) : slice).trimEnd()
  return base.replace(/[\s|–—-]+$/u, "").trim()
}

/** Clip on a word boundary and add an ellipsis when the text is too long. */
export function clipText(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) return cleaned
  const slice = cleaned.slice(0, max - 1)
  const word = slice.lastIndexOf(" ")
  const base = (word > 40 ? slice.slice(0, word) : slice).trimEnd()
  return `${base}…`
}

/**
 * Fit "keyword | benefit" into the characters left after the brand suffix.
 * The keyword stays at the front. The benefit is dropped before the keyword
 * is shortened.
 */
export function buildPipeTitle(keyword: string, benefit: string | null | undefined): string {
  const key = keyword.replace(/\s+/g, " ").trim()
  const extra = benefit?.replace(/\s+/g, " ").trim()
  if (extra) {
    const both = `${key} | ${extra}`
    if (both.length <= INNER_MAX) return both
  }
  if (key.length <= INNER_MAX) return key
  const room = INNER_MAX - 1
  const cut = key.slice(0, room)
  const word = cut.lastIndexOf(" ")
  const base = (word > 12 ? cut.slice(0, word) : cut).trimEnd()
  return `${base}…`
}

export function neighborhoodTitle(neighborhood: string, gradeA: number): string {
  const benefit = gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  const candidates = [
    `Healthy Restaurants in ${neighborhood}`,
    `Healthy Restaurants, ${neighborhood}`,
  ]
  for (const keyword of candidates) {
    const withBenefit = benefit ? buildPipeTitle(keyword, benefit) : null
    if (withBenefit && withBenefit.includes("|")) return withBenefit
  }
  for (const keyword of candidates) {
    const plain = buildPipeTitle(keyword, null)
    if (!plain.endsWith("…")) return plain
  }
  return buildPipeTitle(candidates[0], null)
}

export function dietTitle(label: string, gradeA: number): string {
  const benefit = gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  const candidates = [
    `${label} Restaurants NYC`,
    `${label} Restaurants`,
  ]
  for (const keyword of candidates) {
    const titled = buildPipeTitle(keyword, benefit)
    if (!benefit || titled.includes("|")) return titled
  }
  return buildPipeTitle(candidates[0], null)
}

export function boroughTitle(borough: string, gradeA: number): string {
  return neighborhoodTitle(borough, gradeA)
}

export function dietBoroughTitle(label: string, borough: string, gradeA: number): string {
  const benefit = gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  const candidates = [
    `${label} Restaurants in ${borough}`,
    `${label} in ${borough}`,
  ]
  for (const keyword of candidates) {
    const titled = buildPipeTitle(keyword, benefit)
    if (!benefit || titled.includes("|")) return titled
  }
  for (const keyword of candidates) {
    const plain = buildPipeTitle(keyword, null)
    if (!plain.endsWith("…")) return plain
  }
  return buildPipeTitle(candidates[candidates.length - 1], null)
}

export function restaurantTitle(input: {
  name: string
  inspectionGrade: string | null
  inspectionDate: string | null
  neighborhood: string | null
}): string {
  const month = formatInspectionMonth(input.inspectionDate)
  const grade = input.inspectionGrade?.trim()
  const benefits: string[] = []
  if (grade && month) benefits.push(`Grade ${grade}, ${month}`)
  if (grade) benefits.push(`Grade ${grade}`)
  if (month) benefits.push(`Inspected ${month}`)
  if (input.neighborhood) benefits.push(input.neighborhood)
  for (const benefit of benefits) {
    const titled = buildPipeTitle(input.name, benefit)
    if (titled.includes("|")) return titled
  }
  return buildPipeTitle(input.name, null)
}

export function hubMetaDescription(input: {
  count: number
  place: string
  gradeA: number
  latestMonth: string | null
  dietLabel?: string | null
}): string {
  const subject = input.dietLabel
    ? `${input.count.toLocaleString("en-US")} ${input.dietLabel.toLowerCase()} restaurants in ${input.place}`
    : `${input.count.toLocaleString("en-US")} healthy restaurants in ${input.place}`
  const parts = [`${subject}.`]
  if (input.gradeA > 0) {
    parts.push(`${input.gradeA.toLocaleString("en-US")} hold a NYC DOHMH Grade A.`)
  } else {
    parts.push("A NYC DOHMH grade is shown when a record is matched.")
  }
  if (input.latestMonth) parts.push(`Latest matched inspection: ${input.latestMonth}.`)
  return clipText(parts.join(" "), DESCRIPTION_MAX)
}

export function restaurantMetaDescription(input: {
  name: string
  neighborhood: string | null
  borough: string | null
  inspectionGrade: string | null
  inspectionScore: number | null
  inspectionDate: string | null
  tags: string[]
}): string {
  const where = [input.neighborhood, input.borough].filter(Boolean).join(", ") || "New York City"
  const parts = [`${input.name} in ${where}.`]
  const month = formatInspectionMonth(input.inspectionDate)
  const grade = input.inspectionGrade?.trim()
  if (grade && input.inspectionScore != null && month) {
    parts.push(`NYC DOHMH Grade ${grade}, score ${input.inspectionScore}, inspected ${month}.`)
  } else if (grade && month) {
    parts.push(`NYC DOHMH Grade ${grade}, inspected ${month}.`)
  } else if (grade && input.inspectionScore != null) {
    parts.push(`NYC DOHMH Grade ${grade}, score ${input.inspectionScore}.`)
  } else if (grade) {
    parts.push(`NYC DOHMH Grade ${grade}.`)
  } else if (month) {
    parts.push(`Latest matched NYC DOHMH inspection: ${month}. No letter grade is stored.`)
  } else {
    parts.push("No NYC DOHMH grade is matched on this listing.")
  }
  if (input.tags.length > 0) {
    parts.push(`Tagged ${input.tags.slice(0, 3).join(", ")}.`)
  }
  return clipText(parts.join(" "), DESCRIPTION_MAX)
}

/** Guide title inners. Benefit phrases state what the page actually explains. */
export const GUIDE_TITLE_PARTS: Record<string, { keyword: string; benefit: string }> = {
  "nyc-restaurant-inspection-process": { keyword: "NYC Inspections", benefit: "How a Visit Works" },
  "vegan-nyc-borough-guide": { keyword: "Vegan Restaurants NYC", benefit: "By Borough" },
  "halal-food-guide-nyc": { keyword: "Halal Restaurants NYC", benefit: "Five Boroughs" },
  "gluten-free-dining-nyc": { keyword: "Gluten-Free NYC", benefit: "What We Tag" },
  "how-eat-healthy-nyc-15-dollars": { keyword: "Eat Healthy NYC for $15", benefit: "A Guide" },
  "best-healthy-neighborhoods-nyc": { keyword: "Healthy NYC Neighborhoods 2026", benefit: "Ranked" },
  "hidden-gem-restaurants-nyc": { keyword: "Hidden Gems NYC", benefit: "How We Find Them" },
  "kosher-dining-nyc-guide": { keyword: "Kosher Restaurants NYC", benefit: "By Borough" },
  "late-night-healthy-eating-nyc": { keyword: "Healthy Food Open Late in NYC", benefit: "After 10pm" },
  "seafood-healthy-restaurants-nyc": { keyword: "Healthy Seafood NYC", benefit: "A Diner's Guide" },
  "healthy-breakfast-nyc": { keyword: "Healthy Breakfast NYC", benefit: "Morning Spots" },
}

export function guideTitle(slug: string, fallback: string): string {
  const parts = GUIDE_TITLE_PARTS[slug]
  if (!parts) return fitTitle([fallback], { allowBrand: true })
  return fitTitle([`${parts.keyword} | ${parts.benefit}`, parts.keyword], { allowBrand: false })
}

const LETTERS = new Set(["A", "B", "C"])

export function letterGrade(grade: string | null | undefined): "A" | "B" | "C" | null {
  const code = grade?.trim().toUpperCase()
  return code && LETTERS.has(code) ? (code as "A" | "B" | "C") : null
}

export function monthsBefore(later: Date, earlier: Date): number {
  return (later.getUTCFullYear() - earlier.getUTCFullYear()) * 12 + (later.getUTCMonth() - earlier.getUTCMonth())
}

export function inspectionIsRecent(raw: string | null | undefined, snapshot: Date): boolean {
  const date = parseInspectionDate(raw ?? null)
  if (!date) return false
  return monthsBefore(snapshot, date) <= 18
}

function hasStoredReviews(
  rating: number | null | undefined,
  reviews: number | null | undefined
): reviews is number {
  return rating != null && rating > 0 && reviews != null && reviews > 0
}

/** "4.5 stars from 1,515 Google reviews." Uses the stored rating and count only. */
function googleReviewLead(rating: number, reviews: number): string {
  const stars = rating.toFixed(1)
  const starWord = Number(stars) === 1 ? "star" : "stars"
  const reviewWord = reviews === 1 ? "review" : "reviews"
  return `${stars} ${starWord} from ${reviews.toLocaleString("en-US")} Google ${reviewWord}.`
}

export function restaurantListingTitle(input: {
  name: string
  neighborhood: string | null
  borough: string | null
  grade: string | null
  inspectionDate: string | null
  type: string | null
  snapshot: Date
  rating?: number | null
  reviews?: number | null
}): string {
  const grade = letterGrade(input.grade)
  const month = formatInspectionMonth(input.inspectionDate)
  const recent = inspectionIsRecent(input.inspectionDate, input.snapshot)
  const hood = input.neighborhood
  const borough = input.borough
  const cuisine = cuisineLabel(input.type, input.name)
  const shortName = clipListingTitle(input.name)
  const dated = recent && month ? month : null
  // Reviews queries are about half of listing impressions. Lead with them
  // when a Google rating and a review count are stored. Long names fall
  // through to the same no-Reviews candidates as an unreviewed listing.
  const reviewCandidates: Array<string | null> = hasStoredReviews(input.rating, input.reviews)
    ? grade
      ? [
          dated ? `${shortName} Reviews & Grade ${grade} (${dated})` : null,
          hood ? `${shortName} Reviews, ${hood} | Grade ${grade}` : null,
          dated ? `${shortName} Reviews | Grade ${grade}, ${dated}` : null,
          `${shortName} Reviews | Grade ${grade}`,
        ]
      : [
          hood ? `${shortName} Reviews, ${hood}` : null,
          borough ? `${shortName} Reviews, ${borough}` : null,
          `${shortName} Reviews`,
        ]
    : []
  const titled = grade
    ? fitTitle(
        [
          ...reviewCandidates,
          dated && hood ? `${shortName}, ${hood} | Grade ${grade}, ${dated}` : null,
          hood ? `${shortName}, ${hood} | NYC Grade ${grade}` : null,
          hood ? `${shortName}, ${hood} | Grade ${grade}` : null,
          borough ? `${shortName} | NYC Grade ${grade}, ${borough}` : null,
          `${shortName} | Grade ${grade}`,
          shortName,
        ],
        { allowBrand: false, max: TITLE_MAX, cap: TITLE_MAX }
      )
    : fitTitle(
        [
          ...reviewCandidates,
          cuisine && hood && borough ? `${shortName} | ${cuisine} in ${hood}, ${borough}` : null,
          cuisine && hood ? `${shortName} | ${cuisine} in ${hood}` : null,
          hood ? `${shortName}, ${hood}` : null,
          shortName,
        ],
        { allowBrand: false, max: TITLE_MAX, cap: TITLE_MAX }
      )
  return clipListingTitle(titled)
}

function cuisineLabel(type: string | null, name: string): string | null {
  if (!type) return null
  const cuisine = type.replace(/\s+restaurant$/i, "").trim()
  if (!cuisine || name.toLowerCase().includes(cuisine.toLowerCase())) return null
  return cuisine
}

export function restaurantListingDescription(input: {
  name: string
  type: string | null
  address: string | null
  neighborhood: string | null
  borough: string | null
  grade: string | null
  score: number | null
  inspectionDate: string | null
  snapshot?: Date
  rating: number | null
  reviews: number | null
  tags: string[]
}): string {
  const grade = letterGrade(input.grade)
  const month = input.snapshot && !inspectionIsRecent(input.inspectionDate, input.snapshot)
    ? null
    : formatInspectionMonth(input.inspectionDate)
  const type = input.type?.trim()
  const place = [input.neighborhood, input.borough].filter(Boolean).join(", ")
  const identity = input.address && input.neighborhood && type
    ? `${input.name}: ${type.toLowerCase()} at ${input.address}, ${input.neighborhood}.`
    : type && place
      ? `${input.name}: ${type} in ${place}.`
      : `${input.name}${place ? ` in ${place}` : ""}.`
  let gradeSentence: string
  if (grade) {
    const bits = [`NYC DOHMH Grade ${grade}`]
    if (input.score != null) bits.push(`score ${input.score}`)
    if (month) bits.push(`inspected ${month}`)
    gradeSentence = `${bits.join(", ")}.`
  } else {
    gradeSentence = "No NYC DOHMH letter grade on file yet."
  }
  const rating = input.rating
  const reviews = input.reviews
  const rated = rating != null && rating > 0 && reviews != null && reviews > 0
  // Rating stays first so a long address is what gets dropped at 160 characters.
  const head = rated
    ? [googleReviewLead(rating, reviews), gradeSentence, identity]
    : [identity, gradeSentence]
  const tails: string[] = []
  if (input.tags.length > 0) tails.push(`Tagged ${input.tags.slice(0, 2).join(", ")}.`)
  return fitDescription(head, tails)
}

const CTR_DESCRIPTION_MAX = 155

function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}

/**
 * Titles for the pages that already earn the clicks. The lead is the query.
 * The benefit is a count that page already computes. Nothing here is invented.
 */
export function breakfastGuideTitle(gradeA: number): string {
  const count = formatCount(gradeA)
  const spots = gradeA === 1 ? "Spot" : "Spots"
  return fitTitle(
    [
      gradeA > 0 ? `Healthy Breakfast NYC: ${count} Grade A ${spots} Open by 8 AM` : null,
      gradeA > 0 ? `Healthy Breakfast NYC | ${count} Grade A` : null,
      "Healthy Breakfast NYC",
    ],
    { allowBrand: false },
  )
}

export function lateNightGuideTitle(neighborhoods: number): string {
  const areas = neighborhoods > 0 ? `${formatCount(neighborhoods)} ${neighborhoods === 1 ? "Neighborhood" : "Neighborhoods"}` : null
  return fitTitle(
    [
      "Healthy Food Open Late in NYC: After 10pm",
      areas ? `Healthy Food Open Late in NYC | ${areas}` : null,
      "Healthy Food Open Late in NYC",
    ],
    { allowBrand: false },
  )
}

export const HEALTH_GRADES_GUIDE_TITLE = "What Does a C Rating Mean? NYC Grades"

export function healthGradesGuideTitle(): string {
  return fitTitle([HEALTH_GRADES_GUIDE_TITLE, "NYC Restaurant Grades"], { allowBrand: false })
}

export function dietCtrTitle(label: string, gradeA: number, count: number): string {
  const graded = gradeA > 0 ? `${formatCount(gradeA)} Grade A` : null
  const listed = count > 0 ? `${formatCount(count)} Listed` : null
  return fitTitle(
    [
      graded ? `${label} Restaurants NYC | ${graded}` : null,
      listed ? `${label} Restaurants NYC | ${listed}` : null,
      `${label} Restaurants NYC`,
    ],
    { allowBrand: false },
  )
}

export function breakfastGuideDescription(input: { earlyOpeners: number; gradeA: number }): string {
  const spot = input.gradeA === 1 ? "spot opens" : "spots open"
  const listing = input.earlyOpeners === 1 ? "listing opens" : "listings open"
  return fitCtrBand(
    `Healthy Breakfast NYC: ${formatCount(input.gradeA)} Grade A ${spot} by 8 AM weekdays. ${formatCount(input.earlyOpeners)} published ${listing} that early. The letter is the official NYC DOHMH grade.`,
  )
}

export function lateNightGuideLede(input: { restaurants: number; neighborhoods: number }): string {
  const rest = input.restaurants === 1 ? "restaurant listing" : "restaurant listings"
  const hood = input.neighborhoods === 1 ? "neighborhood" : "neighborhoods"
  return `Healthy food open late in NYC means a meal after 10pm. This directory publishes ${input.restaurants.toLocaleString("en-US")} ${rest} across ${input.neighborhoods.toLocaleString("en-US")} ${hood}. Working hours on those listings are what show whether a place is open after 10pm, and a matched NYC DOHMH grade is shown when one is on file. Grade A is a score under 14 points. This guide does not add a restaurant that is not in the published set.`
}

export function lateNightGuideDescription(input: { restaurants: number; neighborhoods: number }): string {
  const hood = input.neighborhoods === 1 ? "neighborhood" : "neighborhoods"
  const rest = input.restaurants === 1 ? "listing" : "listings"
  const verb = input.restaurants === 1 ? "includes" : "include"
  const counts = `${formatCount(input.restaurants)} published ${rest} across ${formatCount(input.neighborhoods)} ${hood}`
  return `Healthy Food Open Late in NYC means after 10pm. ${counts} ${verb} hours and an official NYC DOHMH grade on file.`
}

/**
 * Guide keeps the "kosher restaurants nyc" query. The count is the published
 * kosher tag total the guide already renders. Year is the caller's data year.
 */
export function kosherGuideTitle(count: number, year: number): string {
  const listed = count > 0 ? `${formatCount(count)} Listed by Borough (${year})` : null
  const short = count > 0 ? `${formatCount(count)} Listed` : null
  return fitTitle(
    [
      listed ? `Kosher Restaurants NYC: ${listed}` : null,
      short ? `Kosher Restaurants NYC | ${short}` : null,
      "Kosher Restaurants NYC",
    ],
    { allowBrand: false },
  )
}

export function kosherGuideDescription(count: number): string {
  const listed = count === 1 ? "listing is" : "listings are"
  const lead = count > 0
    ? `Kosher Restaurants NYC: ${formatCount(count)} published ${listed} tagged kosher and listed by borough.`
    : "Kosher Restaurants NYC: published listings tagged kosher, listed by borough."
  return fitDescription(
    [lead],
    [
      "The tag is not a certification this directory issues.",
      "NYC DOHMH grades for these listings are on the health-grades page.",
    ],
  )
}

/**
 * Kosher dietary hub only. Grade A and graded come from the hub’s existing
 * letter-grade counts. Other diet hubs stay on dietHubTitle or dietCtrTitle.
 */
export function kosherHealthGradesTitle(gradeA: number, graded: number): string {
  const ratio = graded > 0 ? `${formatCount(gradeA)} of ${formatCount(graded)} Grade A` : null
  const short = graded > 0 && gradeA > 0 ? `${formatCount(gradeA)} Grade A` : null
  return fitTitle(
    [
      ratio ? `Kosher Restaurant Health Grades NYC: ${ratio}` : null,
      ratio ? `Kosher Health Grades NYC: ${ratio}` : null,
      short ? `Kosher Restaurant Health Grades NYC | ${short}` : null,
      "Kosher Restaurant Health Grades NYC",
    ],
    { allowBrand: false },
  )
}

export function kosherHealthGradesDescription(input: { count: number; gradeA: number; graded: number }): string {
  const ratio = input.graded > 0
    ? `${formatCount(input.gradeA)} of ${formatCount(input.graded)} graded kosher restaurants hold an official NYC DOHMH Grade A.`
    : "No published kosher restaurant has a matched NYC DOHMH letter grade."
  const listed = input.count > 0
    ? `${formatCount(input.count)} published ${input.count === 1 ? "listing carries" : "listings carry"} the kosher tag.`
    : ""
  return fitDescription([`Kosher restaurant health grades in NYC. ${ratio}`], [listed])
}

export const HEALTH_GRADES_GUIDE_DESCRIPTION =
  "What does a C rating mean for NYC restaurant grades? A is 0\u201313 points, B is 14\u201327 on a reinspection, and C is 28 or more on the official NYC DOHMH score."

export function healthGradesGuideDescription(): string {
  return HEALTH_GRADES_GUIDE_DESCRIPTION
}

export function dietCtrDescription(label: string, count: number, gradeA: number): string {
  const name = label.toLowerCase()
  const noun = count === 1 ? "restaurant" : "restaurants"
  const listed = formatCount(count)
  if (gradeA > 0) {
    const verb = gradeA === 1 ? "holds" : "hold"
    return fitCtrBand(
      `${listed} ${name} ${noun} in NYC. ${formatCount(gradeA)} ${verb} an official NYC DOHMH Grade A. The letter on each listing is the latest matched NYC DOHMH inspection.`,
    )
  }
  return fitCtrBand(
    `${listed} ${name} ${noun} in NYC. An official NYC DOHMH grade is shown when a record is matched, and none of these listings hold Grade A on the page.`,
  )
}

/** Keep a finished sentence inside the CTR description band. Do not clip mid-thought. */
function fitCtrBand(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= CTR_DESCRIPTION_MAX) return cleaned
  const sentences = cleaned.split(/(?<=\.)\s+/)
  let cut = ""
  for (const sentence of sentences) {
    const next = cut ? `${cut} ${sentence}` : sentence
    if (next.length > CTR_DESCRIPTION_MAX) break
    cut = next
  }
  return cut || cleaned
}

export function homeTitle(gradeA: number, year: number): string {
  const count = gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  return fitTitle(
    [
      count ? `Healthy Restaurants NYC ${year} | ${count}` : null,
      `Healthy Restaurants NYC ${year}`,
    ],
    { allowBrand: false }
  )
}

export function neighborhoodHubTitle(hood: string, borough: string, gradeA: number, year: number): string {
  const count = gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  return fitTitle(
    [
      count ? `Healthy Restaurants in ${hood}, ${borough} | ${count}` : null,
      count ? `Healthy Restaurants in ${hood} ${year} | ${count}` : null,
      count ? `Healthy Restaurants in ${hood} | ${count}` : null,
      count ? `Healthy Restaurants, ${hood} | ${count}` : null,
      `Healthy Restaurants in ${hood}`,
    ],
    { allowBrand: false }
  )
}

export function boroughHubTitle(borough: string, gradeA: number, year: number): string {
  const count = gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  return fitTitle(
    [
      count ? `Healthy Restaurants in ${borough} ${year} | ${count}` : null,
      count ? `Healthy ${borough} Restaurants ${year} | ${count}` : null,
      `Healthy Restaurants in ${borough} ${year}`,
      `Healthy Restaurants in ${borough}`,
    ],
    { allowBrand: false }
  )
}

/**
 * Manhattan only. Search Console shows "healthy food near me" on this hub.
 * Other boroughs stay on boroughHubTitle. Grade A is the NYC DOHMH letter.
 */
export function manhattanHubTitle(gradeA: number, year: number): string {
  const count = gradeA > 0 ? formatCount(gradeA) : null
  const noun = gradeA === 1 ? "Restaurant" : "Restaurants"
  return fitTitle(
    [
      count ? `Healthy Food in Manhattan: ${count} Grade A ${noun} (${year})` : null,
      count ? `Healthy Food in Manhattan: ${count} Grade A (${year})` : null,
      count ? `Healthy Food in Manhattan | ${count} Grade A` : null,
      `Healthy Food in Manhattan ${year}`,
      "Healthy Food in Manhattan",
    ],
    { allowBrand: false }
  )
}

export function manhattanHubDescription(input: {
  count: number
  gradeA: number
  latestMonth: string | null
}): string {
  const listed = formatCount(input.count)
  const noun = input.count === 1 ? "restaurant" : "restaurants"
  const counts = input.gradeA > 0
    ? `${listed} published ${noun}, ${formatCount(input.gradeA)} with an official NYC DOHMH Grade A.`
    : `${listed} published ${noun}. An official NYC DOHMH grade is shown when a record is matched.`
  return fitDescription(
    ["Find healthy food near you by Manhattan neighborhood.", counts],
    [input.latestMonth ? `Matched inspections as of ${input.latestMonth}.` : ""]
  )
}

export function dietHubTitle(label: string, count: number, gradeA: number, year: number): string {
  const bits = [
    count > 0 ? `${count.toLocaleString("en-US")} Listed` : null,
    gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null,
  ].filter(Boolean)
  const benefit = bits.join(", ")
  return fitTitle(
    [
      benefit ? `${label} Restaurants NYC ${year} | ${benefit}` : null,
      benefit ? `${label} Restaurants NYC | ${benefit}` : null,
      `${label} Restaurants NYC ${year}`,
      `${label} Restaurants NYC`,
    ],
    { allowBrand: false }
  )
}

/** Paginated Grade A title. Includes "| Page N" and stays within 60 characters. */
export function gradeAPagedTitle(place: string, page: number): string {
  const pageLabel = `Page ${page}`
  const brand = BRAND_NAME
  const candidates = [
    `Grade A Restaurants in ${place}`,
    `Grade A in ${place}`,
    `${place} Grade A`,
    "Grade A Restaurants",
    "Grade A",
  ]
  for (const keyword of candidates) {
    const full = `${keyword} | ${pageLabel} | ${brand}`
    if (full.length <= TITLE_MAX) return full
  }
  return `Grade A | ${pageLabel}`
}

export function gradeAPageDescription(input: {
  total: number
  place: string
  page: number
  pages: number
}): string {
  const lead = `${input.total.toLocaleString("en-US")} published restaurants in ${input.place} hold a NYC DOHMH Grade A.`
  const source = "Grades come from the city's inspection dataset."
  const pageBit = input.page > 1 ? `Page ${input.page} of ${input.pages}.` : ""
  const full = [lead, source, pageBit].filter(Boolean).join(" ")
  if (full.length <= DESCRIPTION_MAX) return full
  const shorter = [lead, pageBit].filter(Boolean).join(" ")
  if (shorter.length <= DESCRIPTION_MAX) return shorter
  return pageBit || lead
}

export function dietBoroughHubTitle(label: string, borough: string, count: number, gradeA: number, year: number): string {
  const bits = [
    count > 0 ? `${count.toLocaleString("en-US")} Listed` : null,
    gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null,
  ].filter(Boolean)
  const listed = bits.join(", ")
  return fitTitle(
    [
      listed ? `${label} Restaurants in ${borough} ${year} | ${listed}` : null,
      listed ? `${label} Restaurants in ${borough} | ${listed}` : null,
      listed ? `${label} in ${borough} | ${listed}` : null,
      `${label} Restaurants in ${borough}`,
    ],
    { allowBrand: false }
  )
}

export const GUIDE_DESCRIPTIONS: Record<string, string> = {
  "nyc-health-grades-explained": HEALTH_GRADES_GUIDE_DESCRIPTION,
  "nyc-restaurant-inspection-process":
    "NYC inspects restaurants at least once a year. Under 14 points is a Grade A. A first-visit score of 14 or more is ungraded until reinspection.",
  "vegan-nyc-borough-guide":
    "How Eat Real Food NYC tags vegan restaurants, and how those tagged kitchens are spread across the five boroughs.",
  "halal-food-guide-nyc":
    "How this directory tags halal restaurants in NYC, what we can and cannot verify about certification, and where tagged kitchens cluster.",
  "gluten-free-dining-nyc":
    "How this directory tags gluten-free restaurants in NYC. A health grade does not measure cross-contact.",
  "how-eat-healthy-nyc-15-dollars":
    "Practical ways to eat in NYC on about $15, using published listings you can filter by neighborhood and diet tag.",
  "best-healthy-neighborhoods-nyc":
    "NYC neighborhoods with at least 10 published listings, ranked in 2026 by the share holding a NYC DOHMH Grade A.",
  "hidden-gem-restaurants-nyc":
    "Hidden gems here are restaurants rated 4.5 or higher with fewer than 200 reviews. This page explains that rule.",
  "kosher-dining-nyc-guide":
    "Kosher Restaurants NYC, listed by borough from the published kosher tag. The tag is not a certification this directory issues.",
  "late-night-healthy-eating-nyc":
    "Healthy Food Open Late in NYC means a meal after 10pm. Published listings store working hours and an official NYC DOHMH grade when one is matched.",
  "seafood-healthy-restaurants-nyc":
    "Seafood-focused listings in the NYC directory, with the matched NYC DOHMH grade shown when we have one.",
  "healthy-breakfast-nyc":
    "Published NYC restaurants open by 8 AM on weekdays, and how many of them hold a Grade A from the NYC Health Department.",
}
