import { cache } from "react"
import { prisma } from "@/lib/db"

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
  hiddenGems: number
}

export const getPublishedDirectoryCounts = cache(async (): Promise<PublishedDirectoryCounts> => {
  const where = PUBLISHED_LISTING_WHERE
  const [restaurants, gradeA, hiddenGems, neighborhoodGroups] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.count({ where: { ...where, inspection_grade: "A" } }),
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
    hiddenGems,
  }
})
