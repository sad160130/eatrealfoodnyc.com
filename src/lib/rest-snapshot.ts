import { DEGRADED_REVALIDATE_SECONDS, restSelect, shortenRevalidate } from "@/lib/db-fallback"
import {
  isFallbackReadOperation,
  runFallbackQuery,
  UnsupportedFallbackError,
  type Row,
} from "@/lib/fallback-engine"
import { memoizeSuccess } from "@/lib/success-memo"

/**
 * Supabase HTTP (PostgREST) copies of the tables public pages read, used when
 * Postgres is out of connections. PostgREST does not take a Supavisor client
 * slot. Column names are the database names; Prisma field aliases are mapped.
 */
export const RESTAURANT_REST_COLUMNS = [
  "id", "name", "slug", "type", "borough", "neighborhood", "address", "street", "city", "state",
  "latitude", "longitude", "rating", "reviews", "price_range", "dietary_tags", "inspection_grade",
  "inspection_date", "inspection_score", "description", "phone", "website", "working_hours", "photo",
  "street_view", "business_status", "is_hidden_gem", "is_published", "is_verified", "priority_rank",
  "email", "company_facebook", "company_instagram", "company_linkedin", "company_x",
  "created_at", "updated_at",
] as const

const REVIEW_REST_COLUMNS = [
  "id", "restaurant_slug", "place_id", "restaurant_name", "google_review_id", "stars", "reviewer_name",
  "is_local_guide", "published_at", "published_ago", "likes_count", "text", "owner_response",
  "review_url", "created_at",
] as const

const PAGE_SIZE = 500
const MAX_PAGES = 60
const SNAPSHOT_TTL_MS = 5 * 60_000

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Map a PostgREST restaurants row onto the Prisma Restaurant field names and types. */
export function restaurantFromRest(row: Row): Row {
  const { is_verified, priority_rank, created_at, updated_at, ...rest } = row
  return {
    ...rest,
    isVerified: Boolean(is_verified),
    priorityRank: typeof priority_rank === "number" ? priority_rank : 0,
    created_at: toDate(created_at) ?? new Date(0),
    updated_at: toDate(updated_at) ?? new Date(0),
  }
}

export function reviewFromRest(row: Row): Row {
  return {
    ...row,
    published_at: toDate(row.published_at),
    created_at: toDate(row.created_at) ?? new Date(0),
  }
}

export type PageLoader = (query: string) => Promise<Row[]>

const defaultLoader: PageLoader = (query) =>
  restSelect<Row>(query, { revalidate: DEGRADED_REVALIDATE_SECONDS })

/** Every restaurants row, paged by id. */
export async function loadAllRestaurants(load: PageLoader = defaultLoader): Promise<Row[]> {
  const rows: Row[] = []
  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
    const batch = await load(
      `restaurants?select=${RESTAURANT_REST_COLUMNS.join(",")}&order=id.asc&limit=${PAGE_SIZE}&offset=${pageIndex * PAGE_SIZE}`
    )
    rows.push(...batch.map(restaurantFromRest))
    if (batch.length < PAGE_SIZE) return rows
  }
  throw new Error("restaurants snapshot exceeded the page cap")
}

function restaurantSnapshot(): Promise<Row[]> {
  return memoizeSuccess("rest-restaurants", SNAPSHOT_TTL_MS, () => loadAllRestaurants())
}

function slugFilter(where: unknown): string | null {
  if (!where || typeof where !== "object") return null
  const value = (where as Row).restaurant_slug
  if (typeof value === "string") return value
  if (value && typeof value === "object" && typeof (value as Row).equals === "string") return (value as Row).equals as string
  return null
}

async function reviewRows(where: unknown, load: PageLoader): Promise<Row[]> {
  const slug = slugFilter(where)
  if (!slug) throw new UnsupportedFallbackError("reviews without a restaurant_slug filter")
  const rows = await load(
    `reviews?select=${REVIEW_REST_COLUMNS.join(",")}&restaurant_slug=eq.${encodeURIComponent(slug)}&limit=1000`
  )
  return rows.map(reviewFromRest)
}

const MODELS: Record<string, { defaultOmit: readonly string[] }> = {
  Restaurant: { defaultOmit: ["partner_status", "search_vector"] },
  Review: { defaultOmit: [] },
}

export function canFallback(model: string | undefined, operation: string): boolean {
  return Boolean(model && MODELS[model] && isFallbackReadOperation(operation))
}

/**
 * Answer a read-only Prisma call from the HTTP copy. Throws
 * UnsupportedFallbackError for shapes the engine does not cover.
 */
export async function fallbackQuery(
  model: string,
  operation: string,
  args: Record<string, unknown> | undefined,
  deps: { restaurants?: () => Promise<Row[]>; load?: PageLoader } = {}
): Promise<unknown> {
  const spec = MODELS[model]
  if (!spec || !isFallbackReadOperation(operation)) {
    throw new UnsupportedFallbackError(`${model}.${operation}`)
  }
  const rows =
    model === "Restaurant"
      ? await (deps.restaurants ?? restaurantSnapshot)()
      : await reviewRows(args?.where, deps.load ?? defaultLoader)
  const result = runFallbackQuery(rows, operation, args, spec)
  // Fallback data is current to within minutes, but keep the page from
  // sitting in the ISR cache for a full day on it.
  await shortenRevalidate()
  return result
}
