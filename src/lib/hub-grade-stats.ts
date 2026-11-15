import { prisma } from "./db"
import { latestStoredDate } from "./freshness"

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
    prisma.restaurant.findMany({
      where: { ...published, inspection_date: { not: null } },
      select: { inspection_date: true },
      orderBy: { inspection_date: "desc" },
      take: 40,
    }),
  ])
  const latest = latestStoredDate(dated.map((row) => row.inspection_date))
  return {
    count,
    gradeA,
    gradeB,
    gradeC,
    graded: gradeA + gradeB + gradeC,
    latestMonth: latest?.monthYear ?? null,
    latestIso: latest?.iso ?? null,
  }
}
