import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import { COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"
import { neighborhoodIndexPath, pageCount } from "@/lib/restaurant-index"
import { laterDate, parseStoredDate, recordStamp } from "@/lib/freshness"
import { GUIDES } from "@/config/guides"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const stampRows = await prisma.restaurant.findMany({
    where: { is_published: true },
    select: {
      slug: true,
      borough: true,
      neighborhood: true,
      dietary_tags: true,
      updated_at: true,
      inspection_date: true,
    },
  })
  const bySlug = new Map<string, Date>()
  const byHood = new Map<string, Date>()
  const byBorough = new Map<string, Date>()
  const byDiet = new Map<string, Date>()
  let directoryStamp: Date | null = null
  for (const row of stampRows) {
    const stamp = recordStamp(row.inspection_date, row.updated_at)
    if (!stamp) continue
    bySlug.set(row.slug, stamp)
    directoryStamp = laterDate(directoryStamp, stamp)
    if (row.borough) byBorough.set(row.borough, laterDate(byBorough.get(row.borough) ?? null, stamp)!)
    if (row.borough && row.neighborhood) {
      const key = `${row.borough}|||${row.neighborhood}`
      byHood.set(key, laterDate(byHood.get(key) ?? null, stamp)!)
    }
    for (const tag of (row.dietary_tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean)) {
      byDiet.set(tag, laterDate(byDiet.get(tag) ?? null, stamp)!)
    }
  }

  // Static pages. lastModified is the newest stored inspection or row update, not the request time.
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, ...(directoryStamp && { lastModified: directoryStamp }), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/our-data`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/editorial-standards`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/team`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/press`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/partner-with-us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/map`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteUrl}/nyc/compare`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guides`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/html-sitemap`, changeFrequency: "weekly", priority: 0.5 },
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
  const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => {
    const published = parseStoredDate(GUIDES.find((guide) => guide.slug === slug)?.publishedDate)
    return {
      url: `${siteUrl}/guides/${slug}`,
      ...(published && { lastModified: published.date }),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }
  })

  // Diet-type hub pages
  const dietTypes = [
    "vegan", "vegetarian", "gluten-free", "halal", "kosher",
    "dairy-free", "keto", "paleo", "whole-foods", "low-calorie", "raw-food", "nut-free",
  ]
  const dietPages: MetadataRoute.Sitemap = dietTypes.map((tag) => ({
    url: `${siteUrl}/healthy-restaurants/${tag}`,
    ...(byDiet.get(tag) && { lastModified: byDiet.get(tag) }),
    changeFrequency: "weekly" as const,
    priority: 0.95,
  }))

  // Borough hub pages
  const boroughs = ["manhattan", "brooklyn", "queens", "bronx", "staten-island"]
  const boroughNameBySlug: Record<string, string> = {
    manhattan: "Manhattan",
    brooklyn: "Brooklyn",
    queens: "Queens",
    bronx: "Bronx",
    "staten-island": "Staten Island",
  }
  const boroughPages: MetadataRoute.Sitemap = boroughs.map((b) => ({
    url: `${siteUrl}/nyc/${b}/healthy-restaurants`,
    ...(byBorough.get(boroughNameBySlug[b]) && { lastModified: byBorough.get(boroughNameBySlug[b]) }),
    changeFrequency: "weekly" as const,
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
    having: { id: { _count: { gte: NEIGHBORHOOD_HUB_MIN_RESTAURANTS } } },
  })
  const neighborhoodPages: MetadataRoute.Sitemap = neighborhoods
    .filter((n) => n.borough && n.neighborhood)
    .map((n) => ({
      url: `${siteUrl}/nyc/${boroughToSlug(n.borough!)}/${neighborhoodToSlug(n.neighborhood!)}/healthy-restaurants`,
      ...(byHood.get(`${n.borough}|||${n.neighborhood}`) && { lastModified: byHood.get(`${n.borough}|||${n.neighborhood}`) }),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }))

  // Diet + borough combo hub pages (gated to avoid thin pages)
  const comboGroups = await Promise.all(
    dietTypes.map((tag) =>
      prisma.restaurant
        .groupBy({
          by: ["borough"],
          where: {
            business_status: "OPERATIONAL",
            is_published: true,
            dietary_tags: { contains: tag },
            borough: { not: null },
          },
          having: { id: { _count: { gte: COMBO_MIN_RESTAURANTS } } },
        })
        .then((rows) => ({ tag, rows }))
    )
  )
  const comboPages: MetadataRoute.Sitemap = comboGroups.flatMap(({ tag, rows }) =>
    rows
      .filter((r) => r.borough)
      .map((r) => ({
        url: `${siteUrl}/nyc/${boroughToSlug(r.borough!)}/${tag}-restaurants`,
        ...(byBorough.get(r.borough!) && { lastModified: byBorough.get(r.borough!) }),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }))
  )

  const indexGroups = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: { is_published: true, borough: { not: null }, neighborhood: { not: null } },
    _count: { id: true },
  })
  const indexPages: MetadataRoute.Sitemap = indexGroups.flatMap((group) => {
    if (!group.borough || !group.neighborhood) return []
    const pages = pageCount(group._count.id)
    return Array.from({ length: pages }, (_, index) => ({
      url: `${siteUrl}${neighborhoodIndexPath(group.borough!, group.neighborhood!, index + 1)}`,
      ...(byHood.get(`${group.borough}|||${group.neighborhood}`) && { lastModified: byHood.get(`${group.borough}|||${group.neighborhood}`) }),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  })

  // Published restaurant pages
  const restaurantPages: MetadataRoute.Sitemap = stampRows.map((row) => ({
    url: `${siteUrl}/restaurants/${row.slug}`,
    ...(bySlug.get(row.slug) && { lastModified: bySlug.get(row.slug) }),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...guidePages,
    ...dietPages,
    ...boroughPages,
    ...neighborhoodPages,
    ...comboPages,
    ...indexPages,
    ...restaurantPages,
  ]
}
