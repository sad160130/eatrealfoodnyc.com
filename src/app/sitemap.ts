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
import closuresReport from "@/data/restaurant-closures.json"
import { HOLIDAY_CATERING_PATH } from "@/lib/holiday-catering"
import { listingStamp, latestStamp } from "@/lib/listing-stamp"
import { OUR_DATA_PAGE_DATE, TEAM_PAGE_DATE } from "@/lib/visible-dates"
import { omitFromSitemap } from "@/lib/sitemap-policy"
import {
  NEWSLETTER_INDEX_MIN_GRADE_A,
  archivedIssueDates,
  buildNewsletterIssue,
  isNewsletterIssueIndexable,
} from "@/lib/newsletter-issue"

const DIET_TYPES = Object.keys(DIET_CONFIG)
const BOROUGHS = ["manhattan", "brooklyn", "queens", "bronx", "staten-island"] as const

/**
 * Editorial pages don't have a row timestamp. These are the last dates the
 * copy itself was revised, not the clock at build time.
 */
/**
 * Last git commit date of each static source file (`git log -1 --format=%cs`).
 * Catering and partner are omitted: their visible Updated line is the newest
 * inspection date, and the sitemap uses that same date below.
 */
const STATIC_LASTMOD: Record<string, string> = {
  "/about": "2026-11-26",
  "/about/editorial-standards": "2026-11-26",
  "/about/team": TEAM_PAGE_DATE,
  "/contact": "2026-11-15",
  "/press": "2026-11-15",
  "/privacy": "2026-11-15",
  "/terms": "2026-11-15",
  "/map": "2026-11-26",
  "/nyc/compare": "2026-11-25",
  "/guides": "2026-11-15",
  "/newsletter": "2026-11-19",
  "/newsletter/issues": "2026-11-19",
  "/about/our-data": OUR_DATA_PAGE_DATE,
}

export function editorialPaths(): string[] {
  return [
    ...GUIDES.map((guide) => `/guides/${guide.slug}`),
    "/data/nyc-restaurant-health-grade-report",
    "/data/best-rated-restaurants",
    "/data/nyc-restaurant-score-13-cliff",
    "/data/not-yet-inspected-restaurants-nyc",
    `/data/nyc-restaurant-closures-${closuresReport.latestMonth}`,
  ]
}

function asDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function rowFreshness(row: { updated_at: Date; inspection_date: string | null }): Date | undefined {
  return listingStamp(row)
}

