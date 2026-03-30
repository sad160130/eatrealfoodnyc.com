import { boroughToSlug, neighborhoodToSlug, formatDietaryTag } from "./utils"

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
