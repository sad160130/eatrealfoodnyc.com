import { notFound } from "next/navigation"
import { GradeAHub, gradeAMetadata } from "@/components/grade-a-hub"
import { gradeANeighborhoodCounts } from "@/lib/grade-a"
import { resolveNeighborhood } from "@/lib/restaurant-index"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const rows = await gradeANeighborhoodCounts()
  return rows.map((row) => ({
    borough: boroughToSlug(row.borough),
    neighborhood: neighborhoodToSlug(row.neighborhood),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}) {
  const { borough, neighborhood } = await params
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved) return { title: "Not Found" }
  return gradeAMetadata({
    boroughName: resolved.boroughName,
    neighborhoodName: resolved.neighborhoodName,
    page: 1,
  })
}

export default async function GradeANeighborhoodPage({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}) {
  const { borough, neighborhood } = await params
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved) notFound()
  return (
    <GradeAHub
      scope={{
        boroughName: resolved.boroughName,
        neighborhoodName: resolved.neighborhoodName,
        page: 1,
      }}
    />
  )
}
