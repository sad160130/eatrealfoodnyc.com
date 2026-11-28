import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

/** Restaurants per alphabetical sitemap page. */
export const HTML_SITEMAP_PAGE_SIZE = 100

/**
 * Clicks from the homepage. The footer links /sitemap. That hub links every
 * borough page and every restaurant-list page, including later pages of a letter.
 * A borough page links each neighborhood hub. A list page links each restaurant.
 */
export const HTML_SITEMAP_DEPTH = {
  hub: 1,
  boroughPage: 2,
  neighborhoodHub: 3,
  restaurantListPage: 2,
  restaurant: 3,
} as const

export function restaurantLetter(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(ch) ? ch : "0"
}

export function letterSlug(letter: string): string {
  return letter === "0" ? "0" : letter.toLowerCase()
}

export function letterFromSlug(slug: string): string | null {
  if (slug === "0") return "0"
  if (/^[a-z]$/.test(slug)) return slug.toUpperCase()
  return null
}

export function letterPath(letter: string, page = 1): string {
  const base = `/sitemap/restaurants/${letterSlug(letter)}`
  return page <= 1 ? base : `${base}/page/${page}`
}

export function boroughSitemapPath(borough: string): string {
  return `/sitemap/boroughs/${boroughToSlug(borough)}`
}

export function neighborhoodHubPath(borough: string, neighborhood: string): string {
  return `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/healthy-restaurants`
}

export function sitemapPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / HTML_SITEMAP_PAGE_SIZE))
}

export function groupNamesByLetter(names: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const name of names) {
    const letter = restaurantLetter(name)
    counts.set(letter, (counts.get(letter) ?? 0) + 1)
  }
  return counts
}

/** Hub, one page per borough, and every alphabetical list page. */
export function htmlSitemapPaths(names: string[], boroughs: string[]): string[] {
  const paths = ["/sitemap"]
  for (const borough of boroughs) paths.push(boroughSitemapPath(borough))
  for (const [letter, count] of groupNamesByLetter(names)) {
    const pages = sitemapPageCount(count)
    for (let page = 1; page <= pages; page += 1) paths.push(letterPath(letter, page))
  }
  return paths
}
