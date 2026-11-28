/** Paths that stay reachable but must not be submitted in the sitemap. */
const THIN_UTILITY = new Set(["/claim", "/badge"])

export function omitFromSitemap(path: string): boolean {
  // The HTML site index paginates restaurant letters. Those pages are the
  // crawl path to every listing, so they stay in the XML sitemap.
  if (path === "/sitemap" || path.startsWith("/sitemap/")) return false
  if (path.includes("/page/")) return true
  if (THIN_UTILITY.has(path)) return true
  if (path.endsWith("/badge")) return true
  return false
}
