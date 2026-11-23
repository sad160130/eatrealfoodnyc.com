import { cache } from "react"
import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import { buildBreakfastGuideData, type BreakfastGuideData } from "@/lib/breakfast-hours"

export type { BreakfastBorough, BreakfastGuideData, BreakfastSpot } from "@/lib/breakfast-hours"

/**
 * Published operational listings open by 8:00 AM on every weekday.
 * `cache()` dedupes the query between generateMetadata and the page.
 * The route exports `revalidate = 86400`, so the HTML refreshes daily.
 * `unstable_cache` is not used: Next 16 deprecates it, and its revalidate
 * interval is copied onto the prerender store.
 */
export const getBreakfastGuideData = cache(async (): Promise<BreakfastGuideData> => {
  const rows = await prisma.restaurant.findMany({
    where: {
      ...PUBLISHED_LISTING_WHERE,
      working_hours: { not: null },
    },
    select: {
      name: true,
      slug: true,
      borough: true,
      neighborhood: true,
      dietary_tags: true,
      rating: true,
      reviews: true,
      inspection_grade: true,
      inspection_score: true,
      inspection_date: true,
      working_hours: true,
    },
  })
  return buildBreakfastGuideData(rows)
})
