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
  "best-healthy-neighborhoods-nyc": { keyword: "Healthy NYC Neighborhoods", benefit: "Ranked" },
  "hidden-gem-restaurants-nyc": { keyword: "Hidden Gems NYC", benefit: "How We Find Them" },
  "kosher-dining-nyc-guide": { keyword: "Kosher Restaurants NYC", benefit: "By Borough" },
  "late-night-healthy-eating-nyc": { keyword: "Late Night Healthy NYC", benefit: "After 10pm" },
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

export function restaurantListingTitle(input: {
  name: string
  neighborhood: string | null
  borough: string | null
  grade: string | null
  inspectionDate: string | null
  type: string | null
  snapshot: Date
}): string {
  const grade = letterGrade(input.grade)
  const month = formatInspectionMonth(input.inspectionDate)
  const recent = inspectionIsRecent(input.inspectionDate, input.snapshot)
  const hood = input.neighborhood
  const borough = input.borough
  if (grade) {
    return fitTitle(
      [
        recent && month && hood ? `${input.name}, ${hood} | Grade ${grade}, ${month}` : null,
        hood ? `${input.name}, ${hood} | NYC Grade ${grade}` : null,
        hood ? `${input.name}, ${hood} | Grade ${grade}` : null,
        borough ? `${input.name} | NYC Grade ${grade}, ${borough}` : null,
        `${input.name} | Grade ${grade}`,
        input.name,
      ],
      { allowBrand: false }
    )
  }
  const cuisine = cuisineLabel(input.type, input.name)
  return fitTitle(
    [
      cuisine && hood && borough ? `${input.name} | ${cuisine} in ${hood}, ${borough}` : null,
      cuisine && hood ? `${input.name} | ${cuisine} in ${hood}` : null,
      hood ? `${input.name}, ${hood}` : null,
      input.name,
    ],
    { allowBrand: false }
  )
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
  const head: string[] = []
  if (input.address && input.neighborhood && type) {
    head.push(`${input.name}: ${type.toLowerCase()} at ${input.address}, ${input.neighborhood}.`)
  } else if (type && place) {
    head.push(`${input.name}: ${type} in ${place}.`)
  } else {
    head.push(`${input.name}${place ? ` in ${place}` : ""}.`)
  }
  if (grade) {
    const bits = [`NYC DOHMH Grade ${grade}`]
    if (input.score != null) bits.push(`score ${input.score}`)
    if (month) bits.push(`inspected ${month}`)
    head.push(`${bits.join(", ")}.`)
  } else {
    head.push("No NYC DOHMH letter grade on file yet.")
  }
  const rated = input.rating != null && input.rating > 0 && (input.reviews ?? 0) > 0
  const tails: string[] = []
  if (!grade && rated) {
    head.push(`Rated ${input.rating!.toFixed(1)}/5 from ${input.reviews} reviews.`)
  }
  if (grade && rated) tails.push(`Rated ${input.rating!.toFixed(1)}/5 (${input.reviews} reviews).`)
  if (input.tags.length > 0) tails.push(`Tagged ${input.tags.slice(0, 2).join(", ")}.`)
  if (grade && rated) tails.push(`Rated ${input.rating!.toFixed(1)}/5.`)
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
  const benefit = neighborhoods > 0 ? `${formatCount(neighborhoods)} ${neighborhoods === 1 ? "Neighborhood" : "Neighborhoods"}` : null
  return fitTitle(
    [benefit ? `Late Night Healthy Eating NYC | ${benefit}` : null, "Late Night Healthy Eating NYC"],
    { allowBrand: false },
  )
}

export const HEALTH_GRADES_GUIDE_TITLE = "NYC Restaurant Grades Explained: A, B, C and Pending (2026)"

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

export function lateNightGuideDescription(input: { restaurants: number; neighborhoods: number }): string {
  const hood = input.neighborhoods === 1 ? "neighborhood" : "neighborhoods"
  const rest = input.restaurants === 1 ? "listing" : "listings"
  const verb = input.restaurants === 1 ? "includes" : "include"
  return fitCtrBand(
    `Late night healthy eating in NYC means after 10 pm. ${formatCount(input.restaurants)} published ${rest} across ${formatCount(input.neighborhoods)} ${hood} ${verb} hours and an official NYC DOHMH grade.`,
  )
}

export const HEALTH_GRADES_GUIDE_DESCRIPTION =
  "NYC restaurant grades mean A for 0\u201313 points, B for 14\u201327 on a reinspection, and C for 28 or more on the official NYC DOHMH score."

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
  return fitTitle(
    [
      gradeA > 0 ? `Healthy Restaurants NYC | ${gradeA.toLocaleString("en-US")} Grade A | Eat Real Food NYC` : null,
      `Healthy Restaurants NYC ${year} | Eat Real Food NYC`,
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
      count ? `Healthy Restaurants in ${borough} | ${count}` : null,
      count ? `Healthy Restaurants in ${borough} ${year} | ${count}` : null,
      `Healthy Restaurants in ${borough}`,
    ],
    { allowBrand: false }
  )
}

export function dietHubTitle(label: string, count: number, gradeA: number, year: number): string {
  return fitTitle(
    [
      ` ${label} Restaurants NYC ${year} | ${count.toLocaleString("en-US")} Listed, ${gradeA.toLocaleString("en-US")} Grade A`.trim(),
      gradeA > 0 ? `${label} Restaurants NYC ${year} | ${gradeA.toLocaleString("en-US")} Grade A` : null,
      gradeA > 0 ? `${label} Restaurants NYC | ${gradeA.toLocaleString("en-US")} Grade A` : null,
      `${label} Restaurants NYC`,
    ],
    { allowBrand: false }
  )
}

export function dietBoroughHubTitle(label: string, borough: string, count: number, gradeA: number, year: number): string {
  const listed = `${count.toLocaleString("en-US")} Listed, ${gradeA.toLocaleString("en-US")} Grade A`
  return fitTitle(
    [
      `${label} Restaurants in ${borough} ${year} | ${listed}`,
      `${label} Restaurants in ${borough} | ${listed}`,
      `${label} in ${borough} | ${listed}`,
      gradeA > 0 ? `${label} Restaurants in ${borough} | ${gradeA.toLocaleString("en-US")} Grade A` : null,
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
    "How we rank NYC neighborhoods for dining out: published listing counts, Grade A share among graded restaurants, and dietary tags.",
  "hidden-gem-restaurants-nyc":
    "Hidden gems here are restaurants rated 4.5 or higher with fewer than 200 reviews. This page explains that rule.",
  "kosher-dining-nyc-guide":
    "How this directory tags kosher restaurants in NYC, and what we do not verify about supervision.",
  "late-night-healthy-eating-nyc":
    "Late-night healthy food in NYC means eating after 10pm. Browse borough hubs for listings that include hours and the NYC health inspection grade.",
  "seafood-healthy-restaurants-nyc":
    "Seafood-focused listings in the NYC directory, with the matched NYC DOHMH grade shown when we have one.",
  "healthy-breakfast-nyc":
    "Published NYC restaurants open by 8 AM on weekdays, and how many of them hold a Grade A from the NYC Health Department.",
}
