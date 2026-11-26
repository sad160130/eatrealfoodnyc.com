import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { DIET_CONFIG, COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { dietHubIsIndexable } from "@/lib/diet-hubs"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import ContextualLinks from "@/components/contextual-links"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import { ANCHOR_TEXT, DIET_HUB_CROSSLINKS } from "@/lib/internal-links"
import AboutThisData from "@/components/about-this-data"
import { withPartnerStatus } from "@/lib/partner-status-db"
import { formatAverageRating, roundAverage } from "@/lib/ratings"
import DirectoryAsOf from "@/components/directory-as-of"
import { formatLongDate } from "@/lib/inspection-dates"
import { latestStamp, listingStamp } from "@/lib/listing-stamp"
import { gradeStatsFor } from "@/lib/hub-grade-stats"
import { dietCtrDescription, dietCtrTitle, dietHubTitle, fitDescription, shortMonth } from "@/lib/seo-titles"
import { dietFaqs, dietIntro } from "@/lib/hub-copy"
import { getDirectorySnapshot } from "@/lib/directory-snapshot"
import { dietCapsule } from "@/lib/answer-capsule"
import { selectTopPicks, TOP_PICKS_EXPLAINER } from "@/lib/top-picks"
import { buildHubItemList, dohmhInspectionDataset } from "@/lib/schema"
import NewsletterSignup from "@/components/newsletter-signup"

export async function generateStaticParams() {
  return Object.keys(DIET_CONFIG).map((tag) => ({ "diet-type": tag }))
}

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "diet-type": string }>
}): Promise<Metadata> {
  const { "diet-type": tag } = await params
  const config = DIET_CONFIG[tag]
  if (!config) return { title: "Not Found" }

  const canonicalUrl = getCanonicalUrl(`/healthy-restaurants/${tag}`)
  const [stats, snapshot, boroughs] = await Promise.all([
    gradeStatsFor({ dietary_tags: { contains: tag } }),
    getDirectorySnapshot(),
    prisma.restaurant.groupBy({
      by: ["borough"],
      where: {
        is_published: true,
        business_status: "OPERATIONAL",
        dietary_tags: { contains: tag },
        borough: { not: null },
      },
      _count: { id: true },
    }),
  ])
  const indexable = dietHubIsIndexable(stats.count)
  const year = (snapshot.lastPublishAt ?? new Date()).getUTCFullYear()
  const ctrDiet = tag === "gluten-free" || tag === "vegetarian"
  const title = ctrDiet
    ? dietCtrTitle(config.label, stats.gradeA, stats.count)
    : dietHubTitle(config.label, stats.count, stats.gradeA, year)
  const dataMonth = shortMonth(snapshot.latestInspectionAt)
  const split = boroughs
    .filter((row) => row.borough && row._count.id > 0)
    .sort((a, b) => b._count.id - a._count.id)
    .map((row) => `${row.borough} ${row._count.id.toLocaleString("en-US")}`)
    .join(", ")
  const description = ctrDiet
    ? dietCtrDescription(config.label, stats.count, stats.gradeA)
    : fitDescription(
        [
          `${stats.count.toLocaleString("en-US")} ${config.label.toLowerCase()} restaurants in NYC${split ? `: ${split}` : ""}.`,
          stats.graded > 0
            ? `${stats.gradeA.toLocaleString("en-US")} of ${stats.graded.toLocaleString("en-US")} graded hold a NYC DOHMH Grade A${stats.gradeC > 0 ? `, ${stats.gradeC.toLocaleString("en-US")} hold a C` : ""}.`
            : "",
        ].filter(Boolean),
        [dataMonth ? `Data as of ${dataMonth}.` : ""].filter(Boolean)
      )
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${config.label} Restaurants in NYC` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
  }
}

export default async function DietTypePage({
  params,
}: {
  params: Promise<{ "diet-type": string }>
}) {
  const { "diet-type": tag } = await params
  const config = DIET_CONFIG[tag]
  if (!config) notFound()

  const crossLinks = DIET_HUB_CROSSLINKS[tag]

  const listedWhere = {
    business_status: "OPERATIONAL" as const,
    is_published: true,
    dietary_tags: { contains: tag },
  }
  const [restaurantRows, totalCount, boroughBreakdown, ratingAgg, neighborhoodBreakdown, gradeSplit, snapshot] = await Promise.all([
    // Full ordered set, then selectTopPicks. A take: 24 here would keep a
    // Grade C or unrated row that sorts first and drop a later Grade A.
    prisma.restaurant.findMany({
      where: listedWhere,
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
    }),
    prisma.restaurant.count({ where: listedWhere }),
    prisma.restaurant.groupBy({
      by: ["borough"],
      where: { ...listedWhere, borough: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // Average every rated listing, not the first page of cards. Unrated rows
    // sort first under Postgres DESC (NULLS FIRST) and must not count as 0.
    prisma.restaurant.aggregate({
      where: { ...listedWhere, rating: { gt: 0 } },
      _avg: { rating: true },
    }),
    prisma.restaurant.groupBy({
      by: ["neighborhood", "borough"],
      where: { ...listedWhere, neighborhood: { not: null }, borough: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    gradeStatsFor({ dietary_tags: { contains: tag } }),
    getDirectorySnapshot(),
  ])
  const restaurants = selectTopPicks(await withPartnerStatus(restaurantRows), 24)
  const hubStamp = latestStamp(restaurantRows.map((row) => listingStamp(row)))
  const topHood = neighborhoodBreakdown[0]
  const topNeighborhood = topHood?.neighborhood && topHood.borough
    ? { name: topHood.neighborhood, borough: topHood.borough, count: topHood._count.id }
    : null
  const capsule = dietCapsule({
    label: config.label,
    count: totalCount,
    gradeA: gradeSplit.gradeA,
    gradeB: gradeSplit.gradeB,
    gradeC: gradeSplit.gradeC,
    latestMonth: snapshot.latestInspectionMonth,
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

  const roundedAvg = roundAverage(ratingAgg._avg.rating)

  const itemListJsonLd = buildHubItemList({
    name: `${config.label} Restaurants in NYC`,
    description: `${totalCount} ${config.label.toLowerCase()} restaurants in New York City`,
    siteUrl,
    restaurants: restaurants.slice(0, 10),
  })

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${config.label} Restaurants in NYC — ${config.label} Certification & Health Grade Data`,
    description: `Published ${config.label.toLowerCase()} listings in NYC: ${totalCount} restaurants, with the matched NYC DOHMH grade when one is stored. A tag is not a certification, and a missing grade is not Grade A.`,
    url: `${siteUrl}/healthy-restaurants/${tag}`,
    creator: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: dohmhInspectionDataset(),
    temporalCoverage: "2024/2026",
    spatialCoverage: { "@type": "Place", name: "New York City" },
    variableMeasured: [
      `${config.label} certification`,
      "Health inspection grade",
      "Community rating",
      "Borough and neighborhood",
    ],
    keywords: [
      `${config.label.toLowerCase()} restaurants`,
      `${config.label.toLowerCase()} NYC`,
      "NYC health inspection grades",
      "healthy restaurants NYC",
    ],
    ...(hubStamp && { dateModified: hubStamp.toISOString().slice(0, 10) }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([itemListJsonLd, datasetJsonLd]),
        }}
      />

      {/* ─── HERO ─── */}
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb items={[
            { label: "Healthy Restaurants", href: "/healthy-restaurants" },
            { label: config.label },
          ]} />

          <p className="eyebrow mt-6">
            Dietary tag
            <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>
              {hubStamp ? <span>Listings updated {formatLongDate(hubStamp)}</span> : <DirectoryAsOf />}
            </span>
          </p>

          <h1 className="display-1 mt-3">
            {config.label} restaurants in NYC
          </h1>

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            {capsule}
          </p>
          <h2 className="h2-serif mt-8">How many {config.label.toLowerCase()} restaurants hold a Grade A?</h2>
          <p className="mt-3 text-base leading-relaxed" style={{ maxWidth: "62ch" }}>
            {gradeSplit.graded === 0
              ? `None of the ${totalCount.toLocaleString("en-US")} published ${config.label.toLowerCase()} restaurants has a matched NYC DOHMH letter grade.`
              : `${gradeSplit.gradeA.toLocaleString("en-US")} of ${gradeSplit.graded.toLocaleString("en-US")} graded ${config.label.toLowerCase()} restaurants hold Grade A. ${gradeSplit.gradeB.toLocaleString("en-US")} hold Grade B and ${gradeSplit.gradeC.toLocaleString("en-US")} hold Grade C.`}
          </p>

          {/* What it is — quiet editorial pull, no green box */}
          <aside
            className="mt-6 border-l pl-5 py-1"
            style={{
              borderLeftWidth: "2px",
              borderLeftColor: "var(--color-jade)",
              maxWidth: "62ch",
            }}
          >
            <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
              What {config.label.toLowerCase()} means here
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

          {/* Intro */}
          <p className="dek mt-6" style={{ maxWidth: "62ch" }}>
            {dietIntro({
              label: config.label,
              place: "NYC",
              count: totalCount,
              gradeA: gradeSplit.gradeA,
              graded: gradeSplit.graded,
            })}
          </p>

          {/* Editorial aside */}
          <aside
            className="mt-6 border-l pl-5 py-1"
            style={{
              borderLeftWidth: "2px",
              borderLeftColor: "var(--color-sage)",
              maxWidth: "62ch",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "1rem",
                lineHeight: 1.55,
                color: "var(--color-text)",
              }}
            >
              {totalCount > 100
                ? `With ${totalCount} options across the city, ${config.label.toLowerCase()} dining in NYC is mainstream. The challenge isn't finding a restaurant — it's finding the right one.`
                : totalCount > 30
                  ? `${totalCount} restaurants may not sound like much for a city this size, but ${config.label.toLowerCase()} spots in NYC tend to be deliberate about what they serve. Quality over quantity.`
                  : `${totalCount} dedicated options — a smaller pool, which makes finding standouts easier. Each tagged with a health grade so you can compare apples to apples.`}
            </p>
          </aside>

          {/* Inline stats */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Total</span>
              <span className="tabular font-semibold">{totalCount.toLocaleString()}</span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Boroughs</span>
              <span className="tabular font-semibold">{boroughBreakdown.filter((b) => b.borough).length}</span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Avg rating</span>
              <span className="tabular font-semibold">{formatAverageRating(roundedAvg)}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* ─── Restaurant grid ─── */}
        <div className="mb-12">
          <p className="eyebrow">Listings</p>
          <h2 className="h2-serif mt-2">Top {Math.min(restaurants.length, 24)} {config.label.toLowerCase()} restaurants</h2>
          <p className="dek mt-2" style={{ fontSize: "0.95rem" }}>
            {TOP_PICKS_EXPLAINER}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
            ))}
          </div>
        </div>

        {/* ─── Borough breakdown ─── */}
        <section
          className="mt-16 border-t pt-10"
          style={{ borderTopColor: "var(--hairline)" }}
        >
          <p className="eyebrow">By borough</p>
          <h2 className="h2-serif mt-2">
            {config.label} restaurants across the five boroughs
          </h2>
          <p className="dek mt-2" style={{ fontSize: "0.95rem" }}>
            Boroughs with {COMBO_MIN_RESTAURANTS}+ listings get their own focused page.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {boroughBreakdown
              .filter((b) => b.borough)
              .map((b) => {
                const hasDedicatedHub = b._count.id >= COMBO_MIN_RESTAURANTS
                return (
                  <Link
                    key={b.borough}
                    href={
                      hasDedicatedHub
                        ? `/nyc/${boroughToSlug(b.borough!)}/${tag}-restaurants`
                        : `/nyc/${boroughToSlug(b.borough!)}/healthy-restaurants`
                    }
                    className="group block border p-4 transition-colors"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "var(--hairline)",
                      borderRadius: "4px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1rem",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        color: "var(--color-forest)",
                      }}
                    >
                      {b.borough}
                    </p>
                    <p
                      className="tabular mt-1.5 text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {b._count.id} {b._count.id === 1 ? "restaurant" : "restaurants"}
                    </p>
                    {hasDedicatedHub && (
                      <p
                        className="eyebrow mt-2"
                        style={{ color: "var(--color-jade)" }}
                      >
                        Dedicated page →
                      </p>
                    )}
                  </Link>
                )
              })}
          </div>
        </section>
      </main>

      {/* ─── Contextual links ─── */}
      <div className="mx-auto max-w-3xl px-6 pb-10">
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
          Our {config.label.toLowerCase()} restaurant listings are drawn from a dataset of {totalCount.toLocaleString()} verified NYC establishments, each tagged conservatively. Use our{" "}
          <Link
            href="/nyc/compare"
            style={{ color: "var(--color-jade)", textDecoration: "underline", textUnderlineOffset: "2px" }}
          >
            neighborhood health comparison tool
          </Link>{" "}
          to see which NYC neighborhoods have the highest concentration of {config.label.toLowerCase()} restaurants.
        </p>
        <ContextualLinks
          intro="Related guides:"
          links={[
            [ANCHOR_TEXT.guideBestNeighborhoods, "/guides/best-healthy-neighborhoods-nyc"],
            [ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"],
          ]}
        />
        {crossLinks && (
          <ContextualLinks
            className="mt-4"
            intro={`Diners exploring ${config.label.toLowerCase()} restaurants also browse`}
            links={crossLinks}
          />
        )}
      </div>

      {/* ─── How we tag — editorial pull ─── */}
      <div className="mx-auto max-w-3xl px-6 pb-10">
        <aside
          className="border-l pl-5 py-1"
          style={{
            borderLeftWidth: "2px",
            borderLeftColor: "var(--hairline-strong)",
            maxWidth: "62ch",
          }}
        >
          <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
            How we tag
          </p>
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1rem",
              lineHeight: 1.55,
              color: "var(--color-text)",
            }}
          >
            We apply the &ldquo;{config.label.toLowerCase()}&rdquo; tag conservatively. A restaurant only gets it if they explicitly identify as {config.label.toLowerCase()}-friendly or if their menu clearly supports it. We don&apos;t guess. If you think we&apos;re missing a spot,{" "}
            <Link
              href="/contact"
              style={{ color: "var(--color-jade)", fontStyle: "normal", textDecoration: "underline", textUnderlineOffset: "2px" }}
            >
              let us know
            </Link>.
          </p>
        </aside>
      </div>

      {/* ─── About this data ─── */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <AboutThisData
          variant="hub"
          restaurantCount={totalCount}
         
          dietaryTag={config.label}
          dietaryCount={totalCount}
        />
      </div>

      {/* ─── FAQ ─── */}
      <FAQSection
        faqs={dietFaqs({
          label: config.label,
          place: "NYC",
          count: totalCount,
          gradeA: gradeSplit.gradeA,
          graded: gradeSplit.graded,
          topBorough: boroughBreakdown[0]?.borough
            ? { name: boroughBreakdown[0].borough, count: boroughBreakdown[0]._count.id }
            : null,
          topNeighborhood: topNeighborhood,
          policy: `We tag a restaurant ${config.label.toLowerCase()} only when it identifies that way or has substantial ${config.label.toLowerCase()} menu coverage. A single dish is not enough, and a missing grade is not a dietary claim.`,
        })}
        heading={`${config.label} restaurants in NYC`}
        subheading="Counts from the published listings."
      />
      <div className="border-t px-6 py-16" style={{ borderTopColor: "var(--hairline)", backgroundColor: "var(--color-cream)" }}>
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </div>
    </>
  )
}
