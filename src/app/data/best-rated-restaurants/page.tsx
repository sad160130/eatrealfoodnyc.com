import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getCanonicalUrl } from "@/config/seo"
import AboutThisData from "@/components/about-this-data"
import {
  parseDietaryTags,
  formatDietaryTag,
  neighborhoodToSlug,
  boroughToSlug,
} from "@/lib/utils"
import bestRatedData, { type RestaurantRow } from "@/data/best-rated-restaurants"

const REPORT_URL = "https://www.eatrealfoodnyc.com/data/best-rated-restaurants"

const PAGE_DESCRIPTION = `${bestRatedData.summary.total} NYC restaurants rated ${bestRatedData.algorithm.qualifyingRating}+ stars across all 5 boroughs. ${bestRatedData.summary.eliteCount} reach our elite ${bestRatedData.algorithm.eliteRating}+ tier. Data-driven ranking of NYC's highest-rated healthy restaurants. Updated ${bestRatedData.reportDate}.`

export const metadata: Metadata = {
  title: `NYC's Best-Rated Healthy Restaurants 2026 — ${bestRatedData.summary.total} Top-Rated Spots`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl("/data/best-rated-restaurants") },
  robots: { index: true, follow: true },
  openGraph: {
    title: `NYC's Best-Rated Healthy Restaurants 2026 — ${bestRatedData.summary.total} Top-Rated Spots`,
    description: PAGE_DESCRIPTION,
    type: "article",
    url: REPORT_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NYC's Best-Rated Healthy Restaurants 2026",
      },
    ],
  },
}

const {
  summary,
  byBorough,
  byNeighborhood,
  byTag,
  featuredByBorough,
  perfectScore,
  eliteList,
  reportDate,
  algorithm,
} = bestRatedData

