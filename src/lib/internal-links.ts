import { boroughToSlug, neighborhoodToSlug, formatDietaryTag, parseDietaryTags } from "./utils"

export const ANCHOR_TEXT = {
  boroughHub: (borough: string) => `healthy restaurants in ${borough}`,
  neighborhoodHub: (neighborhood: string, borough: string) => `healthy restaurants in ${neighborhood}, ${borough}`,
  dietHub: (dietLabel: string) => `${dietLabel.toLowerCase()} restaurants in NYC`,
  healthGrades: "NYC restaurant health inspection grades",
  gradeAFilter: "Grade A certified restaurants in NYC",
  hiddenGems: "hidden gem restaurants in NYC",
  neighborhoodComparison: "NYC neighbourhood health comparison",
  interactiveMap: "NYC healthy restaurant map",
  nearMe: "healthy restaurants near you",
  guideBestNeighborhoods: "healthiest neighbourhoods in NYC for dining",
} as const

export function getBoroughContextualLinks(borough: string): Array<[string, string]> {
  const slug = boroughToSlug(borough)
  return [
    [ANCHOR_TEXT.boroughHub(borough), `/nyc/${slug}/healthy-restaurants`],
    [ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"],
    [ANCHOR_TEXT.hiddenGems, `/search?borough=${borough}&hidden_gem=true`],
    [ANCHOR_TEXT.neighborhoodComparison, "/nyc/compare"],
  ]
}

export function getNeighborhoodContextualLinks(neighborhood: string, borough: string): Array<[string, string]> {
  const boroughSlug = boroughToSlug(borough)
  const hoodSlug = neighborhoodToSlug(neighborhood)
  return [
    [ANCHOR_TEXT.neighborhoodHub(neighborhood, borough), `/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`],
    [ANCHOR_TEXT.boroughHub(borough), `/nyc/${boroughSlug}/healthy-restaurants`],
    [ANCHOR_TEXT.neighborhoodComparison, "/nyc/compare"],
    [ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"],
  ]
}

export function getDietContextualLinks(dietTag: string, dietLabel: string): Array<[string, string]> {
  return [
    [ANCHOR_TEXT.dietHub(dietLabel), `/healthy-restaurants/${dietTag}`],
    [ANCHOR_TEXT.hiddenGems, `/search?diet=${dietTag}&hidden_gem=true`],
    [ANCHOR_TEXT.gradeAFilter, `/search?diet=${dietTag}&grade=A`],
    [ANCHOR_TEXT.neighborhoodComparison, "/nyc/compare"],
  ]
}

export function getRestaurantContextualLinks(
  neighborhood: string | null,
  borough: string | null,
  dietaryTags: string | null
): Array<[string, string]> {
  const links: Array<[string, string]> = []
  if (neighborhood && borough) {
    const boroughSlug = boroughToSlug(borough)
    const hoodSlug = neighborhoodToSlug(neighborhood)
    links.push([ANCHOR_TEXT.neighborhoodHub(neighborhood, borough), `/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`])
    links.push([ANCHOR_TEXT.boroughHub(borough), `/nyc/${boroughSlug}/healthy-restaurants`])
  }
  links.push([ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"])
  links.push([ANCHOR_TEXT.neighborhoodComparison, "/nyc/compare"])
  return links
}

// ─────────────────────────────────────────────────────────────────────────────
// PRD CC-23 — guaranteed minimum internal links from every listing page.
//
// Partial-match anchor pools: varied phrasings around the head term so the site
// does not ship thousands of identical exact-match anchors (over-optimisation
// risk). Selection is DETERMINISTIC per slug, so SSG output is stable across
// builds and there is no hydration drift. Once GSC→BigQuery query data accrues,
// pickAnchor() can be upgraded to weight each page's own top non-brand ranking
// query — until then anchors are derived from page attributes + keyword config.
// ─────────────────────────────────────────────────────────────────────────────

export const MIN_LISTING_HUB_LINKS = 3 // PRD CC-23

const NEIGHBORHOOD_ANCHORS: Array<(n: string) => string> = [
  (n) => `healthy restaurants in ${n}`,
  (n) => `${n} healthy dining`,
  (n) => `where to eat healthy in ${n}`,
  (n) => `${n} restaurants by health grade`,
]

const BOROUGH_ANCHORS: Array<(b: string) => string> = [
  (b) => `healthy restaurants in ${b}`,
  (b) => `${b}'s healthy dining scene`,
  (b) => `healthy spots across ${b}`,
  (b) => `${b} restaurants by health grade`,
]

const DIET_ANCHORS: Array<(d: string) => string> = [
  (d) => `${d} restaurants in NYC`,
  (d) => `best ${d} restaurants in NYC`,
  (d) => `NYC ${d} dining`,
  (d) => `${d}-friendly restaurants in NYC`,
]

// Stable, dependency-free hash so the anchor choice is fixed per page but varies
// across pages (anchor-text diversity without random, SSG-safe output).
function pickAnchor<T>(pool: T[], seed: string, salt: number): T {
  let h = (salt + 1) >>> 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0
  return pool[h % pool.length]
}

/**
 * PRD CC-23: the guaranteed money-page link set for a listing page —
 * neighbourhood hub → borough hub → matching diet-type hubs, padded with
 * authority pages so the result is ALWAYS >= MIN_LISTING_HUB_LINKS even when a
 * restaurant is missing its neighbourhood, borough, or dietary tags.
 */
export function getListingHubLinks(restaurant: {
  slug: string
  borough: string | null
  neighborhood: string | null
  dietary_tags: string | null
}): Array<[string, string]> {
  const links: Array<[string, string]> = []
  const seen = new Set<string>()
  const add = (anchor: string, href: string) => {
    if (seen.has(href)) return
    seen.add(href)
    links.push([anchor, href])
  }

  const { slug, borough, neighborhood } = restaurant

  // 1 — Neighbourhood hub (strongest local relevance)
  if (neighborhood && borough) {
    add(
      pickAnchor(NEIGHBORHOOD_ANCHORS, slug, 1)(neighborhood),
      `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/healthy-restaurants`
    )
  }

  // 2 — Borough hub
  if (borough) {
    add(
      pickAnchor(BOROUGH_ANCHORS, slug, 2)(borough),
      `/nyc/${boroughToSlug(borough)}/healthy-restaurants`
    )
  }

  // 3 — Matching diet-type hubs (capped to keep prose readable; the full set is
  //     already linked in the listing's "Dietary Specializations" section)
  parseDietaryTags(restaurant.dietary_tags)
    .slice(0, 3)
    .forEach((tag, i) => {
      add(
        pickAnchor(DIET_ANCHORS, slug, 3 + i)(formatDietaryTag(tag).toLowerCase()),
        `/healthy-restaurants/${tag}`
      )
    })

  // 4 — Enforce the CC-23 floor: pad with authority/money pages if still short.
  const FALLBACKS: Array<[string, string]> = [
    [ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"],
    [ANCHOR_TEXT.gradeAFilter, "/search?grade=A"],
    [ANCHOR_TEXT.neighborhoodComparison, "/nyc/compare"],
    [ANCHOR_TEXT.hiddenGems, "/search?hidden_gem=true"],
  ]
  for (const [anchor, href] of FALLBACKS) {
    if (links.length >= MIN_LISTING_HUB_LINKS) break
    add(anchor, href)
  }

  return links
}

// ─────────────────────────────────────────────────────────────────────────────
// §6 equity routing — diet-hub cross-links.
// The vegan/vegetarian/whole-foods hubs hold the strongest expired-domain
// backlinks (up to DR95). Route that equity to money pages that have none:
// borough hubs and the high-intent halal/kosher/gluten-free hubs.
// ─────────────────────────────────────────────────────────────────────────────
export const DIET_HUB_CROSSLINKS: Record<string, Array<[string, string]>> = {
  vegan: [
    [ANCHOR_TEXT.boroughHub("Brooklyn"), "/nyc/brooklyn/healthy-restaurants"],
    [ANCHOR_TEXT.dietHub("Gluten-Free"), "/healthy-restaurants/gluten-free"],
  ],
  vegetarian: [
    [ANCHOR_TEXT.dietHub("Halal"), "/healthy-restaurants/halal"],
    [ANCHOR_TEXT.boroughHub("Queens"), "/nyc/queens/healthy-restaurants"],
  ],
  "whole-foods": [
    [ANCHOR_TEXT.dietHub("Kosher"), "/healthy-restaurants/kosher"],
  ],
}
