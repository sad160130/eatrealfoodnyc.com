import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import { COMBO_MIN_RESTAURANTS, DIET_CONFIG } from "@/config/dietary-tags"
import { GUIDES } from "@/config/guides"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"
import { neighborhoodIndexPath, pageCount } from "@/lib/restaurant-index"
import {
  countGradeA,
  gradeABoroughCounts,
  gradeABoroughPath,
  gradeACityPath,
  gradeANeighborhoodCounts,
  gradeANeighborhoodPath,
  gradeAPageCount,
} from "@/lib/grade-a"
import { listNeighborhoodDietCombos, neighborhoodDietPath } from "@/lib/neighborhood-diet"
import healthGradeReport from "@/data/health-grade-report"
import bestRatedReport from "@/data/best-rated-restaurants"

const DIET_TYPES = Object.keys(DIET_CONFIG)
const BOROUGHS = ["manhattan", "brooklyn", "queens", "bronx", "staten-island"] as const

/**
 * Editorial pages don't have a row timestamp. These are the last dates the
 * copy itself was revised, not the clock at build time.
 */
const STATIC_LASTMOD: Record<string, string> = {
  "/about": "2026-03-01",
  "/about/our-data": "2026-04-01",
  "/about/editorial-standards": "2026-03-01",
  "/about/team": "2026-03-01",
  "/contact": "2026-03-01",
  "/press": "2026-03-01",
  "/partner-with-us": "2026-11-15",
  "/privacy": "2026-03-01",
  "/terms": "2026-03-01",
  "/map": "2026-04-01",
  "/nyc/compare": "2026-04-01",
  "/guides": "2026-02-15",
  "/newsletter": "2026-11-15",
  "/data": "2026-11-15",
}

export function editorialPaths(): string[] {
  return [
    ...GUIDES.map((guide) => `/guides/${guide.slug}`),
    "/data/nyc-restaurant-health-grade-report",
    "/data/best-rated-restaurants",
  ]
}

function asDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function latest(dates: Array<Date | undefined>): Date | undefined {
  let max = 0
  for (const date of dates) {
    if (!date) continue
    const time = date.getTime()
    if (time > max) max = time
  }
  return max > 0 ? new Date(max) : undefined
}

