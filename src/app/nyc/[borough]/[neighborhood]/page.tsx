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

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <TopicalBreadcrumb
          items={[
            { label: "NYC Healthy Restaurants", href: "/search" },
            { label: boroughName, href: `/nyc/${boroughSlug}/healthy-restaurants` },
            { label: `${config.label} Restaurants` },
          ]}
        />

        <h1 className="mt-2 font-serif text-3xl font-bold text-forest md:text-4xl">
          {config.emoji} {config.label} Restaurants in {boroughName}, NYC
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
          <span className="font-semibold text-forest">{totalCount} restaurants</span>
          {gradeACount > 0 && <span className="font-semibold text-sage">⭐ {gradeACount} Grade A</span>}
          {avgRating > 0 && (
            <span className="font-semibold" style={{ color: "var(--color-amber)" }}>★ {avgRating} avg</span>
          )}
          <span>🔄 Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        </p>

        <p className="mt-6 max-w-3xl leading-relaxed text-gray-700">
          {boroughName} has {totalCount} {dietLower} {totalCount === 1 ? "restaurant" : "restaurants"} in our directory,
          each verified against its NYC Department of Health inspection grade. {config.whatIs}
        </p>

        {/* Quick filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/search?borough=${boroughName}&diet=${tag}&grade=A`} className="rounded-full border border-sage/20 bg-sage/10 px-3 py-2 text-xs font-semibold text-jade">
            ⭐ Grade A only
          </Link>
          <Link href={`/search?borough=${boroughName}&diet=${tag}&hidden_gem=true`} className="rounded-full border border-amber/20 bg-amber/10 px-3 py-2 text-xs font-semibold" style={{ color: "var(--color-amber)" }}>
            💎 Hidden gems
          </Link>
          <Link href={`/healthy-restaurants/${tag}`} className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">
            All {config.label} in NYC →
          </Link>
        </div>

        {/* Restaurant grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
          ))}
        </div>
      </main>

      {/* Contextual links */}
      <div className="mx-auto max-w-3xl px-4 pb-12 md:px-6">
        <p className="mb-4 text-base leading-relaxed text-gray-700">
          Looking beyond {dietLower} options in {boroughName}? Browse the full{" "}
          <Link href={`/nyc/${boroughSlug}/healthy-restaurants`} className="font-medium text-jade underline underline-offset-2 hover:text-forest">
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
      <div className="mx-auto max-w-3xl px-4 pb-12 md:px-6">
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
