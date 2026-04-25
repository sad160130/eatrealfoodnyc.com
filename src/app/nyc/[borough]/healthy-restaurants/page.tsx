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
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
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

  // Group by neighborhood
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
    description: `${totalCount} healthy restaurants in ${boroughName}, New York City`,
    numberOfItems: totalCount,
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

  const intro = BOROUGH_INTROS[boroughSlug] || ""

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }} />

      {/* ─── HEADER ─── */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <TopicalBreadcrumb items={[
            { label: "NYC Healthy Restaurants", href: "/search" },
            { label: boroughName },
          ]} />

          <h1 className="mt-2 font-serif text-3xl font-bold text-forest md:text-5xl">
            Healthy Restaurants in {boroughName}, NYC
          </h1>
          <p className="mt-2 text-base text-gray-500 md:text-lg">
            {totalCount.toLocaleString()} curated destinations serving health-focused cuisine across {boroughName}.
          </p>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-forest">{totalCount} restaurants</span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-sage">⭐ {gradeACount} Grade A</span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold" style={{ color: "var(--color-amber)" }}>
              ★ {stats._avg.rating ? stats._avg.rating.toFixed(1) : "N/A"} avg
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              🔄 Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          {intro && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600">{intro}</p>}

          {/* Data-driven insight — varies per borough */}
          {gradeACount > 0 && (
            <div className="mt-4 border-l-4 border-sage pl-4">
              <p className="text-sm text-gray-600">
                {gradeACount > totalCount * 0.7
                  ? `${Math.round(gradeACount / totalCount * 100)}% of ${boroughName}'s healthy restaurants hold a Grade A — well above the city average. That's not a marketing stat; it's straight from NYC Health Department records.`
                  : gradeACount > totalCount * 0.4
                    ? `About ${Math.round(gradeACount / totalCount * 100)}% of the healthy restaurants listed here carry a Grade A. Solid, though some neighborhoods in ${boroughName} perform noticeably better than others — scroll down to see the breakdown.`
                    : `Grade A coverage in ${boroughName} sits at ${Math.round(gradeACount / totalCount * 100)}%. That's lower than some other boroughs, but the restaurants that do hold an A tend to be genuinely committed to food safety.`}
              </p>
            </div>
          )}

          {/* Quick filter pills */}
          <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
            <Link href={`/search?borough=${boroughName}&open=true`} className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Open Now
            </Link>
            <Link href={`/search?borough=${boroughName}&grade=A`} className="flex-shrink-0 rounded-full border border-sage/20 bg-sage/10 px-3 py-2 text-xs font-semibold text-jade">
              ⭐ Grade A
            </Link>
            <Link href={`/search?borough=${boroughName}&hidden_gem=true`} className="flex-shrink-0 rounded-full border border-amber/20 bg-amber/10 px-3 py-2 text-xs font-semibold" style={{ color: "var(--color-amber)" }}>
              💎 Hidden Gems
            </Link>
            <Link href={`/map?borough=${boroughName}`} className="flex-shrink-0 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">
              🗺️ Map View
            </Link>
          </div>
        </div>
      </div>

      {/* ─── STICKY JUMP NAV ─── */}
      <div className="sticky top-16 z-30 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto py-3">
            {neighborhoodsSorted.map(([hood, rs]) => (
              <a
                key={hood}
                href={`#neighborhood-${neighborhoodToSlug(hood)}`}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-all hover:border-jade hover:bg-sage/5 hover:text-jade"
              >
                {hood} <span className="ml-1 font-normal" style={{ color: "var(--color-muted)" }}>({rs.length})</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── NEIGHBOURHOOD SECTIONS ─── */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {neighborhoodsSorted.map(([neighborhood, neighborhoodRestaurants], neighborhoodIndex) => {
          const hoodSlug = neighborhoodToSlug(neighborhood)
          const gradeAInHood = neighborhoodRestaurants.filter((r) => r.inspection_grade === "A").length
          const ratedRestaurants = neighborhoodRestaurants.filter((r) => r.rating)
          const avgRating = ratedRestaurants.length > 0
            ? ratedRestaurants.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratedRestaurants.length
            : 0

          return (
            <React.Fragment key={neighborhood}>
            {/* Insert a tone-shifting aside after the 3rd neighborhood */}
            {neighborhoodIndex === 3 && (
              <div className="mb-16 rounded-xl bg-gray-50 px-6 py-5">
                <p className="text-sm text-gray-600">
                  <strong className="text-forest">A note on how we organize this page:</strong> Neighborhoods
                  are sorted by restaurant count, not by quality. A neighborhood with 5 restaurants isn&apos;t
                  worse than one with 50 — it just means fewer options. Some of the best restaurants in
                  {" "}{boroughName} are in smaller neighborhoods that most guides skip entirely.
                </p>
              </div>
            )}
            <section id={`neighborhood-${hoodSlug}`} className="mb-16 scroll-mt-32">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    Healthy Restaurants in {neighborhood}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-4">
                    <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                      {neighborhoodRestaurants.length} restaurants
                    </span>
                    {gradeAInHood > 0 && (
                      <span className="text-xs font-semibold text-sage">⭐ {gradeAInHood} Grade A</span>
                    )}
                    {avgRating > 0 && (
                      <span className="text-xs font-semibold" style={{ color: "var(--color-amber)" }}>
                        ★ {Math.round(avgRating * 10) / 10} avg
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
                  className="flex-shrink-0 rounded-xl border border-sage/30 px-4 py-2 text-xs font-semibold text-jade transition-colors hover:border-jade"
                >
                  View {neighborhood} guide →
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
                <div className="mt-4 text-center">
                  <Link
                    href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
                    className="inline-flex items-center gap-2 rounded-full border border-sage/30 px-6 py-3 text-sm font-semibold text-jade transition-colors hover:border-jade hover:bg-sage/5"
                  >
                    View all {neighborhoodRestaurants.length} restaurants in {neighborhood} →
                  </Link>
                </div>
              )}
            </section>
            </React.Fragment>
          )
        })}
      </div>

      {/* ─── BOROUGH SUMMARY ─── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="rounded-2xl bg-forest p-8 md:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">
            {boroughName.toUpperCase()} HEALTHY DINING
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Explore {boroughName} by neighbourhood
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {neighborhoodsSorted.slice(0, 8).map(([hood, rs]) => (
              <Link
                key={hood}
                href={`/nyc/${boroughSlug}/${neighborhoodToSlug(hood)}/healthy-restaurants`}
                className="group rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/20"
              >
                <p className="text-sm font-semibold text-white transition-colors group-hover:text-sage">{hood}</p>
                <p className="mt-1 text-xs text-white/50">{rs.length} restaurants</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTEXTUAL LINKS ─── */}
      <div className="mx-auto max-w-3xl px-4 pb-12 md:px-6">
        <p className="mb-4 text-base leading-relaxed text-gray-700">
          This page lists every published healthy restaurant in {boroughName} from our directory of {totalCount.toLocaleString()} verified NYC establishments. Each listing shows the official NYC Department of Health inspection grade, dietary certifications, and community ratings.
        </p>
        <ContextualLinks
          intro="Learn more about our data and methodology:"
          links={getBoroughContextualLinks(boroughName)}
        />
      </div>

      {/* ─── COMPARE CTA ─── */}
      <div className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest/10 bg-forest/5 p-6">
          <div>
            <p className="text-sm font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              How does {boroughName} compare to other boroughs?
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
              See health scores, Grade A rates, and hidden gem counts for every NYC neighborhood.
            </p>
          </div>
          <Link href="/nyc/compare" className="flex-shrink-0 rounded-xl border border-sage/30 px-5 py-2.5 text-sm font-semibold text-jade transition-all hover:border-jade hover:shadow-sm">
            📊 Compare neighborhoods →
          </Link>
        </div>
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
