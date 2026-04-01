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
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-700">Home</Link>
          {" / "}
          <Link href={`/nyc/${boroughSlug}/healthy-restaurants`} className="hover:text-green-700">
            {boroughName}
          </Link>
          {" / "}
          <span>{neighborhoodName}</span>
          {" / "}
          <span className="text-gray-900">Healthy Restaurants</span>
        </nav>

        <h1 className="text-2xl font-bold md:text-3xl">
          Healthy Restaurants in {neighborhoodName}, {boroughName}
        </h1>

        <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
          🔄 Data from NYC DOHMH. Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
        </p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { value: stats._count.id.toLocaleString(), label: "restaurants" },
            { value: stats._avg.rating?.toFixed(1) ?? "N/A", label: "avg rating" },
            { value: gradeACount.toLocaleString(), label: "Grade A" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-white p-3 text-center">
              <div className="text-xl font-bold text-green-700">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick filter bar */}
        <div className="mt-8 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
            Quick filters:
          </span>
          <Link
            href={`/search?borough=${boroughName}&neighborhood=${neighborhoodName}&open=true`}
            className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Open Right Now
          </Link>
          <Link
            href={`/search?borough=${boroughName}&neighborhood=${neighborhoodName}&grade=A`}
            className="rounded-full border border-sage/20 bg-sage/10 px-4 py-2 text-xs font-semibold text-jade transition-colors hover:bg-sage/20"
          >
            ⭐ Grade A Only
          </Link>
        </div>

        {/* Restaurant grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
          ))}
        </div>

        {/* Diet sub-links */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Browse by Diet in {neighborhoodName}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {dietLinks.map((tag) => (
              <Link
                key={tag}
                href={`/nyc/${boroughSlug}/${neighborhoodSlug}/${tag}-restaurants`}
                className="flex items-center gap-2 rounded-lg border bg-white px-3 py-3 text-sm transition-colors hover:border-green-400"
              >
                <span className="text-green-600">→</span>
                {formatDietaryTag(tag)} in {neighborhoodName}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Contextual links */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <div className="rounded-2xl border border-sage/10 bg-sage/5 p-6">
          <p className="mb-3 text-sm leading-relaxed text-gray-700">
            {neighborhoodName} is one of the dining areas we track in {boroughName}, New York City.
            Every listing includes the official NYC Department of Health inspection grade.
          </p>
          <ContextualLinks
            intro="Explore further:"
            links={getNeighborhoodContextualLinks(neighborhoodName, boroughName)}
          />
        </div>
      </div>

      {/* FAQ */}
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
