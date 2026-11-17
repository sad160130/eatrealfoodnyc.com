import { prisma } from "./db"
import { formatMonthYear, latestInspectionDate } from "./inspection-dates"

/**
 * Published, operational listings only. Grade counts used in titles and
 * meta descriptions come from this query so a benefit cannot cite an
 * unpublished row.
 */
export async function gradeStatsFor(where: {
  borough?: string
  neighborhood?: string
  dietary_tags?: { contains: string }
}) {
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
