import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import {
  formatPriceRange,
  parseDietaryTags,
  formatDietaryTag,
  boroughToSlug,
  neighborhoodToSlug,
  getOpenStatus,
  parseWorkingHours,
  getRestaurantImageAlt,
  buildTitle,
} from "@/lib/utils"
import MapWrapper from "@/components/map-wrapper"
import HealthScoreCard from "@/components/health-score-card"
import CommunityRating from "@/components/community-rating"
import ShareExperience from "@/components/share-experience"
import ContextualLinks from "@/components/contextual-links"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import { getRestaurantContextualLinks } from "@/lib/internal-links"
import { buildRestaurantSchema, ORGANIZATION_SCHEMA } from "@/lib/schema"
import AccuracyFeedback from "@/components/accuracy-feedback"
import { getCanonicalUrl } from "@/config/seo"
import SaveButton from "@/components/save-button"
import OpenNowBadge from "@/components/open-now-badge"
import CompareButton from "@/components/compare-button"

export const revalidate = 86400

export async function generateStaticParams() {
  const restaurants = await prisma.restaurant.findMany({
    where: { is_published: true },
    select: { slug: true },
  })
  return restaurants.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } })
  if (!restaurant) return { title: "Restaurant Not Found" }

  const tags = parseDietaryTags(restaurant.dietary_tags)
  const description =
    restaurant.description?.slice(0, 155) ||
    `Discover ${restaurant.name} in ${restaurant.neighborhood ?? "NYC"}. ${tags.length > 0 ? tags.map(formatDietaryTag).join(", ") + ". " : ""}Health grade: ${restaurant.inspection_grade ?? "N/A"}. ${restaurant.rating ?? "N/A"}/5 from ${restaurant.reviews ?? 0} reviews.`

  const canonicalUrl = getCanonicalUrl(`/restaurants/${restaurant.slug}`)

  return {
    title: buildTitle({
      name: restaurant.name,
      location: restaurant.neighborhood ? `${restaurant.neighborhood}, NYC` : "New York City",
      suffix: restaurant.inspection_grade === "A" ? "Grade A" : undefined,
    }),
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${restaurant.name} — ${restaurant.neighborhood ?? "NYC"}`,
      description,
      url: canonicalUrl,
      ...(restaurant.photo ? { images: [{ url: restaurant.photo, alt: restaurant.name }] } : {}),
    },
    robots: { index: true, follow: true },
  }
}

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } })
  if (!restaurant || !restaurant.is_published) notFound()

  const price = formatPriceRange(restaurant.price_range)
  const priceLabel =
    restaurant.price_range === 1
      ? "Budget"
      : restaurant.price_range === 2
        ? "Mid-Range"
        : restaurant.price_range === 3
          ? "Upscale"
          : restaurant.price_range === 4
            ? "Fine Dining"
            : null
  const tags = parseDietaryTags(restaurant.dietary_tags)
  const openStatus = getOpenStatus(restaurant.working_hours)
  const hours = parseWorkingHours(restaurant.working_hours)
  const boroughSlug = restaurant.borough ? boroughToSlug(restaurant.borough) : null
  const neighborhoodSlug = restaurant.neighborhood
    ? neighborhoodToSlug(restaurant.neighborhood)
    : null

  const todayName = DAYS_ORDER[new Date().getDay()]

  const breadcrumbItems = [
    { label: "NYC Healthy Restaurants", href: "/search" },
    ...(restaurant.borough && boroughSlug ? [{ label: restaurant.borough, href: `/nyc/${boroughSlug}/healthy-restaurants` }] : []),
    ...(restaurant.neighborhood && boroughSlug && neighborhoodSlug ? [{ label: restaurant.neighborhood, href: `/nyc/${boroughSlug}/${neighborhoodSlug}/healthy-restaurants` }] : []),
    { label: restaurant.name },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [buildRestaurantSchema(restaurant), ORGANIZATION_SCHEMA] }),
        }}
      />

      {/* ─── BREADCRUMB ─── */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <TopicalBreadcrumb items={breadcrumbItems} />
      </div>

      {/* ─── PHOTO GALLERY ─── */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid h-96 grid-cols-2 gap-2">
          {/* Left — main photo */}
          <div className="relative col-span-1 overflow-hidden rounded-2xl">
            {restaurant.photo ? (
              <Image
                src={restaurant.photo}
                alt={getRestaurantImageAlt({ name: restaurant.name, type: restaurant.type, neighborhood: restaurant.neighborhood, borough: restaurant.borough })}
                fill
                className="object-cover"
                priority
                unoptimized
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-jade">
                <span className="font-serif text-6xl font-bold text-white/50">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Right — two stacked cells */}
          <div className="col-span-1 grid grid-rows-2 gap-2">
            {/* Top cell — same photo, different crop */}
            <div className="relative overflow-hidden rounded-2xl">
              {restaurant.photo ? (
                <Image
                  src={restaurant.photo}
                  alt={`${restaurant.name} interior — ${restaurant.neighborhood ?? "NYC"}`}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-forest/80" />
              )}
            </div>

            {/* Bottom cell — neighborhood label placeholder */}
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-forest">
              <div className="text-center">
                {restaurant.neighborhood && (
                  <p className="font-serif text-xl font-bold text-white">
                    {restaurant.neighborhood}
                  </p>
                )}
                <p className="mt-1 text-xs uppercase tracking-widest text-white/50">
                  {restaurant.borough}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── HEADER INFO BLOCK ─── */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Badges + CTA row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {restaurant.rating != null && (
              <span
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold"
                style={{ backgroundColor: "rgba(212,168,83,0.15)", color: "var(--color-amber)" }}
              >
                ★ {restaurant.rating.toFixed(1)}
                {restaurant.reviews != null && (
                  <span className="font-normal">
                    {" "}({(restaurant.reviews / 1000).toFixed(1)}K REVIEWS)
                  </span>
                )}
              </span>
            )}
            {restaurant.inspection_grade && (
              <span
                className="rounded-full border px-4 py-2 text-sm font-bold"
                style={{
                  backgroundColor: "rgba(82,183,136,0.15)",
                  color: "var(--color-jade)",
                  borderColor: "rgba(82,183,136,0.3)",
                }}
              >
                {restaurant.inspection_grade} — HEALTH GRADE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={restaurant.website || (restaurant.phone ? `tel:${restaurant.phone}` : "#")}
              target={restaurant.website ? "_blank" : undefined}
              rel={restaurant.website ? "noopener noreferrer" : undefined}
              className="rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-jade"
            >
              BOOK A TABLE
            </a>
            <SaveButton
              restaurant={{
                slug: restaurant.slug,
                name: restaurant.name,
                neighborhood: restaurant.neighborhood,
                borough: restaurant.borough,
                rating: restaurant.rating,
                inspection_grade: restaurant.inspection_grade,
                dietary_tags: restaurant.dietary_tags,
                photo: restaurant.photo,
                is_hidden_gem: restaurant.is_hidden_gem,
                savedAt: "",
              }}
              variant="full"
            />
            <CompareButton
              restaurant={{
                slug: restaurant.slug,
                name: restaurant.name,
                neighborhood: restaurant.neighborhood,
                borough: restaurant.borough,
                rating: restaurant.rating,
                reviews: restaurant.reviews,
                inspection_grade: restaurant.inspection_grade,
                inspection_score: restaurant.inspection_score,
                dietary_tags: restaurant.dietary_tags,
                photo: restaurant.photo,
                price_range: restaurant.price_range,
                is_hidden_gem: restaurant.is_hidden_gem,
                type: restaurant.type,
                address: restaurant.address,
                phone: restaurant.phone,
                website: restaurant.website,
                working_hours: restaurant.working_hours,
              }}
              variant="full"
            />
          </div>
        </div>

        {/* Restaurant name */}
        <h1 className="mt-4 font-serif text-4xl font-bold text-forest md:text-5xl">
          {restaurant.name}
        </h1>

        {/* Details row */}
        <div className="mt-3 flex flex-wrap items-center gap-6">
          {(price || priceLabel) && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              💳 {[price, priceLabel].filter(Boolean).join(" • ")}
            </span>
          )}
          {restaurant.type && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              🌿 {restaurant.type}
            </span>
          )}
          <OpenNowBadge
            workingHours={restaurant.working_hours}
            showClosingTime={true}
            size="md"
          />
        </div>
      </div>

      {/* ─── MAIN CONTENT: TWO-COLUMN ─── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Curated Story */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-forest">
                The Curated Culinary Story
              </h2>
              {restaurant.description ? (
                <p className="mt-4 text-base leading-relaxed text-gray-700">
                  {restaurant.description}
                </p>
              ) : (
                <p className="mt-4 text-base leading-relaxed text-gray-400 italic">
                  No description available for this restaurant yet.
                </p>
              )}
            </section>

            {/* Dietary Specializations */}
            {tags.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-bold text-forest">
                  Dietary Specializations
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/healthy-restaurants/${tag}`}
                      className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-jade transition-colors hover:bg-sage/10"
                      style={{ borderColor: "rgba(82,183,136,0.3)" }}
                    >
                      🌿 {formatDietaryTag(tag)}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Community Rating */}
            <CommunityRating
              rating={restaurant.rating}
              reviews={restaurant.reviews ?? 0}
              restaurantName={restaurant.name}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
              address={restaurant.address ?? ""}
            />

            {/* Share Experience */}
            <ShareExperience
              restaurantSlug={restaurant.slug}
              restaurantName={restaurant.name}
            />

            {/* Accuracy Feedback */}
            <AccuracyFeedback restaurantSlug={restaurant.slug} />

            {/* Health Inspection */}
            {restaurant.inspection_grade && (
              <section>
                <h2 className="font-serif text-xl font-bold text-forest">NYC Health Inspection</h2>
                <div className="mt-4 flex items-start gap-4">
                  <span
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border-2 font-serif text-2xl font-bold"
                    style={{
                      borderColor:
                        restaurant.inspection_grade === "A"
                          ? "var(--color-sage)"
                          : restaurant.inspection_grade === "B"
                            ? "#FBBF24"
                            : "#F97316",
                      color:
                        restaurant.inspection_grade === "A"
                          ? "var(--color-jade)"
                          : restaurant.inspection_grade === "B"
                            ? "#92400E"
                            : "#7C2D12",
                      backgroundColor:
                        restaurant.inspection_grade === "A"
                          ? "rgba(82,183,136,0.1)"
                          : restaurant.inspection_grade === "B"
                            ? "rgba(251,191,36,0.1)"
                            : "rgba(249,115,22,0.1)",
                    }}
                  >
                    {restaurant.inspection_grade}
                  </span>
                  <div className="space-y-1 text-sm text-gray-600">
                    {restaurant.inspection_score != null && (
                      <p>
                        Score:{" "}
                        <span className="font-medium">{restaurant.inspection_score}</span>{" "}
                        <span className="text-gray-400">(lower is better)</span>
                      </p>
                    )}
                    {restaurant.inspection_date && (
                      <p>Last inspected: {restaurant.inspection_date}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      NYC restaurants are graded by the Department of Health. Grade A means the
                      restaurant has very good food safety practices.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Contextual internal links */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>EXPLORE MORE</p>
              <ContextualLinks
                intro={`${restaurant.name} is one of many healthy restaurants in our directory. Explore`}
                links={getRestaurantContextualLinks(restaurant.neighborhood, restaurant.borough, restaurant.dietary_tags)}
                className="mb-4"
              />
              {tags.length > 0 && (
                <ContextualLinks
                  intro="Browse by dietary need:"
                  links={tags.slice(0, 3).map((tag) => [`${formatDietaryTag(tag).toLowerCase()} restaurants in NYC` as string, `/healthy-restaurants/${tag}`] as [string, string])}
                />
              )}
            </div>

            {/* Topical authority footer */}
            <div className="mt-10 border-t border-gray-100 pt-8 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              <p>
                {restaurant.name} is listed in the{" "}
                <Link href="/" className="font-medium text-jade underline underline-offset-2 hover:text-forest">Eat Real Food NYC directory</Link>
                {restaurant.borough && boroughSlug && (
                  <>{" "}— a curated database of{" "}
                    <Link href={`/nyc/${boroughSlug}/healthy-restaurants`} className="font-medium text-jade underline underline-offset-2 hover:text-forest">
                      healthy restaurants in {restaurant.borough}
                    </Link>
                  </>
                )}
                , verified with official NYC Department of Health inspection data.{" "}
                <Link href="/guides/nyc-health-grades-explained" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
                  Learn how NYC health grades work →
                </Link>
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-1">
            <HealthScoreCard restaurant={restaurant} />

            {/* Data freshness signal */}
            <div className="mt-3 flex items-center gap-2 px-1">
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                🔄 Data sourced from NYC DOHMH Open Data.
                {restaurant.inspection_date && (
                  <> Inspection record dated {new Date(restaurant.inspection_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}.</>
                )}
                {" "}Directory updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
              </span>
            </div>

            <div className="mt-6 sticky top-24 rounded-2xl border border-gray-100 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Location &amp; Contact
              </p>

              {/* Map */}
              <div className="mb-4 overflow-hidden rounded-xl" style={{ height: "180px" }}>
                {restaurant.latitude != null && restaurant.longitude != null ? (
                  <div suppressHydrationWarning style={{ height: "180px" }}>
                    <MapWrapper
                      lat={restaurant.latitude}
                      lng={restaurant.longitude}
                      name={restaurant.name}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl bg-forest/10 text-3xl">
                    🗺️
                  </div>
                )}
              </div>

              {/* Address */}
              {restaurant.address && (
                <div className="flex items-start gap-3 border-b border-gray-100 py-3 text-sm text-gray-700">
                  <span className="mt-0.5 flex-shrink-0">📍</span>
                  <span>{restaurant.address}</span>
                </div>
              )}

              {/* Phone */}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-start gap-3 border-b border-gray-100 py-3 text-sm text-gray-700 hover:text-jade transition-colors"
                >
                  <span className="mt-0.5 flex-shrink-0">📞</span>
                  <span>{restaurant.phone}</span>
                </a>
              )}

              {/* Website */}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 border-b border-gray-100 py-3 text-sm text-gray-700 hover:text-jade transition-colors"
                >
                  <span className="mt-0.5 flex-shrink-0">🌐</span>
                  <span className="truncate">{restaurant.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {restaurant.latitude != null && restaurant.longitude != null && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium transition-colors hover:border-jade"
                  >
                    Directions
                  </a>
                )}
                <button className="rounded-xl border border-gray-200 py-2.5 text-sm font-medium transition-colors hover:border-jade">
                  Share
                </button>
              </div>

              {/* Hours */}
              {hours.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Hours of Operation
                  </p>
                  <div className="space-y-2">
                    {hours.map(({ day, hours: h }) => (
                      <div
                        key={day}
                        className={`flex justify-between text-sm ${
                          day === todayName ? "font-bold text-jade" : ""
                        }`}
                      >
                        <span className={day === todayName ? "text-jade" : "text-gray-500"}>
                          {day}
                        </span>
                        <span className={day === todayName ? "text-jade" : "text-forest font-medium"}>
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── EXPLORE MORE ─── */}
      <div className="mx-auto max-w-7xl border-t border-gray-200 px-6 py-10">
        <h2 className="font-serif text-2xl font-bold text-forest">Explore More</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {restaurant.neighborhood && boroughSlug && neighborhoodSlug && (
            <Link
              href={`/nyc/${boroughSlug}/${neighborhoodSlug}/healthy-restaurants`}
              className="cursor-pointer rounded-xl border border-gray-200 p-4 transition-all hover:border-jade hover:shadow-sm"
            >
              <span className="text-xl">🏙️</span>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">NEIGHBORHOOD</p>
              <p className="mt-1 text-sm font-semibold text-forest">
                {restaurant.neighborhood}
              </p>
            </Link>
          )}
          {restaurant.borough && boroughSlug && (
            <Link
              href={`/nyc/${boroughSlug}/healthy-restaurants`}
              className="cursor-pointer rounded-xl border border-gray-200 p-4 transition-all hover:border-jade hover:shadow-sm"
            >
              <span className="text-xl">🗺️</span>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">BOROUGH</p>
              <p className="mt-1 text-sm font-semibold text-forest">{restaurant.borough}</p>
            </Link>
          )}
          {tags.slice(0, 2).map((tag) => (
            <Link
              key={tag}
              href={`/healthy-restaurants/${tag}`}
              className="cursor-pointer rounded-xl border border-gray-200 p-4 transition-all hover:border-jade hover:shadow-sm"
            >
              <span className="text-xl">🌿</span>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">DIETARY</p>
              <p className="mt-1 text-sm font-semibold text-forest">{formatDietaryTag(tag)}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
