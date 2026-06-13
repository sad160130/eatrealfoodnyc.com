import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { DIET_CONFIG, COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { DIET_KEYWORDS } from "@/config/keywords"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import ContextualLinks from "@/components/contextual-links"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import { ANCHOR_TEXT, DIET_HUB_CROSSLINKS } from "@/lib/internal-links"
import AboutThisData from "@/components/about-this-data"

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
  const kwds = DIET_KEYWORDS[tag]
  const count = await prisma.restaurant.count({ where: { business_status: "OPERATIONAL", is_published: true, dietary_tags: { contains: tag } } })
  return {
    title: kwds?.metaTitle || `Best ${config.label} Restaurants in NYC (2026)`,
    description: kwds?.metaDescription(count) || `Find ${config.label.toLowerCase()} restaurants in NYC with health inspection grades.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: kwds?.h1,
      description: kwds?.metaDescription(count) || `Find ${config.label.toLowerCase()} restaurants in NYC with health inspection grades.`,
      url: canonicalUrl,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${config.label} Restaurants in NYC` }],
    },
    robots: { index: true, follow: true },
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

  const [restaurants, totalCount, boroughBreakdown] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        business_status: "OPERATIONAL", is_published: true,
        dietary_tags: { contains: tag },
      },
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
      take: 24,
    }),
    prisma.restaurant.count({
      where: {
        business_status: "OPERATIONAL", is_published: true,
        dietary_tags: { contains: tag },
      },
    }),
    prisma.restaurant.groupBy({
      by: ["borough"],
      where: {
        business_status: "OPERATIONAL", is_published: true,
        dietary_tags: { contains: tag },
        borough: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Healthy Restaurants", item: `${siteUrl}/healthy-restaurants` },
      { "@type": "ListItem", position: 3, name: config.label },
    ],
  }

  const avgRating = restaurants.length > 0
    ? restaurants.reduce((sum, r) => sum + (r.rating ?? 0), 0) / restaurants.length
    : 0
  const roundedAvg = Math.round(avgRating * 10) / 10

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${config.label} Restaurants in NYC`,
    description: `${totalCount} ${config.label.toLowerCase()} restaurants in New York City`,
    numberOfItems: totalCount,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: roundedAvg || 4.3,
      reviewCount: totalCount,
      bestRating: 5,
      worstRating: 1,
    },
    itemListElement: restaurants.slice(0, 10).map((r, i) => ({
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
    name: `${config.label} Restaurants in NYC — ${config.label} Certification & Health Grade Data`,
    description: `${config.label} certifications, health inspection grades, dietary tags, and restaurant data for ${totalCount} verified ${config.label.toLowerCase()} restaurants across all five NYC boroughs. Sourced from NYC DOHMH Open Data and Eat Real Food NYC editorial classification.`,
    url: `${siteUrl}/healthy-restaurants/${tag}`,
    creator: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: {
      "@type": "Dataset",
      name: "DOHMH New York City Restaurant Inspection Results",
      url: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
      publisher: { "@type": "GovernmentOrganization", name: "NYC Department of Health and Mental Hygiene" },
    },
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
    dateModified: new Date().toISOString().split("T")[0],
  }

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
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb items={[
            { label: "Healthy Restaurants", href: "/" },
            { label: config.label },
          ]} />

          <p className="eyebrow mt-6">
            Dietary tag
            <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>
              Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </p>

          <h1 className="display-1 mt-3" style={{ textTransform: "lowercase" }}>
            {config.label}.
          </h1>

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>{totalCount.toLocaleString()}</span> {config.label.toLowerCase()} restaurants in NYC — each tied to a real NYC Department of Health inspection grade.
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
          {config.intro && (
            <p className="dek mt-6" style={{ maxWidth: "62ch" }}>
              {config.intro}
            </p>
          )}

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
              <span className="tabular font-semibold">{roundedAvg || "—"}{roundedAvg ? " ★" : ""}</span>
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
            Ranked by editorial priority, rating, and review depth.
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
          lastRefreshed="April 2026"
          dietaryTag={config.label}
          dietaryCount={totalCount}
        />
      </div>

      {/* ─── FAQ ─── */}
      {config.faqs.length > 0 && (
        <FAQSection
          faqs={config.faqs}
          heading={`${config.label} Restaurants in NYC — FAQ`}
          subheading={`Everything you need to know about finding ${config.label.toLowerCase()} restaurants across New York City.`}
        />
      )}
    </>
  )
}
