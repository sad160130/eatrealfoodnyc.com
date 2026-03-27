export const SEO_CONFIG = {
  siteName: "Eat Real Food NYC",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://eatrealfoodnyc.com",
  defaultTitle: "Eat Real Food NYC — Healthy Restaurants Across All 5 Boroughs",
  defaultDescription:
    "NYC's most trusted healthy restaurant directory. Every listing verified with NYC Health Department inspection grades, dietary certifications, and neighborhood-level curation.",
  twitterHandle: "@eatrealfoodnyc",
  ogImage: "/og-default.jpg",
}

export function getCanonicalUrl(path: string): string {
  const base = SEO_CONFIG.siteUrl.replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalizedPath}`
}
