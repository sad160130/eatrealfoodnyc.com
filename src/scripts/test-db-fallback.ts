import { runFallbackQuery, matchesWhere, UnsupportedFallbackError } from "../lib/fallback-engine"
import { fallbackQuery, loadAllRestaurants, restaurantFromRest, canFallback } from "../lib/rest-snapshot"
import { restInList } from "../lib/partner-status-db"
import { forcedOutage } from "../lib/db"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

const spec = { defaultOmit: ["partner_status"] }
const rows = [
  { id: 1, name: "Alpha", borough: "Brooklyn", neighborhood: "Red Hook", inspection_grade: "A", rating: 4.5, reviews: 10, priorityRank: 0, dietary_tags: "vegan,halal", is_published: true, business_status: "OPERATIONAL", inspection_score: 9, partner_status: "partner", updated_at: new Date("2026-11-01") },
  { id: 2, name: "bravo", borough: "Brooklyn", neighborhood: "Red Hook", inspection_grade: "B", rating: null, reviews: 3, priorityRank: 5, dietary_tags: "vegan", is_published: true, business_status: "OPERATIONAL", inspection_score: 20, partner_status: null, updated_at: new Date("2026-11-05") },
  { id: 3, name: "Charlie", borough: "Queens", neighborhood: null, inspection_grade: "A", rating: 4.9, reviews: 50, priorityRank: 0, dietary_tags: null, is_published: true, business_status: "CLOSED_TEMPORARILY", inspection_score: null, partner_status: null, updated_at: new Date("2026-10-01") },
  { id: 4, name: "Delta", borough: "Queens", neighborhood: "Astoria", inspection_grade: "A", rating: 4.1, reviews: 7, priorityRank: 0, dietary_tags: "Gluten-Free", is_published: false, business_status: "OPERATIONAL", inspection_score: 5, partner_status: null, updated_at: new Date("2026-09-01") },
]
const published = { business_status: "OPERATIONAL", is_published: true }

