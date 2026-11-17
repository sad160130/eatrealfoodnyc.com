import { cache } from "react"
import { prisma } from "@/lib/db"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"

/**
 * Published operational listings — the same filter public listing pages use
 * (borough hubs, neighbourhood hubs, diet hubs, homepage). Sitemap restaurant
 * URLs use `is_published: true`; neighbourhood URLs add this operational
 * filter. About, Press, and Partner counters must use this set, not the
 * full dataset (the old hardcoded 8,835).
 */
export const PUBLISHED_LISTING_WHERE = {
  business_status: "OPERATIONAL" as const,
  is_published: true,
}

export interface PublishedDirectoryCounts {
  restaurants: number
  /** Distinct borough + neighbourhood pairs with at least one published listing. */
  neighborhoods: number
  gradeA: number
  /** Published listings whose stored grade is A, B, or C. */
  letterGraded: number
  hiddenGems: number
}

async function queryPublishedDirectoryCounts(): Promise<PublishedDirectoryCounts> {
  const where = PUBLISHED_LISTING_WHERE
  const [restaurants, gradeA, letterGraded, hiddenGems, neighborhoodGroups] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.count({ where: { ...where, inspection_grade: "A" } }),
    prisma.restaurant.count({ where: { ...where, inspection_grade: { in: ["A", "B", "C"] } } }),
    prisma.restaurant.count({ where: { ...where, is_hidden_gem: true } }),
    prisma.restaurant.groupBy({
      by: ["borough", "neighborhood"],
      where: {
        ...where,
        borough: { not: null },
        neighborhood: { not: null },
      },
    }),
  ])

  return {
    restaurants,
    neighborhoods: neighborhoodGroups.length,
    gradeA,
    letterGraded,
    hiddenGems,
  }
}

/**
 * Per-request dedupe. Homepage, partner, and the footer all call this.
 * `cache()` is request-scoped, so one render shares one count. It is not a
 * dynamic API: routes keep the static or ISR setting they already export.
 * `unstable_cache` is intentionally not used here. Its `revalidate` is copied
 * onto the prerender store, and a layout-level call would pull fully static
 * routes down to that interval.
 */
export const getPublishedDirectoryCounts = cache(queryPublishedDirectoryCounts)

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
