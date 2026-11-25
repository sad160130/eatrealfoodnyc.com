import { hubKey } from "@/lib/neighborhood-hubs"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

/**
 * Café slugs that lost a trailing e. next.config.ts 301s each source to the
 * destination. 12-chairs-caf is not in this map: 12-chairs-cafe is a different
 * restaurant. Link the destination only when that slug is published.
 */
export const RESTAURANT_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "bluestone-lane-battery-park-caf": "bluestone-lane-battery-park-cafe",
  "bluestone-lane-chelsea-piers-caf": "bluestone-lane-chelsea-piers-cafe",
  "bluestone-lane-dumbo-caf": "bluestone-lane-dumbo-cafe",
  "bluestone-lane-55-hudson-yards-caf": "bluestone-lane-55-hudson-yards-cafe",
  "bluestone-lane-manhattan-west-caf": "bluestone-lane-manhattan-west-cafe",
  "bluestone-lane-tribeca-caf": "bluestone-lane-tribeca-cafe",
  "bluestone-lane-upper-east-side-caf": "bluestone-lane-upper-east-side-cafe",
  "bluestone-lane-upper-west-side-caf": "bluestone-lane-upper-west-side-cafe",
  "breckenridge-green-caf": "breckenridge-green-cafe",
  "bryant-park-caf": "bryant-park-cafe",
  "compass-caf": "compass-cafe",
  "cuffie-ridge-jamaican-vegan-caf": "cuffie-ridge-jamaican-vegan-cafe",
  "daisys-juice-bar-caf": "daisys-juice-bar-cafe",
  "el-budare-caf": "el-budare-cafe",
  "franchia-vegan-caf": "franchia-vegan-cafe",
  "havana-caf": "havana-cafe",
  "1480-hk-caf": "1480-hk-cafe",
  "beets-social-caf": "beets-social-cafe",
  "la-flor-de-izucar-caf": "la-flor-de-izucar-cafe",
  "le-moulin-caf": "le-moulin-cafe",
  "madame-bont-caf": "madame-bont-cafe",
  "marie-blachre-bakery-caf": "marie-blachre-bakery-cafe",
  "moss-caf": "moss-cafe",
  "natura-caf": "natura-cafe",
  "newsbar-caf": "newsbar-cafe",
  "oda-caf": "oda-cafe",
  "ok-caf": "ok-cafe",
  "redwood-caf": "redwood-cafe",
  "rosecrans-florist-caf": "rosecrans-florist-cafe",
  "sweetie-house-playground-caf": "sweetie-house-playground-cafe",
  "the-bay-caf": "the-bay-cafe",
  "the-kasbah-caf": "the-kasbah-cafe",
  "the-paris-caf": "the-paris-cafe",
  "the-pine-tree-caf": "the-pine-tree-cafe",
  "the-river-caf": "the-river-cafe",
  "ton-caf": "ton-cafe",
  "yellow-magnolia-caf": "yellow-magnolia-cafe",
}

export interface LinkIndex {
  slugs: ReadonlySet<string>
  hubs: ReadonlySet<string>
  diets: ReadonlySet<string>
}

export function canonicalPublishedSlug(slug: string, published: ReadonlySet<string>): string | null {
  const alias = RESTAURANT_SLUG_ALIASES[slug]
  if (alias && published.has(alias)) return alias
  if (published.has(slug)) return slug
  return null
}

export function restaurantHref(slug: string, links: Pick<LinkIndex, "slugs">): string | null {
  const canonical = canonicalPublishedSlug(slug, links.slugs)
  return canonical ? `/restaurants/${canonical}` : null
}

export function neighborhoodHubHref(
  borough: string | null,
  neighborhood: string | null,
  links: Pick<LinkIndex, "hubs">
): string | null {
  if (!borough || !neighborhood) return null
  if (!links.hubs.has(hubKey(borough, neighborhood))) return null
  return `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/healthy-restaurants`
}

export function dietHubHref(tag: string, links: Pick<LinkIndex, "diets">): string | null {
  if (!links.diets.has(tag)) return null
  return `/healthy-restaurants/${tag}`
}