async function main() {
  // where operators
  assert(runFallbackQuery(rows, "count", { where: published }, spec) === 2, "count with equality filters")
  assert(runFallbackQuery(rows, "count", { where: { neighborhood: { not: null } } }, spec) === 3, "not: null excludes nulls")
  assert(runFallbackQuery(rows, "count", { where: { inspection_grade: { in: ["A", "B"] } } }, spec) === 4, "in list")
  assert(runFallbackQuery(rows, "count", { where: { inspection_grade: { notIn: ["A"] } } }, spec) === 1, "notIn list")
  assert(runFallbackQuery(rows, "count", { where: { rating: { gt: 0 } } }, spec) === 3, "gt skips nulls like SQL")
  assert(runFallbackQuery(rows, "count", { where: { dietary_tags: { contains: "vegan" } } }, spec) === 2, "contains is case-sensitive")
  assert(runFallbackQuery(rows, "count", { where: { dietary_tags: { contains: "gluten", mode: "insensitive" } } }, spec) === 1, "contains insensitive")
  assert(runFallbackQuery(rows, "count", { where: { name: { startsWith: "Al" } } }, spec) === 1, "startsWith")
  assert(runFallbackQuery(rows, "count", { where: { OR: [{ borough: "Queens" }, { rating: null }] } }, spec) === 3, "OR with null equality")
  assert(runFallbackQuery(rows, "count", { where: { NOT: { borough: "Queens" } } }, spec) === 2, "NOT")
  assert(runFallbackQuery(rows, "count", { where: { AND: [{ borough: "Brooklyn" }, { inspection_grade: "A" }] } }, spec) === 1, "AND")
  assert(runFallbackQuery(rows, "count", { where: { updated_at: { gte: new Date("2026-11-01") } } }, spec) === 2, "date comparison")
  assert(runFallbackQuery(rows, "count", { where: { id: { not: 1 }, borough: "Brooklyn" } }, spec) === 1, "not value")
  let unsupported = false
  try {
    matchesWhere(rows[0], { name: { search: "x" } })
  } catch (error) {
    unsupported = error instanceof UnsupportedFallbackError
  }
  assert(unsupported, "an unknown operator is refused, not guessed")

  // ordering, paging, select, omit, distinct
  const byRating = runFallbackQuery(rows, "findMany", { orderBy: { rating: "desc" } }, spec) as Array<{ id: number }>
  assert(byRating.map((row) => row.id).join(",") === "2,3,1,4", "DESC sorts NULLS FIRST like Postgres")
  const asc = runFallbackQuery(rows, "findMany", { orderBy: { rating: "asc" } }, spec) as Array<{ id: number }>
  assert(asc[asc.length - 1].id === 2, "ASC sorts NULLS LAST")
  const nullsLast = runFallbackQuery(rows, "findMany", { orderBy: { rating: { sort: "desc", nulls: "last" } } }, spec) as Array<{ id: number }>
  assert(nullsLast.map((row) => row.id).join(",") === "3,1,4,2", "explicit nulls last")
  const multi = runFallbackQuery(rows, "findMany", { orderBy: [{ priorityRank: "desc" }, { rating: "desc" }], take: 2, skip: 1 }, spec) as Array<{ id: number }>
  assert(multi.map((row) => row.id).join(",") === "3,1", "multi-key order with skip and take")
  const names = runFallbackQuery(rows, "findMany", { orderBy: { name: "asc" }, select: { name: true } }, spec) as Array<Record<string, unknown>>
  assert(names.map((row) => row.name).join(",") === "Alpha,bravo,Charlie,Delta", "names sort by locale, not code point")
  assert(Object.keys(names[0]).join(",") === "name", "select returns only selected fields")
  const full = runFallbackQuery(rows, "findFirst", { where: { id: 1 } }, spec) as Record<string, unknown>
  assert(!("partner_status" in full) && full.name === "Alpha", "default omit hides partner_status")
  const distinct = runFallbackQuery(rows, "findMany", { distinct: ["borough"], select: { borough: true } }, spec) as unknown[]
  assert(distinct.length === 2, "distinct keeps one row per value")
  assert(runFallbackQuery(rows, "findUnique", { where: { id: 99 } }, spec) === null, "findUnique miss is null")
  let threw = false
  try {
    runFallbackQuery(rows, "findFirstOrThrow", { where: { id: 99 } }, spec)
  } catch (error) {
    threw = (error as { code?: string }).code === "P2025"
  }
  assert(threw, "OrThrow raises P2025")

  // aggregate and groupBy
  const agg = runFallbackQuery(rows, "aggregate", { where: published, _avg: { rating: true }, _count: { inspection_score: true }, _max: { updated_at: true } }, spec) as Record<string, Record<string, unknown>>
  assert(agg._avg.rating === 4.5 && agg._count.inspection_score === 2, "aggregate avg skips nulls and count counts non-null")
  assert((agg._max.updated_at as Date).toISOString().startsWith("2026-11-05"), "aggregate max on dates")
  const groups = runFallbackQuery(rows, "groupBy", { by: ["borough"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }, spec) as Array<Record<string, unknown>>
  assert(groups.length === 2 && (groups[0]._count as Record<string, number>).id === 2, "groupBy counts per group")
  const having = runFallbackQuery(rows, "groupBy", { by: ["borough", "neighborhood"], where: { neighborhood: { not: null } }, having: { id: { _count: { gte: 2 } } } }, spec) as Array<Record<string, unknown>>
  assert(having.length === 1 && having[0].neighborhood === "Red Hook" && !("_count" in having[0]), "having filters groups without leaking unselected aggregates")
  const ordered = runFallbackQuery(rows, "groupBy", { by: ["neighborhood"], where: { neighborhood: { not: null } }, orderBy: { _count: { id: "desc" } }, take: 1 }, spec) as Array<Record<string, unknown>>
  assert(ordered[0].neighborhood === "Red Hook" && !("_count" in ordered[0]), "orderBy an aggregate that was not selected")
  assert(Object.getOwnPropertySymbols(ordered[0]).length === 0, "group rows carry no internal keys")
  const countSelect = runFallbackQuery(rows, "count", { select: { _all: true, rating: true } }, spec) as Record<string, number>
  assert(countSelect._all === 4 && countSelect.rating === 3, "count with select")

  // REST mapping and loading
  const mapped = restaurantFromRest({ id: 1, is_verified: true, priority_rank: 2, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-11-20T00:00:00Z" })
  assert(mapped.isVerified === true && mapped.priorityRank === 2 && mapped.updated_at instanceof Date, "REST rows map to Prisma field names")
  const queries: string[] = []
  const loaded = await loadAllRestaurants(async (query) => {
    queries.push(query)
    const offset = Number(/offset=(\d+)/.exec(query)?.[1])
    return offset === 0 ? Array.from({ length: 500 }, (_, i) => ({ id: i + 1 })) : [{ id: 501 }]
  })
  assert(loaded.length === 501 && queries.length === 2 && queries[0].includes("order=id.asc"), "the snapshot pages through the table")

  const viaRest = await fallbackQuery("Restaurant", "count", { where: published }, { restaurants: async () => rows })
  assert(viaRest === 2, "a Restaurant read is answered from the snapshot")
  const reviews = await fallbackQuery("Review", "findMany", { where: { restaurant_slug: "alpha", text: { not: "" } }, orderBy: [{ likes_count: "desc" }], take: 1 }, {
    load: async (query) => {
      assert(query.includes("restaurant_slug=eq.alpha"), "review fallback filters by slug over HTTP")
      return [
        { id: "r1", restaurant_slug: "alpha", stars: 5, likes_count: 1, text: "good", published_at: "2026-01-01T00:00:00Z", created_at: "2026-01-02T00:00:00Z" },
        { id: "r2", restaurant_slug: "alpha", stars: 4, likes_count: 9, text: "fine", published_at: null, created_at: "2026-01-02T00:00:00Z" },
      ]
    },
  }) as Array<Record<string, unknown>>
  assert(reviews.length === 1 && reviews[0].id === "r2", "a Review read is answered from the slug subset")
  let refused = false
  await fallbackQuery("Review", "findMany", { where: {} }, { load: async () => [] }).catch((error) => {
    refused = error instanceof UnsupportedFallbackError
  })
  assert(refused, "reviews without a slug filter are refused")
  assert(!canFallback("Restaurant", "updateMany") && !canFallback(undefined, "queryRaw") && canFallback("Restaurant", "groupBy"), "writes and raw SQL never use the fallback")

  assert(restInList(['a', 'b"c']) === 'in.("a","b\\"c")', "PostgREST in-list quotes slugs")
  assert(forcedOutage({ DB_FORCE_FALLBACK: "1", VERCEL_ENV: "preview" }) === true, "forced outage works on previews")
  assert(forcedOutage({ DB_FORCE_FALLBACK: "1", VERCEL_ENV: "production" }) === false, "forced outage is ignored in production")
  assert(forcedOutage({}) === false, "forced outage is off by default")

  console.log("\nDB fallback tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
