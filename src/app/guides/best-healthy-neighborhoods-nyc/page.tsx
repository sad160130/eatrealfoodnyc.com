import type { Metadata } from "next"
import Link from "next/link"
import FAQSchema from "@/components/faq-schema"
import FAQItem from "@/components/faq-item"
import { getCanonicalUrl } from "@/config/seo"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import GuideCTA from "@/components/guide-cta"
import AboutThisData from "@/components/about-this-data"
import GuideReportNote from "@/components/guide-report-note"
import DataCallout from "@/components/data-callout"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { BOROUGH_NAMES, type BoroughGradeStats, type NeighborhoodGradeRow, getLiveGuideStats } from "@/lib/live-guide-stats"
import { getPublishedDirectoryCounts } from "@/lib/directory-stats"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("best-healthy-neighborhoods-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "How do you rank neighborhoods for healthy dining?",
    answer: "We use a composite score based on four factors: total number of healthy restaurants, average restaurant rating, average NYC health inspection score, and dietary diversity (how many different dietary categories are represented). Neighborhoods are compared within their borough first, then across the city. Data comes from our published restaurant listings and live NYC Department of Health inspection records.",
  },
  {
    question: "Which borough has the healthiest restaurants overall?",
    answer: "On this page, boroughs are compared by the share of published listings whose matched NYC DOHMH grade is A. The paragraph under the ranking method names the borough with the highest share in the current directory.",
  },
  {
    question: "Are health inspection grades a good proxy for food quality?",
    answer: "Health inspection grades measure sanitation and food safety compliance — not taste, nutrition, or ingredient quality. An A-grade restaurant follows proper food handling, temperature control, and pest management practices. This is important for food safety but tells you nothing about whether the food is nutritious or well-prepared. We recommend using health grades as a minimum safety threshold, not a quality indicator.",
  },
  {
    question: "Why are outer-borough neighborhoods underrated?",
    answer: "Media coverage of NYC dining skews heavily toward Manhattan and parts of Brooklyn, creating a visibility gap. Neighborhoods in Queens, the Bronx, and Staten Island often have excellent restaurants that never receive press attention simply because food writers do not visit them regularly. Our data-driven approach surfaces these neighborhoods based on actual restaurant performance rather than media buzz.",
  },
  {
    question: "How often is the neighborhood data updated?",
    answer: "Restaurant listings and ratings are updated regularly as we receive new data. NYC health inspection grades are sourced from the NYC Department of Health and Mental Hygiene open data feed and reflect the most recent inspection results. Neighborhood rankings are recalculated periodically to account for new restaurant openings, closures, and updated inspection scores.",
  },
]

