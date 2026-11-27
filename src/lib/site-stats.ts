import { cache } from "react"
import { unstable_rethrow } from "next/navigation"
import { prisma } from "@/lib/db"
import { shortenRevalidate } from "@/lib/db-fallback"
import { formatLongDate, latestInspectionDate } from "@/lib/inspection-dates"
import { memoizeSuccess } from "@/lib/success-memo"

/**
 * Headline directory counts. Every public claim about how big the directory
 * is should read this object, then say which field it is using.
 *
 * publishedListings — operational rows with is_published true. A diner can open these.
 * restaurantsTracked — every restaurant row, published or not.
 * gradedListings — published listings whose matched grade is A, B, or C.
 * gradedPercent — gradedListings ÷ publishedListings, rounded.
 * gradeAListings — published listings whose matched grade is A. Not the full city file.
 * neighborhoods — distinct borough + neighborhood pairs among published listings.
 * dataAsOf — newest parsed inspection_date among those published listings.
 */
export const PUBLISHED_LISTING_WHERE = {
  business_status: "OPERATIONAL" as const,
  is_published: true,
}

export const SITE_STATS_TTL_MS = 60_000

export interface SiteStats {
  publishedListings: number
  restaurantsTracked: number
  gradedListings: number
  gradedPercent: number
  gradeAListings: number
  neighborhoods: number
  hiddenGems: number
  /** YYYY-MM-DD, or null when no inspection date is stored. */
  dataAsOf: string | null
  dataAsOfLabel: string | null
  source: "live" | "fallback"
}

export const SITE_STATS_FALLBACK: SiteStats = {
  publishedListings: 0,
  restaurantsTracked: 0,
  gradedListings: 0,
  gradedPercent: 0,
  gradeAListings: 0,
  neighborhoods: 0,
  hiddenGems: 0,
  dataAsOf: null,
  dataAsOfLabel: null,
  source: "fallback",
}

export function gradedPercent(graded: number, published: number): number {
  if (published <= 0) return 0
  return Math.round((graded / published) * 100)
}

export function dataAsOfSentence(label: string | null): string {
  return label ? `Data as of ${label}.` : "Data as of date not on file."
}

async function querySiteStats(): Promise<SiteStats> {
  const where = PUBLISHED_LISTING_WHERE
  const [publishedListings, restaurantsTracked, gradeAListings, gradedListings, hiddenGems, neighborhoodGroups, inspectionDates] =
    await Promise.all([
      prisma.restaurant.count({ where }),
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { ...where, inspection_grade: "A" } }),
      prisma.restaurant.count({ where: { ...where, inspection_grade: { in: ["A", "B", "C"] } } }),
      prisma.restaurant.count({ where: { ...where, is_hidden_gem: true } }),
      prisma.restaurant.groupBy({
        by: ["borough", "neighborhood"],
        where: { ...where, borough: { not: null }, neighborhood: { not: null } },
      }),
      prisma.restaurant.findMany({
        where: { ...where, inspection_date: { not: null } },
        distinct: ["inspection_date"],
        select: { inspection_date: true },
      }),
    ])
  const latest = latestInspectionDate(inspectionDates.map((row) => row.inspection_date))
  return {
    publishedListings,
    restaurantsTracked,
    gradedListings,
    gradedPercent: gradedPercent(gradedListings, publishedListings),
    gradeAListings,
    neighborhoods: neighborhoodGroups.length,
    hiddenGems,
    dataAsOf: latest ? latest.toISOString().slice(0, 10) : null,
    dataAsOfLabel: latest ? formatLongDate(latest) : null,
    source: "live",
  }
}

/** Throws when the database read fails. Successful results are shared for one minute. */
export function loadLiveSiteStats(): Promise<SiteStats> {
  return memoizeSuccess("site-stats", SITE_STATS_TTL_MS, querySiteStats)
}

/** Never throws a database error. A failed read is zeros with source "fallback". */
export const getSiteStats = cache(async (): Promise<SiteStats> => {
  try {
    return await loadLiveSiteStats()
  } catch (error) {
    unstable_rethrow(error)
    const name = error instanceof Error ? error.name : "Error"
    const raw = error instanceof Error ? error.message : ""
    const message = raw.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[redacted]").slice(0, 160)
    console.error(`Site stats unavailable (${name}${message ? `: ${message}` : ""})`)
    await shortenRevalidate()
    return SITE_STATS_FALLBACK
  }
})
