import unpublished from "../../data/unpublished-2026-11-15.json"
import { boroughToSlug, neighborhoodToSlug } from "./utils"

interface RemovedRow {
  slug: string
  borough?: string | null
  neighborhood?: string | null
}

/**
 * Delisted slugs and where a request should land.
 * The Nov 15 unpublished file stores a borough and no ZIP or neighborhood,
 * so the target is that borough hub. A neighborhood is used when the row has one.
 */
export function removedListingDestination(row: Pick<RemovedRow, "borough" | "neighborhood">): string | null {
  const borough = row.borough?.trim()
  if (!borough) return null
  const neighborhood = row.neighborhood?.trim()
  if (neighborhood) {
    return `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/healthy-restaurants`
  }
  return `/nyc/${boroughToSlug(borough)}/healthy-restaurants`
}

export function removedListingRedirects(): Array<{ source: string; destination: string; statusCode: 301 }> {
  const rows = (unpublished.rows ?? []) as RemovedRow[]
  return rows.flatMap((row) => {
    const destination = removedListingDestination(row)
    if (!row.slug || !destination) return []
    return [{ source: `/restaurants/${row.slug}`, destination, statusCode: 301 as const }]
  })
}