export default async function HealthyNeighborhoodsGuide() {
  const { restaurants, neighborhoods } = await getPublishedDirectoryCounts()
  const stats = await getLiveGuideStats()
  const boroughRank = BOROUGH_NAMES.map((name) => ({ name, ...stats.global.boroughs[name] })).sort(
    (a, b) => b.rate - a.rate || b.total - a.total
  )
  const leadingBorough = boroughRank[0]
  const faqs = GUIDE_FAQS.map((faq) => {
    if (faq.question === "How do you rank neighborhoods for healthy dining?") {
      return {
        ...faq,
        answer: `A neighborhood is included when it has at least 10 published listings. The rank is the share of those listings whose matched NYC DOHMH grade is A. This directory currently has ${restaurants.toLocaleString("en-US")} published restaurants across ${neighborhoods.toLocaleString("en-US")} neighborhoods. Grade A is a food-safety grade, not a nutrition score.`,
      }
    }
    if (faq.question === "Which borough has the healthiest restaurants overall?" && leadingBorough) {
      return {
        ...faq,
        answer: `${leadingBorough.name} has the highest Grade A share of published listings right now: ${leadingBorough.rate}% (${leadingBorough.gradeA.toLocaleString("en-US")} of ${leadingBorough.total.toLocaleString("en-US")}). The other boroughs are listed in the sections below with their three highest neighborhood shares. The compare tool shows the same listings with different sort orders.`,
      }
    }
    return faq
  })
  return (
    <GuideLayout guide={guide}>
      <FAQSchema faqs={faqs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            datePublished: guide.publishedDate,
            dateModified: guide.updatedDate ?? guide.publishedDate,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/guides/${guide.slug}` },
          }),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle="Data-driven rankings of NYC neighborhoods for healthy dining across all five boroughs."
        stats={[
          { label: "Neighborhoods", stat: neighborhoods.toLocaleString("en-US") },
          { label: "Boroughs", stat: "5" },
          { label: "Health scores computed", stat: "Yes" },
          { label: "Live DOHMH data", stat: "Yes" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#how-we-rank", label: "How we rank" },
            { href: "#top-manhattan", label: "Top Manhattan neighborhoods" },
            { href: "#top-brooklyn", label: "Top Brooklyn neighborhoods" },
            { href: "#top-queens", label: "Top Queens neighborhoods" },
            { href: "#bronx-staten-island", label: "Bronx & Staten Island" },
            { href: "#dietary-diversity", label: "Dietary diversity" },
            { href: "#hidden-gem-density", label: "Hidden gem density" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <DataCallout
          heading="NYC Neighborhood Health Rankings — Our Data"
          intro={`We track healthy dining data across ${stats.global.totalUniqueNeighborhoods} NYC neighborhoods. The rankings below are based on three factors: Grade A certification rate, restaurant count, and hidden gem density. Minimum 10 restaurants required to qualify.`}
          dataPoints={[
            {
              stat: stats.neighborhoods.topByGradeA[0]?.neighborhood ?? "",
              label: "#1 neighborhood by Grade A rate",
              source: `${stats.neighborhoods.topByGradeA[0]?.rate ?? 0}% Grade A — ${stats.neighborhoods.topByGradeA[0]?.borough ?? ""}`,
            },
            {
              stat: stats.neighborhoods.topByGradeA[1]?.neighborhood ?? "",
              label: "#2 neighborhood by Grade A rate",
              source: `${stats.neighborhoods.topByGradeA[1]?.rate ?? 0}% Grade A — ${stats.neighborhoods.topByGradeA[1]?.borough ?? ""}`,
            },
            {
              stat: stats.neighborhoods.topByHiddenGems[0]?.neighborhood ?? "—",
              label: "Most hidden gems",
              source: stats.neighborhoods.topByHiddenGems[0]
                ? `${stats.neighborhoods.topByHiddenGems[0].count} undiscovered gems — ${stats.neighborhoods.topByHiddenGems[0].borough}`
                : "Hidden gem data updating",
            },
            {
              stat: stats.global.totalUniqueNeighborhoods.toString(),
              label: "NYC neighborhoods tracked",
              source: "Across all 5 boroughs",
            },
          ]}
          sourceNote="Full neighborhood comparison available at eatrealfoodnyc.com/nyc/compare — ranks all tracked neighborhoods by health score, Grade A rate, dietary diversity, and hidden gem count. Each grade is the latest matched NYC DOHMH record."
          variant="forest"
        />

        <div className="my-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-forest px-6 py-4">
            <p className="text-sm font-semibold text-white">
              Top 10 NYC Neighborhoods by Grade A Rate
            </p>
            <p className="mt-0.5 text-xs text-white/50">
              Eat Real Food NYC data — minimum 10 restaurants — latest matched NYC DOHMH grade
            </p>
          </div>
          <ol className="divide-y divide-gray-50">
            {stats.neighborhoods.topByGradeA.map((n, i) => (
              <li
                key={`${n.neighborhood}-${n.borough}`}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 text-sm font-bold"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest">{n.neighborhood}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {n.borough}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sage">{n.rate}% Grade A</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {n.gradeA} of {n.total} restaurants
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <section id="how-we-rank" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we rank neighborhoods
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The table above ranks neighborhoods that have at least 10 published listings. The share is Grade A listings divided by published listings in that neighborhood. The letter is the matched{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC DOHMH grade
            </Link>
            , not a score this directory assigns. A neighborhood with fewer than 10 published listings is left off the ranking so a handful of Grade A kitchens cannot sit at 100 percent.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            {leadingBorough
              ? `${leadingBorough.name} currently has the highest borough Grade A share: ${leadingBorough.rate}% (${leadingBorough.gradeA.toLocaleString("en-US")} of ${leadingBorough.total.toLocaleString("en-US")} published listings). `
              : ""}
            The borough sections name the three neighborhoods in each borough with the highest share under that same 10-listing floor. Hidden-gem counts are a separate column: a hidden gem is a published restaurant rated 4.5 or higher with fewer than 200 reviews. Use the{" "}
            <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">
              neighborhood comparison tool
            </Link>{" "}
            to sort the same listings another way.
          </p>
        </section>

        <BoroughGradeSection
          id="top-manhattan"
          heading="Top Manhattan neighborhoods"
          borough="Manhattan"
          rows={stats.neighborhoods.topByBorough.Manhattan ?? []}
          boroughStats={stats.global.boroughs.Manhattan}
        />
        <BoroughGradeSection
          id="top-brooklyn"
          heading="Top Brooklyn neighborhoods"
          borough="Brooklyn"
          rows={stats.neighborhoods.topByBorough.Brooklyn ?? []}
          boroughStats={stats.global.boroughs.Brooklyn}
        />
        <BoroughGradeSection
          id="top-queens"
          heading="Top Queens neighborhoods"
          borough="Queens"
          rows={stats.neighborhoods.topByBorough.Queens ?? []}
          boroughStats={stats.global.boroughs.Queens}
        />
        <section id="bronx-staten-island" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Bronx and Staten Island
          </h2>
          <BoroughGradeBlock borough="Bronx" rows={stats.neighborhoods.topByBorough.Bronx ?? []} boroughStats={stats.global.boroughs.Bronx} />
          <BoroughGradeBlock borough="Staten Island" rows={stats.neighborhoods.topByBorough["Staten Island"] ?? []} boroughStats={stats.global.boroughs["Staten Island"]} />
        </section>

        <section id="dietary-diversity" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Dietary tags by neighborhood
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            A dietary tag is applied only when a restaurant identifies that way or has substantial dedicated menu coverage. The lines below are the neighborhood with the most published listings for each tag that has at least one tagged restaurant. They are counts, not a claim that the neighborhood covers every diet.
          </p>
          <ul className="space-y-3 text-lg leading-relaxed text-gray-700">
            {dietLeaders(stats).map((row) => (
              <li key={row.tag}>
                <Link href={`/healthy-restaurants/${row.tag}`} className="font-semibold text-jade hover:text-forest">
                  {row.label}
                </Link>
                {": "}
                <Link href={row.href} className="font-semibold text-jade hover:text-forest">
                  {row.neighborhood}
                </Link>
                {`, ${row.borough} — ${row.count.toLocaleString("en-US")} published ${row.count === 1 ? "listing" : "listings"}.`}
              </li>
            ))}
          </ul>
        </section>

        <section id="hidden-gem-density" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Hidden gems
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            A hidden gem on this site is a published restaurant rated 4.5 or higher with fewer than 200 reviews. The directory currently flags {stats.hiddenGems.total.toLocaleString("en-US")} of them
            {stats.hiddenGems.percentWithGradeA > 0 ? `, and ${stats.hiddenGems.percentWithGradeA}% of those hold Grade A` : ""}.
            {" "}By borough: {gemBoroughSentence(stats.hiddenGems.byBorough)}.
          </p>
          {stats.neighborhoods.topByHiddenGems.length > 0 ? (
            <p className="mb-4 text-lg leading-relaxed text-gray-700">
              The neighborhoods with the most flagged hidden gems are {stats.neighborhoods.topByHiddenGems.slice(0, 5).map((row) => `${row.neighborhood}, ${row.borough} (${row.count})`).join("; ")}.
              {" "}The rule is explained in the{" "}
              <Link href="/guides/hidden-gem-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
                hidden gem restaurant guide
              </Link>
              . The{" "}
              <Link href="/map" className="font-semibold text-jade hover:text-forest">
                map
              </Link>{" "}
              plots the same listings.
            </p>
          ) : null}
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isLast={i === faqs.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideReportNote>
          This ranking uses the directory&apos;s published listings. Neighborhood Tabulation Areas with at least 80 letter-graded restaurants are counted in the
        </GuideReportNote>
        <GuideCTA
          heading="Compare every NYC neighborhood"
          body={`Use our interactive comparison tool to rank ${neighborhoods.toLocaleString("en-US")} ${neighborhoods === 1 ? "neighborhood" : "neighborhoods"} across all five boroughs by the metrics that matter to you: restaurant density, ratings, health scores, and dietary diversity.`}
          primaryLabel="Compare neighborhoods →"
          primaryHref="/nyc/compare"
          secondaryLabel="View map"
          secondaryHref="/map"
        />
      </div>
        <AboutThisData variant="guide" />
    </GuideLayout>
  )
}

function BoroughGradeSection({
  id,
  heading,
  borough,
  rows,
  boroughStats,
}: {
  id: string
  heading: string
  borough: string
  rows: NeighborhoodGradeRow[]
  boroughStats: BoroughGradeStats | undefined
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        {heading}
      </h2>
      <BoroughGradeBlock borough={borough} rows={rows} boroughStats={boroughStats} />
    </section>
  )
}

function BoroughGradeBlock({
  borough,
  rows,
  boroughStats,
}: {
  borough: string
  rows: NeighborhoodGradeRow[]
  boroughStats: BoroughGradeStats | undefined
}) {
  const total = boroughStats?.total ?? 0
  const gradeA = boroughStats?.gradeA ?? 0
  const rate = boroughStats?.rate ?? 0
  return (
    <div className="mb-8">
      <p className="mb-4 text-lg leading-relaxed text-gray-700">
        <Link href={`/nyc/${boroughToSlug(borough)}/healthy-restaurants`} className="font-semibold text-jade hover:text-forest">
          {borough}
        </Link>
        {" "}has {gradeA.toLocaleString("en-US")} Grade A listings out of {total.toLocaleString("en-US")} published ({rate}%).
        {rows.length > 0
          ? " The highest neighborhood shares, among places with at least 10 published listings, are below."
          : " No neighborhood in this borough has 10 published listings yet."}
      </p>
      {rows.length > 0 ? (
        <ul className="space-y-2 text-lg leading-relaxed text-gray-700">
          {rows.map((row) => (
            <li key={`${row.borough}-${row.neighborhood}`}>
              <Link
                href={`/nyc/${boroughToSlug(row.borough)}/${neighborhoodToSlug(row.neighborhood)}/healthy-restaurants`}
                className="font-semibold text-jade hover:text-forest"
              >
                {row.neighborhood}
              </Link>
              {`: ${row.rate}% Grade A (${row.gradeA.toLocaleString("en-US")} of ${row.total.toLocaleString("en-US")} published listings).`}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function dietLeaders(stats: Awaited<ReturnType<typeof getLiveGuideStats>>) {
  return Object.keys(DIET_CONFIG)
    .flatMap((tag) => {
      const top = stats.dietary.topNeighborhoodsByTag[tag]?.[0]
      if (!top || top.count < 1) return []
      const config = DIET_CONFIG[tag as keyof typeof DIET_CONFIG]
      if (!config) return []
      return [{
        tag,
        label: config.label,
        neighborhood: top.neighborhood,
        borough: top.borough,
        count: top.count,
        href: `/nyc/${boroughToSlug(top.borough)}/${neighborhoodToSlug(top.neighborhood)}/healthy-restaurants`,
      }]
    })
    .sort((a, b) => b.count - a.count)
}

function gemBoroughSentence(byBorough: Record<string, number>): string {
  const parts = BOROUGH_NAMES.map((name) => `${name} ${(byBorough[name] ?? 0).toLocaleString("en-US")}`)
  return parts.join(", ")
}
