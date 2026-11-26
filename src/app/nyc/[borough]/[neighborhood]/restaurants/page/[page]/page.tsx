import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { getCanonicalUrl } from "@/config/seo"
import {
  neighborhoodIndexPath,
  pageCount,
  resolveNeighborhood,
  loadNeighborhoodRoster,
  RESTAURANT_INDEX_PAGE_SIZE,
} from "@/lib/restaurant-index"
import { hubStamp } from "@/lib/hub-record"
import { fitTitle } from "@/lib/seo-titles"
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
  const title = fitTitle([`All restaurants in ${resolved.neighborhoodName} | Page ${pageNumber}`], { allowBrand: true })
  const canonical = getCanonicalUrl(neighborhoodIndexPath(resolved.boroughName, resolved.neighborhoodName, pageNumber))
  return {
    title: { absolute: title },
    description: `Page ${pageNumber} of published restaurants in ${resolved.neighborhoodName}, ${resolved.boroughName}.`,
    alternates: { canonical },
    openGraph: { title, url: canonical },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
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
  const roster = await loadNeighborhoodRoster(resolved.boroughName, resolved.neighborhoodName)
  const total = roster.length
  const pages = pageCount(total)
  if (pageNumber > pages) notFound()
  const grade = (letter: string) => roster.filter((row) => row.inspection_grade === letter).length
  const pageRows = roster.slice((pageNumber - 1) * RESTAURANT_INDEX_PAGE_SIZE, pageNumber * RESTAURANT_INDEX_PAGE_SIZE)
  return (
    <NeighborhoodRestaurantList
      borough={resolved.boroughName}
      neighborhood={resolved.neighborhoodName}
      restaurants={pageRows}
      page={pageNumber}
      pages={pages}
      total={total}
      gradeA={grade("A")}
      gradeB={grade("B")}
      gradeC={grade("C")}
      updated={hubStamp(roster)}
      listings={pageRows.map((row) => ({ name: row.name, grade: row.inspection_grade }))}
    />
  )
}
