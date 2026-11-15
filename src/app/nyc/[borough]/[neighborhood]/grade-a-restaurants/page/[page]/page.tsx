import { notFound } from "next/navigation"
import { GradeAHub, gradeAMetadata } from "@/components/grade-a-hub"
import { GRADE_A_MIN, countGradeA, gradeANeighborhoodCounts, gradeAPageCount } from "@/lib/grade-a"
import { resolveNeighborhood } from "@/lib/restaurant-index"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const rows = await gradeANeighborhoodCounts()
  const params: Array<{ borough: string; neighborhood: string; page: string }> = []
  for (const row of rows) {
    const pages = gradeAPageCount(row.count)
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
}) {
  const { borough, neighborhood, page } = await params
  const pageNumber = Number(page)
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved || !Number.isInteger(pageNumber) || pageNumber < 2) return { title: "Not Found" }
  return gradeAMetadata({
    boroughName: resolved.boroughName,
    neighborhoodName: resolved.neighborhoodName,
    page: pageNumber,
  })
}

export default async function GradeANeighborhoodPageN({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string; page: string }>
}) {
  const { borough, neighborhood, page } = await params
  const pageNumber = Number(page)
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved || !Number.isInteger(pageNumber) || pageNumber < 2) notFound()
  const total = await countGradeA({
    borough: resolved.boroughName,
    neighborhood: resolved.neighborhoodName,
  })
  if (total < GRADE_A_MIN || pageNumber > gradeAPageCount(total)) notFound()
  return (
    <GradeAHub
      scope={{
        boroughName: resolved.boroughName,
        neighborhoodName: resolved.neighborhoodName,
        page: pageNumber,
      }}
    />
  )
}
