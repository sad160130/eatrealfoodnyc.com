import Link from "next/link"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"

/**
 * One in-body sentence pointing a guide at the fall 2026 inspection report.
 * The lead-in is the guide's own context. The date and the food-safety
 * sentence are the report's, not a new count.
 */
export default function GuideReportNote({ children }: { children: string }) {
  return (
    <p className="mb-8 text-lg leading-relaxed text-gray-700">
      {children}{" "}
      <Link href="/data/nyc-restaurant-health-grade-report" className="font-semibold text-jade hover:text-forest">
        NYC restaurant inspection report
      </Link>
      . {FOOD_SAFETY_SENTENCE} Figures are from NYC Open Data dataset 43nn-pn8j, record date November 13, 2026.
    </p>
  )
}
