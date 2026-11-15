import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import { BOROUGH_MAP } from "@/config/boroughs"
import { latestInspectionDate, formatMonthYear } from "@/lib/inspection-dates"

export const GRADE_A_PAGE_SIZE = 48
export const GRADE_A_MIN = 5

export const GRADE_A_WHERE = {
  ...PUBLISHED_LISTING_WHERE,
  inspection_grade: "A",
} as const

export function gradeACityPath(page = 1) {
  return page <= 1 ? "/healthy-restaurants/grade-a" : `/healthy-restaurants/grade-a/page/${page}`
}

export function gradeABoroughPath(borough: string, page = 1) {
  const base = `/nyc/${boroughToSlug(borough)}/grade-a-restaurants`
  return page <= 1 ? base : `${base}/page/${page}`
}

export function gradeANeighborhoodPath(borough: string, neighborhood: string, page = 1) {
  const base = `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/grade-a-restaurants`
  return page <= 1 ? base : `${base}/page/${page}`
}

export function gradeAPageCount(total: number) {
  return Math.max(1, Math.ceil(total / GRADE_A_PAGE_SIZE))
}

export function boroughNameFromSlug(slug: string) {
  return BOROUGH_MAP[slug] ?? null
}

export async function countGradeA(where: { borough?: string; neighborhood?: string }) {
  return prisma.restaurant.count({
    where: {
      ...GRADE_A_WHERE,
      ...(where.borough ? { borough: where.borough } : {}),
      ...(where.neighborhood ? { neighborhood: where.neighborhood } : {}),
    },
  })
}

export async function latestGradeAMonth(where: { borough?: string; neighborhood?: string }) {
  const dated = await prisma.restaurant.findMany({
    where: {
      ...GRADE_A_WHERE,
      ...(where.borough ? { borough: where.borough } : {}),
      ...(where.neighborhood ? { neighborhood: where.neighborhood } : {}),
      inspection_date: { not: null },
    },
    select: { inspection_date: true },
    orderBy: { inspection_date: "desc" },
    take: 40,
  })
  const latest = latestInspectionDate(dated.map((row) => row.inspection_date))
  return latest ? formatMonthYear(latest) : null
}

export async function gradeABoroughCounts() {
  const rows = await prisma.restaurant.groupBy({
    by: ["borough"],
    where: { ...GRADE_A_WHERE, borough: { not: null } },
    _count: { id: true },
  })
  return rows
    .filter((row) => row.borough && row._count.id >= GRADE_A_MIN)
    .map((row) => ({ borough: row.borough as string, count: row._count.id }))
}

export async function gradeANeighborhoodCounts() {
  const rows = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: { ...GRADE_A_WHERE, borough: { not: null }, neighborhood: { not: null } },
    _count: { id: true },
    having: { id: { _count: { gte: GRADE_A_MIN } } },
  })
  return rows.flatMap((row) => {
    if (!row.borough || !row.neighborhood) return []
    if (!Object.values(BOROUGH_MAP).includes(row.borough)) return []
    return [{ borough: row.borough, neighborhood: row.neighborhood, count: row._count.id }]
  })
}