function GradeChip({ grade }: { grade: string | null }) {
  if (!grade) return null
  const colors: Record<string, string> = {
    A: "bg-green-50 text-green-700 border-green-200",
    B: "bg-amber-50 text-amber-700 border-amber-200",
    C: "bg-orange-50 text-orange-700 border-orange-200",
  }
  return (
    <span
      aria-label={`NYC Department of Health inspection grade ${grade}`}
      className={`rounded-full border px-2 py-0.5 text-xs font-bold ${
        colors[grade] ?? "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      Grade {grade}
    </span>
  )
}

function FeaturedCard({ r, rank }: { r: RestaurantRow; rank?: number }) {
  const tags = parseDietaryTags(r.dietary_tags).slice(0, 2)
  const hoodSlug = r.neighborhood ? neighborhoodToSlug(r.neighborhood) : null
  const boroughSlug = r.borough ? boroughToSlug(r.borough) : null

  return (
    <article
      aria-label={`${r.name} — rated ${r.rating} out of 5 stars`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-amber/30 hover:shadow-md"
    >
      <Link
        href={`/restaurants/${r.slug}`}
        className="block"
        aria-label={`View ${r.name}`}
      >
        <div className="relative h-44 flex-shrink-0 bg-gradient-to-br from-amber/10 to-sage/10">
          {r.photo ? (
            <Image
              src={r.photo}
              alt={`${r.name} — best-rated restaurant in ${r.neighborhood ?? "NYC"}`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-4xl">⭐</span>
            </div>
          )}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber px-2.5 py-1 text-xs font-bold text-forest shadow-sm">
            <span aria-hidden="true">⭐</span>
            <span>
              Top-Rated{rank ? ` #${rank}` : ""}
            </span>
          </div>
          {r.inspection_grade && (
            <div className="absolute right-3 top-3">
              <GradeChip grade={r.inspection_grade} />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <h3
          className="text-base font-bold text-forest transition-colors group-hover:text-jade"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <Link href={`/restaurants/${r.slug}`}>{r.name}</Link>
        </h3>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
          {r.neighborhood && r.borough && hoodSlug && boroughSlug ? (
            <Link
              href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
              className="hover:text-jade"
            >
              {r.neighborhood}, {r.borough}
            </Link>
          ) : (
            r.borough ?? "New York City"
          )}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span
            aria-label={`Rated ${r.rating} out of 5 from ${r.reviews?.toLocaleString()} reviews`}
            className="flex items-center gap-1 text-sm font-bold text-amber-500"
          >
            <span aria-hidden="true">★</span>
            <span>{r.rating}</span>
          </span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            ({r.reviews?.toLocaleString()} reviews)
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {r.type && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {r.type}
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium text-jade"
            >
              {formatDietaryTag(tag)}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function BestRatedRestaurantsPage() {
  const dateModified = new Date().toISOString().split("T")[0]
  const boroughOrder = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

  const reportJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: "NYC Best-Rated Healthy Restaurants Index 2026",
        description: `${summary.total} NYC healthy restaurants rated ${algorithm.qualifyingRating}+ stars from community reviews. ${summary.eliteCount} qualify for the elite ${algorithm.eliteRating}+ tier. ${summary.perfectScoreCount} hold a perfect 5.0 rating.`,
        url: REPORT_URL,
        creator: {
          "@type": "Organization",
          name: "Eat Real Food NYC",
          url: "https://www.eatrealfoodnyc.com",
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
        temporalCoverage: "2024/2026",
        spatialCoverage: { "@type": "City", name: "New York City" },
        variableMeasured: [
          `Community rating (minimum ${algorithm.qualifyingRating})`,
          `Elite rating tier (minimum ${algorithm.eliteRating})`,
          "Review count",
          "Health inspection grade",
          "Dietary certifications",
          "Operational status",
        ],
        dateModified,
      },
      {
        "@type": "Article",
        headline: `NYC's Best-Rated Healthy Restaurants 2026 — ${summary.total} Top-Rated Spots`,
        description: PAGE_DESCRIPTION,
        url: REPORT_URL,
        author: { "@type": "Organization", name: "Eat Real Food NYC" },
        publisher: {
          "@type": "Organization",
          name: "Eat Real Food NYC",
          url: "https://www.eatrealfoodnyc.com",
        },
        datePublished: "2026-05-01",
        dateModified,
      },
    ],
  }

  const keyStatItems = [
    {
      stat: summary.total.toLocaleString(),
      label: "Best-rated restaurants in NYC",
      sub: `Rating ≥ ${algorithm.qualifyingRating} · All 5 boroughs`,
      color: "text-amber-500",
    },
    {
      stat: `★ ${summary.avgRating ?? "—"}`,
      label: "Average rating across this set",
      sub: `Qualifying floor: ★${algorithm.qualifyingRating}`,
      color: "text-amber-500",
    },
    {
      stat: summary.eliteCount.toLocaleString(),
      label: `Reach our elite ★${algorithm.eliteRating}+ tier`,
      sub: `${Math.round((summary.eliteCount / summary.total) * 100)}% of qualifying restaurants`,
      color: "text-forest",
    },
    {
      stat: `${summary.gradeAPct}%`,
      label: "Hold a Grade A inspection",
      sub: `${summary.withGradeA.toLocaleString()} Grade A holders`,
      color: "text-green-600",
    },
  ]

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportJsonLd) }}
      />

      {/* Hero */}
      <header className="bg-forest px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-white/40"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/70">Data Reports</span>
            <span aria-hidden="true">/</span>
            <span className="text-white/70">Best-Rated Restaurants</span>
          </nav>
          <span className="mb-4 inline-block rounded-full bg-amber/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber">
            <span aria-hidden="true">⭐</span> Original Research — {reportDate}
          </span>
          <h1
            className="text-4xl font-bold leading-tight text-white md:text-5xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            NYC&apos;s Best-Rated
            <br />
            <span className="text-amber">Healthy Restaurants</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
            {summary.total} NYC restaurants rated {algorithm.qualifyingRating}+ stars across all 5
            boroughs and {byNeighborhood.length}+ neighborhoods. Ranked by community rating with
            review-count tiebreakers. Sourced from our directory of active NYC healthy restaurants.
          </p>
        </div>
      </header>

      {/* Key stats */}
      <section
        aria-label="Index summary"
        className="border-b border-gray-100 bg-white shadow-sm"
      >
        <div className="mx-auto max-w-5xl px-6 py-6">
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {keyStatItems.map((item) => (
              <div key={item.label} className="text-center">
                <dt className="sr-only">{item.label}</dt>
                <dd
                  className={`text-2xl font-bold md:text-3xl ${item.color}`}
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {item.stat}
                </dd>
                <p
                  className="mt-1 text-xs leading-tight"
                  style={{ color: "var(--color-muted)" }}
                >
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{item.sub}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-16 px-6 py-12">
        {/* Methodology */}
        <section aria-labelledby="methodology-heading">
          <div className="rounded-2xl border border-amber/20 bg-amber/5 p-6">
            <h2
              id="methodology-heading"
              className="mb-3 text-xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              How this index works
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              A restaurant qualifies for this index when it meets all three criteria. Within the
              qualifying set, restaurants are ranked by community rating, with review count as the
              tiebreaker.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  criterion: `Rating ≥ ${algorithm.qualifyingRating} stars`,
                  icon: "⭐",
                  detail: `Above the ${algorithm.qualifyingRating}-star floor — consistently excellent customer experiences across reviews.`,
                },
                {
                  criterion: `Elite tier: ${algorithm.eliteRating}+`,
                  icon: "🏆",
                  detail: `${summary.eliteCount} restaurants pass the elite ${algorithm.eliteRating}-star threshold — a much higher bar.`,
                },
                {
                  criterion: "Currently operational",
                  icon: "✅",
                  detail: "Open and serving customers — not closed restaurants with stale legacy reviews.",
                },
              ].map((item) => (
                <div key={item.criterion} className="rounded-xl border border-amber/10 bg-white p-4">
                  <span aria-hidden="true" className="text-2xl">
                    {item.icon}
                  </span>
                  <p className="mt-2 text-sm font-bold text-forest">{item.criterion}</p>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="mt-4 text-xs leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Ratings are sourced from Google Maps community reviews. Grades and operational status
              are sourced from the NYC DOHMH Open Data portal. The index regenerates whenever our
              data is refreshed; current figures are as of {reportDate}.
            </p>
          </div>
        </section>

        {/* By borough summary */}
        <section aria-labelledby="by-borough-heading">
          <h2
            id="by-borough-heading"
            className="mb-2 text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Best-rated restaurants by borough
          </h2>
          <p className="mb-8 text-base" style={{ color: "var(--color-muted)" }}>
            Manhattan dominates by sheer count, but every borough surfaces standout restaurants.
            Average rating across the qualifying set sits remarkably tight across all five
            boroughs — quality is everywhere, distribution is uneven.
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boroughOrder.map((borough) => {
              const b = byBorough.find((x) => x.borough === borough)
              if (!b) return null
              return (
                <article
                  key={borough}
                  aria-label={`${borough} summary`}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3
                        className="text-lg font-bold text-forest"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {borough}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        Avg rating ★ {b.avgRating ?? "—"} · {b.elite} elite ({b.elitePct}%)
                      </p>
                    </div>
                    <span
                      className="text-3xl font-bold text-amber-500"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {b.count}
                    </span>
                  </div>

                  <p className="mb-3 text-xs" style={{ color: "var(--color-muted)" }}>
                    Grade A holders: <strong className="text-green-600">{b.gradeA}</strong> ({b.gradeAPct}%)
                  </p>

                  {b.topRestaurant && (
                    <div className="border-t border-gray-50 pt-3">
                      <p
                        className="mb-1 text-xs"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Top-rated in {borough}:
                      </p>
                      <Link
                        href={`/restaurants/${b.topRestaurant.slug}`}
                        className="text-sm font-semibold text-jade transition-colors hover:text-forest"
                      >
                        {b.topRestaurant.name}
                      </Link>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        ★ {b.topRestaurant.rating} · {b.topRestaurant.reviews?.toLocaleString()} reviews
                        {b.topRestaurant.neighborhood ? ` · ${b.topRestaurant.neighborhood}` : ""}
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/nyc/${boroughToSlug(borough)}/healthy-restaurants`}
                    className="mt-3 inline-block text-xs font-semibold text-jade transition-colors hover:text-forest"
                  >
                    Browse {borough} restaurants →
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        {/* Featured top 5 per borough */}
        {boroughOrder.map((borough) => {
          const featured = featuredByBorough[borough]
          if (!featured || featured.length === 0) return null
          return (
            <section key={borough} aria-label={`Top-rated in ${borough}`}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    className="text-2xl font-bold text-forest"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Top-rated healthy restaurants in {borough}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                    Ranked by rating, with review count as the tiebreaker.
                  </p>
                </div>
                <Link
                  href={`/nyc/${boroughToSlug(borough)}/healthy-restaurants`}
                  className="flex-shrink-0 rounded-xl border border-sage/30 px-4 py-2 text-xs font-semibold text-jade transition-colors hover:border-jade"
                >
                  All {borough} restaurants →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {featured.map((r, i) => (
                  <FeaturedCard key={r.slug} r={r} rank={i + 1} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Top neighborhoods */}
        {byNeighborhood.length > 0 && (
          <section aria-labelledby="top-neighborhoods-heading">
            <h2
              id="top-neighborhoods-heading"
              className="mb-2 text-3xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Neighborhoods with the most best-rated restaurants
            </h2>
            <p className="mb-6 text-base" style={{ color: "var(--color-muted)" }}>
              Highest concentration of {algorithm.qualifyingRating}+ rated restaurants. Minimum 3
              restaurants required to qualify for this list.
            </p>
            <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {byNeighborhood.map((n, i) => {
                if (!n.borough || !n.neighborhood) return null
                return (
                  <li key={`${n.neighborhood}-${n.borough}`}>
                    <Link
                      href={`/nyc/${boroughToSlug(n.borough)}/${neighborhoodToSlug(n.neighborhood)}/healthy-restaurants`}
                      className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-all hover:border-amber/30 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 text-sm font-bold ${i < 3 ? "text-amber-500" : ""}`}
                          style={i < 3 ? undefined : { color: "var(--color-muted)" }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-forest transition-colors group-hover:text-jade">
                            {n.neighborhood}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                            {n.borough}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-500">
                          <span aria-hidden="true">⭐</span> {n.count}
                        </span>
                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                          best-rated
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Perfect 5.0 */}
        {perfectScore.length > 0 && (
          <section aria-labelledby="perfect-score-heading">
            <h2
              id="perfect-score-heading"
              className="mb-2 text-3xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Perfect 5.0 — the rarest tier
            </h2>
            <p className="mb-6 text-base" style={{ color: "var(--color-muted)" }}>
              {perfectScore.length} restaurants in our directory hold a perfect 5.0 rating across
              every review they have received. A 5.0 over a meaningful number of reviews is almost
              unheard of — these are exceptional outliers.
            </p>
            <div
              role="region"
              aria-label="Restaurants with a perfect 5.0 rating"
              className="overflow-hidden rounded-2xl border border-amber/20 bg-white shadow-sm"
            >
              <table className="w-full text-sm">
                <caption className="sr-only">
                  NYC restaurants with a perfect 5.0 community rating.
                </caption>
                <thead>
                  <tr className="grid grid-cols-12 bg-amber/80 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-forest">
                    <th scope="col" className="col-span-5 text-left">
                      Restaurant
                    </th>
                    <th scope="col" className="col-span-3 hidden text-center sm:block">
                      Location
                    </th>
                    <th scope="col" className="col-span-2 text-center">
                      Reviews
                    </th>
                    <th scope="col" className="col-span-2 hidden text-center md:block">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {perfectScore.map((r, i) => (
                    <tr
                      key={r.slug}
                      className={`grid grid-cols-12 items-center border-b border-amber/10 px-6 py-4 ${
                        i % 2 === 0 ? "" : "bg-amber/5"
                      }`}
                    >
                      <th scope="row" className="col-span-5 text-left font-normal">
                        <Link
                          href={`/restaurants/${r.slug}`}
                          className="text-sm font-semibold text-forest transition-colors hover:text-jade"
                        >
                          {r.name}
                        </Link>
                        <p className="text-xs font-bold text-amber-600">
                          <span aria-hidden="true">★</span> 5.0 perfect
                        </p>
                      </th>
                      <td
                        className="col-span-3 hidden text-sm sm:block"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {r.neighborhood ?? "—"}, {r.borough ?? "—"}
                      </td>
                      <td
                        className="col-span-2 text-center text-sm"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {r.reviews?.toLocaleString()}
                      </td>
                      <td className="col-span-2 hidden text-center md:block">
                        <GradeChip grade={r.inspection_grade} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Elite list */}
        {eliteList.length > 0 && (
          <section aria-labelledby="elite-list-heading">
            <h2
              id="elite-list-heading"
              className="mb-2 text-3xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              The elite {algorithm.eliteRating}+ tier
            </h2>
            <p className="mb-6 text-base" style={{ color: "var(--color-muted)" }}>
              The top {Math.min(eliteList.length, 25)} restaurants in the elite tier (rating ≥{" "}
              {algorithm.eliteRating}), sorted by rating then by review count. Across NYC, only{" "}
              {summary.eliteCount} restaurants pass this bar.
            </p>
            <ol className="space-y-3">
              {eliteList.map((r, i) => (
                <li key={r.slug}>
                  <Link
                    href={`/restaurants/${r.slug}`}
                    className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-all hover:border-amber/30 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 text-sm font-bold ${i < 3 ? "text-amber-500" : ""}`}
                        style={i < 3 ? undefined : { color: "var(--color-muted)" }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-forest transition-colors group-hover:text-jade">
                          {r.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                          {r.neighborhood ?? "—"}, {r.borough ?? "—"}
                          {r.type ? ` · ${r.type}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-amber-500">
                        <span aria-hidden="true">★</span> {r.rating}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {r.reviews?.toLocaleString()} reviews
                      </span>
                      <GradeChip grade={r.inspection_grade} />
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* By dietary tag */}
        {byTag.length > 0 && (
          <section aria-labelledby="by-tag-heading">
            <h2
              id="by-tag-heading"
              className="mb-2 text-3xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Best-rated by dietary category
            </h2>
            <p className="mb-6 text-base" style={{ color: "var(--color-muted)" }}>
              How many qualifying restaurants carry each dietary certification.
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {byTag.map((t) => (
                <Link
                  key={t.tag}
                  href={`/healthy-restaurants/${t.tag}`}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-all hover:border-sage/30"
                >
                  <p className="text-sm font-semibold capitalize text-forest transition-colors group-hover:text-jade">
                    {t.tag.replace("-", " ")}
                  </p>
                  <span className="text-sm font-bold text-amber-500">
                    <span aria-hidden="true">⭐</span> {t.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related reports */}
        <section aria-labelledby="related-heading">
          <h2
            id="related-heading"
            className="mb-4 text-xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Related data reports
          </h2>
          <Link
            href="/data/nyc-restaurant-health-grade-report"
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-sage/30 hover:shadow-md"
          >
            <span aria-hidden="true" className="text-3xl">📊</span>
            <div>
              <p className="font-bold text-forest transition-colors group-hover:text-jade">
                NYC Restaurant Health Grade Report
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
                Analysis of NYC DOHMH inspection grades by borough, neighborhood, and cuisine type.
              </p>
            </div>
            <span className="ml-auto flex-shrink-0 text-sm font-semibold text-jade">Read →</span>
          </Link>
        </section>

        {/* CTA */}
        <section aria-label="Browse best-rated restaurants" className="rounded-2xl bg-forest p-8 text-center">
          <h2
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Explore all {summary.total} best-rated restaurants
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/60">
            Filter by borough, dietary need, or neighborhood to find your next standout restaurant
            in NYC.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/search?grade=A"
              className="rounded-xl bg-amber px-8 py-4 font-semibold text-forest transition-all hover:bg-white hover:text-forest"
            >
              Browse Grade A restaurants →
            </Link>
            <Link
              href="/data/nyc-restaurant-health-grade-report"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
            >
              NYC Health Grade Report
            </Link>
          </div>
        </section>

        {/* About this data */}
        <AboutThisData variant="guide" lastRefreshed={reportDate} />
      </main>
    </div>
  )
}
