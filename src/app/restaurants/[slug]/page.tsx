import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import {
  formatPriceRange,
  parseDietaryTags,
  formatDietaryTag,
  boroughToSlug,
  neighborhoodToSlug,
  parseWorkingHours,
  getRestaurantImageAlt,
  buildTitle,
} from "@/lib/utils"
import MapWrapper from "@/components/map-wrapper"
import RestaurantPhotoGallery from "@/components/restaurant-photo-gallery"
import HealthScoreCard from "@/components/health-score-card"
import CommunityRating from "@/components/community-rating"
import ShareExperience from "@/components/share-experience"
import ContextualLinks from "@/components/contextual-links"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import { getListingHubLinks } from "@/lib/internal-links"
import { buildRestaurantSchema, ORGANIZATION_SCHEMA } from "@/lib/schema"
import AccuracyFeedback from "@/components/accuracy-feedback"
import { getCanonicalUrl } from "@/config/seo"
import SaveButton from "@/components/save-button"
import OpenNowBadge from "@/components/open-now-badge"
import CompareButton from "@/components/compare-button"
import VerifiedBadge from "@/components/VerifiedBadge"

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
  const locationStr = restaurant.neighborhood ? `${restaurant.neighborhood}, NYC` : "New York City"
  const tagStr = tags.length > 0 ? `${tags.slice(0, 3).map(formatDietaryTag).join(", ")}. ` : ""
  const gradeStr = restaurant.inspection_grade ? `NYC health grade: ${restaurant.inspection_grade}. ` : ""
  const ratingStr = restaurant.rating ? `Rated ${restaurant.rating}/5 from ${(restaurant.reviews ?? 0).toLocaleString()} reviews.` : ""
  const description = `${restaurant.name} is a healthy restaurant in ${locationStr}. ${tagStr}${gradeStr}${ratingStr}`.slice(0, 160)

  const canonicalUrl = getCanonicalUrl(`/restaurants/${restaurant.slug}`)

  return {
    title: buildTitle({
      name: restaurant.name,
      location: locationStr,
      suffix: "Healthy Restaurant",
    }),
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${restaurant.name} — ${restaurant.neighborhood ?? "NYC"}`,
      description,
      url: canonicalUrl,
      type: "website",
      ...(restaurant.photo ? { images: [{ url: restaurant.photo, alt: restaurant.name }] } : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: restaurant.name }] }),
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
  const hours = parseWorkingHours(restaurant.working_hours)
  const boroughSlug = restaurant.borough ? boroughToSlug(restaurant.borough) : null
  const neighborhoodSlug = restaurant.neighborhood
    ? neighborhoodToSlug(restaurant.neighborhood)
    : null

  const todayName = DAYS_ORDER[new Date().getDay()]
  const grade = restaurant.inspection_grade || ""
  const gradeAria = grade
    ? `NYC Department of Health inspection grade ${grade}`
    : "NYC Department of Health inspection grade pending"

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

      {/* ─── EDITORIAL HERO ───
          Name first, monumental plaque beside it as subject anchor. The
          letter carries the meaning; jade stays constant across A/B/C. */}
      <header className="mx-auto max-w-7xl px-6 pb-10 pt-8">
        {/* Eyebrow — restaurant type if known, else generic */}
        <p className="eyebrow">
          {restaurant.type || "Healthy restaurant"}
          {restaurant.is_hidden_gem && (
            <>
              <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
              <span style={{ color: "var(--color-amber)" }}>Hidden gem ✦</span>
            </>
          )}
        </p>

        {/* Main row: title left, monumental plaque right */}
        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="display-1">
              {restaurant.name}
              {restaurant.isVerified && (
                <span className="ml-3 inline-flex align-middle" style={{ verticalAlign: "0.15em" }}>
                  <VerifiedBadge />
                </span>
              )}
            </h1>

            {/* Subtitle: neighborhood · borough · price */}
            <p className="dek mt-3" style={{ color: "var(--color-text)" }}>
              {[
                restaurant.neighborhood,
                restaurant.borough,
                priceLabel || price,
              ]
                .filter(Boolean)
                .map((piece, i, arr) => (
                  <span key={`${piece}-${i}`}>
                    {piece}
                    {i < arr.length - 1 && (
                      <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
                    )}
                  </span>
                ))}
            </p>
          </div>

          {/* The subject anchor — monumental plaque echoing the DOHMH inspection placard */}
          <div className="hidden flex-shrink-0 flex-col items-center gap-2 sm:flex">
            <span
              className="plaque"
              data-grade={grade}
              aria-label={gradeAria}
              style={{ width: "5.5rem", height: "5.5rem", fontSize: "3rem" }}
            >
              {grade || "–"}
            </span>
            <span className="eyebrow" style={{ color: "var(--color-muted)" }}>
              NYC Health Grade
            </span>
          </div>
        </div>

        {/* Inline metadata: rating + open status — no pill chips */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {restaurant.rating != null && (
            <span
              aria-label={`Rated ${restaurant.rating.toFixed(1)} out of 5 from ${(restaurant.reviews ?? 0).toLocaleString()} reviews`}
              className="tabular inline-flex items-center gap-1.5"
              style={{ color: "var(--color-text)" }}
            >
              <span aria-hidden="true" style={{ color: "var(--color-amber)", fontSize: "1.05em" }}>★</span>
              <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
              <span style={{ color: "var(--color-muted)" }}>
                · {(restaurant.reviews ?? 0).toLocaleString()} reviews
              </span>
            </span>
          )}
          <OpenNowBadge workingHours={restaurant.working_hours} showClosingTime={true} size="md" />
          {/* Inline dietary tags — quiet, lowercase, with mid-dot separators */}
          {tags.length > 0 && (
            <span className="inline-flex flex-wrap items-center gap-x-1.5">
              {tags.slice(0, 4).map((tag, i) => (
                <span key={tag} className="inline-flex items-center">
                  {i > 0 && <span aria-hidden="true" className="mr-1.5" style={{ color: "var(--color-muted)" }}>·</span>}
                  <Link
                    href={`/healthy-restaurants/${tag}`}
                    className="lowercase transition-colors hover:underline"
                    style={{ color: "var(--color-jade)", textUnderlineOffset: "2px" }}
                  >
                    {formatDietaryTag(tag)}
                  </Link>
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Action row — typographic actions, no pill buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-5" style={{ borderTopColor: "var(--hairline)" }}>
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--color-forest)" }}
            >
              Visit website
              <span aria-hidden="true" style={{ color: "var(--color-jade)" }}>↗</span>
            </a>
          )}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="eyebrow inline-flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--color-forest)" }}
            >
              Call
              <span className="tabular" style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-muted)" }}>
                {restaurant.phone}
              </span>
            </a>
          )}
          {restaurant.latitude != null && restaurant.longitude != null && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--color-forest)" }}
            >
              Directions
              <span aria-hidden="true" style={{ color: "var(--color-jade)" }}>→</span>
            </a>
          )}
          <span className="ml-auto inline-flex items-center gap-3">
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
          </span>
        </div>
      </header>

      {/* ─── PHOTO GALLERY — comes after the hero, editorial-style ─── */}
      <RestaurantPhotoGallery
        photo={restaurant.photo}
        name={restaurant.name}
        alt={getRestaurantImageAlt({ name: restaurant.name, type: restaurant.type, neighborhood: restaurant.neighborhood, borough: restaurant.borough })}
        neighborhood={restaurant.neighborhood}
        borough={restaurant.borough}
        type={restaurant.type}
      />

      {/* ─── MAIN: TWO-COLUMN ─── */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-12 lg:col-span-2">

            {/* Curated Story */}
            <section>
              <p className="eyebrow">The brief</p>
              <h2 className="h2-serif mt-2">About {restaurant.name}</h2>
              {restaurant.description ? (
                <p className="dek mt-4" style={{ maxWidth: "65ch" }}>
                  {restaurant.description}
                </p>
              ) : (
                <p className="dek mt-4 italic" style={{ color: "var(--color-muted)", maxWidth: "65ch" }}>
                  Description coming soon.
                </p>
              )}

              {/* Editorial asides */}
              {restaurant.rating && restaurant.rating >= 4.5 && (restaurant.reviews ?? 0) >= 500 && (
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
                    A {restaurant.rating}/5 across {(restaurant.reviews ?? 0).toLocaleString()} reviews is unusually consistent for{" "}
                    {restaurant.neighborhood || "NYC"} — the kind of volume-with-score combination that suggests genuine quality, not hype.
                  </p>
                </aside>
              )}
              {restaurant.inspection_grade === "A" && restaurant.is_hidden_gem && (
                <aside
                  className="mt-6 border-l pl-5 py-1"
                  style={{
                    borderLeftWidth: "2px",
                    borderLeftColor: "var(--color-amber)",
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
                    <span className="gem-mark">✦</span> A hidden gem with a clean Grade A — the kind of spot regulars keep to themselves.
                  </p>
                </aside>
              )}
            </section>

            {/* NYC Health Inspection — the placard, the explanation. No bespoke colors. */}
            {restaurant.inspection_grade && (
              <section>
                <p className="eyebrow">Health inspection</p>
                <h2 className="h2-serif mt-2">NYC DOHMH Grade {restaurant.inspection_grade}</h2>
                <div className="mt-5 flex items-start gap-5">
                  <span
                    className="plaque flex-shrink-0"
                    data-grade={grade}
                    aria-label={gradeAria}
                    style={{ width: "4.5rem", height: "4.5rem", fontSize: "2.5rem" }}
                  >
                    {restaurant.inspection_grade}
                  </span>
                  <div className="space-y-2 pt-1">
                    {restaurant.inspection_score != null && (
                      <p className="text-sm" style={{ color: "var(--color-text)" }}>
                        <span className="eyebrow mr-2" style={{ color: "var(--color-muted)" }}>Score</span>
                        <span className="tabular font-semibold">{restaurant.inspection_score}</span>
                        <span className="ml-1.5" style={{ color: "var(--color-muted)" }}>(lower is better)</span>
                      </p>
                    )}
                    {restaurant.inspection_date && (
                      <p className="text-sm" style={{ color: "var(--color-text)" }}>
                        <span className="eyebrow mr-2" style={{ color: "var(--color-muted)" }}>Inspected</span>
                        <span className="tabular">{restaurant.inspection_date}</span>
                      </p>
                    )}
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-muted)", maxWidth: "52ch", lineHeight: 1.55 }}
                    >
                      {restaurant.inspection_grade === "A"
                        ? "Grade A is the highest mark from NYC's Department of Health — about 90% of restaurants earn it."
                        : restaurant.inspection_grade === "B"
                          ? "A Grade B means some violations were found. Many B-graded spots earn an A on re-inspection within weeks."
                          : "Grade C indicates serious violations. The restaurant is subject to accelerated re-inspection by the DOHMH."}
                    </p>
                    <p className="mt-2">
                      <Link
                        href="/guides/nyc-health-grades-explained"
                        className="eyebrow inline-flex items-center gap-1.5"
                        style={{ color: "var(--color-jade)" }}
                      >
                        How grades work
                        <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </div>
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

            {/* Contextual internal links (PRD CC-23) */}
            <section className="border-t pt-8" style={{ borderTopColor: "var(--hairline)" }}>
              <p className="eyebrow">Explore</p>
              <ContextualLinks
                intro={`${restaurant.name} is one of many healthy restaurants in our directory. See`}
                links={getListingHubLinks(restaurant)}
                className="mt-3"
              />
            </section>

            {/* Topical authority footer */}
            <div
              className="border-t pt-6 text-sm"
              style={{ borderTopColor: "var(--hairline)", color: "var(--color-muted)", lineHeight: 1.55, maxWidth: "62ch" }}
            >
              <p>
                {restaurant.name} is listed in the{" "}
                <Link href="/" style={{ color: "var(--color-jade)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  Eat Real Food NYC directory
                </Link>
                {restaurant.borough && boroughSlug && (
                  <>{" "}— a curated database of{" "}
                    <Link href={`/nyc/${boroughSlug}/healthy-restaurants`} style={{ color: "var(--color-jade)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                      healthy restaurants in {restaurant.borough}
                    </Link>
                  </>
                )}
                , verified with official NYC Department of Health inspection data.
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN (sidebar) ── */}
          <aside className="lg:col-span-1">
            <HealthScoreCard restaurant={restaurant} />

            {/* Data freshness */}
            <p className="mt-3 px-1 text-xs" style={{ color: "var(--color-muted)", lineHeight: 1.55 }}>
              Data sourced from NYC DOHMH Open Data.
              {restaurant.inspection_date && (
                <> Inspection record dated {new Date(restaurant.inspection_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}.</>
              )}{" "}
              Directory updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
            </p>

            {/* Location & contact card — hairline, 4px, no emoji */}
            <div
              className="sticky top-24 mt-6 border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "var(--hairline)",
                borderRadius: "4px",
              }}
            >
              <div className="px-5 pt-5">
                <p className="eyebrow" style={{ color: "var(--color-muted)" }}>Location &amp; contact</p>
              </div>

              {/* Map */}
              <div className="mx-5 mt-4 overflow-hidden border" style={{ borderColor: "var(--hairline)", borderRadius: "3px", height: "180px" }}>
                {restaurant.latitude != null && restaurant.longitude != null ? (
                  <div suppressHydrationWarning style={{ height: "180px" }}>
                    <MapWrapper
                      lat={restaurant.latitude}
                      lng={restaurant.longitude}
                      name={restaurant.name}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--color-cream)", color: "var(--color-muted)" }}>
                    <span className="eyebrow">Map unavailable</span>
                  </div>
                )}
              </div>

              {/* Contact rows */}
              <div className="px-5 pt-3">
                {restaurant.address && (
                  <ContactRow label="Address">
                    <span>{restaurant.address}</span>
                  </ContactRow>
                )}
                {restaurant.phone && (
                  <ContactRow label="Phone">
                    <a href={`tel:${restaurant.phone}`} className="tabular transition-colors hover:underline" style={{ color: "var(--color-forest)", textUnderlineOffset: "2px" }}>
                      {restaurant.phone}
                    </a>
                  </ContactRow>
                )}
                {restaurant.website && (
                  <ContactRow label="Web">
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate transition-colors hover:underline"
                      style={{ color: "var(--color-forest)", textUnderlineOffset: "2px" }}
                    >
                      {restaurant.website.replace(/^https?:\/\//, "")}
                    </a>
                  </ContactRow>
                )}
              </div>

              {/* Hours */}
              {hours.length > 0 && (
                <div className="border-t px-5 py-5" style={{ borderTopColor: "var(--hairline)" }}>
                  <p className="eyebrow mb-3" style={{ color: "var(--color-muted)" }}>Hours</p>
                  <dl className="space-y-1.5 text-sm">
                    {hours.map(({ day, hours: h }) => {
                      const isToday = day === todayName
                      return (
                        <div key={day} className="flex items-baseline justify-between gap-3">
                          <dt
                            style={{
                              color: isToday ? "var(--color-jade)" : "var(--color-muted)",
                              fontWeight: isToday ? 600 : 400,
                              fontFamily: isToday ? "var(--font-display)" : "var(--font-body)",
                              fontSize: isToday ? "0.95rem" : "0.875rem",
                            }}
                          >
                            {day}
                          </dt>
                          <dd
                            className="tabular"
                            style={{
                              color: isToday ? "var(--color-forest)" : "var(--color-text)",
                              fontWeight: isToday ? 600 : 500,
                            }}
                          >
                            {h}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ─── EXPLORE MORE ─── */}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="border-t pt-10" style={{ borderTopColor: "var(--hairline)" }}>
          <p className="eyebrow">Explore more</p>
          <h2 className="h2-serif mt-2">Find similar spots</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {restaurant.neighborhood && boroughSlug && neighborhoodSlug && (
              <ExploreCard
                eyebrow="Neighborhood"
                title={restaurant.neighborhood}
                href={`/nyc/${boroughSlug}/${neighborhoodSlug}/healthy-restaurants`}
              />
            )}
            {restaurant.borough && boroughSlug && (
              <ExploreCard
                eyebrow="Borough"
                title={restaurant.borough}
                href={`/nyc/${boroughSlug}/healthy-restaurants`}
              />
            )}
            {tags.slice(0, 2).map((tag) => (
              <ExploreCard
                key={tag}
                eyebrow="Dietary"
                title={formatDietaryTag(tag)}
                href={`/healthy-restaurants/${tag}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Internal pieces ─── */

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-[5rem_1fr] items-baseline gap-3 border-b py-3 text-sm"
      style={{ borderBottomColor: "var(--hairline)" }}
    >
      <dt className="eyebrow" style={{ color: "var(--color-muted)" }}>
        {label}
      </dt>
      <dd style={{ color: "var(--color-text)", lineHeight: 1.5 }}>{children}</dd>
    </div>
  )
}

function ExploreCard({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string
  title: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group block border p-5 transition-colors"
      style={{
        borderColor: "var(--hairline)",
        backgroundColor: "#FFFFFF",
        borderRadius: "4px",
      }}
    >
      <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
        {eyebrow}
      </p>
      <p
        className="mt-3"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.125rem",
          fontWeight: 700,
          lineHeight: 1.2,
          color: "var(--color-forest)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </p>
      <p
        className="mt-3 inline-flex items-center gap-1.5 transition-colors"
        style={{ color: "var(--color-jade)" }}
      >
        <span className="eyebrow">See spots</span>
        <span aria-hidden="true">→</span>
      </p>
    </Link>
  )
}
