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

import { formatInspectionMonth } from "./freshness"

export const BRAND_NAME = "Eat Real Food NYC"
export const TITLE_TEMPLATE_SUFFIX = ` | ${BRAND_NAME}`
export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 160

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
  "nyc-health-grades-explained": { keyword: "NYC Restaurant Grades", benefit: "A, B, and C" },
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
  if (!parts) return buildPipeTitle(fallback, null)
  return buildPipeTitle(parts.keyword, parts.benefit)
}

export const GUIDE_DESCRIPTIONS: Record<string, string> = {
  "nyc-health-grades-explained":
    "What a NYC DOHMH Grade A (0–13 points), Grade B (14–27), and Grade C (28 or more) means, and how an inspection score becomes a letter.",
  "nyc-restaurant-inspection-process":
    "How a NYC DOHMH restaurant inspection is scored and posted, what a Grade Pending card means, and how to read the public record.",
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
    "Published NYC listings whose hours run past 10pm, grouped by borough, with the NYC DOHMH grade when one is matched.",
  "seafood-healthy-restaurants-nyc":
    "Seafood-focused listings in the NYC directory, with the matched NYC DOHMH grade shown when we have one.",
  "healthy-breakfast-nyc":
    "Breakfast-oriented listings in the NYC directory. A NYC DOHMH grade is shown when a record is matched.",
}
