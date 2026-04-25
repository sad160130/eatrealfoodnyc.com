import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/our-data`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/editorial-standards`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/team`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/press`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/map`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteUrl}/nyc/compare`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guides`, changeFrequency: "monthly", priority: 0.8 },
  ]

  // Guide pages
  const guideSlugs = [
    "nyc-health-grades-explained",
    "nyc-restaurant-inspection-process",
    "vegan-nyc-borough-guide",
    "halal-food-guide-nyc",
    "gluten-free-dining-nyc",
    "how-eat-healthy-nyc-15-dollars",
    "best-healthy-neighborhoods-nyc",
    "hidden-gem-restaurants-nyc",
    "kosher-dining-nyc-guide",
    "late-night-healthy-eating-nyc",
  ]
  const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${siteUrl}/guides/${slug}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }))

  // Diet-type hub pages
  const dietTypes = [
    "vegan", "vegetarian", "gluten-free", "halal", "kosher",
    "dairy-free", "keto", "paleo", "whole-foods", "low-calorie", "raw-food", "nut-free",
  ]
  const dietPages: MetadataRoute.Sitemap = dietTypes.map((tag) => ({
    url: `${siteUrl}/healthy-restaurants/${tag}`,
    changeFrequency: "weekly",
    priority: 0.95,
  }))

  // Borough hub pages
  const boroughs = ["manhattan", "brooklyn", "queens", "bronx", "staten-island"]
  const boroughPages: MetadataRoute.Sitemap = boroughs.map((b) => ({
    url: `${siteUrl}/nyc/${b}/healthy-restaurants`,
    changeFrequency: "weekly",
    priority: 0.9,
  }))

  // Neighborhood hub pages
  const neighborhoods = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: {
      business_status: "OPERATIONAL",
      is_published: true,
      borough: { not: null },
      neighborhood: { not: null },
    },
    having: { id: { _count: { gte: 3 } } },
  })
  const neighborhoodPages: MetadataRoute.Sitemap = neighborhoods
    .filter((n) => n.borough && n.neighborhood)
    .map((n) => ({
      url: `${siteUrl}/nyc/${boroughToSlug(n.borough!)}/${neighborhoodToSlug(n.neighborhood!)}/healthy-restaurants`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }))

  // Published restaurant pages
  const restaurants = await prisma.restaurant.findMany({
    where: { is_published: true },
    select: { slug: true },
  })
  const restaurantPages: MetadataRoute.Sitemap = restaurants.map((r) => ({
    url: `${siteUrl}/restaurants/${r.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...guidePages,
    ...dietPages,
    ...boroughPages,
    ...neighborhoodPages,
    ...restaurantPages,
  ]
}
