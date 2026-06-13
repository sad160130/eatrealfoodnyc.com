import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { neighborhoodToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP, BOROUGH_FAQS, BOROUGH_INTROS } from "@/config/boroughs"
import { BOROUGH_KEYWORDS } from "@/config/keywords"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import BackToTop from "@/components/back-to-top"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import ContextualLinks from "@/components/contextual-links"
import { getBoroughContextualLinks } from "@/lib/internal-links"
import NeighborhoodScorecard from "@/components/neighborhood-scorecard"
import scorecardsData from "@/data/neighborhood-scorecards"
import AboutThisData from "@/components/about-this-data"

export async function generateStaticParams() {
  return ["manhattan", "brooklyn", "queens", "bronx", "staten-island"].map((borough) => ({
    borough,
  }))
}

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string }>
}): Promise<Metadata> {
  const { borough } = await params
  const name = BOROUGH_MAP[borough]
  if (!name) return { title: "Not Found" }

  const count = await prisma.restaurant.count({
    where: { borough: name, business_status: "OPERATIONAL", is_published: true },
  })
  const canonicalUrl = getCanonicalUrl(`/nyc/${borough}/healthy-restaurants`)

  const kwds = BOROUGH_KEYWORDS[borough]
  return {
    title: kwds?.metaTitle || `Healthy Restaurants in ${name}, NYC (2026)`,
    description: kwds?.metaDescription(count) || `Find ${count}+ healthy restaurants in ${name}, NYC — verified with NYC health inspection grades.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: kwds?.h1,
      description: kwds?.metaDescription(count) || `Find ${count}+ healthy restaurants in ${name}, NYC — verified with NYC health inspection grades.`,
      url: canonicalUrl,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `Healthy Restaurants in ${name}, NYC` }],
    },
    robots: { index: true, follow: true },
  }
}

export default async function BoroughPage({
  params,
}: {
  params: Promise<{ borough: string }>
}) {
  const { borough: boroughSlug } = await params
  const boroughName = BOROUGH_MAP[boroughSlug]
  if (!boroughName) notFound()

  const [restaurants, stats, gradeACount] = await Promise.all([
    prisma.restaurant.findMany({
      where: { borough: boroughName, business_status: "OPERATIONAL", is_published: true },
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
    }),
    prisma.restaurant.aggregate({
      where: { borough: boroughName, business_status: "OPERATIONAL", is_published: true },
      _count: { id: true },
      _avg: { rating: true },
    }),
    prisma.restaurant.count({
      where: { borough: boroughName, business_status: "OPERATIONAL", is_published: true, inspection_grade: "A" },
    }),
  ])

  const totalCount = stats._count.id
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

  const neighborhoodScorecard = scorecardsData[boroughName] ?? []

  const byNeighborhood = restaurants.reduce((acc, r) => {
    const hood = r.neighborhood || "Other"
    if (!acc[hood]) acc[hood] = []
    acc[hood].push(r)
    return acc
  }, {} as Record<string, typeof restaurants>)

  const neighborhoodsSorted = Object.entries(byNeighborhood).sort((a, b) => b[1].length - a[1].length)

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: boroughName, item: `${siteUrl}/nyc/${boroughSlug}/healthy-restaurants` },
      { "@type": "ListItem", position: 3, name: "Healthy Restaurants" },
    ],
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Healthy Restaurants in ${boroughName}, NYC`,
    description: `Complete guide to ${totalCount} healthy restaurants across ${neighborhoodScorecard.length} neighborhoods in ${boroughName}, with NYC health inspection grades and dietary filters.`,
    numberOfItems: totalCount,
    about: {
      "@type": "City",
      name: boroughName,
      containedInPlace: { "@type": "City", name: "New York City" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 4.3,
      reviewCount: totalCount,
      bestRating: 5,
      worstRating: 1,
    },
    itemListElement: restaurants.slice(0, 20).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Restaurant",
        name: r.name,
        url: `${siteUrl}/restaurants/${r.slug}`,
        ...(r.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: r.rating, reviewCount: r.reviews || 1, bestRating: 5, worstRating: 1 } } : {}),
      },
    })),
  }

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Healthy Restaurants in ${boroughName}, NYC — Health Grade Data`,
    description: `Health inspection grades, dietary certifications, and restaurant data for ${totalCount} healthy restaurants across ${neighborhoodScorecard.length} neighborhoods in ${boroughName}, New York City. Sourced from NYC DOHMH Open Data.`,
    url: `${siteUrl}/nyc/${boroughSlug}/healthy-restaurants`,
    creator: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: {
      "@type": "Dataset",
      name: "DOHMH New York City Restaurant Inspection Results",
      url: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
      publisher: { "@type": "GovernmentOrganization", name: "NYC Department of Health and Mental Hygiene" },
    },
    temporalCoverage: "2024/2026",
    spatialCoverage: { "@type": "Place", name: `${boroughName}, New York City` },
    variableMeasured: ["Health inspection grade", "Dietary certifications", "Community rating", "Hidden gem status"],
    dateModified: new Date().toISOString().split("T")[0],
  }

  const intro = BOROUGH_INTROS[boroughSlug] || ""
  const gradeARate = totalCount > 0 ? Math.round((gradeACount / totalCount) * 100) : 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd, datasetJsonLd]),
        }}
      />

      {/* ─── HERO ─── */}
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6 md:px-6">
          <TopicalBreadcrumb items={[
            { label: "NYC Healthy Restaurants", href: "/search" },
            { label: boroughName },
          ]} />

          <p className="eyebrow mt-6">
            Borough hub
            <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>
              Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </p>

          <h1 className="display-1 mt-3">
            Healthy restaurants in {boroughName}.
          </h1>

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>{totalCount.toLocaleString()}</span> curated spots across{" "}
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>{neighborhoodsSorted.length}</span> {boroughName} neighborhoods — every listing tied to a real NYC Department of Health inspection grade.
          </p>

          {/* Inline stats — mid-dot separators, tabular nums, no pipes */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <StatInline label="Grade A" value={`${gradeACount.toLocaleString()} (${gradeARate}%)`} />
            <Dot />
            <StatInline label="Avg rating" value={stats._avg.rating ? `${stats._avg.rating.toFixed(1)} ★` : "—"} />
            <Dot />
            <StatInline label="Neighborhoods" value={neighborhoodsSorted.length.toString()} />
          </div>

          {intro && (
            <p className="dek mt-5" style={{ maxWidth: "62ch", color: "var(--color-text)" }}>
              {intro}
            </p>
          )}

          {/* Editorial insight */}
          {gradeACount > 0 && (
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
                {gradeARate > 70
                  ? `${gradeARate}% of ${boroughName}'s healthy restaurants hold a Grade A — well above the city average. Straight from NYC Health Department records.`
                  : gradeARate > 40
                    ? `About ${gradeARate}% of the healthy restaurants listed here carry a Grade A. Some neighborhoods perform noticeably better than others.`
                    : `Grade A coverage in ${boroughName} sits at ${gradeARate}%. The restaurants that do hold an A tend to be genuinely committed to food safety.`}
              </p>
            </aside>
          )}

          {/* Quick filters — homepage callout pattern, scaled down */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link href={`/search?borough=${boroughName}&open=true`} className="callout">
              <span className="callout-initial">O<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Open right now</span>
              <span className="callout-pulse" aria-hidden="true" />
            </Link>
            <Link href={`/search?borough=${boroughName}&grade=A`} className="callout">
              <span className="callout-initial">A<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Grade A only</span>
            </Link>
            <Link href={`/search?borough=${boroughName}&hidden_gem=true`} className="callout">
              <span className="callout-initial" style={{ color: "var(--color-amber)" }}>✦</span>
              <span className="callout-label">Hidden gems</span>
            </Link>
            <Link href={`/map?borough=${boroughName}`} className="callout">
              <span className="callout-initial">M<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Map view</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── STICKY JUMP NAV ─── */}
      <div
        className="sticky top-16 z-30 border-b"
        style={{
          backgroundColor: "var(--color-cream)",
          borderBottomColor: "var(--hairline)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
            <span className="eyebrow mr-2 flex-shrink-0" style={{ color: "var(--color-muted)" }}>
              Jump to
            </span>
            {neighborhoodsSorted.map(([hood, rs]) => (
              <a
                key={hood}
                href={`#neighborhood-${neighborhoodToSlug(hood)}`}
                className="flex-shrink-0 whitespace-nowrap border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: "var(--hairline)",
                  borderRadius: "3px",
                  color: "var(--color-forest)",
                }}
              >
                {hood}{" "}
                <span className="tabular ml-1" style={{ color: "var(--color-muted)" }}>
                  {rs.length}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── NEIGHBORHOOD SECTIONS ─── */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {neighborhoodsSorted.map(([neighborhood, neighborhoodRestaurants], neighborhoodIndex) => {
          const hoodSlug = neighborhoodToSlug(neighborhood)
          const gradeAInHood = neighborhoodRestaurants.filter((r) => r.inspection_grade === "A").length
          const ratedRestaurants = neighborhoodRestaurants.filter((r) => r.rating)
          const avgRating = ratedRestaurants.length > 0
            ? ratedRestaurants.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratedRestaurants.length
            : 0

          return (
            <React.Fragment key={neighborhood}>
              {/* Editorial aside after the 3rd neighborhood */}
              {neighborhoodIndex === 3 && (
                <aside
                  className="mb-14 border-l pl-5 py-1"
                  style={{
                    borderLeftWidth: "2px",
                    borderLeftColor: "var(--hairline-strong)",
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
                    A note on order. Neighborhoods are sorted by restaurant count, not quality. Some of the best spots in {boroughName} are in smaller neighborhoods most guides skip entirely.
                  </p>
                </aside>
              )}

              <section id={`neighborhood-${hoodSlug}`} className="mb-14 scroll-mt-32">
                <div
                  className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4"
                  style={{ borderBottomColor: "var(--hairline)" }}
                >
                  <div>
                    <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
                      Neighborhood {String(neighborhoodIndex + 1).padStart(2, "0")} <span className="mx-1.5">·</span>{" "}
                      <span className="tabular">{neighborhoodRestaurants.length}</span> restaurants
                    </p>
                    <h2 className="h2-serif mt-2">
                      Healthy restaurants in {neighborhood}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      {gradeAInHood > 0 && (
                        <span style={{ color: "var(--color-muted)" }}>
                          <span className="eyebrow mr-1.5" style={{ color: "var(--color-jade)" }}>A</span>
                          <span className="tabular">{gradeAInHood}</span> Grade A
                        </span>
                      )}
                      {avgRating > 0 && (
                        <span style={{ color: "var(--color-muted)" }}>
                          <span aria-hidden="true" style={{ color: "var(--color-amber)" }}>★</span>{" "}
                          <span className="tabular">{Math.round(avgRating * 10) / 10}</span> avg
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
                    className="eyebrow inline-flex flex-shrink-0 items-center gap-1.5 transition-colors"
                    style={{ color: "var(--color-jade)" }}
                  >
                    View {neighborhood}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {neighborhoodRestaurants.slice(0, 8).map((restaurant, index) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      priority={neighborhoodIndex === 0 && index < 8}
                    />
                  ))}
                </div>
                {neighborhoodRestaurants.length > 8 && (
                  <div className="mt-6">
                    <Link
                      href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
                      className="eyebrow inline-flex items-center gap-1.5 transition-colors"
                      style={{ color: "var(--color-jade)" }}
                    >
                      View all <span className="tabular mx-1">{neighborhoodRestaurants.length}</span> in {neighborhood}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )}
              </section>
            </React.Fragment>
          )
        })}
      </div>

      {/* ─── BOROUGH SUMMARY — forest tonal break ─── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <section
          className="p-10 md:p-14"
          style={{
            backgroundColor: "var(--color-forest)",
            color: "var(--color-cream)",
            borderRadius: "4px",
          }}
        >
          <p className="eyebrow" style={{ color: "var(--color-sage)" }}>
            {boroughName} explorer
          </p>
          <h2
            className="mt-3"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 2.5vw + 1rem, 2.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-cream)",
            }}
          >
            Browse {boroughName} by neighborhood.
          </h2>
          <p
            className="mt-3"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              lineHeight: 1.55,
              color: "rgba(248, 246, 241, 0.72)",
              maxWidth: "60ch",
            }}
          >
            The top {Math.min(8, neighborhoodsSorted.length)} neighborhoods by published listing count.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {neighborhoodsSorted.slice(0, 8).map(([hood, rs]) => (
              <Link
                key={hood}
                href={`/nyc/${boroughSlug}/${neighborhoodToSlug(hood)}/healthy-restaurants`}
                className="group block border p-4 transition-colors"
                style={{
                  borderColor: "rgba(248, 246, 241, 0.18)",
                  borderRadius: "3px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    lineHeight: 1.2,
                    color: "var(--color-cream)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {hood}
                </p>
                <p
                  className="tabular mt-2"
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(248, 246, 241, 0.6)",
                  }}
                >
                  {rs.length} restaurants
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ─── CONTEXTUAL LINKS ─── */}
      <div className="mx-auto max-w-3xl px-4 pb-12 md:px-6">
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
          This page lists every published healthy restaurant in {boroughName} from our directory of {totalCount.toLocaleString()} verified NYC establishments. Each listing shows the official NYC Department of Health inspection grade, dietary certifications, and community ratings.
        </p>
        <ContextualLinks
          intro="Learn more about our data and methodology:"
          links={getBoroughContextualLinks(boroughName)}
        />
      </div>

      {/* ─── COMPARE CTA — editorial card ─── */}
      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div
          className="flex flex-wrap items-center justify-between gap-4 border p-6"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "var(--hairline)",
            borderRadius: "4px",
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--color-muted)" }}>Compare</p>
            <p className="h2-serif mt-1" style={{ fontSize: "1.375rem" }}>
              How does {boroughName} compare?
            </p>
            <p
              className="mt-1.5 text-sm"
              style={{ color: "var(--color-muted)", maxWidth: "52ch" }}
            >
              Health scores, Grade A rates, and hidden gem counts across NYC neighborhoods.
            </p>
          </div>
          <Link
            href="/nyc/compare"
            className="eyebrow flex-shrink-0 inline-flex items-center gap-1.5 transition-colors"
            style={{ color: "var(--color-jade)" }}
          >
            Compare neighborhoods
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* ─── NEIGHBORHOOD HEALTH SCORECARD ─── */}
      {neighborhoodScorecard.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <NeighborhoodScorecard
            borough={boroughName}
            neighborhoods={neighborhoodScorecard}
          />
        </div>
      )}

      {/* ─── ABOUT THIS DATA ─── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <AboutThisData
          variant="hub"
          restaurantCount={restaurants.length}
          gradeACount={gradeACount}
          lastRefreshed="April 2026"
          borough={boroughName}
        />
      </div>

      {/* ─── FAQ ─── */}
      {BOROUGH_FAQS[boroughSlug]?.length > 0 && (
        <FAQSection
          faqs={BOROUGH_FAQS[boroughSlug]}
          heading={`Healthy Restaurants in ${boroughName} — FAQ`}
          subheading={`Common questions about finding healthy food in ${boroughName}, NYC.`}
        />
      )}

      <BackToTop />
    </>
  )
}

/* ─── Internal pieces ─── */

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ color: "var(--color-text)" }}>
      <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>{label}</span>
      <span className="tabular font-semibold">{value}</span>
    </span>
  )
}

function Dot() {
  return <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
}
