import type { Metadata } from "next"
import Link from "next/link"
import ComparePageClient from "@/components/compare-page-client"

// §6 equity routing: /nyc/compare is a high-inbound internal hub — pass that
// equity to all five borough money pages (incl. Staten Island, previously orphaned).
// Server-rendered so the links live in the initial HTML (skill rule #9).
const BOROUGH_LINKS: Array<[string, string]> = [
  ["Manhattan", "manhattan"],
  ["Brooklyn", "brooklyn"],
  ["Queens", "queens"],
  ["Bronx", "bronx"],
  ["Staten Island", "staten-island"],
]

export const metadata: Metadata = {
  title: "NYC Neighborhood Health Rankings — Compare Healthy Dining",
  description: "Compare NYC neighborhoods by health inspection grades, average ratings, and dietary diversity. Rank the healthiest dining areas.",
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

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="mb-4 font-serif text-xl font-bold text-forest">
          Explore healthy restaurants by borough
        </h2>
        <div className="flex flex-wrap gap-3">
          {BOROUGH_LINKS.map(([label, slug]) => (
            <Link
              key={slug}
              href={`/nyc/${slug}/healthy-restaurants`}
              className="rounded-full border border-sage/30 px-4 py-2 text-sm font-medium text-jade transition-colors hover:border-jade hover:text-forest"
            >
              healthy restaurants in {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
