import { cache } from "react"
import { prisma } from "@/lib/db"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"
import { loadLiveSiteStats, PUBLISHED_LISTING_WHERE, SITE_STATS_TTL_MS } from "@/lib/site-stats"

/**
 * Footer, homepage, and listing metadata all read these totals. One minute
 * collapses a crawl burst onto one query per instance. Failures are not
 * stored. `unstable_cache` is not used: its numeric `revalidate` is copied
 * onto the prerender and would pull fully static routes down to that interval.
 */
export const DIRECTORY_SHARED_TTL_MS = SITE_STATS_TTL_MS

export { PUBLISHED_LISTING_WHERE }

export interface PublishedDirectoryCounts {
  restaurants: number
  /** Distinct borough + neighbourhood pairs with at least one published listing. */
  neighborhoods: number
  gradeA: number
  /** Published listings whose stored grade is A, B, or C. */
  letterGraded: number
  hiddenGems: number
}

/**
 * Same published-listing fields as `getSiteStats`. One database read feeds both.
 */
export const getPublishedDirectoryCounts = cache(async (): Promise<PublishedDirectoryCounts> => {
  const stats = await loadLiveSiteStats()
  return {
    restaurants: stats.publishedListings,
    neighborhoods: stats.neighborhoods,
    gradeA: stats.gradeAListings,
    letterGraded: stats.gradedListings,
    hiddenGems: stats.hiddenGems,
  }
})

/**
 * Neighborhoods that have a published hub page (the same minimum as
 * /nyc/[borough]/[neighborhood]/healthy-restaurants). Used to confirm a
 * `nbhd-` referral is a real neighborhood before mentioning it.
 */
export const getPublishedHubNeighborhoodNames = cache(async (): Promise<string[]> => {
  const rows = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: {
      ...PUBLISHED_LISTING_WHERE,
      borough: { not: null },
      neighborhood: { not: null },
    },
    having: { id: { _count: { gte: NEIGHBORHOOD_HUB_MIN_RESTAURANTS } } },
  })
  return [
    ...new Set(rows.flatMap((row) => (row.neighborhood ? [row.neighborhood] : []))),
  ].sort((a, b) => a.localeCompare(b, "en"))
})
