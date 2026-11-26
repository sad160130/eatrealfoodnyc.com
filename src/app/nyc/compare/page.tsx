import type { Metadata } from "next"
import Link from "next/link"
import ComparePageClient from "@/components/compare-page-client"
import CityGradeBrief from "@/components/city-grade-brief"
import { ntaExtremes, reportBoroughRows } from "@/lib/nta-grade-share"
import { pageMeta } from "@/lib/page-meta"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

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

export const metadata: Metadata = pageMeta({
  path: "/nyc/compare",
  title: "NYC Neighborhood Health Rankings",
  description: "Compare NYC neighborhoods by health inspection grades, average ratings, and dietary diversity. Rank the healthiest dining areas.",
})

export default function ComparePage() {
  const lowestBorough = [...reportBoroughRows()].sort(
    (a, b) => Number.parseFloat(a.share) - Number.parseFloat(b.share)
  )[0]
  const lowestNta = ntaExtremes(1).lowest[0]
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Compare neighborhoods", path: "/nyc/compare" }]} />
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-10">
        <CityGradeBrief
          answer={`${lowestBorough.name} has the lowest borough Grade A share, at ${lowestBorough.share} of letter-graded restaurants, and ${lowestNta.name} is the lowest neighborhood at ${lowestNta.share}.`}
          howTo="The ranking tool below sorts this directory's published neighborhoods by health score, restaurant count, average rating, Grade A share among our listings, or hidden gems. That score is not the citywide NTA table above. Use the city table to see the Health Department's letter-grade share, then open a borough hub to see the published listings."
        />
      </div>
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
