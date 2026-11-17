import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, neighborhoodToSlug, formatDietaryTag, parseDietaryTags } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP } from "@/config/boroughs"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import ContextualLinks from "@/components/contextual-links"
import { getNeighborhoodContextualLinks } from "@/lib/internal-links"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS, getBuiltNeighborhoodHubs } from "@/lib/neighborhood-hubs"
import { COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { NEIGHBORHOOD_DIET_TAGS, neighborhoodDietPath } from "@/lib/neighborhood-diet"
import AboutThisData from "@/components/about-this-data"
import { withPartnerStatus } from "@/lib/partner-status-db"
import { formatAverageRating, roundAverage } from "@/lib/ratings"
import DirectoryAsOf from "@/components/directory-as-of"
import { gradeStatsFor } from "@/lib/hub-grade-stats"
import { fitDescription, neighborhoodHubTitle, shortMonth } from "@/lib/seo-titles"
import { placeIntro } from "@/lib/hub-copy"
import { getDirectorySnapshot } from "@/lib/directory-snapshot"
import { neighborhoodCapsule } from "@/lib/answer-capsule"
import { formatMonthYear, latestInspectionDate } from "@/lib/inspection-dates"
import { buildHubItemList } from "@/lib/schema"
import NewsletterSignup from "@/components/newsletter-signup"
import NeighborhoodSponsorSlot from "@/components/neighborhood-sponsor-slot"

export async function generateStaticParams() {
  const results = await prisma.restaurant.groupBy({
    by: ["borough", "neighborhood"],
    where: {
      business_status: "OPERATIONAL", is_published: true,
      borough: { not: null },
      neighborhood: { not: null },
    },
    having: { id: { _count: { gte: NEIGHBORHOOD_HUB_MIN_RESTAURANTS } } },
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
  const stats = await gradeStatsFor({
    borough: resolved.boroughName,
    neighborhood: resolved.neighborhoodName,
  })
  const snapshot = await getDirectorySnapshot()
  const year = (snapshot.lastPublishAt ?? new Date()).getUTCFullYear()
  const title = neighborhoodHubTitle(resolved.neighborhoodName, resolved.boroughName, stats.gradeA, year)
  const dataMonth = shortMonth(snapshot.lastPublishAt)
  const description = fitDescription(
    [
      `${stats.count.toLocaleString("en-US")} healthy restaurants in ${resolved.neighborhoodName}, ${resolved.boroughName}: ${stats.gradeA.toLocaleString("en-US")} hold a NYC DOHMH Grade A.`,
    ],
    [
      dataMonth ? `Compare grades, ratings and hours. Data as of ${dataMonth}.` : "Compare grades, ratings and hours.",
      dataMonth ? `Data as of ${dataMonth}.` : "",
    ].filter(Boolean)
  )
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, type: "website" },
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

  const listedWhere = {
    borough: boroughName,
    neighborhood: neighborhoodName,
    business_status: "OPERATIONAL" as const,
    is_published: true,
  }
  const [restaurantRows, stats, ratingAgg, gradeACount] = await Promise.all([
    prisma.restaurant.findMany({
      where: listedWhere,
      orderBy: [{ priorityRank: "desc" }, { rating: "desc" }, { reviews: "desc" }],
    }),
    prisma.restaurant.aggregate({
      where: listedWhere,
      _count: { id: true },
    }),
    prisma.restaurant.aggregate({
      where: { ...listedWhere, rating: { gt: 0 } },
      _avg: { rating: true },
    }),
    prisma.restaurant.count({
      where: { ...listedWhere, inspection_grade: "A" },
    }),
  ])
  const restaurants = await withPartnerStatus(restaurantRows)
  const avgRating = roundAverage(ratingAgg._avg.rating)

  if (restaurants.length < NEIGHBORHOOD_HUB_MIN_RESTAURANTS) notFound()

  const gradedCount = restaurants.filter((row) => row.inspection_grade === "A" || row.inspection_grade === "B" || row.inspection_grade === "C").length
  const taggedCount = restaurants.filter((row) => row.dietary_tags?.trim()).length
  const latestInspection = latestInspectionDate(restaurants.map((row) => row.inspection_date))
  const capsule = neighborhoodCapsule({
    neighborhood: neighborhoodName,
    count: restaurants.length,
    graded: gradedCount,
    gradeA: restaurants.filter((row) => row.inspection_grade === "A").length,
    latestMonth: latestInspection ? formatMonthYear(latestInspection) : null,
    tagged: taggedCount,
  })

  // Gate for the contextual-links block below. Memoised — see neighborhood-hubs.ts.
  const validHubs = await getBuiltNeighborhoodHubs()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const dietLinks = NEIGHBORHOOD_DIET_TAGS.map((tag) => ({
    tag,
    count: restaurants.filter((row) => parseDietaryTags(row.dietary_tags).includes(tag)).length,
  }))

  // Card grid renders the top N; the full link list below renders all.
  const CARD_LIMIT = 24

  // ItemList publishes a 10-entry excerpt. Binding itemListElement to this
  // array keeps the entries and any derived count from drifting apart.
  const schemaItems = restaurants.slice(0, 10)

  const itemListJsonLd = buildHubItemList({
    name: `Healthy Restaurants in ${neighborhoodName}, ${boroughName}`,
    description: `${restaurants.length} healthy restaurants in ${neighborhoodName}, ${boroughName}, NYC`,
    siteUrl,
    restaurants: schemaItems,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb items={[
            { label: "Healthy Restaurants", href: "/healthy-restaurants" },
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
            Healthy restaurants in {neighborhoodName}, {boroughName}
          </h1>

          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            {capsule}
          </p>
          <h2 className="h2-serif mt-8">How many Grade A restaurants are in {neighborhoodName}?</h2>
          <p className="mt-3 text-base leading-relaxed" style={{ maxWidth: "62ch" }}>
            {gradedCount === 0
              ? `None of the ${restaurants.length.toLocaleString("en-US")} published restaurants in ${neighborhoodName} has a matched NYC DOHMH letter grade.`
              : `${restaurants.filter((row) => row.inspection_grade === "A").length.toLocaleString("en-US")} of ${gradedCount.toLocaleString("en-US")} graded restaurants in ${neighborhoodName} hold Grade A. The share is among graded listings, not every published row.`}
          </p>
          <h2 className="h2-serif mt-8">Which diets are tagged in {neighborhoodName}?</h2>
          <p className="mt-3 text-base leading-relaxed" style={{ maxWidth: "62ch" }}>
            {taggedCount === 0
              ? `None of the published restaurants in ${neighborhoodName} carries a dietary tag. Tags are applied only when a kitchen identifies with that diet.`
              : `${taggedCount.toLocaleString("en-US")} of ${restaurants.length.toLocaleString("en-US")} published restaurants in ${neighborhoodName} carry at least one dietary tag.`}
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
                {formatAverageRating(avgRating)}
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
              <span>Data as of</span>
              <span style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-body)", fontWeight: 500 }}>
                <DirectoryAsOf variant="month" />
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
              href={
                gradeACount >= 5
                  ? `/nyc/${boroughSlug}/${neighborhoodSlug}/grade-a-restaurants`
                  : `/nyc/${boroughSlug}/grade-a-restaurants`
              }
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
          <h2 className="h2-serif mt-2">Top {Math.min(restaurants.length, CARD_LIMIT)} spots</h2>
          <p className="dek mt-2" style={{ fontSize: "0.95rem" }}>
            Ranked by editorial priority, rating, and review depth.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.slice(0, CARD_LIMIT).map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
            ))}
          </div>
        </div>

        {/* ─── Full directory link list ───
             Server-rendered plain anchors covering every published restaurant
             in this neighbourhood, including the ones already shown as cards.
             Exists so restaurants ranked below the card cap still receive a
             crawlable internal link from their own neighbourhood hub.
             No RestaurantCard, no images, no client component, no JS. */}
        {restaurants.length > CARD_LIMIT && (
          <section
            className="mt-16 border-t pt-10"
            style={{ borderTopColor: "var(--hairline)" }}
          >
            <p className="eyebrow">Full directory</p>
            <h2 className="h2-serif mt-2">
              All {restaurants.length} healthy restaurants in {neighborhoodName}
            </h2>
            <p className="dek mt-2" style={{ fontSize: "0.95rem" }}>
              Every published listing in {neighborhoodName}, including the{" "}
              {Math.min(restaurants.length, CARD_LIMIT)} featured above.{" "}
              <Link href={`/nyc/${boroughSlug}/${neighborhoodSlug}/restaurants`} style={{ color: "var(--color-jade)" }}>
                All restaurants in {neighborhoodName}
              </Link>
              .
            </p>
            <ul
              className="mt-6"
              style={{
                columnWidth: "260px",
                columnGap: "2rem",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {restaurants.map((r) => (
                <li
                  key={r.id}
                  style={{ breakInside: "avoid", padding: "0.4rem 0" }}
                >
                  <a
                    href={`/restaurants/${r.slug}`}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.45,
                      color: "var(--color-forest)",
                      textDecoration: "none",
                    }}
                  >
                    {r.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Paid slot sits below the organic list and is not part of ItemList JSON-LD. */}
        <NeighborhoodSponsorSlot neighborhoodSlug={neighborhoodSlug} />

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
            {dietLinks.map(({ tag, count }) => (
              <Link
                key={tag}
                href={
                  count >= COMBO_MIN_RESTAURANTS
                    ? neighborhoodDietPath(boroughName, neighborhoodName, tag)
                    : `/healthy-restaurants/${tag}`
                }
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
                  {count >= COMBO_MIN_RESTAURANTS
                    ? `${count.toLocaleString("en-US")} in ${neighborhoodName}`
                    : `${count.toLocaleString("en-US")} here · citywide list`}
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
          {placeIntro({
            place: neighborhoodName,
            borough: boroughName,
            count: restaurants.length,
            gradeA: gradeACount,
            gradeB: restaurants.filter((row) => row.inspection_grade === "B").length,
            gradeC: restaurants.filter((row) => row.inspection_grade === "C").length,
            latestMonth: latestInspection ? formatMonthYear(latestInspection) : null,
            diets: dietLinks.map((link) => ({ label: link.tag, count: link.count })),
          }).map((paragraph) => (
            <span key={paragraph.slice(0, 40)}>{paragraph} </span>
          ))}
        </p>
        <ContextualLinks
          intro="Explore further:"
          links={getNeighborhoodContextualLinks(neighborhoodName, boroughName, validHubs)}
        />
      </div>

      {/* ─── About this data ─── */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <AboutThisData
          variant="hub"
          restaurantCount={restaurants.length}
          gradeACount={gradeACount}
         
          borough={boroughName}
        />
      </div>

      {/* ─── FAQ ─── */}
      <FAQSection
        faqs={[
          {
            question: `Which published restaurants in ${neighborhoodName} have the highest stored rating?`,
            answer: (() => {
              const rated = restaurants
                .filter((row) => (row.rating ?? 0) > 0 && (row.reviews ?? 0) > 0)
                .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0))
                .slice(0, 3)
              if (rated.length === 0) return ""
              return `The highest stored ratings are ${rated.map((row) => `${row.name} (${row.rating?.toFixed(1)}/5 from ${row.reviews} reviews)`).join("; ")}. Our picks elsewhere on the page are ordered editorially, not by rating.`
            })(),
          },
          {
            question: `How many listings in ${neighborhoodName} carry the vegan tag?`,
            answer: (() => {
              const vegan = restaurants.filter((row) => parseDietaryTags(row.dietary_tags).includes("vegan"))
              if (vegan.length === 0) return ""
              const names = vegan.slice(0, 3).map((row) => row.name).join(", ")
              return `${vegan.length} of ${restaurants.length} listings in ${neighborhoodName} carry the vegan tag${names ? `: ${names}` : ""}.`
            })(),
          },
          {
            question: `How many restaurants in ${neighborhoodName} hold Grade A?`,
            answer: gradeACount === 0 ? "" : `${gradeACount} of ${restaurants.length} published restaurants in ${neighborhoodName} hold a NYC DOHMH Grade A.`,
          },
          {
            question: `How many healthy restaurants are in ${neighborhoodName}?`,
            answer: `${restaurants.length} published restaurants are listed in ${neighborhoodName}, ${boroughName}.`,
          },
        ].filter((faq) => faq.answer)}
        heading={`Healthy Restaurants in ${neighborhoodName} — FAQ`}
        subheading={`Common questions about dining in ${neighborhoodName}, ${boroughName}.`}
      />
      <div className="border-t px-6 py-16" style={{ borderTopColor: "var(--hairline)", backgroundColor: "var(--color-cream)" }}>
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </div>
    </>
  )
}
