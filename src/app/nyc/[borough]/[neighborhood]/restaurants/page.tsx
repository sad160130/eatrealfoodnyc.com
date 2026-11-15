import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { getCanonicalUrl } from "@/config/seo"
import { neighborhoodIndexPath, pageCount, resolveNeighborhood, RESTAURANT_INDEX_PAGE_SIZE } from "@/lib/restaurant-index"
import { fitTitle } from "@/lib/seo-titles"
import NeighborhoodRestaurantList from "@/components/neighborhood-restaurant-list"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const rows = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: { is_published: true, borough: { not: null }, neighborhood: { not: null } },
  })
  return rows.flatMap((row) => {
    if (!row.borough || !row.neighborhood) return []
    return [{ borough: boroughToSlug(row.borough), neighborhood: neighborhoodToSlug(row.neighborhood) }]
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}): Promise<Metadata> {
  const { borough, neighborhood } = await params
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved) return { title: "Not Found" }
  const title = fitTitle([`All restaurants in ${resolved.neighborhoodName}`], { allowBrand: true })
  const canonical = getCanonicalUrl(neighborhoodIndexPath(resolved.boroughName, resolved.neighborhoodName))
  return {
    title: { absolute: title },
    description: `Every published restaurant in ${resolved.neighborhoodName}, ${resolved.boroughName}. Plain links, page by page.`,
    alternates: { canonical },
    openGraph: { title, url: canonical },
    robots: { index: true, follow: true },
  }
}

export default async function NeighborhoodRestaurantsPage({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}) {
  const { borough, neighborhood } = await params
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved) notFound()
  const total = await prisma.restaurant.count({
    where: {
      is_published: true,
      borough: resolved.boroughName,
      neighborhood: resolved.neighborhoodName,
    },
  })
  if (total === 0) notFound()
  const restaurants = await prisma.restaurant.findMany({
    where: {
      is_published: true,
      borough: resolved.boroughName,
      neighborhood: resolved.neighborhoodName,
    },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
    take: RESTAURANT_INDEX_PAGE_SIZE,
  })
  return (
    <NeighborhoodRestaurantList
      borough={resolved.boroughName}
      neighborhood={resolved.neighborhoodName}
      restaurants={restaurants}
      page={1}
      pages={pageCount(total)}
      total={total}
    />
  )
}
