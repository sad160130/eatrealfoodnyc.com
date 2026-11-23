import { cache } from "react"
import { prisma } from "@/lib/db"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { DIRECTORY_SHARED_TTL_MS, getPublishedDirectoryCounts } from "@/lib/directory-stats"
import { formatLongDate, formatMonthYear, latestInspectionDate } from "@/lib/inspection-dates"
import { memoizeSuccess } from "@/lib/success-memo"

export interface DirectorySnapshot {
  trackedCount: number
  publishedCount: number
  gradeAPublished: number
  gradeAAll: number
  neighborhoodCount: number
  dietaryTagCount: number
  lastPublishAt: Date | null
  lastPublishLabel: string | null
  latestInspectionAt: Date | null
  latestInspectionLabel: string | null
  latestInspectionMonth: string | null
}

/**
 * Freshness labels plus the full-dataset Grade A count. Published listing,
 * Grade A, and neighbourhood counts come from `getPublishedDirectoryCounts`
 * so the homepage, About, and guides cannot drift from each other.
 * `lastPublishAt` is the newest `updated_at` among published rows, which the
 * weekly publish script bumps. A later edit to a published row moves it too.
 * Inspection labels use the newest parsed inspection_date, not a hardcoded month.
 * Hub "Data as of" lines and "Newest inspection date on file" both read
 * `latestInspectionAt`. `lastPublishAt` is the publish clock and is not a
 * data-as-of date.
 */
async function queryDirectorySnapshot(): Promise<DirectorySnapshot> {
  const [counts, trackedCount, gradeAAll, lastPublish, inspectionDates] = await Promise.all([
    getPublishedDirectoryCounts(),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { inspection_grade: "A" } }),
    prisma.restaurant.aggregate({
      where: { is_published: true },
      _max: { updated_at: true },
    }),
    prisma.restaurant.findMany({
      where: { is_published: true, inspection_date: { not: null } },
      distinct: ["inspection_date"],
      select: { inspection_date: true },
    }),
  ])

  const latest = latestInspectionDate(inspectionDates.map((row) => row.inspection_date))
  const lastPublishAt = lastPublish._max.updated_at

  return {
    trackedCount,
    publishedCount: counts.restaurants,
    gradeAPublished: counts.gradeA,
    gradeAAll,
    neighborhoodCount: counts.neighborhoods,
    dietaryTagCount: Object.keys(DIET_CONFIG).length,
    lastPublishAt,
    lastPublishLabel: lastPublishAt ? formatMonthYear(lastPublishAt) : null,
    latestInspectionAt: latest,
    latestInspectionLabel: latest ? formatLongDate(latest) : null,
    latestInspectionMonth: latest ? formatMonthYear(latest) : null,
  }
}

export const getDirectorySnapshot = cache(() =>
  memoizeSuccess("directory-snapshot", DIRECTORY_SHARED_TTL_MS, queryDirectorySnapshot)
)
