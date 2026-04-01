import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Our Data — NYC Restaurant Health Inspection Grades",
  description:
    "How Eat Real Food NYC sources, verifies, and scores 8,835 restaurants using NYC Health Department data, Google Maps listings, and AI-assisted dietary tagging.",
  alternates: { canonical: getCanonicalUrl("/about/our-data") },
  robots: { index: true, follow: true },
}

export default function OurDataPage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <span>/</span>
            <span className="text-white/80">Our Data</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">METHODOLOGY</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Our Data &<br />
            <span className="text-sage">Methodology</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Every restaurant in our directory is backed by verifiable public data. Here is exactly
            where our data comes from, how we process it, and how we calculate our Health Score.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Data Sources */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">DATA SOURCES</p>
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Where our data comes from
          </h2>
          <div className="space-y-6">
            {[
              {
                icon: "🏥",
                source: "NYC Department of Health and Mental Hygiene (DOHMH)",
                data: "Restaurant inspection grades, numeric inspection scores, inspection dates, violation histories, and business operational status.",
                processing: "We pull the full DOHMH inspection dataset from NYC Open Data and match each record to our restaurant listings by name and address. We retain the most recent inspection grade, the cumulative inspection score, and the inspection date. Restaurants without a current grade are flagged but still included in the directory.",
                coverage: "100% of restaurants in our directory have been cross-referenced against the DOHMH database. Approximately 92% have a current letter grade (A, B, or C). The remaining 8% are pending re-inspection or are newly opened.",
              },
              {
                icon: "📍",
                source: "Google Maps Platform",
                data: "Business names, addresses, latitude/longitude coordinates, user ratings, review counts, phone numbers, websites, working hours, cuisine types, and business photos.",
                processing: "Restaurant listings are sourced via the Google Maps Places API. We geocode every address to obtain precise coordinates for map placement. Ratings and review counts are captured at the time of data collection and represent a snapshot. We do not fabricate or modify user ratings.",
                coverage: "100% of our 8,835 restaurants have verified Google Maps listings. Over 99% have latitude/longitude coordinates. Approximately 85% have phone numbers and 70% have listed websites.",
              },
              {
                icon: "🗺️",
                source: "NYC Neighborhood Tabulation Areas (NTA) GeoJSON",
                data: "Neighborhood boundaries, neighborhood names, and borough assignments for all NYC neighborhoods.",
                processing: "We use the official NYC NTA boundary files from the Department of City Planning to assign every restaurant to its correct neighborhood using point-in-polygon geospatial matching. This ensures that neighborhood pages reflect the actual city-defined boundaries, not approximations.",
                coverage: "100% of geocoded restaurants are assigned to an NTA-defined neighborhood. We cover all 5 boroughs and over 190 distinct neighborhoods.",
              },
              {
                icon: "🤖",
                source: "AI-Assisted Dietary Tagging (Claude API)",
                data: "12 dietary classification tags: vegan, vegetarian, gluten-free, keto, paleo, halal, kosher, dairy-free, nut-free, raw-food, whole-foods, and low-calorie.",
                processing: "We use Claude (claude-haiku-4-5 for bulk classification, claude-sonnet-4-20250514 for quality review) to analyze each restaurant's cuisine type, name, menu indicators, and publicly available information to assign dietary tags. Tags are applied conservatively — a restaurant is only tagged if it genuinely specializes in or is certified for that dietary category. Halal and kosher tags require evidence of certification, not merely menu items that happen to comply. Every AI-generated tag is subject to manual spot-check review.",
                coverage: "100% of restaurants have been processed through the dietary tagging pipeline. Approximately 65% of restaurants have at least one dietary tag. The most common tags are vegetarian-friendly (38%), halal (12%), and gluten-free options (11%).",
              },
            ].map((item) => (
              <div key={item.source} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.source}</h3>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-sage">What data we pull</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700">{item.data}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-sage">How we process it</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700">{item.processing}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-sage">Coverage</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700">{item.coverage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health Score Formula */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SCORING SYSTEM</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we calculate the Health Score
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            Every restaurant in our directory receives a Health Score from 0 to 100. This score is not a subjective
            editorial rating — it is a weighted composite derived from verifiable data points. Here is the exact formula:
          </p>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              {[
                { points: "40", label: "Inspection Grade", detail: "Grade A = 40 pts, Grade B = 25 pts, Grade C = 10 pts, No grade = 0 pts. This is the single most important factor because it reflects the official NYC Health Department assessment of food safety and sanitation." },
                { points: "20", label: "Dietary Diversity", detail: "Up to 20 points based on the number and relevance of dietary tags. Restaurants with verified certifications (halal, kosher) or dedicated dietary options (fully vegan, dedicated gluten-free kitchen) score higher than those with incidental compliance." },
                { points: "10", label: "Hidden Gem Bonus", detail: "10 points awarded to restaurants that qualify as hidden gems. This rewards high-quality restaurants that may not have mass-market visibility but deliver exceptional experiences." },
                { points: "10", label: "User Rating", detail: "Scaled from the Google Maps rating. A 5.0 rating = 10 pts, 4.0 = 6 pts, 3.0 = 2 pts, below 3.0 = 0 pts. Ratings are interpolated linearly within each bracket." },
                { points: "10", label: "Track Record", detail: "Up to 10 points based on the restaurant's inspection history over time. Restaurants that have maintained a Grade A across multiple inspection cycles receive the full 10 points. A single grade drop reduces this proportionally." },
              ].map((item) => (
                <div key={item.label} className="flex gap-4 rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-forest text-lg font-bold text-white">
                    {item.points}
                  </div>
                  <div>
                    <p className="font-semibold text-forest">{item.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-forest/5 p-4">
              <p className="text-center text-sm font-semibold text-forest">
                Maximum possible score: 40 + 20 + 10 + 10 + 10 = <span className="text-lg">100 points</span>
              </p>
            </div>
          </div>
        </section>

        {/* Hidden Gem Criteria */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">HIDDEN GEMS</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we identify hidden gems
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            Hidden gems are restaurants that deliver outstanding quality but have not yet achieved widespread
            recognition. We identify them algorithmically using three strict criteria — all three must be met:
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { criterion: "Rating of 4.5 or higher", detail: "The restaurant must have a Google Maps rating of at least 4.5 out of 5.0, indicating consistently excellent customer experiences." },
              { criterion: "Fewer than 200 reviews", detail: "The restaurant must have fewer than 200 Google Maps reviews, indicating it has not yet reached mass-market awareness." },
              { criterion: "Currently operational", detail: "The restaurant must be confirmed as currently operating. Closed or temporarily shuttered restaurants are excluded." },
            ].map((item) => (
              <div key={item.criterion} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-forest">
                  ✓
                </div>
                <h3 className="text-base font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.criterion}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Update Frequency */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">DATA FRESHNESS</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How often we update our data
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {[
                { frequency: "Weekly", item: "NYC DOHMH inspection grades and scores are refreshed weekly from the NYC Open Data portal to reflect the latest inspection results." },
                { frequency: "Monthly", item: "Google Maps ratings, review counts, and business status (open/closed) are updated monthly to keep our listings current." },
                { frequency: "Quarterly", item: "Dietary tags are re-evaluated quarterly. New restaurants added to the DOHMH database are processed through our full pipeline within 30 days of appearing in the city data." },
                { frequency: "Ongoing", item: "User-submitted corrections are reviewed within 48 hours and applied to the database if verified." },
              ].map((item) => (
                <div key={item.frequency} className="flex gap-4">
                  <span className="flex-shrink-0 rounded-lg bg-sage/10 px-3 py-1 text-xs font-bold uppercase text-forest">
                    {item.frequency}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-700">{item.item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Found an error in our data?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            Our data is only as good as the sources we pull from and the processes we apply. If you spot an
            inaccuracy — a wrong grade, a missing dietary tag, a closed restaurant still listed — we want to know.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
          >
            Report a data issue →
          </Link>
        </section>
      </div>
    </div>
  )
}
