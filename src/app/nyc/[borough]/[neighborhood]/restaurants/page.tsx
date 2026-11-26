import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { getCanonicalUrl } from "@/config/seo"
import { neighborhoodIndexPath, pageCount, resolveNeighborhood, loadNeighborhoodRoster, RESTAURANT_INDEX_PAGE_SIZE } from "@/lib/restaurant-index"
import { hubStamp } from "@/lib/hub-record"
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
  const roster = await loadNeighborhoodRoster(resolved.boroughName, resolved.neighborhoodName)
  const total = roster.length
  if (total === 0) notFound()
  const grade = (letter: string) => roster.filter((row) => row.inspection_grade === letter).length
  const pageRows = roster.slice(0, RESTAURANT_INDEX_PAGE_SIZE)
  return (
    <NeighborhoodRestaurantList
      borough={resolved.boroughName}
      neighborhood={resolved.neighborhoodName}
      restaurants={pageRows}
      page={1}
      pages={pageCount(total)}
      total={total}
      gradeA={grade("A")}
      gradeB={grade("B")}
      gradeC={grade("C")}
      updated={hubStamp(roster)}
      listings={pageRows.map((row) => ({ name: row.name, grade: row.inspection_grade }))}
    />
  )
}
