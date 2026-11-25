import { cache } from "react"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { DIRECTORY_SHARED_TTL_MS } from "@/lib/directory-stats"
import { indexableDietLinks, type DietLink } from "@/lib/diet-hub-index"
import { memoizeSuccess } from "@/lib/success-memo"

export type { DietLink }
export { DIET_NAV, dietHubIsIndexable, indexableDietLinks } from "@/lib/diet-hub-index"

async function queryPublishedDietCounts(): Promise<Record<string, number>> {
  const { prisma } = await import("@/lib/db")
  const { PUBLISHED_LISTING_WHERE } = await import("@/lib/directory-stats")
  const rows = await prisma.restaurant.findMany({
    where: { ...PUBLISHED_LISTING_WHERE, dietary_tags: { not: null } },
    select: { dietary_tags: true },
  })
  const counts: Record<string, number> = {}
  for (const tag of Object.keys(DIET_CONFIG)) counts[tag] = 0
  for (const row of rows) {
    const seen = new Set(
      (row.dietary_tags ?? "")
        .split("|")
        .map((tag) => tag.trim())
        .filter((tag) => tag in counts)
    )
    for (const tag of seen) counts[tag] += 1
  }
  return counts
}

export const getPublishedDietCounts = cache(() =>
  memoizeSuccess("published-diet-counts", DIRECTORY_SHARED_TTL_MS, queryPublishedDietCounts)
)

export const getIndexableDietTags = cache(async (): Promise<DietLink[]> => {
  return indexableDietLinks(await getPublishedDietCounts())
})
