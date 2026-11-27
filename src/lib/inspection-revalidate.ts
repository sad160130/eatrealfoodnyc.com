import type { DohmhRefreshResult } from "@/lib/dohmh-refresh"

/**
 * Paths whose HTML shows an inspection grade or a directory total. Dynamic
 * patterns mark every cached instance of that route stale; the next request
 * regenerates one page, it does not rebuild them inside the cron.
 * A dry run and a refresh that changed no rows leave the cache alone.
 */
export const INSPECTION_REVALIDATE_PATHS = [
  "/",
  "/restaurants/[slug]",
  "/restaurants/[slug]/badge",
  "/nyc/[borough]/healthy-restaurants",
  "/nyc/[borough]/[neighborhood]/healthy-restaurants",
  "/nyc/[borough]/[neighborhood]",
  "/healthy-restaurants",
  "/healthy-restaurants/[diet-type]",
  "/data",
] as const

export function inspectionRefreshPaths(
  result: Pick<DohmhRefreshResult, "dryRun" | "restaurantsUpdated">
): readonly string[] {
  if (result.dryRun || result.restaurantsUpdated < 1) return []
  return INSPECTION_REVALIDATE_PATHS
}
