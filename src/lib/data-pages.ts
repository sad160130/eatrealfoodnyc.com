import { FALL_2026_REPORT as REPORT } from "@/data/fall-2026-inspection-report"
import bestRated from "@/data/best-rated-restaurants"

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
  ]
}
