import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import EatForYourGoal from "@/components/eat-for-your-goal"
import SavedPreview from "@/components/saved-preview"
import RestaurantCard from "@/components/restaurant-card"
import { withPartnerStatus } from "@/lib/partner-status-db"
import { isDirectoryEligible } from "@/config/publishable-types"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { dataAsOfSentence, getSiteStats } from "@/lib/site-stats"
import { homeHeroCopy } from "@/lib/home-hero"
import HomeHeroCta from "@/components/home-hero-cta"
import NewsletterSignup from "@/components/newsletter-signup"
import { fitDescription, homeTitle } from "@/lib/seo-titles"
import { getIndexableDietTags } from "@/lib/diet-hubs"
import { homeFaqs } from "@/lib/money-pages"
import FAQSchema from "@/components/faq-schema"
import { buildBreadcrumbList } from "@/lib/schema"
import { skipImageOptimizer } from "@/lib/photo-src"
import HolidayCateringBanner from "@/components/holiday-catering-banner"
import { UpdatedWebPage } from "@/components/updated-webpage"
import { pausedSlugs } from "@/config/listing-overrides"

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getSiteStats()
  const year = stats.dataAsOf ? Number(stats.dataAsOf.slice(0, 4)) : new Date().getUTCFullYear()
  const title = homeTitle(stats.gradeAListings, year)
  const dataMonth = stats.dataAsOfLabel
  const extraTags = Math.max(0, Object.keys(DIET_CONFIG).length - 3)
  const description = fitDescription(
    [
      `${stats.publishedListings.toLocaleString("en-US")} published listings in NYC for ${year}. ${stats.gradeAListings.toLocaleString("en-US")} hold an official NYC DOHMH Grade A.`,
    ],
    [
      extraTags > 0
        ? `Across ${stats.neighborhoods.toLocaleString("en-US")} neighborhoods with a published listing. Filter vegan, halal, gluten-free, and ${extraTags} more.${dataMonth ? ` ${dataAsOfSentence(dataMonth)}` : ""}`
        : "",
      `Across ${stats.neighborhoods.toLocaleString("en-US")} neighborhoods with a published listing.${dataMonth ? ` ${dataAsOfSentence(dataMonth)}` : ""}`,
      dataMonth ? dataAsOfSentence(dataMonth) : "",
    ].filter(Boolean)
  )
  return {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "https://www.eatrealfoodnyc.com",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://www.eatrealfoodnyc.com",
    siteName: "Eat Real Food NYC",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Eat Real Food NYC — Healthy Restaurant Directory" }],
  },
  // The root layout's Twitter description still says every listing is
  // verified. Override it here so the homepage card matches the Grade A count.
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large" as const,
    },
  },
  }
}

// ISR — re-validate the homepage at most once per hour. Featured restaurants,
// hidden gems, and aggregate counts move with the weekly publish cadence, so
// 1-hour granularity is well within freshness. If the build output for / shows
// ƒ (dynamic) at HEAD, this also cuts TTFB by removing Prisma roundtrips from
// the request path. If / is already ○/● (static), this swaps "stale until next
// deploy" for "stale at most 1 hour" with no TTFB change.
export const revalidate = 3600

