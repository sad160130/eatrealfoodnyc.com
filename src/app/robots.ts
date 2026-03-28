import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/search", "/near-me", "/compare", "/saved", "/api/", "/_next/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
