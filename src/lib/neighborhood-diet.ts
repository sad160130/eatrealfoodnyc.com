import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import { COMBO_MIN_RESTAURANTS, DIET_CONFIG } from "@/config/dietary-tags"
import { BOROUGH_MAP } from "@/config/boroughs"
import { boroughToSlug, neighborhoodToSlug, parseDietaryTags } from "@/lib/utils"

export const NEIGHBORHOOD_DIET_TAGS = ["vegan", "vegetarian", "gluten-free", "halal", "kosher"] as const

export type NeighborhoodDietTag = (typeof NEIGHBORHOOD_DIET_TAGS)[number]

export function isNeighborhoodDietTag(tag: string): tag is NeighborhoodDietTag {
  return (NEIGHBORHOOD_DIET_TAGS as readonly string[]).includes(tag)
}

export function dietFromNeighborhoodCombo(combo: string): NeighborhoodDietTag | null {
  if (!combo.endsWith("-restaurants")) return null
  const tag = combo.slice(0, -"-restaurants".length)
  return isNeighborhoodDietTag(tag) ? tag : null
}

export function neighborhoodDietPath(borough: string, neighborhood: string, tag: string) {
  return `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/${tag}-restaurants`
}

export interface NeighborhoodDietCombo {
  borough: string
  neighborhood: string
  tag: NeighborhoodDietTag
  count: number
}

export async function listNeighborhoodDietCombos(): Promise<NeighborhoodDietCombo[]> {
  const rows = await prisma.restaurant.findMany({
    where: {
      ...PUBLISHED_LISTING_WHERE,
      borough: { not: null },
      neighborhood: { not: null },
      dietary_tags: { not: null },
    },
    select: { borough: true, neighborhood: true, dietary_tags: true },
  })
  const counts = new Map<string, NeighborhoodDietCombo>()
  for (const row of rows) {
    if (!row.borough || !row.neighborhood) continue
    if (!Object.values(BOROUGH_MAP).includes(row.borough)) continue
    for (const tag of parseDietaryTags(row.dietary_tags)) {
      if (!isNeighborhoodDietTag(tag)) continue
      const key = `${row.borough}::${row.neighborhood}::${tag}`
      const current = counts.get(key) ?? {
        borough: row.borough,
        neighborhood: row.neighborhood,
        tag,
        count: 0,
      }
      current.count += 1
      counts.set(key, current)
    }
  }
  return [...counts.values()].filter((combo) => combo.count >= COMBO_MIN_RESTAURANTS)
}

export function dietLabel(tag: NeighborhoodDietTag) {
  return DIET_CONFIG[tag].label
}
