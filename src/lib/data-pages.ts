import { FALL_2026_REPORT as REPORT } from "@/data/fall-2026-inspection-report"
import bestRated from "@/data/best-rated-restaurants"
import scoreCliff from "@/data/score-13-cliff.json"
import notYetInspected from "@/data/not-yet-inspected.json"
import closures from "@/data/restaurant-closures.json"

export interface DataPageEntry {
  href: string
  title: string
  summary: string
}

const bestRatedSummary = `${bestRated.summary.total.toLocaleString("en-US")} operational restaurants rated 4.5 or higher in the ${bestRated.reportDate} snapshot, ${bestRated.summary.withGradeA.toLocaleString("en-US")} of them with a Grade A. Grade A is a food-safety grade, not a health claim.`

/**
 * Public research pages under /data. The product email lives on /data itself.
 * Summaries quote the stored extracts. They are not live counts.
 */
export function dataPageIndex(): DataPageEntry[] {
  return [
    {
      href: "/data/nyc-restaurant-health-grade-report",
      title: "NYC Restaurant Inspection Report, Fall 2026",
      summary: `On the ${REPORT.extractLabel} extract of NYC Open Data ${REPORT.datasetId} (record date November 13, 2026), ${REPORT.gradeAShare} of ${REPORT.letterGraded.toLocaleString("en-US")} letter-graded restaurants hold an A. ${REPORT.uninspected.toLocaleString("en-US")} of ${REPORT.establishments.toLocaleString("en-US")} establishments still show January 1, 1900. Grade A is a food-safety grade, not a health claim.`,
    },
    {
      href: "/data/best-rated-restaurants",
      title: "Best-rated restaurants",
      summary: bestRatedSummary,
    },
    {
      href: "/data/nyc-restaurant-score-13-cliff",
      title: "The score 13 cliff, 2026 initial inspections",
      summary: scoreSummary(),
    },
    {
      href: "/data/not-yet-inspected-restaurants-nyc",
      title: "Not yet inspected restaurants",
      summary: uninspectedSummary(),
    },
    {
      href: `/data/nyc-restaurant-closures-${closures.latestMonth}`,
      title: `NYC restaurant closures, ${closures.latestMonth}`,
      summary: closureSummary(),
    },
  ]
}

function countAt(score: number): number {
  return scoreCliff.histogram.find((row) => row.score === score)?.n ?? 0
}

function scoreSummary(): string {
  return `Record date ${scoreCliff.recordDateLabel} (${scoreCliff.recordDate}). ${scoreCliff.n.toLocaleString("en-US")} unique 2026 cycle initial inspections with a score: ${countAt(12).toLocaleString("en-US")} scored 12, ${countAt(13).toLocaleString("en-US")} scored 13, ${countAt(14).toLocaleString("en-US")} scored 14, and ${countAt(15).toLocaleString("en-US")} scored 15. Grade A is a food-safety grade, not a health claim.`
}

function uninspectedSummary(): string {
  return `Record date ${notYetInspected.recordDateLabel} (${notYetInspected.recordDate}). ${notYetInspected.uninspected.toLocaleString("en-US")} of ${notYetInspected.establishments.toLocaleString("en-US")} establishments have only the January 1, 1900 placeholder inspection date.`
}

function closureSummary(): string {
  const month = closures.months.find((row) => row.month === closures.latestMonth)
  return `Record date ${closures.recordDateLabel} (${closures.recordDate}). Closure events and unique restaurants by month from ${closures.seriesStart} through ${closures.latestMonth}, counted on the active file. ${closures.latestMonth} has ${month?.events.toLocaleString("en-US")} events and ${month?.restaurants.toLocaleString("en-US")} restaurants. Inspections in the file run through ${closures.inspectionMaxLabel}.`
}

export function llmsResearchAddendum(): string {
  return dataPageIndex()
    .filter((page) => page.href !== "/data/nyc-restaurant-health-grade-report" && page.href !== "/data/best-rated-restaurants")
    .map((page) => `  ${page.title}:\n  https://www.eatrealfoodnyc.com${page.href}\n  ${page.summary}`)
    .join("\n")
}
