import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import AboutThisData from "@/components/about-this-data"
import reportData from "@/data/health-grade-report"

const { summary, byBorough, neighborhoods, byType, keyFindings, reportDate } = reportData

const REPORT_URL = "https://www.eatrealfoodnyc.com/data/nyc-restaurant-health-grade-report"
const PAGE_DESCRIPTION = `Analysis of NYC restaurant health inspection grades across all 5 boroughs and ${neighborhoods.totalAnalyzed} neighborhoods. Data sourced from NYC DOHMH Open Data. ${summary.totalGradeA.toLocaleString()} Grade A restaurants tracked across ${summary.totalRestaurants.toLocaleString()} active NYC restaurants.`

export const metadata: Metadata = {
  title: "NYC Restaurant Health Grade Report 2026 — Eat Real Food NYC",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl("/data/nyc-restaurant-health-grade-report"),
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "NYC Restaurant Health Grade Report 2026",
    description: `Data analysis of health inspection grades across ${summary.totalRestaurants.toLocaleString()} NYC restaurants. Which boroughs and neighborhoods have the safest restaurants?`,
    type: "article",
    url: REPORT_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NYC Restaurant Health Grade Report 2026",
      },
    ],
  },
}

function GradeBar({
  gradeAPct,
  gradeBPct,
  gradeCPct,
}: {
  gradeAPct: number
  gradeBPct: number
  gradeCPct: number
}) {
  return (
    <div
      role="img"
      aria-label={`Grade distribution: ${gradeAPct}% Grade A, ${gradeBPct}% Grade B, ${gradeCPct}% Grade C`}
      className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100"
    >
      <div
        className="bg-green-500 transition-all"
        style={{ width: `${gradeAPct}%` }}
        title={`Grade A: ${gradeAPct}%`}
      />
      <div
        className="bg-amber-400 transition-all"
        style={{ width: `${gradeBPct}%` }}
        title={`Grade B: ${gradeBPct}%`}
      />
      <div
        className="bg-orange-500 transition-all"
        style={{ width: `${gradeCPct}%` }}
        title={`Grade C: ${gradeCPct}%`}
      />
    </div>
  )
}

