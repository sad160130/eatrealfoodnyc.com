import { prisma } from "./db"
import { boroughToSlug, neighborhoodToSlug } from "./utils"
import { BOROUGH_MAP } from "@/config/boroughs"

export const RESTAURANT_INDEX_PAGE_SIZE = 80

export interface IndexedRestaurant {
  name: string
  slug: string
  borough: string
  neighborhood: string
}

export async function loadPublishedIndex(): Promise<IndexedRestaurant[]> {
  const rows = await prisma.restaurant.findMany({
    where: {
      is_published: true,
      borough: { not: null },
      neighborhood: { not: null },
    },
    select: { name: true, slug: true, borough: true, neighborhood: true },
    orderBy: [{ borough: "asc" }, { neighborhood: "asc" }, { name: "asc" }],
  })
  return rows.flatMap((row) => {
    if (!row.borough || !row.neighborhood) return []
    return [{ name: row.name, slug: row.slug, borough: row.borough, neighborhood: row.neighborhood }]
  })
}

export function groupIndex(rows: IndexedRestaurant[]) {
  const boroughs = new Map<string, Map<string, IndexedRestaurant[]>>()
  for (const row of rows) {
    const hoods = boroughs.get(row.borough) ?? new Map<string, IndexedRestaurant[]>()
    const list = hoods.get(row.neighborhood) ?? []
    list.push(row)
    hoods.set(row.neighborhood, list)
    boroughs.set(row.borough, hoods)
  }
  return boroughs
}

export function neighborhoodIndexPath(borough: string, neighborhood: string, page = 1) {
  const base = `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/restaurants`
  return page <= 1 ? base : `${base}/page/${page}`
}

export function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / RESTAURANT_INDEX_PAGE_SIZE))
}

export async function resolveNeighborhood(boroughSlug: string, neighborhoodSlug: string) {
  const boroughName = BOROUGH_MAP[boroughSlug]
  if (!boroughName) return null
  const rows = await prisma.restaurant.findMany({
    where: { borough: boroughName, is_published: true, neighborhood: { not: null } },
    select: { neighborhood: true },
    distinct: ["neighborhood"],
  })
  const neighborhoodName = rows
    .map((row) => row.neighborhood)
    .find((name) => name && neighborhoodToSlug(name) === neighborhoodSlug)
  if (!neighborhoodName) return null
  return { boroughName, neighborhoodName }
}
