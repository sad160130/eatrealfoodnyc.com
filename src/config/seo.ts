export const SEO_CONFIG = {
  siteName: "Eat Real Food NYC",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com",
  defaultTitle: "Eat Real Food NYC — Healthy Restaurants Across All 5 Boroughs",
  defaultDescription:
    "NYC's most trusted healthy restaurant directory. Every listing verified with NYC Health Department inspection grades, dietary certifications, and neighborhood-level curation.",
  twitterHandle: "@eatrealfoodnyc",
  ogImage: "/opengraph-image",
}

export function getCanonicalUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com").replace(/\/$/, "")
  const normalizedPath = path === "/" ? "" : (path.startsWith("/") ? path : `/${path}`)
  const cleanPath = normalizedPath.endsWith("/") && normalizedPath.length > 1
    ? normalizedPath.slice(0, -1)
    : normalizedPath
  return `${base}${cleanPath}`
}
