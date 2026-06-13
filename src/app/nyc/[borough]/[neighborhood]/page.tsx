import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP } from "@/config/boroughs"
import { DIET_CONFIG, COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { buildDietBoroughKeywords } from "@/config/keywords"
import { ANCHOR_TEXT } from "@/lib/internal-links"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import ContextualLinks from "@/components/contextual-links"
import AboutThisData from "@/components/about-this-data"

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

  const count = await prisma.restaurant.count({
    where: { borough: boroughName, business_status: "OPERATIONAL", is_published: true, dietary_tags: { contains: tag } },
  })
  const kw = buildDietBoroughKeywords(config.label, boroughName)
  const canonicalUrl = getCanonicalUrl(`/nyc/${boroughSlug}/${tag}${SUFFIX}`)

  return {
    title: kw.metaTitle,
    description: kw.metaDescription(count),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: kw.h1,
      description: kw.metaDescription(count),
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

  const [restaurants, totalCount, gradeACount, agg] = await Promise.all([
    prisma.restaurant.findMany({
      where: baseWhere,
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
      take: 48,
    }),
    prisma.restaurant.count({ where: baseWhere }),
    prisma.restaurant.count({ where: { ...baseWhere, inspection_grade: "A" } }),
    prisma.restaurant.aggregate({ where: baseWhere, _avg: { rating: true } }),
  ])

  // Gate thin pages — never index a doorway page with too few listings.
  if (totalCount < COMBO_MIN_RESTAURANTS) notFound()

  const avgRating = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0
  const dietLower = config.label.toLowerCase()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const pageUrl = `${siteUrl}/nyc/${boroughSlug}/${tag}${SUFFIX}`

  // Combo-specific FAQs (real, data-driven — information gain over the diet hub),
  // padded with two evergreen diet FAQs from config for depth.
  const comboFaqs = [
    {
      question: `How many ${dietLower} restaurants are in ${boroughName}?`,
      answer: `Our directory lists ${totalCount} ${dietLower} restaurants in ${boroughName}, NYC, each cross-referenced with its NYC Department of Health inspection record.`,
    },
    {
      question: `Do ${dietLower} restaurants in ${boroughName} have NYC health grades?`,
      answer:
        gradeACount > 0
          ? `Yes — ${gradeACount} of the ${totalCount} ${dietLower} restaurants we list in ${boroughName} currently hold a Grade A from the NYC DOHMH. Every listing shows its official grade, score, and inspection date.`
          : `Every ${dietLower} restaurant we list in ${boroughName} shows its official NYC DOHMH inspection grade, score, and date wherever the city has published one.`,
    },
    ...(avgRating > 0
      ? [{
          question: `What's the average rating of ${dietLower} restaurants in ${boroughName}?`,
          answer: `The ${dietLower} restaurants in ${boroughName} in our directory average ${avgRating}/5 across community reviews sourced from Google Maps.`,
        }]
      : []),
    ...config.faqs.slice(0, 2),
  ]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: boroughName, item: `${siteUrl}/nyc/${boroughSlug}/healthy-restaurants` },
      { "@type": "ListItem", position: 3, name: `${config.label} Restaurants` },
    ],
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${config.label} Restaurants in ${boroughName}, NYC`,
    description: `${totalCount} ${dietLower} restaurants in ${boroughName}, New York City, with NYC health inspection grades.`,
    numberOfItems: totalCount,
    ...(avgRating > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: totalCount, bestRating: 5, worstRating: 1 },
    }),
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
    name: `${config.label} Restaurants in ${boroughName}, NYC — Health Grade Data`,
    description: `Health inspection grades, dietary classification, and ratings for ${totalCount} ${dietLower} restaurants in ${boroughName}, New York City. Sourced from NYC DOHMH Open Data and Eat Real Food NYC editorial classification.`,
    url: pageUrl,
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
    variableMeasured: [`${config.label} classification`, "Health inspection grade", "Community rating", "Neighborhood"],
    dateModified: new Date().toISOString().split("T")[0],
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comboFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd, datasetJsonLd, faqJsonLd]) }}
      />

      {/* ─── HERO ─── */}
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb
            items={[
              { label: "NYC Healthy Restaurants", href: "/search" },
              { label: boroughName, href: `/nyc/${boroughSlug}/healthy-restaurants` },
              { label: `${config.label} Restaurants` },
            ]}
          />

          <p className="eyebrow mt-6">
            {config.label} <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>{boroughName}, NYC</span>
          </p>

          <h1 className="display-1 mt-3">
            {config.label} restaurants in {boroughName}.
          </h1>

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>{totalCount.toLocaleString()}</span> {dietLower} {totalCount === 1 ? "restaurant" : "restaurants"} in {boroughName} — every listing verified against its NYC Department of Health inspection grade.
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
            {avgRating > 0 && (
              <>
                <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
                <span style={{ color: "var(--color-text)" }}>
                  <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Avg rating</span>
                  <span className="tabular font-semibold">{avgRating} ★</span>
                </span>
              </>
            )}
          </div>

          {/* Quick filters — homepage callout pattern */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href={`/search?borough=${boroughName}&diet=${tag}&grade=A`} className="callout">
              <span className="callout-initial">A<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Grade A only</span>
            </Link>
            <Link href={`/search?borough=${boroughName}&diet=${tag}&hidden_gem=true`} className="callout">
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
            Ranked by editorial priority, rating, and review depth.
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
          lastRefreshed="April 2026"
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
