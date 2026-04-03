import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { DIET_KEYWORDS } from "@/config/keywords"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import ContextualLinks from "@/components/contextual-links"
import { ANCHOR_TEXT } from "@/lib/internal-links"

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

  const [restaurants, totalCount, boroughBreakdown] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        business_status: "OPERATIONAL", is_published: true,
        dietary_tags: { contains: tag },
      },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
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

  const avgRating = restaurants.reduce((sum, r) => sum + (r.rating ?? 0), 0) / restaurants.length
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]),
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-700">Home</Link>
          {" / "}
          <span>Healthy Restaurants</span>
          {" / "}
          <span className="text-gray-900">{config.label}</span>
        </nav>

        <h1 className="text-2xl font-bold md:text-3xl">
          {config.emoji} {config.label} Restaurants in NYC
        </h1>

        <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
          🔄 Data from NYC DOHMH. Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
          {totalCount} active restaurants.
        </p>

        {/* What is box */}
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <h2 className="font-semibold text-green-900">What is {config.label}?</h2>
          <p className="mt-2 text-sm leading-relaxed text-green-800">{config.whatIs}</p>
        </div>

        {/* Intro */}
        <p className="mt-6 leading-relaxed text-gray-700">{config.intro}</p>

        {/* Count */}
        <p className="mt-4 text-sm font-medium text-gray-500">
          {totalCount} {config.label} restaurants in NYC
        </p>

        {/* Restaurant grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
          ))}
        </div>

        {/* Borough breakdown */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">
            {config.label} Restaurants by Borough
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {boroughBreakdown
              .filter((b) => b.borough)
              .map((b) => (
                <Link
                  key={b.borough}
                  href={`/nyc/${boroughToSlug(b.borough!)}/${tag}-restaurants`}
                  className="rounded-lg border bg-white p-3 text-center transition hover:border-green-400"
                >
                  <div className="font-medium">{b.borough}</div>
                  <div className="text-xs text-gray-400">
                    {b._count.id} restaurants
                  </div>
                </Link>
              ))}
          </div>
        </section>

      </main>

      {/* Contextual links */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <p className="mb-4 text-base leading-relaxed text-gray-700">
          Our {config.label.toLowerCase()} restaurant listings are drawn from a dataset of {totalCount.toLocaleString()} verified NYC establishments, each tagged conservatively.
          Use our <Link href="/nyc/compare" className="font-medium text-jade underline underline-offset-2 hover:text-forest">neighbourhood health comparison tool</Link> to see which NYC neighbourhoods have the highest concentration of {config.label.toLowerCase()} restaurants.
        </p>
        <ContextualLinks
          intro="Related guides:"
          links={[
            [ANCHOR_TEXT.guideBestNeighborhoods, "/guides/best-healthy-neighborhoods-nyc"],
            [ANCHOR_TEXT.healthGrades, "/guides/nyc-health-grades-explained"],
          ]}
        />
      </div>

      {/* FAQ */}
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
