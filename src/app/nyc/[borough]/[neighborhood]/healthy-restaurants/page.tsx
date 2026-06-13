import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, neighborhoodToSlug, formatDietaryTag } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { buildNeighborhoodKeywords } from "@/config/keywords"
import { BOROUGH_MAP } from "@/config/boroughs"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import ContextualLinks from "@/components/contextual-links"
import { getNeighborhoodContextualLinks } from "@/lib/internal-links"
import AboutThisData from "@/components/about-this-data"

export async function generateStaticParams() {
  const results = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: {
      business_status: "OPERATIONAL", is_published: true,
      borough: { not: null },
      neighborhood: { not: null },
    },
    having: { id: { _count: { gte: 3 } } },
    _count: { id: true },
  })

  return results
    .filter((r) => r.borough && r.neighborhood)
    .map((r) => ({
      borough: boroughToSlug(r.borough!),
      neighborhood: neighborhoodToSlug(r.neighborhood!),
    }))
}

export const revalidate = 86400

async function getBoroughAndNeighborhood(
  boroughSlug: string,
  neighborhoodSlug: string
) {
  const boroughName = BOROUGH_MAP[boroughSlug]
  if (!boroughName) return null

  const neighborhoods = await prisma.restaurant.findMany({
    where: { borough: boroughName, business_status: "OPERATIONAL", is_published: true, neighborhood: { not: null } },
    select: { neighborhood: true },
    distinct: ["neighborhood"],
  })

  const matchedNeighborhood = neighborhoods
    .map((n) => n.neighborhood!)
    .find((n) => neighborhoodToSlug(n) === neighborhoodSlug)

  if (!matchedNeighborhood) return null
  return { boroughName, neighborhoodName: matchedNeighborhood }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}): Promise<Metadata> {
  const { borough, neighborhood } = await params
  const resolved = await getBoroughAndNeighborhood(borough, neighborhood)
  if (!resolved) return { title: "Not Found" }

  const canonicalUrl = getCanonicalUrl(`/nyc/${borough}/${neighborhood}/healthy-restaurants`)
  const kwds = buildNeighborhoodKeywords(resolved.neighborhoodName, resolved.boroughName)
  return {
    title: kwds.metaTitle,
    description: kwds.metaDescription(0),
    alternates: { canonical: canonicalUrl },
    openGraph: { url: canonicalUrl, type: "website" },
    robots: { index: true, follow: true },
  }
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ borough: string; neighborhood: string }>
}) {
  const { borough: boroughSlug, neighborhood: neighborhoodSlug } = await params
  const resolved = await getBoroughAndNeighborhood(boroughSlug, neighborhoodSlug)
  if (!resolved) notFound()

  const { boroughName, neighborhoodName } = resolved

  const [restaurants, stats, gradeACount] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        borough: boroughName,
        neighborhood: neighborhoodName,
        business_status: "OPERATIONAL", is_published: true,
      },
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
      take: 24,
    }),
    prisma.restaurant.aggregate({
      where: {
        borough: boroughName,
        neighborhood: neighborhoodName,
        business_status: "OPERATIONAL", is_published: true,
      },
      _count: { id: true },
      _avg: { rating: true },
    }),
    prisma.restaurant.count({
      where: {
        borough: boroughName,
        neighborhood: neighborhoodName,
        inspection_grade: "A",
      },
    }),
  ])

  if (restaurants.length < 3) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const dietLinks = ["vegan", "halal", "gluten-free"]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: boroughName, item: `${siteUrl}/nyc/${boroughSlug}/healthy-restaurants` },
      { "@type": "ListItem", position: 3, name: neighborhoodName, item: `${siteUrl}/nyc/${boroughSlug}/${neighborhoodSlug}/healthy-restaurants` },
      { "@type": "ListItem", position: 4, name: "Healthy Restaurants" },
    ],
  }

  const avgRating = restaurants.reduce((sum, r) => sum + (r.rating ?? 0), 0) / restaurants.length
  const roundedAvg = Math.round(avgRating * 10) / 10

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Healthy Restaurants in ${neighborhoodName}, ${boroughName}`,
    description: `${restaurants.length} healthy restaurants in ${neighborhoodName}, ${boroughName}, NYC`,
    numberOfItems: restaurants.length,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: roundedAvg || 4.3,
      reviewCount: restaurants.length,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }}
      />

      {/* ─── HERO ─── */}
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb items={[
            { label: "NYC", href: "/search" },
            { label: boroughName, href: `/nyc/${boroughSlug}/healthy-restaurants` },
            { label: neighborhoodName },
          ]} />

          <p className="eyebrow mt-6">
            Neighborhood
            <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>
              {boroughName}, NYC
            </span>
          </p>

          <h1 className="display-1 mt-3">
            Healthy restaurants in {neighborhoodName}.
          </h1>

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>{stats._count.id.toLocaleString()}</span> curated spots in {neighborhoodName} — every listing tied to a real NYC Department of Health inspection grade.
          </p>

          {/* Inline stats */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Restaurants</span>
              <span className="tabular font-semibold">{stats._count.id.toLocaleString()}</span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Avg rating</span>
              <span className="tabular font-semibold">
                {stats._avg.rating ? `${stats._avg.rating.toFixed(1)} ★` : "—"}
              </span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Grade A</span>
              <span className="tabular font-semibold">{gradeACount.toLocaleString()}</span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span
              className="eyebrow inline-flex items-center gap-1"
              style={{ color: "var(--color-muted)" }}
            >
              <span>Updated</span>
              <span style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-body)", fontWeight: 500 }}>
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </span>
          </div>

          {/* Quick filters — homepage callout pattern */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <Link
              href={`/search?borough=${boroughName}&neighborhood=${neighborhoodName}&open=true`}
              className="callout"
            >
              <span className="callout-initial">O<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Open right now</span>
              <span className="callout-pulse" aria-hidden="true" />
            </Link>
            <Link
              href={`/search?borough=${boroughName}&neighborhood=${neighborhoodName}&grade=A`}
              className="callout"
            >
              <span className="callout-initial">A<span style={{ color: "var(--color-muted)" }}>.</span></span>
              <span className="callout-label">Grade A only</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* ─── Restaurant grid ─── */}
        <div className="mb-12">
          <p className="eyebrow">Listings</p>
          <h2 className="h2-serif mt-2">Top {Math.min(restaurants.length, 24)} spots</h2>
          <p className="dek mt-2" style={{ fontSize: "0.95rem" }}>
            Ranked by editorial priority, rating, and review depth.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
            ))}
          </div>
        </div>

        {/* ─── Diet sub-links ─── */}
        <section
          className="mt-16 border-t pt-10"
          style={{ borderTopColor: "var(--hairline)" }}
        >
          <p className="eyebrow">Browse by diet</p>
          <h2 className="h2-serif mt-2">
            Dietary options in {neighborhoodName}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {dietLinks.map((tag) => (
              <Link
                key={tag}
                href={`/healthy-restaurants/${tag}`}
                className="group block border p-5 transition-colors"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "var(--hairline)",
                  borderRadius: "4px",
                }}
              >
                <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
                  Dietary
                </p>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "var(--color-forest)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {formatDietaryTag(tag)} in {neighborhoodName}
                </p>
                <p
                  className="eyebrow mt-2 inline-flex items-center gap-1.5"
                  style={{ color: "var(--color-jade)" }}
                >
                  See spots
                  <span aria-hidden="true">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ─── Contextual links ─── */}
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
          {neighborhoodName} is one of the dining areas we track in {boroughName}, New York City. Every listing includes the official NYC Department of Health inspection grade.
        </p>
        <ContextualLinks
          intro="Explore further:"
          links={getNeighborhoodContextualLinks(neighborhoodName, boroughName)}
        />
      </div>

      {/* ─── About this data ─── */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <AboutThisData
          variant="hub"
          restaurantCount={restaurants.length}
          gradeACount={gradeACount}
          lastRefreshed="April 2026"
          borough={boroughName}
        />
      </div>

      {/* ─── FAQ ─── */}
      <FAQSection
        faqs={[
          {
            question: `What are the best healthy restaurants in ${neighborhoodName}?`,
            answer: `${neighborhoodName} has ${restaurants.length} healthy restaurants in our directory. The top-rated options include ${restaurants.slice(0, 3).map((r) => r.name).join(", ")}. Use the filters above to narrow by dietary need or health inspection grade.`,
          },
          {
            question: `Are there vegan restaurants in ${neighborhoodName}?`,
            answer: `Yes — ${neighborhoodName} has several vegan and plant-based dining options. Filter by the vegan dietary tag above to see all vegan restaurants in this neighborhood.`,
          },
          {
            question: `Which restaurants in ${neighborhoodName} have a Grade A health inspection?`,
            answer: `${gradeACount} restaurants in ${neighborhoodName} currently hold a Grade A from the NYC Department of Health. Use the Grade A filter to see only top-graded establishments.`,
          },
          {
            question: `How many healthy restaurants are in ${neighborhoodName}?`,
            answer: `There are currently ${restaurants.length} healthy restaurants listed in ${neighborhoodName}, ${boroughName}. This includes ${Array.from(new Set(restaurants.map((r) => r.type).filter(Boolean))).slice(0, 3).join(", ")} and more.`,
          },
          {
            question: `What neighborhoods are near ${neighborhoodName} for healthy eating?`,
            answer: `${neighborhoodName} is located in ${boroughName}. Nearby neighborhoods also have strong healthy dining options — use the neighborhood comparison tool to see how they rank.`,
          },
        ]}
        heading={`Healthy Restaurants in ${neighborhoodName} — FAQ`}
        subheading={`Common questions about dining in ${neighborhoodName}, ${boroughName}.`}
      />
    </>
  )
}
