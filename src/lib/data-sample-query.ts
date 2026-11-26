import { HIGH_SCORE } from "@/lib/compliance-csv"
import { prisma } from "@/lib/db"
import { buildSampleRows, DATA_SAMPLE_LIMIT, type SampleLeadRow, type SampleSourceRow } from "@/lib/data-sample"
import { formatLongDate, latestInspectionDate } from "@/lib/inspection-dates"

const select = {
  name: true,
  borough: true,
  neighborhood: true,
  inspection_grade: true,
  inspection_score: true,
  inspection_date: true,
  is_published: true,
} as const

/**
 * Published rows only, from the same three lists as the /data sample
 * and the compliance file: grade pending (Z/P), score >= 28, and not yet inspected.
 * The queries are disjoint so one list cannot crowd out the others.
 */
export async function loadDataSampleRows(limit = DATA_SAMPLE_LIMIT): Promise<SampleLeadRow[]> {
  const [pending, high, uninspected] = await Promise.all([
    prisma.restaurant.findMany({
      where: { is_published: true, inspection_grade: { in: ["Z", "P"] } },
      select,
      orderBy: [{ inspection_score: { sort: "desc", nulls: "last" } }, { name: "asc" }],
      take: limit,
    }),
    prisma.restaurant.findMany({
      where: {
        is_published: true,
        inspection_score: { gte: HIGH_SCORE },
        OR: [
          { inspection_grade: null },
          { inspection_grade: "" },
          { NOT: { inspection_grade: { in: ["Z", "P"] } } },
        ],
      },
      select,
      orderBy: [{ inspection_score: { sort: "desc", nulls: "last" } }, { name: "asc" }],
      take: limit,
    }),
    prisma.restaurant.findMany({
      where: {
        is_published: true,
        AND: [
          { OR: [{ inspection_date: null }, { inspection_date: "" }] },
          { OR: [{ inspection_grade: null }, { inspection_grade: "" }, { inspection_grade: "N" }] },
          { OR: [{ inspection_score: null }, { inspection_score: { lt: HIGH_SCORE } }] },
        ],
      },
      select,
      orderBy: { name: "asc" },
      take: limit,
    }),
  ])
  const rows: SampleSourceRow[] = [...pending, ...high, ...uninspected]
  return buildSampleRows(rows, limit)
}

/**
 * Newest inspection_date in the restaurants table.
 * The column is M/D/YYYY text, so the max is parsed, not string-sorted.
 */
export async function loadNewestInspectionAt(): Promise<Date | null> {
  const dated = await prisma.restaurant.findMany({
    where: {
      AND: [{ inspection_date: { not: null } }, { NOT: { inspection_date: "" } }],
    },
    distinct: ["inspection_date"],
    select: { inspection_date: true },
  })
  return latestInspectionDate(dated.map((row) => row.inspection_date))
}

export async function loadNewestInspectionLabel(): Promise<string | null> {
  const latest = await loadNewestInspectionAt()
  return latest ? formatLongDate(latest) : null
}
