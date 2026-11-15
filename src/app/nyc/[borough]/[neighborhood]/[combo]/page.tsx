import { notFound } from "next/navigation"
import { NeighborhoodDietHub, neighborhoodDietMetadata } from "@/components/neighborhood-diet-hub"
import { dietFromNeighborhoodCombo, listNeighborhoodDietCombos } from "@/lib/neighborhood-diet"
import { resolveNeighborhood } from "@/lib/restaurant-index"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const combos = await listNeighborhoodDietCombos()
  return combos.map((combo) => ({
    borough: boroughToSlug(combo.borough),
    neighborhood: neighborhoodToSlug(combo.neighborhood),
    combo: `${combo.tag}-restaurants`,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string; combo: string }>
}) {
  const { borough, neighborhood, combo } = await params
  const tag = dietFromNeighborhoodCombo(combo)
  const resolved = tag ? await resolveNeighborhood(borough, neighborhood) : null
  if (!tag || !resolved) return { title: "Not Found" }
  return neighborhoodDietMetadata({
    boroughName: resolved.boroughName,
    neighborhoodName: resolved.neighborhoodName,
    tag,
  })
}

export default async function NeighborhoodDietPage({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string; combo: string }>
}) {
  const { borough, neighborhood, combo } = await params
  const tag = dietFromNeighborhoodCombo(combo)
  if (!tag) notFound()
  const resolved = await resolveNeighborhood(borough, neighborhood)
  if (!resolved) notFound()
  return (
    <NeighborhoodDietHub
      boroughName={resolved.boroughName}
      neighborhoodName={resolved.neighborhoodName}
      tag={tag}
    />
  )
}