function latest(dates: Array<Date | undefined>): Date | undefined {
  return latestStamp(dates)
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
      inspection_date: true,
      inspection_grade: true,
      borough: true,
      neighborhood: true,
      dietary_tags: true,
    },
  })

  const directoryUpdated = latest(restaurants.map((row) => rowFreshness(row)))

  const staticPages = [
    entry(siteUrl, "/", 1, "daily", directoryUpdated),
    entry(siteUrl, "/data", 0.8, "weekly", directoryUpdated),
    entry(siteUrl, "/catering", 0.6, "weekly", directoryUpdated),
    entry(siteUrl, "/partner-with-us", 0.6, "monthly", directoryUpdated),
    ...Object.entries(STATIC_LASTMOD).map(([path, date]) =>
      entry(siteUrl, path, path.startsWith("/about") ? 0.7 : path === "/guides" || path === "/data" ? 0.8 : path === "/nyc/compare" ? 0.8 : path === "/map" ? 0.75 : 0.5, path === "/map" || path === "/nyc/compare" || path === "/data" ? "weekly" : "monthly", asDate(date))
    ),
  ]

  const guidePages = GUIDES.map((guide) =>
    entry(
      siteUrl,
      `/guides/${guide.slug}`,
      guide.slug === "grade-a-restaurants-by-borough-nyc" ? 0.8 : 0.85,
      "monthly",
      asDate(guide.updatedDate ?? guide.publishedDate)
    )
  )

  const byDiet = new Map<string, Date[]>()
  const byBorough = new Map<string, Date[]>()
  const byNeighborhood = new Map<string, { borough: string; neighborhood: string; dates: Date[]; count: number }>()
  const byCombo = new Map<string, { borough: string; tag: string; dates: Date[]; count: number }>()
  const byHoodDiet = new Map<string, Date[]>()
  const gradeACity: Date[] = []
  const gradeAByBorough = new Map<string, Date[]>()
  const gradeAByHood = new Map<string, Date[]>()

  for (const row of restaurants) {
    const moment = rowFreshness(row)
    const tags = (row.dietary_tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean)
    for (const tag of tags) {
      if (!DIET_TYPES.includes(tag)) continue
      const dates = byDiet.get(tag) ?? []
      if (moment) dates.push(moment)
      byDiet.set(tag, dates)
      if (row.borough) {
        const key = `${row.borough}::${tag}`
        const combo = byCombo.get(key) ?? { borough: row.borough, tag, dates: [], count: 0 }
        if (moment) combo.dates.push(moment)
        combo.count += 1
        byCombo.set(key, combo)
      }
      if (row.borough && row.neighborhood && moment) {
        const hoodKey = `${row.borough}::${row.neighborhood}::${tag}`
        const hoodDates = byHoodDiet.get(hoodKey) ?? []
        hoodDates.push(moment)
        byHoodDiet.set(hoodKey, hoodDates)
      }
    }
    if (row.inspection_grade?.trim().toUpperCase() === "A" && moment) {
      gradeACity.push(moment)
      if (row.borough) {
        const slug = boroughToSlug(row.borough)
        const dates = gradeAByBorough.get(slug) ?? []
        dates.push(moment)
        gradeAByBorough.set(slug, dates)
        if (row.neighborhood) {
          const hoodKey = `${slug}::${neighborhoodToSlug(row.neighborhood)}`
          const hoodDates = gradeAByHood.get(hoodKey) ?? []
          hoodDates.push(moment)
          gradeAByHood.set(hoodKey, hoodDates)
        }
      }
    }
    if (row.borough) {
      const slug = boroughToSlug(row.borough)
      const dates = byBorough.get(slug) ?? []
      if (moment) dates.push(moment)
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
      if (moment) hood.dates.push(moment)
      hood.count += 1
      byNeighborhood.set(key, hood)
    }
  }

  const dietPages = [
    entry(siteUrl, "/healthy-restaurants", 0.9, "weekly", directoryUpdated),
    ...DIET_TYPES.filter((tag) => (byDiet.get(tag)?.length ?? 0) >= COMBO_MIN_RESTAURANTS).map((tag) =>
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
      asDate("2026-11-15")
    ),
    entry(
      siteUrl,
      "/data/best-rated-restaurants",
      0.9,
      "monthly",
      directoryUpdated
    ),
    entry(siteUrl, "/data/nyc-restaurant-score-13-cliff", 0.9, "monthly", asDate("2026-11-25")),
    entry(siteUrl, "/data/not-yet-inspected-restaurants-nyc", 0.9, "monthly", asDate("2026-11-25")),
    entry(
      siteUrl,
      `/data/nyc-restaurant-closures-${closuresReport.latestMonth}`,
      0.9,
      "monthly",
      asDate("2026-11-25")
    ),
  ]

  const restaurantPages = restaurants.map((row) =>
    entry(siteUrl, `/restaurants/${row.slug}`, 0.8, "monthly", rowFreshness(row))
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
      entry(siteUrl, gradeACityPath(index + 1), index === 0 ? 0.95 : 0.5, "weekly", latest(gradeACity))
    ),
    ...gradeABoroughs.flatMap((row) =>
      Array.from({ length: gradeAPageCount(row.count) }, (_, index) =>
        entry(siteUrl, gradeABoroughPath(row.borough, index + 1), index === 0 ? 0.9 : 0.5, "weekly", latest(gradeAByBorough.get(boroughToSlug(row.borough)) ?? []))
      )
    ),
    ...gradeANeighborhoods.flatMap((row) =>
      Array.from({ length: gradeAPageCount(row.count) }, (_, index) =>
        entry(
          siteUrl,
          gradeANeighborhoodPath(row.borough, row.neighborhood, index + 1),
          index === 0 ? 0.85 : 0.5,
          "weekly",
          latest(gradeAByHood.get(`${boroughToSlug(row.borough)}::${neighborhoodToSlug(row.neighborhood)}`) ?? [])
        )
      )
    ),
  ]

  const gradeARows = await prisma.restaurant.findMany({
    where: { is_published: true, inspection_grade: "A", inspection_date: { not: null } },
    select: {
      name: true,
      slug: true,
      borough: true,
      neighborhood: true,
      inspection_grade: true,
      inspection_date: true,
      is_published: true,
    },
  })
  const issueNow = new Date()
  const newsletterIssuePages = archivedIssueDates(
    gradeARows.map((row) => row.inspection_date),
    issueNow,
  ).flatMap((date) => {
    // The minimum count only opens the 12-week gate. Weeks outside that
    // window are dropped before the listing scan. The rebuilt count is
    // what decides whether a recent week is indexable.
    if (!isNewsletterIssueIndexable(date, NEWSLETTER_INDEX_MIN_GRADE_A, issueNow)) return []
    const gradeACount = buildNewsletterIssue(gradeARows, date).gradeA.length
    if (!isNewsletterIssueIndexable(date, gradeACount, issueNow)) return []
    return [entry(siteUrl, `/newsletter/issues/${date}`, 0.6, "weekly", asDate(date))]
  })

  const neighborhoodDietPages = (await listNeighborhoodDietCombos()).map((combo) =>
    entry(
      siteUrl,
      neighborhoodDietPath(combo.borough, combo.neighborhood, combo.tag),
      0.85,
      "weekly",
      latest(byHoodDiet.get(`${combo.borough}::${combo.neighborhood}::${combo.tag}`) ?? [])
    )
  )

  const holidayCateringPage = entry(
    siteUrl,
    HOLIDAY_CATERING_PATH,
    0.8,
    "weekly",
    asDate("2026-11-20")
  )

  return [
    ...staticPages,
    holidayCateringPage,
    ...guidePages,
    ...dataPages,
    ...dietPages,
    ...boroughPages,
    ...neighborhoodPages,
    ...comboPages,
    ...gradeAPages,
    ...neighborhoodDietPages,
    ...newsletterIssuePages,
    entry(siteUrl, "/html-sitemap", 0.5, "weekly", directoryUpdated),
    ...indexPages,
    ...restaurantPages,
  ].filter((item) => !omitFromSitemap(item.url.replace(siteUrl, "") || "/"))
}
