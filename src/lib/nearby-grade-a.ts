import { cache } from "react"
import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import { parseDietaryTags } from "@/lib/utils"

const KM_PER_DEG_LAT = 111
const MILES_PER_KM = 0.621371

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const lat1 = (aLat * Math.PI) / 180
  const lat2 = (bLat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * MILES_PER_KM
}

export interface NearbyGradeA {
  slug: string
  name: string
  miles: number
  score: number | null
  inspectionDate: string | null
  tags: string[]
  rating: number | null
}

export const nearbyGradeA = cache(async function nearbyGradeA(input: {
  id: number
  latitude: number | null
  longitude: number | null
  neighborhood: string | null
  borough: string | null
  dietaryTags: string | null
}): Promise<NearbyGradeA[]> {
  if (input.latitude == null || input.longitude == null) return fallback(input)
  const tags = new Set(parseDietaryTags(input.dietaryTags))
  const box = async (miles: number) => {
    const lat = miles / (KM_PER_DEG_LAT * MILES_PER_KM)
    const lng = lat / Math.cos((input.latitude! * Math.PI) / 180)
    const rows = await prisma.restaurant.findMany({
      where: {
        ...PUBLISHED_LISTING_WHERE,
        inspection_grade: "A",
        id: { not: input.id },
        latitude: { gte: input.latitude! - lat, lte: input.latitude! + lat },
        longitude: { gte: input.longitude! - lng, lte: input.longitude! + lng },
      },
      select: {
        slug: true,
        name: true,
        latitude: true,
        longitude: true,
        inspection_score: true,
        inspection_date: true,
        dietary_tags: true,
        rating: true,
        priorityRank: true,
      },
    })
    return rows
      .filter((row) => row.latitude != null && row.longitude != null)
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        miles: haversineMiles(input.latitude!, input.longitude!, row.latitude!, row.longitude!),
        score: row.inspection_score,
        inspectionDate: row.inspection_date,
        tags: parseDietaryTags(row.dietary_tags).filter((tag) => tags.has(tag)),
        rating: row.rating,
        shared: parseDietaryTags(row.dietary_tags).filter((tag) => tags.has(tag)).length,
        priority: row.priorityRank ?? 0,
      }))
      .filter((row) => row.miles <= miles)
      .sort((a, b) => b.shared - a.shared || a.miles - b.miles || (b.rating ?? -1) - (a.rating ?? -1) || b.priority - a.priority)
  }
  let found = await box(0.62)
  if (found.length < 4) found = await box(1)
  if (found.length < 2) return fallback(input)
  return found.slice(0, 4).map(({ shared: _shared, priority: _priority, ...row }) => row)
})

async function fallback(input: {
  id: number
  neighborhood: string | null
  borough: string | null
}): Promise<NearbyGradeA[]> {
  if (!input.neighborhood || !input.borough) return []
  const rows = await prisma.restaurant.findMany({
    where: {
      ...PUBLISHED_LISTING_WHERE,
      inspection_grade: "A",
      id: { not: input.id },
      neighborhood: input.neighborhood,
      borough: input.borough,
    },
    orderBy: [{ rating: "desc" }, { reviews: "desc" }],
    take: 4,
    select: { slug: true, name: true, inspection_score: true, inspection_date: true, dietary_tags: true, rating: true },
  })
  if (rows.length < 2) return []
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    miles: 0,
    score: row.inspection_score,
    inspectionDate: row.inspection_date,
    tags: parseDietaryTags(row.dietary_tags).slice(0, 3),
    rating: row.rating,
  }))
}
