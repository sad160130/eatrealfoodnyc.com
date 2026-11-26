import { prisma } from "@/lib/db"
import { DEGRADED_REVALIDATE_SECONDS, errorLabel, restSelect } from "@/lib/db-fallback"
import { isTransientConnectionError } from "@/lib/connection-retry"
import { correctCityIslandListing } from "@/lib/city-island"
import { correctRosebankListing } from "@/lib/rosebank"
import { RESTAURANT_REST_COLUMNS } from "@/lib/rest-snapshot"

function findListing(slug: string) {
  return prisma.restaurant.findUnique({ where: { slug } })
}

export type ListingRestaurant = NonNullable<Awaited<ReturnType<typeof findListing>>>

const REST_COLUMNS = RESTAURANT_REST_COLUMNS

type RestRow = Record<(typeof REST_COLUMNS)[number], unknown>

function toDate(value: unknown): Date {
  const date = typeof value === "string" || value instanceof Date ? new Date(value) : new Date(NaN)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

/** Map a PostgREST row (snake_case column names) onto the Prisma model shape. */
export function restRowToListing(row: RestRow): ListingRestaurant {
  const { is_verified, priority_rank, created_at, updated_at, ...rest } = row
  return {
    ...(rest as Omit<ListingRestaurant, "isVerified" | "priorityRank" | "created_at" | "updated_at">),
    isVerified: Boolean(is_verified),
    priorityRank: typeof priority_rank === "number" ? priority_rank : 0,
    created_at: toDate(created_at),
    updated_at: toDate(updated_at),
  } as ListingRestaurant
}

export function listingRestQuery(slug: string): string {
  return `restaurants?select=${REST_COLUMNS.join(",")}&slug=eq.${encodeURIComponent(slug)}&limit=1`
}

/**
 * Listing row by slug. Prisma (with connection retries) first; if the pooler
 * is still out of connections, the same row comes from Supabase's HTTP Data
 * API, and that render gets a short ISR revalidate so it refreshes soon.
 * Returns null only when the row does not exist.
 */
export async function loadListingBySlug(
  slug: string,
  deps: {
    primary?: (slug: string) => Promise<ListingRestaurant | null>
    rest?: (slug: string) => Promise<RestRow[]>
  } = {}
): Promise<ListingRestaurant | null> {
  const primary = deps.primary ?? findListing
  const rest =
    deps.rest ??
    ((value: string) => restSelect<RestRow>(listingRestQuery(value), { revalidate: DEGRADED_REVALIDATE_SECONDS }))
  try {
    const row = await primary(slug)
    return row ? correctCityIslandListing(correctRosebankListing(row)) : null
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error
    console.error(`[db-degraded] listing ${slug} read via Supabase REST (${errorLabel(error)})`)
    const rows = await rest(slug)
    return rows[0] ? correctCityIslandListing(correctRosebankListing(restRowToListing(rows[0]))) : null
  }
}