const ALL_DIETS = [
  { tag: "vegan",       label: "Vegan",       emoji: "🌱" },
  { tag: "vegetarian",  label: "Vegetarian",  emoji: "🥦" },
  { tag: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { tag: "halal",       label: "Halal",       emoji: "🕌" },
  { tag: "kosher",      label: "Kosher",      emoji: "✡️" },
  { tag: "dairy-free",  label: "Dairy-Free",  emoji: "🥛" },
  { tag: "keto",        label: "Keto",        emoji: "🥑" },
  { tag: "whole-foods", label: "Whole Foods", emoji: "🥗" },
  { tag: "low-calorie", label: "Low Calorie", emoji: "⚖️" },
  { tag: "raw-food",    label: "Raw Food",    emoji: "🌿" },
  { tag: "nut-free",    label: "Nut-Free",    emoji: "🚫" },
  { tag: "paleo",       label: "Paleo",       emoji: "🍖" },
]

export default async function HomePage() {
  const [stats, editorPickRows, hiddenGemRows, indexableDiets, neighborhoodGroups] = await Promise.all([
    getSiteStats(),
    prisma.restaurant.findMany({
      where: {
        business_status: "OPERATIONAL", is_published: true,
        photo: { not: null },
        rating: { gte: 4.5 },
        reviews: { gte: 200 },
        slug: { notIn: pausedSlugs() },
      },
      // Rating and review count only. partner_status must not change this order.
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: 40,
    }),
    prisma.restaurant.findMany({
      where: { business_status: "OPERATIONAL", is_published: true, is_hidden_gem: true, photo: { not: null }, slug: { notIn: pausedSlugs() } },
      orderBy: { rating: "desc" },
      take: 4,
    }),
    getIndexableDietTags(),
    prisma.restaurant.groupBy({
      by: ["borough", "neighborhood"],
      where: {
        business_status: "OPERATIONAL",
        is_published: true,
        borough: { not: null },
        neighborhood: { not: null },
      },
      _count: { id: true },
    }),
  ])
  const topNeighborhoods = neighborhoodGroups
    .filter((row) => row.borough && row.neighborhood && row._count.id >= 3)
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 12)

  const [editorsPicks, hiddenGems] = await Promise.all([
    withPartnerStatus(editorPickRows),
    withPartnerStatus(hiddenGemRows),
  ])
  const totalCount = stats.publishedListings
  const hero = homeHeroCopy({
    published: stats.publishedListings,
    gradeA: stats.gradeAListings,
    latestInspectionLabel: stats.dataAsOfLabel,
  })
  const dietTags = new Set(indexableDiets.map((diet) => diet.tag))
  const visibleDiets = ALL_DIETS.filter((diet) => dietTags.has(diet.tag))
  const faqs = homeFaqs()
  const journalPicks = editorsPicks.filter((restaurant) => isDirectoryEligible(restaurant)).slice(0, 8)
  const featuredGem = hiddenGems.filter((restaurant) => isDirectoryEligible(restaurant))[0] ?? journalPicks[1] ?? null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbList([{ name: "Eat Real Food NYC", path: "/" }])),
        }}
      />
      {/* ─── HERO ─── One Grade A action. The letter plaque is the inspection
           card; search, map, and catering stay as text links under it. */}
      <section
        aria-labelledby="home-hero-heading"
        className="relative px-6 pb-12 pt-8 md:pb-16 md:pt-14"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            {hero.showGradeMark ? (
              <span className="plaque shrink-0" aria-hidden="true">A</span>
            ) : null}
            <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
              {hero.showGradeMark ? (
                <>
                  <span className="tabular">{stats.gradeAListings.toLocaleString("en-US")} Grade A listings</span>
                  <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
                </>
              ) : null}
              <span className="tabular">{totalCount.toLocaleString("en-US")} published listings</span>
              <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
              <span>{dataAsOfSentence(stats.dataAsOfLabel)}</span>
            </p>
          </div>

          <h1 id="home-hero-heading" className="display-1 mt-6 max-w-[26ch] md:mt-8">
            {hero.headingLead}
            <br />
            {hero.headingRest}
          </h1>

          <p className="dek mt-5 max-w-[42rem]">
            {hero.subhead}
          </p>

          <div className="mt-8">
            <HomeHeroCta href={hero.ctaHref}>{hero.ctaLabel}</HomeHeroCta>
          </div>

          <nav aria-label="Other ways to browse" className="mt-5">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {[
                { href: "/search", label: "Search" },
                { href: "/search?open=true", label: "Open now" },
                { href: "/near-me", label: "Near me" },
                { href: "/map", label: "Map" },
                { href: "/guides/nyc-health-grades-explained", label: "How grades work" },
                { href: "/data", label: "Inspection data" },
                { href: "/guides/best-italian-restaurants-nyc", label: "Best Italian, 2026" },
                { href: "/guides/best-pizza-restaurants-nyc", label: "Best pizza, 2026" },
                { href: "/guides/ethiopian-restaurants-nyc", label: "Ethiopian restaurants NYC" },
                { href: "/guides/grade-a-restaurants-by-borough-nyc", label: "Grade A by borough" },
                { href: "/catering", label: "Request catering" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-medium underline underline-offset-4 hover:text-forest"
                    style={{ color: "var(--color-jade)", textDecorationThickness: "1px" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 max-w-2xl">
            <HolidayCateringBanner variant="line" />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl border-t border-hairline md:mt-16" />
      </section>

      {/* ─── DATA REPORT FEATURE BANNER ─── */}
      <div className="mx-auto mt-8 mb-12 max-w-7xl px-4 md:px-6">
        <Link
          href="/data/nyc-restaurant-health-grade-report"
          className="group block rounded-md bg-forest px-6 py-6 text-cream transition-colors hover:bg-jade md:px-8 md:py-7"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow" style={{ color: "var(--color-sage)" }}>
                New · Original research
              </p>
              <p
                className="mt-2 text-xl font-bold leading-tight md:text-2xl"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  color: "var(--color-cream)",
                }}
              >
                NYC Restaurant Inspection Report, Fall 2026
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/75">
                Closures, uninspected establishments, and Grade A rates from NYC Open Data through November 10, 2026.
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-cream/75 transition-all group-hover:translate-x-0.5 group-hover:text-cream">
              Read report <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </Link>
      </div>

      {/* ─── SAVED PREVIEW ─── */}
      <SavedPreview />

      {/* ─── CURATION MATRIX ─── Refined to typographic grid; emoji removed,
           amber reserved for gem mark only, CTAs structured as real content. */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Find your spot</p>
              <h2 className="h2-serif mt-2">The Curation Matrix</h2>
            </div>
            <Link
              href="/search"
              className="shrink-0 text-xs font-semibold uppercase transition-colors hover:text-forest"
              style={{ color: "var(--color-jade)", letterSpacing: "0.14em" }}
            >
              View all filters <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-4" style={{ minHeight: "480px" }}>
            {/* Featured hidden gem — magazine-cover treatment, amber ✦ mark stays on theme */}
            {featuredGem && (
              <Link
                href={`/restaurants/${featuredGem.slug}`}
                className="group relative row-span-2 overflow-hidden rounded-md lg:col-span-1"
                style={{ minHeight: "320px" }}
              >
                {featuredGem.photo ? (
                  <Image
                    src={featuredGem.photo}
                    alt={`${featuredGem.name} — ${featuredGem.neighborhood ?? featuredGem.borough ?? "NYC"} hidden gem restaurant`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    priority
                    unoptimized={skipImageOptimizer(featuredGem.photo)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-forest" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/35 to-transparent" />
                <div className="absolute left-5 top-5 z-10">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[0.65rem] font-semibold uppercase backdrop-blur"
                    style={{
                      backgroundColor: "rgba(27, 58, 45, 0.55)",
                      color: "var(--color-cream)",
                      letterSpacing: "0.16em",
                    }}
                  >
                    <span className="gem-mark" aria-hidden="true">✦</span>
                    Hidden gem
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p
                    className="font-bold text-cream"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.5rem, 2vw + 0.75rem, 1.875rem)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {featuredGem.name}
                  </p>
                  {featuredGem.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-cream/75">
                      {featuredGem.description}
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* 12 dietary filters — typographic grid, no emoji, hover-revealed arrow */}
            <div
              className="rounded-md border bg-white p-6 lg:col-span-2"
              style={{ borderColor: "var(--hairline)" }}
            >
              <p className="eyebrow">Filter by diet</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {visibleDiets.map((diet) => (
                  <Link
                    key={diet.tag}
                    href={`/healthy-restaurants/${diet.tag}`}
                    className="group flex items-center justify-between rounded-sm border px-4 py-3 text-left transition-colors hover:border-forest"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    <span
                      className="text-sm font-medium transition-colors group-hover:text-jade"
                      style={{ color: "var(--color-forest)" }}
                    >
                      {diet.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-2 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      style={{ color: "var(--color-jade)" }}
                    >
                      &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Borough explorer — all 5 boroughs, hairline divider list */}
            <div
              className="rounded-md border bg-white p-6"
              style={{ borderColor: "var(--hairline)" }}
            >
              <p className="eyebrow">By borough</p>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                Health-graded data across all 5 NYC boroughs.
              </p>
              <div className="mt-5">
                {["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].map((borough) => (
                  <Link
                    key={borough}
                    href={`/nyc/${boroughToSlug(borough)}/healthy-restaurants`}
                    className="group flex items-center justify-between border-b py-2.5 text-sm font-medium transition-colors hover:text-jade"
                    style={{ borderColor: "var(--hairline)", color: "var(--color-text)" }}
                  >
                    <span>{borough}</span>
                    <span
                      aria-hidden="true"
                      className="opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      style={{ color: "var(--color-jade)" }}
                    >
                      &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Comparison CTA — real content, not just a pill */}
            <div
              className="flex flex-col justify-center rounded-md border bg-white p-6 lg:col-span-2"
              style={{ borderColor: "var(--hairline)" }}
            >
              <p className="eyebrow">Neighborhood comparison</p>
              <h3
                className="mt-2 text-xl font-bold leading-snug md:text-2xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-forest)",
                  letterSpacing: "-0.015em",
                }}
              >
                Which NYC neighborhoods score highest on health-graded dining?
              </h3>
              <Link
                href="/nyc/compare"
                className="mt-4 inline-flex items-center gap-2 self-start text-sm font-semibold underline underline-offset-4 transition-colors hover:text-forest"
                style={{
                  color: "var(--color-jade)",
                  textDecorationThickness: "1px",
                }}
              >
                Compare all neighborhoods <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Nearby Now — forest panel, refined button */}
            <div className="flex flex-col justify-between rounded-md bg-forest p-6 text-cream">
              <div>
                <p className="eyebrow" style={{ color: "var(--color-sage)" }}>
                  Within 1 mile
                </p>
                <h3
                  className="mt-2 text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-cream)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                  }}
                >
                  Healthy options near you, right now.
                </h3>
              </div>
              <Link
                href="/near-me"
                className="mt-6 inline-flex items-center self-start rounded-sm bg-sage px-5 py-2.5 text-xs font-semibold uppercase transition-colors hover:bg-cream"
                style={{
                  color: "var(--color-forest)",
                  letterSpacing: "0.14em",
                }}
              >
                Find nearby
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t px-6 py-16" style={{ borderColor: "var(--hairline)", backgroundColor: "var(--color-cream)" }}>
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Neighborhood hubs</p>
          <h2 className="h2-serif mt-2">Healthy restaurants by neighborhood</h2>
          <p className="dek mt-3" style={{ maxWidth: "62ch" }}>
            The twelve neighborhoods with the most published listings. Every diet hub is linked in the filter above.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topNeighborhoods.map((row) => (
              <li key={`${row.borough}-${row.neighborhood}`}>
                <Link
                  href={`/nyc/${boroughToSlug(row.borough!)}/${neighborhoodToSlug(row.neighborhood!)}/healthy-restaurants`}
                  className="flex items-baseline justify-between gap-4 border bg-white px-4 py-3"
                  style={{ borderColor: "var(--hairline)" }}
                >
                  <span className="font-semibold" style={{ color: "var(--color-forest)" }}>
                    Healthy restaurants in {row.neighborhood}
                  </span>
                  <span className="tabular text-sm" style={{ color: "var(--color-muted)" }}>
                    {row._count.id.toLocaleString("en-US")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── EAT FOR YOUR GOAL ─── */}
      <EatForYourGoal />

      {/* ─── EDITOR'S JOURNAL ─── Uses RestaurantCard for visual consistency
           with the rest of the site (same placard signature, same rhythm). */}
      <section className="py-24 md:py-28" style={{ backgroundColor: "var(--color-cream)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">This month</p>
            <h2 className="h2-serif mt-2">The Editor&apos;s Journal</h2>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Hand-selected additions from our directory — the kind of healthy
              restaurants that locals quietly keep returning to.
            </p>
          </div>

          {/* Horizontal scroll using the canonical RestaurantCard */}
          <div className="scrollbar-hide mt-10 -mx-6 flex gap-5 overflow-x-auto px-6 pb-4">
            {journalPicks.map((r) => (
              <div key={r.id} className="w-80 shrink-0 sm:w-72">
                <RestaurantCard restaurant={r} priority={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE DIRECTORY IN NUMBERS ───
           Replaces a prior "Dispatches" section that featured fabricated
           bylines (Elena Vance, Marcus Thorne) and a fabricated "Critics'
           Choice: 2026 Green List." Per CLAUDE.md §11 ("Trust is the
           product"), that section is now a real-data accounting of the
           directory itself — every number is verifiable, every link is
           real, and the headline directly states the position. */}
      <section
        className="border-t bg-white py-24 md:py-28"
        style={{ borderColor: "var(--hairline)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left — the position + the numbers */}
            <div className="lg:col-span-7">
              <p className="eyebrow">The directory, in numbers</p>
              <h2 className="display-2 mt-3">
                Real data. No bylines.
              </h2>
              <p className="dek mt-5" style={{ maxWidth: "58ch" }}>
                We don&apos;t pay critics, and we don&apos;t sell grades or rankings.
                A listing shows a NYC Department of Health grade only when it
                matches an inspection record.{" "}
                {stats.gradedListings.toLocaleString()} of{" "}
                {totalCount.toLocaleString()} published listings have an A, B, or C ({stats.gradedPercent}%).{" "}
                {(totalCount - stats.gradedListings).toLocaleString()} do not. {dataAsOfSentence(stats.dataAsOfLabel)}
              </p>

              <dl className="mt-12 grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3">
                <Stat number={stats.publishedListings.toLocaleString()} label="Published listings" />
                <Stat number={stats.restaurantsTracked.toLocaleString()} label="Restaurant rows tracked, including unpublished" />
                <Stat number={stats.gradeAListings.toLocaleString()} label="Grade A among published listings" />
                <Stat number={stats.neighborhoods.toLocaleString()} label="Neighborhoods with a published listing" />
                <Stat number={`${stats.gradedListings.toLocaleString()} (${stats.gradedPercent}%)`} label="Published listings with an A, B, or C" />
                <Stat number={stats.hiddenGems.toLocaleString()} label="Hidden gems among published listings" />
              </dl>
            </div>

            {/* Right — methodology card */}
            <div className="flex lg:col-span-5">
              <div
                className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md p-8 md:p-10"
                style={{ backgroundColor: "var(--color-forest)" }}
              >
                <div>
                  <p className="eyebrow" style={{ color: "var(--color-sage)" }}>
                    Our methodology
                  </p>
                  <h3
                    className="mt-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "clamp(1.625rem, 1.5vw + 1rem, 2.25rem)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "var(--color-cream)",
                    }}
                  >
                    How we built this.
                  </h3>
                  <p
                    className="mt-5 max-w-md"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                      color: "rgba(248, 246, 241, 0.78)",
                    }}
                  >
                    DOHMH Open Data joined to conservative dietary tagging.
                    Labeled Partner placements never change a grade or a ranking.
                    No fabricated reviews, no editorial personas. Grade A on this page
                    counts published listings only, not every inspected restaurant in the city file.
                    {dataAsOfSentence(stats.dataAsOfLabel)}
                  </p>
                </div>
                <Link
                  href="/about/our-data"
                  className="eyebrow mt-8 inline-flex items-center self-start gap-1.5 transition-colors"
                  style={{ color: "var(--color-sage)" }}
                >
                  Read the methodology
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FROM OUR GUIDES ─── Hairline cards, no emoji, eyebrow + Georgia title */}
      <section
        className="border-t bg-white px-6 py-24 md:py-28"
        style={{ borderColor: "var(--hairline)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">Knowledge base</p>
              <h2 className="h2-serif mt-2">From our guides</h2>
            </div>
            <Link
              href="/guides"
              className="shrink-0 text-sm font-semibold transition-colors hover:text-forest"
              style={{ color: "var(--color-jade)" }}
            >
              View all guides <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                slug: "nyc-health-grades-explained",
                title: "NYC Health Grades Explained",
                desc: "What Grade A, B, and C really mean — and how the inspection process works.",
                category: "Health & safety",
              },
              {
                slug: "vegan-nyc-borough-guide",
                title: "Vegan NYC — Borough by Borough",
                desc: "The definitive guide to plant-based dining across all five NYC boroughs.",
                category: "Dietary guides",
              },
              {
                slug: "best-healthy-neighborhoods-nyc",
                title: "Best Healthy Neighborhoods NYC",
                desc: "Neighborhoods with at least 10 published listings, ranked by NYC DOHMH Grade A share.",
                category: "Neighborhood guides",
              },
              {
                slug: "best-italian-restaurants-nyc",
                title: "Best Italian Restaurants in NYC (2026)",
                desc: "Ten open Italian restaurants ranked by official NYC DOHMH inspection score.",
                category: "Dining guides",
              },
              {
                slug: "best-pizza-restaurants-nyc",
                title: "Best Pizza Restaurants in NYC (2026)",
                desc: "Ten published pizza listings ranked by official NYC DOHMH inspection score.",
                category: "Dining guides",
              },
              {
                slug: "grade-a-restaurants-by-borough-nyc",
                title: "Grade A Restaurants by Borough",
                desc: "Five recent kitchens checked against the latest NYC DOHMH inspection. Three match Grade A.",
                category: "Health & safety",
              },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/guides/${article.slug}`}
                className="group flex flex-col rounded-md border p-7 transition-all hover:border-forest hover:shadow-lg"
                style={{
                  borderColor: "var(--hairline)",
                  backgroundColor: "var(--color-cream)",
                }}
              >
                <p className="eyebrow">{article.category}</p>
                <h3
                  className="mt-4 text-lg font-bold leading-snug transition-colors group-hover:text-jade"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-forest)",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {article.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--color-muted)" }}
                >
                  {article.desc}
                </p>
                <p
                  className="mt-6 text-xs font-semibold transition-all group-hover:translate-x-0.5"
                  style={{ color: "var(--color-jade)" }}
                >
                  Read guide <span aria-hidden="true">&rarr;</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-6 py-16" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
        <div className="mx-auto max-w-3xl">
          <FAQSchema faqs={faqs} />
          <p className="eyebrow">FAQ</p>
          <h2 className="h2-serif mt-2">Questions about this directory</h2>
          {stats.dataAsOf ? (
            <>
              <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
                {dataAsOfSentence(stats.dataAsOfLabel)}
              </p>
              <UpdatedWebPage date={new Date(`${stats.dataAsOf}T00:00:00.000Z`)} urlPath="/" hideLabel />
            </>
          ) : null}
          <div className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{faq.question}</h3>
                <p className="mt-2 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
                  <LinkedAnswer text={faq.answer} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-6 py-16" style={{ borderColor: "var(--hairline)", backgroundColor: "var(--color-cream)" }}>
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </section>

    </>
  )
}

/* ─── Internal pieces ─── */

function LinkedAnswer({ text }: { text: string }) {
  const parts = text.split(/(\/guides\/[a-z0-9-]+|\/about\/[a-z0-9-]+)/)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("/") ? (
          <Link key={index} href={part} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            {part === "/guides/nyc-health-grades-explained"
              ? "the grades guide"
              : part === "/about/our-data"
                ? "how this directory sources grades"
                : part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <dt
        className="tabular"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(1.875rem, 1.5vw + 1rem, 2.5rem)",
          lineHeight: 1,
          letterSpacing: "-0.025em",
          color: "var(--color-forest)",
        }}
      >
        {number}
      </dt>
      <dd
        className="eyebrow mt-3"
        style={{
          color: "var(--color-muted)",
          letterSpacing: "0.12em",
          lineHeight: 1.35,
        }}
      >
        {label}
      </dd>
    </div>
  )
}
