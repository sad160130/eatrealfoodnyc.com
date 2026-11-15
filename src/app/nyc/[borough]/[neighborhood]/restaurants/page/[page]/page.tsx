import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { getCanonicalUrl } from "@/config/seo"
import {
  neighborhoodIndexPath,
  pageCount,
  resolveNeighborhood,
  RESTAURANT_INDEX_PAGE_SIZE,
} from "@/lib/restaurant-index"
import { buildPipeTitle, withBrand } from "@/lib/seo-titles"
import NeighborhoodRestaurantList from "@/components/neighborhood-restaurant-list"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const rows = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: { is_published: true, borough: { not: null }, neighborhood: { not: null } },
    _count: { id: true },
  })
  const params: Array<{ borough: string; neighborhood: string; page: string }> = []
  for (const row of rows) {
    if (!row.borough || !row.neighborhood) continue
    const pages = pageCount(row._count.id)
    for (let page = 2; page <= pages; page++) {
      params.push({
        borough: boroughToSlug(row.borough),
        neighborhood: neighborhoodToSlug(row.neighborhood),
        page: String(page),
      })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string; page: string }>
}): Promise<Metadata> {
  const { borough, neighborhood, page } = await params
  const pageNumber = Number(page)
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved || !Number.isInteger(pageNumber) || pageNumber < 2) return { title: "Not Found" }
  const title = buildPipeTitle(`All restaurants in ${resolved.neighborhoodName}`, `Page ${pageNumber}`)
  const canonical = getCanonicalUrl(neighborhoodIndexPath(resolved.boroughName, resolved.neighborhoodName, pageNumber))
  return {
    title,
    description: `Page ${pageNumber} of published restaurants in ${resolved.neighborhoodName}, ${resolved.boroughName}.`,
    alternates: { canonical },
    openGraph: { title: withBrand(title), url: canonical },
    robots: { index: true, follow: true },
  }
}

export default async function NeighborhoodRestaurantsPageN({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string; page: string }>
}) {
  const { borough, neighborhood, page } = await params
  const pageNumber = Number(page)
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound()
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved) notFound()
  const total = await prisma.restaurant.count({
    where: {
      is_published: true,
      borough: resolved.boroughName,
      neighborhood: resolved.neighborhoodName,
    },
  })
  const pages = pageCount(total)
  if (pageNumber > pages) notFound()
  const restaurants = await prisma.restaurant.findMany({
    where: {
      is_published: true,
      borough: resolved.boroughName,
      neighborhood: resolved.neighborhoodName,
    },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
    skip: (pageNumber - 1) * RESTAURANT_INDEX_PAGE_SIZE,
    take: RESTAURANT_INDEX_PAGE_SIZE,
  })
  return (
    <NeighborhoodRestaurantList
      borough={resolved.boroughName}
      neighborhood={resolved.neighborhoodName}
      restaurants={restaurants}
      page={pageNumber}
      pages={pages}
      total={total}
    />
  )
}
