import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP } from "@/config/boroughs"
import { DIET_CONFIG, COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { gradeStatsFor } from "@/lib/hub-grade-stats"
import { dietBoroughHubTitle, fitDescription, shortMonth } from "@/lib/seo-titles"
import { getDirectorySnapshot } from "@/lib/directory-snapshot"
import { buildHubItemList, dohmhInspectionDataset } from "@/lib/schema"
import { ANCHOR_TEXT } from "@/lib/internal-links"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import ContextualLinks from "@/components/contextual-links"
import AboutThisData from "@/components/about-this-data"
import { withPartnerStatus } from "@/lib/partner-status-db"
import { formatAverageRating, roundAverage } from "@/lib/ratings"
import { selectTopPicks, TOP_PICKS_EXPLAINER } from "@/lib/top-picks"
import { HubRecord } from "@/components/hub-record"
import { hubStamp } from "@/lib/hub-record"

// This route serves the diet+borough combo pages, e.g. /nyc/brooklyn/vegan-restaurants.
// It lives under the [neighborhood] dynamic segment because Next.js requires a single
// dynamic name per level, and /nyc/[borough]/ already uses [neighborhood] (for the
// /nyc/[borough]/[neighborhood]/healthy-restaurants hubs). The static
// /nyc/[borough]/healthy-restaurants route takes precedence over this dynamic one,
// and bare neighbourhood URLs (no "-restaurants" suffix) fall through to notFound().
export const revalidate = 86400

const SUFFIX = "-restaurants"

function parseCombo(boroughSlug: string, seg: string) {
  if (!seg.endsWith(SUFFIX)) return null
  const tag = seg.slice(0, -SUFFIX.length)
  const boroughName = BOROUGH_MAP[boroughSlug]
  const config = DIET_CONFIG[tag]
  if (!boroughName || !config) return null
  return { boroughName, tag, config }
}

export async function generateStaticParams() {
  const params: Array<{ borough: string; neighborhood: string }> = []
  for (const tag of Object.keys(DIET_CONFIG)) {
    const rows = await prisma.restaurant.groupBy({
      by: ["borough"],
      where: {
        business_status: "OPERATIONAL",
        is_published: true,
        dietary_tags: { contains: tag },
        borough: { not: null },
      },
      having: { id: { _count: { gte: COMBO_MIN_RESTAURANTS } } },
    })
    for (const r of rows) {
      if (r.borough) params.push({ borough: boroughToSlug(r.borough), neighborhood: `${tag}${SUFFIX}` })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}): Promise<Metadata> {
  const { borough: boroughSlug, neighborhood: seg } = await params
  const combo = parseCombo(boroughSlug, seg)
  if (!combo) return { title: "Not Found" }
  const { boroughName, tag, config } = combo

  const stats = await gradeStatsFor({
    borough: boroughName,
    dietary_tags: { contains: tag },
  })
  const snapshot = await getDirectorySnapshot()
  const year = (snapshot.lastPublishAt ?? new Date()).getUTCFullYear()
  const title = dietBoroughHubTitle(config.label, boroughName, stats.count, stats.gradeA, year)
  const dataMonth = shortMonth(snapshot.latestInspectionAt)
  const description = fitDescription(
    [`${stats.count.toLocaleString("en-US")} ${config.label.toLowerCase()} restaurants in ${boroughName}, NYC, ${stats.gradeA.toLocaleString("en-US")} with a NYC DOHMH Grade A.`],
    [
      dataMonth ? `Compare inspection scores, ratings and hours by neighborhood. Data as of ${dataMonth}.` : "Compare inspection scores, ratings and hours by neighborhood.",
      dataMonth ? `Data as of ${dataMonth}.` : "",
    ].filter(Boolean)
  )
  const canonicalUrl = getCanonicalUrl(`/nyc/${boroughSlug}/${tag}${SUFFIX}`)

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${config.label} Restaurants in ${boroughName}, NYC` }],
    },
    robots: { index: true, follow: true },
  }
}

export default async function DietBoroughPage({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}) {
  const { borough: boroughSlug, neighborhood: seg } = await params
  const combo = parseCombo(boroughSlug, seg)
  if (!combo) notFound()
  const { boroughName, tag, config } = combo

  const baseWhere = {
    borough: boroughName,
    business_status: "OPERATIONAL",
    is_published: true,
    dietary_tags: { contains: tag },
  }

  const [restaurantRows, totalCount, gradeACount, agg] = await Promise.all([
    prisma.restaurant.findMany({
      where: baseWhere,
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
    }),
    prisma.restaurant.count({ where: baseWhere }),
    prisma.restaurant.count({ where: { ...baseWhere, inspection_grade: "A" } }),
    prisma.restaurant.aggregate({
      where: { ...baseWhere, rating: { gt: 0 } },
      _avg: { rating: true },
    }),
  ])
  const restaurants = selectTopPicks(await withPartnerStatus(restaurantRows), 48)

  // Gate thin pages — never index a doorway page with too few listings.
  if (totalCount < COMBO_MIN_RESTAURANTS) notFound()

  const avgRating = roundAverage(agg._avg.rating)
  const dietLower = config.label.toLowerCase()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const pageUrl = `${siteUrl}/nyc/${boroughSlug}/${tag}${SUFFIX}`

  // Combo-specific FAQs (real, data-driven — information gain over the diet hub),
  // padded with two evergreen diet FAQs from config for depth.
  const comboFaqs = [
    {
      question: `How many ${dietLower} restaurants are in ${boroughName}?`,
      answer: `This directory lists ${totalCount} published ${dietLower} restaurants in ${boroughName}. ${gradeACount} hold Grade A. A listing with no letter is not described as graded.`,
    },
    {
      question: `Do ${dietLower} restaurants in ${boroughName} have NYC health grades?`,
      answer:
        gradeACount > 0
          ? `${gradeACount} of the ${totalCount} published ${dietLower} restaurants in ${boroughName} hold Grade A. The rest are not described as Grade A.`
          : `None of the ${totalCount} published ${dietLower} restaurants in ${boroughName} holds Grade A.`,
    },
    ...(avgRating != null
      ? [{
          question: `What's the average rating of ${dietLower} restaurants in ${boroughName}?`,
          answer: `The rated ${dietLower} restaurants in ${boroughName} in our directory average ${avgRating.toFixed(1)}/5 across community reviews sourced from Google Maps. Unrated listings are left out of that average.`,
        }]
      : []),
  ]

  const itemListJsonLd = buildHubItemList({
    name: `${config.label} Restaurants in ${boroughName}, NYC`,
    description: `${totalCount} ${dietLower} restaurants in ${boroughName}, New York City, with NYC health inspection grades.`,
    siteUrl,
    restaurants: restaurants.slice(0, 10),
  })

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${config.label} Restaurants in ${boroughName}, NYC — Health Grade Data`,
    description: `Health inspection grades, dietary classification, and ratings for ${totalCount} ${dietLower} restaurants in ${boroughName}, New York City. Sourced from NYC DOHMH Open Data and Eat Real Food NYC editorial classification.`,
    url: pageUrl,
    creator: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: dohmhInspectionDataset(),
    temporalCoverage: "2024/2026",
    spatialCoverage: { "@type": "Place", name: `${boroughName}, New York City` },
    variableMeasured: [`${config.label} classification`, "Health inspection grade", "Community rating", "Neighborhood"],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([itemListJsonLd, datasetJsonLd]) }}
      />

      {/* ─── HERO ─── */}
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb
            items={[
              { label: "Healthy Restaurants", href: "/healthy-restaurants" },
              { label: boroughName, href: `/nyc/${boroughSlug}/healthy-restaurants` },
              { label: `${config.label} Restaurants` },
            ]}
          />

          <p className="eyebrow mt-6">
            {config.label} <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>{boroughName}, NYC</span>
          </p>

          <h1 className="display-1 mt-3">
            {config.label} restaurants in {boroughName}
          </h1>
          <HubRecord
            place={boroughName}
            urlPath={`/nyc/${boroughSlug}/${tag}-restaurants`}
            total={totalCount}
            gradeA={gradeACount}
            updated={hubStamp(restaurants)}
            mode="diet"
            dietLabel={config.label}
          />

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>{totalCount.toLocaleString()}</span> {dietLower} {totalCount === 1 ? "restaurant" : "restaurants"} in {boroughName}. {gradeACount.toLocaleString()} hold Grade A. Listings without a letter are not counted as Grade A.
          </p>

          {/* What it means — quiet editorial pull */}
          <aside
            className="mt-6 border-l pl-5 py-1"
            style={{
              borderLeftWidth: "2px",
              borderLeftColor: "var(--color-jade)",
              maxWidth: "62ch",
            }}
          >
            <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
              What {dietLower} means here
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.0625rem",
                fontStyle: "italic",
                lineHeight: 1.55,
                color: "var(--color-text)",
              }}
            >
              {config.whatIs}
            </p>
          </aside>

          {/* Inline stats */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Restaurants</span>
              <span className="tabular font-semibold">{totalCount.toLocaleString()}</span>
            </span>
            {gradeACount > 0 && (
              <>
                <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
                <span style={{ color: "var(--color-text)" }}>
                  <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Grade A</span>
                  <span className="tabular font-semibold">{gradeACount.toLocaleString()}</span>
                </span>
              </>
            )}
            {avgRating != null && (
              <>
                <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
                <span style={{ color: "var(--color-text)" }}>
                  <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Avg rating</span>
                  <span className="tabular font-semibold">{formatAverageRating(avgRating)}</span>
                </span>
              </>
            )}
          </div>

          {/* Quick filters — homepage callout pattern */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href={`/nyc/${boroughSlug}/grade-a-restaurants`} className="callout">
              <span className="callout-initial">A<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Grade A only</span>
            </Link>
            <Link href="/guides/hidden-gem-restaurants-nyc" className="callout">
              <span className="callout-initial" style={{ color: "var(--color-amber)" }}>✦</span>
              <span className="callout-label">Hidden gems</span>
            </Link>
            <Link href={`/healthy-restaurants/${tag}`} className="callout">
              <span className="callout-initial">All<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">{config.label} citywide</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* ─── Listings ─── */}
        <div>
          <p className="eyebrow">Listings</p>
          <h2 className="h2-serif mt-2">Top {Math.min(restaurants.length, 48)} {dietLower} spots in {boroughName}</h2>
          <p className="dek mt-2" style={{ fontSize: "0.95rem" }}>
            {TOP_PICKS_EXPLAINER}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
            ))}
          </div>
        </div>
      </main>

      {/* Contextual links */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <p
          className="mb-4"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--color-text)",
            maxWidth: "62ch",
          }}
        >
          Looking beyond {dietLower} options in {boroughName}? Browse the full{" "}
          <Link
            href={`/nyc/${boroughSlug}/healthy-restaurants`}
            style={{ color: "var(--color-jade)", textDecoration: "underline", textUnderlineOffset: "2px" }}
          >
            healthy restaurants in {boroughName}
          </Link>{" "}
          directory, or explore {dietLower} spots across the rest of the city.
        </p>
        <ContextualLinks
          intro="Related pages:"
          links={[
            [ANCHOR_TEXT.boroughHub(boroughName), `/nyc/${boroughSlug}/healthy-restaurants`],
            [ANCHOR_TEXT.dietHub(config.label), `/healthy-restaurants/${tag}`],
            [ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"],
          ]}
        />
      </div>

      {/* About this data */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <AboutThisData
          variant="hub"
          restaurantCount={totalCount}
          gradeACount={gradeACount}
         
          borough={boroughName}
          dietaryTag={config.label}
          dietaryCount={totalCount}
        />
      </div>

      {/* FAQ */}
      <FAQSection
        faqs={comboFaqs}
        heading={`${config.label} Restaurants in ${boroughName} — FAQ`}
        subheading={`Common questions about finding ${dietLower} restaurants in ${boroughName}, NYC.`}
      />
    </>
  )
}
