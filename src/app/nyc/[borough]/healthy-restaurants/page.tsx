import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { formatPriceRange, parseDietaryTags, formatDietaryTag } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP, BOROUGH_FAQS } from "@/config/boroughs"
import BoroughFilters from "@/components/borough-filters"
import FAQSection from "@/components/faq-section"

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
  const canonicalUrl = getCanonicalUrl(`/nyc/${borough}/healthy-restaurants`)
  return {
    title: `Healthy Restaurants in ${name}, NYC (2026)`,
    description: `Find healthy restaurants in ${name}, NYC. Filter by vegan, gluten-free, halal and more. View NYC health inspection grades for every listing.`,
    alternates: { canonical: canonicalUrl },
    openGraph: { url: canonicalUrl, type: "website" },
    robots: { index: true, follow: true },
  }
}

const PAGE_SIZE = 24

export default async function BoroughPage({
  params,
  searchParams,
}: {
  params: Promise<{ borough: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { borough: boroughSlug } = await params
  const { page: pageParam } = await searchParams
  const boroughName = BOROUGH_MAP[boroughSlug]
  if (!boroughName) notFound()

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10))
  const skip = (currentPage - 1) * PAGE_SIZE

  const [restaurants, stats, gradeACount] = await Promise.all([
    prisma.restaurant.findMany({
      where: { borough: boroughName, business_status: "OPERATIONAL" },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: PAGE_SIZE,
      skip,
    }),
    prisma.restaurant.aggregate({
      where: { borough: boroughName, business_status: "OPERATIONAL" },
      _count: { id: true },
      _avg: { rating: true },
    }),
    prisma.restaurant.count({
      where: { borough: boroughName, inspection_grade: "A" },
    }),
  ])

  const totalCount = stats._count.id
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: boroughName,
        item: `${siteUrl}/nyc/${boroughSlug}/healthy-restaurants`,
      },
      { "@type": "ListItem", position: 3, name: "Healthy Restaurants" },
    ],
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Healthy Restaurants in ${boroughName}, NYC`,
    description: `${stats._count.id} healthy restaurants in ${boroughName}, New York City`,
    numberOfItems: stats._count.id,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 4.3,
      reviewCount: stats._count.id,
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

      {/* ─── HEADER AREA ─── */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* Breadcrumb */}
          <nav className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            <Link href="/" className="hover:text-jade transition-colors">
              NYC
            </Link>
            <span className="mx-2">/</span>
            <span className="text-forest">{boroughName.toUpperCase()}</span>
          </nav>

          {/* H1 */}
          <h1 className="mt-2 font-serif text-4xl font-bold text-forest md:text-5xl">
            {boroughName} Culinary Guide
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            {totalCount.toLocaleString()} curated destinations serving health-focused cuisine across{" "}
            {boroughName}.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
            <span>🔄</span>
            Data sourced from NYC Department of Health. Updated{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
            Showing {stats._count.id} active restaurants.
          </p>

          {/* Actions row */}
          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-lg border border-forest px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white"
            >
              🗺️ View Map
            </Link>
            <p className="text-sm text-gray-400">
              Showing {skip + 1}–{Math.min(skip + restaurants.length, totalCount)} of{" "}
              {totalCount.toLocaleString()} results
            </p>
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─── */}
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        {/* Sidebar */}
        <BoroughFilters boroughSlug={boroughSlug} boroughName={boroughName} />

        {/* Restaurant list */}
        <div className="flex-1">
          {/* Quick filter bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              Quick filters:
            </span>
            <Link
              href={`/search?borough=${boroughName}&open=true`}
              className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Open Right Now
            </Link>
            <Link
              href={`/search?borough=${boroughName}&grade=A`}
              className="rounded-full border border-sage/20 bg-sage/10 px-4 py-2 text-xs font-semibold text-jade transition-colors hover:bg-sage/20"
            >
              ⭐ Grade A Only
            </Link>
            <Link
              href={`/search?borough=${boroughName}&hidden_gem=true`}
              className="rounded-full border border-amber/20 bg-amber/10 px-4 py-2 text-xs font-semibold transition-colors hover:bg-amber/20"
              style={{ color: "var(--color-amber)" }}
            >
              💎 Hidden Gems
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {restaurants.map((r, i) => {
              const tags = parseDietaryTags(r.dietary_tags)
              const price = formatPriceRange(r.price_range)
              const priceLabel =
                r.price_range === 1
                  ? "Budget"
                  : r.price_range === 2
                    ? "Moderate"
                    : r.price_range === 3
                      ? "Upscale"
                      : r.price_range === 4
                        ? "Fine Dining"
                        : null

              return (
                <div
                  key={r.id}
                  className="flex cursor-pointer gap-6 overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-lg"
                >
                  {/* Photo */}
                  <div className="relative h-52 w-64 flex-shrink-0">
                    {r.photo ? (
                      <Image
                        src={r.photo}
                        alt={`${r.name} — ${r.neighborhood ?? boroughName}, NYC`}
                        fill
                        className="object-cover"
                        unoptimized
                        priority={i === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-jade" />
                    )}
                    {i === 0 && (
                      <span className="absolute left-3 top-3 rounded bg-amber px-2 py-1 text-xs font-bold text-white">
                        PROMOTED
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {r.type && (
                            <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-jade">
                              {r.type}
                            </span>
                          )}
                          {r.neighborhood && (
                            <span className="text-xs text-gray-400">{r.neighborhood}</span>
                          )}
                        </div>
                        {r.rating != null && (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-amber">★ {r.rating.toFixed(1)}</span>
                            {r.reviews != null && (
                              <span className="text-xs text-gray-400">({r.reviews})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <Link
                        href={`/restaurants/${r.slug}`}
                        className="mt-2 block font-serif text-2xl font-bold text-forest transition-colors hover:text-jade"
                      >
                        {r.name}
                      </Link>

                      {/* Description */}
                      {r.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{r.description}</p>
                      )}

                      {/* Dietary chips */}
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-jade"
                            >
                              {formatDietaryTag(tag)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400">
                            HEALTH GRADE
                          </p>
                          <p className="text-sm font-bold text-forest">
                            {r.inspection_grade ? `GRADE ${r.inspection_grade}` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400">PRICING</p>
                          <p className="text-sm font-bold text-forest">
                            {price && priceLabel ? `${price} • ${priceLabel}` : price || "—"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/restaurants/${r.slug}`}
                        className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-jade"
                      >
                        Book Table →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {/* Prev */}
              {currentPage > 1 ? (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-sm transition-colors hover:border-jade hover:text-jade"
                >
                  ←
                </Link>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-sm text-gray-300">
                  ←
                </span>
              )}

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1
                return (
                  <Link
                    key={page}
                    href={`?page=${page}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors ${
                      page === currentPage
                        ? "border-forest bg-forest font-semibold text-white"
                        : "border-gray-200 text-gray-600 hover:border-jade hover:text-jade"
                    }`}
                  >
                    {page}
                  </Link>
                )
              })}

              {/* Next */}
              {currentPage < totalPages ? (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-sm transition-colors hover:border-jade hover:text-jade"
                >
                  →
                </Link>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-sm text-gray-300">
                  →
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── COMPARE CTA ─── */}
      <div className="mx-auto max-w-7xl px-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest/10 bg-forest/5 p-6">
          <div>
            <p className="text-sm font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              How does {boroughName} compare to other boroughs?
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
              See health scores, Grade A rates, and hidden gem counts for every NYC neighborhood.
            </p>
          </div>
          <Link
            href="/nyc/compare"
            className="flex-shrink-0 rounded-xl border border-sage/30 px-5 py-2.5 text-sm font-semibold text-jade transition-all hover:border-jade hover:shadow-sm"
          >
            📊 Compare neighborhoods →
          </Link>
        </div>
      </div>

      {/* ─── FAQ SECTION ─── */}
      {BOROUGH_FAQS[boroughSlug]?.length > 0 && (
        <FAQSection
          faqs={BOROUGH_FAQS[boroughSlug]}
          heading={`Healthy Restaurants in ${boroughName} — FAQ`}
          subheading={`Common questions about finding healthy food in ${boroughName}, NYC.`}
        />
      )}
    </>
  )
}
