import type { Metadata } from "next"
import ComparePageClient from "@/components/compare-page-client"

export const metadata: Metadata = {
  title: "NYC Neighborhood Health Rankings — Compare Healthy Dining",
  description: "Compare NYC neighborhoods by health inspection grades, average ratings, and dietary diversity. Rank the healthiest neighborhoods for dining across all 5 boroughs.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://www.eatrealfoodnyc.com/nyc/compare",
  },
}

export default function ComparePage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <ComparePageClient />
    </div>
  )
}
