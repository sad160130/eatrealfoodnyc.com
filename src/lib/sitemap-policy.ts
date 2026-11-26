/** Paths that stay reachable but must not be submitted in the sitemap. */
const THIN_UTILITY = new Set(["/claim", "/badge"])

export function omitFromSitemap(path: string): boolean {
  if (path.includes("/page/")) return true
  if (THIN_UTILITY.has(path)) return true
  if (path.endsWith("/badge")) return true
  return false
}
