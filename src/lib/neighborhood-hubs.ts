import { boroughToSlug, neighborhoodToSlug } from "./utils"

// NOTE: `./db` is deliberately NOT imported at module scope. internal-links.ts
// imports hasBuiltHub() from here, and several scripts ES-import
// internal-links.ts — ES imports hoist above their dotenv.config() calls, so a
// top-level `import { prisma } from "./db"` would instantiate the Prisma client
// (which reads DATABASE_URL at module-evaluation time) before the env files are
// loaded, breaking every such script with ECONNREFUSED. The client is pulled in
// lazily inside loadHubSet() instead, keeping this module import-side-effect-free.

/**
 * The minimum number of published, operational restaurants a neighbourhood
 * must have before its hub page is built.
 *
 * SINGLE SOURCE OF TRUTH. Consumed by:
 *   - generateStaticParams  (nyc/[borough]/[neighborhood]/healthy-restaurants)
 *   - the runtime notFound() guard on that same route
 *   - sitemap.ts
 *   - api/neighborhood-stats/route.ts
 *   - scripts/pull-best-rated-restaurants.ts
 *   - every internal-link emitter, via getBuiltNeighborhoodHubs()
 *
 * NOTE: pull-health-grade-report.ts uses a separate >= 10 threshold for
 * statistical significance. That is deliberately independent of this value.
 */
export const NEIGHBORHOOD_HUB_MIN_RESTAURANTS = 3

/** Key format shared by producer and consumers: "borough-slug/neighborhood-slug". */
export function hubKey(borough: string, neighborhood: string): string {
  return `${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}`
}

async function loadHubSet(): Promise<Set<string>> {
  // Lazy — see the note at the top of this file.
  const { prisma } = await import("./db")

  const rows = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: {
      business_status: "OPERATIONAL",
      is_published: true,
      borough: { not: null },
      neighborhood: { not: null },
    },
    // `_count: { id: true }` is intentionally NOT selected. Prisma does not
    // require an aggregation to be selected in order to filter on it in
    // `having` — sitemap.ts:72 runs this exact filter without the selection
    // and returns the same 103 rows that generateStaticParams (which does
    // select it) builds pages for. We only need the grouping keys here, so
    // selecting the count would fetch a column we immediately discard.
    having: { id: { _count: { gte: NEIGHBORHOOD_HUB_MIN_RESTAURANTS } } },
  })

  return new Set(
    rows
      .filter((r) => r.borough && r.neighborhood)
      .map((r) => hubKey(r.borough!, r.neighborhood!))
  )
}

/**
 * Module-level promise singleton. The build prerenders ~2,001 restaurant pages
 * and 103 hubs; without memoisation each would fire an identical groupBy.
 * Caching the PROMISE (not the resolved value) also collapses concurrent
 * callers during parallel prerendering into one in-flight query.
 *
 * Scope is the Node process, so a `next build` using N workers issues N
 * queries total (last build reported 3 workers => 3 queries).
 *
 * Staleness: the Set is frozen for the process lifetime. Hub membership only
 * changes on the weekly publish, which triggers a full rebuild, so the window
 * is immaterial. Chosen over unstable_cache (deprecated in Next 16) and React
 * cache() (per-render scope, would not dedupe across prerenders).
 */
let hubSetPromise: Promise<Set<string>> | null = null

export function getBuiltNeighborhoodHubs(): Promise<Set<string>> {
  if (!hubSetPromise) hubSetPromise = loadHubSet()
  return hubSetPromise
}

/** Convenience predicate for call sites holding a resolved Set. */
export function hasBuiltHub(
  validHubs: Set<string>,
  borough: string | null,
  neighborhood: string | null
): boolean {
  if (!borough || !neighborhood) return false
  return validHubs.has(hubKey(borough, neighborhood))
}