export default function HealthGradeReportPage() {
  const dateModified = new Date().toISOString().split("T")[0]

  const reportJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: "NYC Restaurant Health Grade Report 2026",
        description: `Analysis of health inspection grades for ${summary.totalRestaurants.toLocaleString()} active NYC restaurants across all 5 boroughs and ${neighborhoods.totalAnalyzed} neighborhoods.`,
        url: REPORT_URL,
        creator: {
          "@type": "Organization",
          name: "Eat Real Food NYC",
          url: "https://www.eatrealfoodnyc.com",
        },
        isBasedOn: {
          "@type": "Dataset",
          name: "DOHMH New York City Restaurant Inspection Results",
          url: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
          publisher: {
            "@type": "GovernmentOrganization",
            name: "NYC Department of Health and Mental Hygiene",
          },
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
        temporalCoverage: "2024/2026",
        spatialCoverage: { "@type": "City", name: "New York City" },
        variableMeasured: [
          "Health inspection grade (A/B/C)",
          "Inspection score",
          "Grade distribution by borough",
          "Grade distribution by neighborhood",
          "Grade distribution by restaurant type",
        ],
        dateModified,
      },
      {
        "@type": "Article",
        headline: "NYC Restaurant Health Grade Report 2026",
        description: PAGE_DESCRIPTION,
        url: REPORT_URL,
        author: { "@type": "Organization", name: "Eat Real Food NYC" },
        publisher: {
          "@type": "Organization",
          name: "Eat Real Food NYC",
          url: "https://www.eatrealfoodnyc.com",
        },
        datePublished: "2026-03-01",
        dateModified,
      },
    ],
  }

  const distributionCards = [
    {
      grade: "A",
      count: summary.totalGradeA,
      pct: summary.overallGradeAPct,
      color: "border-green-200 bg-green-50",
      textColor: "text-green-600",
      badgeColor: "bg-green-100 text-green-700",
      meaning: "Excellent food safety (0–13 inspection points)",
    },
    {
      grade: "B",
      count: summary.totalGradeB,
      pct: summary.overallGradeBPct,
      color: "border-amber-200 bg-amber-50",
      textColor: "text-amber-600",
      badgeColor: "bg-amber-100 text-amber-700",
      meaning: "Good but with noted violations (14–27 points)",
    },
    {
      grade: "C",
      count: summary.totalGradeC,
      pct: summary.overallGradeCPct,
      color: "border-orange-200 bg-orange-50",
      textColor: "text-orange-600",
      badgeColor: "bg-orange-100 text-orange-700",
      meaning: "Significant violations (28+ points)",
    },
  ]

  const keyStatItems = [
    {
      stat: summary.totalGradeA.toLocaleString(),
      label: "Grade A restaurants in NYC",
      sub: `${summary.gradeACoverage}% of all restaurants tracked`,
      color: "text-green-600",
    },
    {
      stat: `${summary.overallGradeAPct}%`,
      label: "Of graded restaurants hold Grade A",
      sub: `Based on ${summary.totalGraded.toLocaleString()} graded restaurants`,
      color: "text-jade",
    },
    {
      stat: keyFindings.topBorough,
      label: "Highest Grade A borough",
      sub: `${keyFindings.topBoroughGradeAPct}% of graded restaurants`,
      color: "text-forest",
    },
    {
      stat: keyFindings.topNeighborhood ?? "—",
      label: "Top neighborhood by Grade A rate",
      sub: keyFindings.topNeighborhood
        ? `${keyFindings.topNeighborhoodGradeAPct}% Grade A — ${keyFindings.topNeighborhoodBorough}`
        : "Not enough graded data",
      color: "text-forest",
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
            <span className="text-white/70">Health Grade Report</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="mb-4 inline-block rounded-full bg-sage/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sage">
                <span aria-hidden="true">📊</span> Original Research — {reportDate}
              </span>
              <h1
                className="text-4xl font-bold leading-tight text-white md:text-5xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                NYC Restaurant
                <br />
                <span className="text-sage">Health Grade Report</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
                An analysis of NYC Department of Health inspection grades across{" "}
                {summary.totalRestaurants.toLocaleString()} active restaurants in all 5 boroughs and{" "}
                {neighborhoods.totalAnalyzed} neighborhoods. Data sourced directly from NYC DOHMH
                Open Data.
              </p>
            </div>
            <aside aria-label="Citation" className="flex flex-col gap-2 text-right">
              <p className="text-xs text-white/30">Cite this report</p>
              <p className="rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white/50">
                eatrealfoodnyc.com/data/
                <br />
                nyc-restaurant-health-grade-report
              </p>
            </aside>
          </div>
        </div>
      </header>

      {/* Key findings bar */}
      <section
        aria-label="Key findings"
        className="border-b border-gray-100 bg-white shadow-sm"
      >
        <div className="mx-auto max-w-5xl px-6 py-6">
          <p
            className="mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            KEY FINDINGS
          </p>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        {/* Section 1 — Overall grade distribution */}
        <section aria-labelledby="overall-distribution-heading">
          <h2
            id="overall-distribution-heading"
            className="mb-2 text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Overall grade distribution
          </h2>
          <p className="mb-8 text-base" style={{ color: "var(--color-muted)" }}>
            Across all {summary.totalRestaurants.toLocaleString()} active NYC restaurants in our
            directory, {summary.gradedPct}% have a verified health inspection grade from the NYC
            Department of Health.
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {distributionCards.map((item) => (
              <article
                key={item.grade}
                aria-label={`Grade ${item.grade} statistics`}
                className={`rounded-2xl border ${item.color} p-6 text-center`}
              >
                <span
                  className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${item.badgeColor}`}
                >
                  Grade {item.grade}
                </span>
                <p
                  className={`text-5xl font-bold ${item.textColor}`}
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {item.pct}%
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  {item.count.toLocaleString()} restaurants
                </p>
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: "var(--color-muted)" }}
                >
                  {item.meaning}
                </p>
              </article>
            ))}
          </div>

          <p
            className="rounded-xl bg-gray-50 px-5 py-4 text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            <strong className="text-gray-700">Note on coverage:</strong> {summary.gradedPct}% of our
            directory ({summary.totalGraded.toLocaleString()} restaurants) have a verified
            inspection grade. The remaining {100 - summary.gradedPct}% are either not yet inspected,
            pending a grade, or were not matched in the DOHMH database. Percentages above are
            calculated from graded restaurants only.
          </p>
        </section>

        {/* Section 2 — By borough */}
        <section aria-labelledby="by-borough-heading">
          <h2
            id="by-borough-heading"
            className="mb-2 text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Grade distribution by borough
          </h2>
          <p className="mb-8 text-base" style={{ color: "var(--color-muted)" }}>
            Grade A rates vary across NYC&apos;s five boroughs. {keyFindings.topBorough} leads with{" "}
            {keyFindings.topBoroughGradeAPct}% of graded restaurants holding Grade A, while{" "}
            {keyFindings.bottomBorough} sits at {keyFindings.bottomBoroughGradeAPct}%.
          </p>

          <div
            role="region"
            aria-label="Borough grade distribution table"
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">
                NYC borough health inspection grade distribution, sorted by Grade A percentage.
              </caption>
              <thead>
                <tr className="grid grid-cols-12 bg-forest px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/70">
                  <th scope="col" className="col-span-3 text-left">
                    Borough
                  </th>
                  <th scope="col" className="col-span-2 text-center">
                    Restaurants
                  </th>
                  <th scope="col" className="col-span-2 text-center">
                    Graded
                  </th>
                  <th scope="col" className="col-span-2 text-center">
                    Grade A %
                  </th>
                  <th scope="col" className="col-span-3 text-left">
                    Grade distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...byBorough]
                  .sort((a, b) => b.gradeAPct - a.gradeAPct)
                  .map((b, i) => (
                    <tr
                      key={b.borough}
                      className={`grid grid-cols-12 items-center gap-2 border-b border-gray-50 px-6 py-4 ${
                        i % 2 === 0 ? "" : "bg-gray-50/40"
                      }`}
                    >
                      <th scope="row" className="col-span-3 text-left font-normal">
                        <Link
                          href={`/nyc/${boroughToSlug(b.borough)}/healthy-restaurants`}
                          className="text-sm font-semibold text-forest transition-colors hover:text-jade"
                        >
                          {b.borough}
                        </Link>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {b.hiddenGems} hidden gems
                        </p>
                      </th>
                      <td className="col-span-2 text-center text-sm font-medium text-gray-700">
                        {b.total.toLocaleString()}
                      </td>
                      <td
                        className="col-span-2 text-center text-sm"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {b.graded.toLocaleString()}
                        <span className="ml-1 text-xs">({b.gradedPct}%)</span>
                      </td>
                      <td className="col-span-2 text-center">
                        <span className="text-sm font-bold text-green-600">
                          {b.gradeAPct}%
                        </span>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {b.gradeA.toLocaleString()} restaurants
                        </p>
                      </td>
                      <td className="col-span-3 space-y-1">
                        <GradeBar
                          gradeAPct={b.gradeAPct}
                          gradeBPct={b.gradeBPct}
                          gradeCPct={b.gradeCPct}
                        />
                        <div
                          className="flex gap-2 text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          <span className="text-green-600">A:{b.gradeAPct}%</span>
                          <span className="text-amber-500">B:{b.gradeBPct}%</span>
                          <span className="text-orange-500">C:{b.gradeCPct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 — Top neighborhoods */}
        <section aria-labelledby="top-neighborhoods-heading">
          <h2
            id="top-neighborhoods-heading"
            className="mb-2 text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Top {neighborhoods.topByGradeA.length} neighborhoods by Grade A rate
          </h2>
          <p className="mb-8 text-base" style={{ color: "var(--color-muted)" }}>
            Ranked by Grade A percentage among graded restaurants. Minimum 5 graded restaurants
            required to qualify. {neighborhoods.totalAnalyzed} neighborhoods analyzed.
          </p>

          <div
            role="region"
            aria-label="Top neighborhoods by Grade A rate"
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">
                Top NYC neighborhoods ranked by Grade A inspection rate.
              </caption>
              <thead>
                <tr className="grid grid-cols-12 bg-forest px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/70">
                  <th scope="col" className="col-span-1 text-center">
                    #
                  </th>
                  <th scope="col" className="col-span-4 text-left">
                    Neighborhood
                  </th>
                  <th scope="col" className="col-span-2 hidden text-center sm:block">
                    Total
                  </th>
                  <th scope="col" className="col-span-2 text-center">
                    Grade A
                  </th>
                  <th scope="col" className="col-span-3 text-left">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {neighborhoods.topByGradeA.map((n, i) => (
                  <tr
                    key={`${n.neighborhood}-${n.borough}`}
                    className={`grid grid-cols-12 items-center border-b border-gray-50 px-6 py-4 ${
                      i % 2 === 0 ? "" : "bg-gray-50/40"
                    }`}
                  >
                    <td className="col-span-1 text-center">
                      <span
                        className={`text-sm font-bold ${
                          i < 3 ? "text-amber-500" : ""
                        }`}
                        style={i < 3 ? undefined : { color: "var(--color-muted)" }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <th scope="row" className="col-span-4 text-left font-normal">
                      <Link
                        href={`/nyc/${boroughToSlug(n.borough)}/${neighborhoodToSlug(n.neighborhood)}/healthy-restaurants`}
                        className="text-sm font-semibold text-forest transition-colors hover:text-jade"
                      >
                        {n.neighborhood}
                      </Link>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {n.borough}
                      </p>
                    </th>
                    <td
                      className="col-span-2 hidden text-center text-sm sm:block"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {n.total}
                    </td>
                    <td className="col-span-2 text-center">
                      <span className="text-sm font-bold text-green-600">{n.gradeAPct}%</span>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {n.gradeA} restaurants
                      </p>
                    </td>
                    <td className="col-span-3">
                      <GradeBar
                        gradeAPct={n.gradeAPct}
                        gradeBPct={n.gradeBPct}
                        gradeCPct={n.gradeCPct}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 — Bottom neighborhoods */}
        <section aria-labelledby="bottom-neighborhoods-heading">
          <h2
            id="bottom-neighborhoods-heading"
            className="mb-2 text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Neighborhoods with the lowest Grade A rates
          </h2>
          <p className="mb-6 text-base" style={{ color: "var(--color-muted)" }}>
            These neighborhoods have the lowest proportion of Grade A restaurants among those with
            verified inspection records. Diners in these areas should check individual restaurant
            grades before visiting.
          </p>

          <div
            role="region"
            aria-label="Neighborhoods with the lowest Grade A rates"
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">
                NYC neighborhoods with the lowest Grade A inspection rates.
              </caption>
              <thead>
                <tr className="grid grid-cols-12 bg-gray-700 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/70">
                  <th scope="col" className="col-span-1 text-center">
                    #
                  </th>
                  <th scope="col" className="col-span-5 text-left">
                    Neighborhood
                  </th>
                  <th scope="col" className="col-span-3 text-center">
                    Grade A rate
                  </th>
                  <th scope="col" className="col-span-3 text-center">
                    Grade C count
                  </th>
                </tr>
              </thead>
              <tbody>
                {neighborhoods.bottomByGradeA.map((n, i) => (
                  <tr
                    key={`${n.neighborhood}-${n.borough}`}
                    className={`grid grid-cols-12 items-center border-b border-gray-50 px-6 py-4 ${
                      i % 2 === 0 ? "" : "bg-gray-50/40"
                    }`}
                  >
                    <td
                      className="col-span-1 text-center text-sm font-bold"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {i + 1}
                    </td>
                    <th scope="row" className="col-span-5 text-left font-normal">
                      <Link
                        href={`/nyc/${boroughToSlug(n.borough)}/${neighborhoodToSlug(n.neighborhood)}/healthy-restaurants`}
                        className="text-sm font-semibold text-forest transition-colors hover:text-jade"
                      >
                        {n.neighborhood}
                      </Link>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {n.borough} · {n.total} restaurants
                      </p>
                    </th>
                    <td className="col-span-3 text-center text-sm font-bold text-orange-500">
                      {n.gradeAPct}%
                    </td>
                    <td
                      className="col-span-3 text-center text-sm"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {n.gradeC} restaurants
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            className="mt-4 text-xs leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            A lower Grade A rate does not necessarily indicate unsafe dining — it may reflect a
            higher proportion of ungraded or recently inspected restaurants. Always check individual
            restaurant grades at{" "}
            <Link
              href="/search?grade=A"
              className="text-jade underline underline-offset-2 hover:text-forest"
            >
              eatrealfoodnyc.com/search
            </Link>
            .
          </p>
        </section>

        {/* Section 5 — By restaurant type */}
        {byType.length > 0 && (
          <section aria-labelledby="by-type-heading">
            <h2
              id="by-type-heading"
              className="mb-2 text-3xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Grade A rates by restaurant type
            </h2>
            <p className="mb-8 text-base" style={{ color: "var(--color-muted)" }}>
              Some restaurant categories consistently outperform others on health inspections.
              Minimum 5 graded restaurants required per type.
            </p>

            <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {byType.slice(0, 14).map((t, i) => (
                <li
                  key={t.type}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`w-5 flex-shrink-0 text-xs font-bold ${
                        i < 3 ? "text-amber-500" : ""
                      }`}
                      style={i < 3 ? undefined : { color: "var(--color-muted)" }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-forest">{t.type}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {t.gradeA} of {t.graded} graded
                      </p>
                    </div>
                  </div>
                  <span className="ml-3 flex-shrink-0 text-sm font-bold text-green-600">
                    {t.gradeAPct}%
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Section 6 — Methodology */}
        <section aria-labelledby="methodology-heading">
          <h2
            id="methodology-heading"
            className="mb-6 text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Methodology
          </h2>
          <div className="space-y-4 leading-relaxed text-gray-700">
            <p>
              This report analyzes health inspection data for{" "}
              <strong>{summary.totalRestaurants.toLocaleString()} active NYC restaurants</strong> in
              the Eat Real Food NYC directory. Restaurant listings are sourced from Google Maps
              Platform and filtered to operational businesses only.
            </p>
            <p>
              Health inspection grades (A, B, C) are sourced directly from the{" "}
              <a
                href="https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jade underline underline-offset-2 hover:text-forest"
              >
                NYC Department of Health and Mental Hygiene Open Data portal
              </a>
              . We match inspection records to restaurant listings using restaurant name and
              address. Only the most recent inspection grade per restaurant is used. Grade coverage
              is {summary.gradedPct}% of our directory — the remainder have not been matched to the
              DOHMH database or have not yet received a letter grade.
            </p>
            <p>
              Neighborhood assignments are determined using the official NYC Neighborhood
              Tabulation Area (NTA) GeoJSON boundaries. Each restaurant is assigned to a
              neighborhood using a point-in-polygon algorithm. Borough-level data is aggregated
              from neighborhood data.
            </p>
            <p>
              Grade A percentages in this report are calculated from graded restaurants only
              (excluding ungraded). Total Grade A coverage (as a percentage of all restaurants) is
              shown separately in the borough table.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Browse Grade A restaurants" className="rounded-2xl bg-forest p-8 text-center">
          <h2
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Browse Grade A restaurants near you
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/60">
            Every restaurant in our directory shows its official NYC health inspection grade.
            Filter by grade, borough, neighborhood, and dietary need.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/search?grade=A"
              className="rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
            >
              Browse Grade A restaurants →
            </Link>
            <Link
              href="/nyc/compare"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
            >
              Compare neighborhoods
            </Link>
          </div>
        </section>

        {/* About this data */}
        <AboutThisData variant="guide" lastRefreshed={reportDate} />
      </main>
    </div>
  )
}