function entry(
  siteUrl: string,
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  lastModified?: Date
): MetadataRoute.Sitemap[number] {
  return {
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com").replace(/\/$/, "")

  const restaurants = await prisma.restaurant.findMany({
    where: { is_published: true, business_status: "OPERATIONAL" },
    select: {
      slug: true,
      updated_at: true,
      borough: true,
      neighborhood: true,
      dietary_tags: true,
    },
  })

  const directoryUpdated = latest(restaurants.map((row) => row.updated_at))

  const staticPages = [
    entry(siteUrl, "/", 1, "daily", directoryUpdated),
    ...Object.entries(STATIC_LASTMOD).map(([path, date]) =>
      entry(siteUrl, path, path.startsWith("/about") ? 0.7 : path === "/guides" || path === "/data" ? 0.8 : path === "/nyc/compare" ? 0.8 : path === "/map" ? 0.75 : 0.5, path === "/map" || path === "/nyc/compare" || path === "/data" ? "weekly" : "monthly", asDate(date))
    ),
  ]

  const guidePages = GUIDES.map((guide) =>
    entry(siteUrl, `/guides/${guide.slug}`, 0.85, "monthly", asDate(guide.publishedDate))
  )

  const byDiet = new Map<string, Date[]>()
  const byBorough = new Map<string, Date[]>()
  const byNeighborhood = new Map<string, { borough: string; neighborhood: string; dates: Date[]; count: number }>()
  const byCombo = new Map<string, { borough: string; tag: string; dates: Date[]; count: number }>()

  for (const row of restaurants) {
    const tags = (row.dietary_tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean)
    for (const tag of tags) {
      if (!DIET_TYPES.includes(tag)) continue
      const dates = byDiet.get(tag) ?? []
      dates.push(row.updated_at)
      byDiet.set(tag, dates)
      if (row.borough) {
        const key = `${row.borough}::${tag}`
        const combo = byCombo.get(key) ?? { borough: row.borough, tag, dates: [], count: 0 }
        combo.dates.push(row.updated_at)
        combo.count += 1
        byCombo.set(key, combo)
      }
    }
    if (row.borough) {
      const slug = boroughToSlug(row.borough)
      const dates = byBorough.get(slug) ?? []
      dates.push(row.updated_at)
      byBorough.set(slug, dates)
    }
    if (row.borough && row.neighborhood) {
      const key = `${row.borough}::${row.neighborhood}`
      const hood = byNeighborhood.get(key) ?? {
        borough: row.borough,
        neighborhood: row.neighborhood,
        dates: [],
        count: 0,
      }
      hood.dates.push(row.updated_at)
      hood.count += 1
      byNeighborhood.set(key, hood)
    }
  }

  const dietPages = [
    entry(siteUrl, "/healthy-restaurants", 0.9, "weekly", directoryUpdated),
    ...DIET_TYPES.map((tag) =>
      entry(siteUrl, `/healthy-restaurants/${tag}`, 0.95, "weekly", latest(byDiet.get(tag) ?? []))
    ),
  ]

  const boroughPages = BOROUGHS.map((borough) =>
    entry(siteUrl, `/nyc/${borough}/healthy-restaurants`, 0.9, "weekly", latest(byBorough.get(borough) ?? []))
  )

  const neighborhoodPages = [...byNeighborhood.values()]
    .filter((hood) => hood.count >= NEIGHBORHOOD_HUB_MIN_RESTAURANTS)
    .map((hood) =>
      entry(
        siteUrl,
        `/nyc/${boroughToSlug(hood.borough)}/${neighborhoodToSlug(hood.neighborhood)}/healthy-restaurants`,
        0.85,
        "weekly",
        latest(hood.dates)
      )
    )

  const comboPages = [...byCombo.values()]
    .filter((combo) => combo.count >= COMBO_MIN_RESTAURANTS)
    .map((combo) =>
      entry(
        siteUrl,
        `/nyc/${boroughToSlug(combo.borough)}/${combo.tag}-restaurants`,
        0.85,
        "weekly",
        latest(combo.dates)
      )
    )

  const dataPages = [
    entry(
      siteUrl,
      "/data/nyc-restaurant-health-grade-report",
      0.9,
      "monthly",
      asDate(healthGradeReport.generatedAt)
    ),
    entry(
      siteUrl,
      "/data/best-rated-restaurants",
      0.9,
      "monthly",
      asDate(bestRatedReport.generatedAt)
    ),
  ]

  const restaurantPages = restaurants.map((row) =>
    entry(siteUrl, `/restaurants/${row.slug}`, 0.8, "monthly", row.updated_at)
  )

  const indexPages = [...byNeighborhood.values()].flatMap((hood) => {
    const pages = pageCount(hood.count)
    return Array.from({ length: pages }, (_, index) =>
      entry(
        siteUrl,
        neighborhoodIndexPath(hood.borough, hood.neighborhood, index + 1),
        0.6,
        "weekly",
        latest(hood.dates)
      )
    )
  })

  const gradeATotal = await countGradeA({})
  const gradeABoroughs = await gradeABoroughCounts()
  const gradeANeighborhoods = await gradeANeighborhoodCounts()
  const gradeAPages = [
    ...Array.from({ length: gradeAPageCount(gradeATotal) }, (_, index) =>
      entry(siteUrl, gradeACityPath(index + 1), index === 0 ? 0.95 : 0.5, "weekly", directoryUpdated)
    ),
    ...gradeABoroughs.flatMap((row) =>
      Array.from({ length: gradeAPageCount(row.count) }, (_, index) =>
        entry(siteUrl, gradeABoroughPath(row.borough, index + 1), index === 0 ? 0.9 : 0.5, "weekly", directoryUpdated)
      )
    ),
    ...gradeANeighborhoods.flatMap((row) =>
      Array.from({ length: gradeAPageCount(row.count) }, (_, index) =>
        entry(
          siteUrl,
          gradeANeighborhoodPath(row.borough, row.neighborhood, index + 1),
          index === 0 ? 0.85 : 0.5,
          "weekly",
          directoryUpdated
        )
      )
    ),
  ]

  const neighborhoodDietPages = (await listNeighborhoodDietCombos()).map((combo) =>
    entry(
      siteUrl,
      neighborhoodDietPath(combo.borough, combo.neighborhood, combo.tag),
      0.85,
      "weekly",
      directoryUpdated
    )
  )

  return [
    ...staticPages,
    ...guidePages,
    ...dataPages,
    ...dietPages,
    ...boroughPages,
    ...neighborhoodPages,
    ...comboPages,
    ...gradeAPages,
    ...neighborhoodDietPages,
    entry(siteUrl, "/html-sitemap", 0.5, "weekly", directoryUpdated),
    ...indexPages,
    ...restaurantPages,
  ]
}
