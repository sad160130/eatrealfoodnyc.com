import { cache } from "react"
import { prisma } from "./db"
import { formatMonthYear, latestInspectionDate } from "./inspection-dates"

type GradeWhere = {
  borough?: string
  neighborhood?: string
  dietary_tags?: { contains: string }
}

/**
 * Published, operational listings only. Grade counts used in titles and
 * meta descriptions come from this query so a benefit cannot cite an
 * unpublished row.
 * `cache()` dedupes generateMetadata and the page. The key is a string
 * because React compares arguments with Object.is.
 */
async function queryGradeStats(where: GradeWhere) {
  const published = {
    ...where,
    is_published: true,
    business_status: "OPERATIONAL" as const,
  }
  const [count, gradeA, gradeB, gradeC, dated] = await Promise.all([
    prisma.restaurant.count({ where: published }),
    prisma.restaurant.count({ where: { ...published, inspection_grade: "A" } }),
    prisma.restaurant.count({ where: { ...published, inspection_grade: "B" } }),
    prisma.restaurant.count({ where: { ...published, inspection_grade: "C" } }),
    // Stored as M/D/YYYY. String ORDER BY is not chronological
    // ("9/30/2026" sorts ahead of "11/10/2026"), so load every distinct
    // date and parse it with the same helper as the directory footer.
    prisma.restaurant.findMany({
      where: { ...published, inspection_date: { not: null } },
      distinct: ["inspection_date"],
      select: { inspection_date: true },
    }),
  ])
  const latest = latestInspectionDate(dated.map((row) => row.inspection_date))
  return {
    count,
    gradeA,
    gradeB,
    gradeC,
    graded: gradeA + gradeB + gradeC,
    latestMonth: latest ? formatMonthYear(latest) : null,
    latestIso: latest ? latest.toISOString().slice(0, 10) : null,
  }
}

const loadGradeStats = cache((key: string) => {
  const parsed = JSON.parse(key) as { borough: string | null; neighborhood: string | null; tag: string | null }
  const where: GradeWhere = {}
  if (parsed.borough) where.borough = parsed.borough
  if (parsed.neighborhood) where.neighborhood = parsed.neighborhood
  if (parsed.tag) where.dietary_tags = { contains: parsed.tag }
  return queryGradeStats(where)
})

export function gradeStatsFor(where: GradeWhere) {
  return loadGradeStats(JSON.stringify({
    borough: where.borough ?? null,
    neighborhood: where.neighborhood ?? null,
    tag: where.dietary_tags?.contains ?? null,
  }))
}
