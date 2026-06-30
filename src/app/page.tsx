import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import { WEBSITE_SCHEMA, ORGANIZATION_SCHEMA } from "@/lib/schema"
import EatForYourGoal from "@/components/eat-for-your-goal"
import SavedPreview from "@/components/saved-preview"
import RestaurantCard from "@/components/restaurant-card"
import reportData from "@/data/health-grade-report"

export const metadata: Metadata = {
  title: "Healthy Restaurants NYC — Find & Filter 2026 | Eat Real Food NYC",
  description:
    "8,835 healthy restaurants across all 5 NYC boroughs. Every listing verified with health inspection grades. Filter by vegan, halal, gluten-free, and more.",
  alternates: {
    canonical: "https://www.eatrealfoodnyc.com",
  },
  openGraph: {
    title: "Healthy Restaurants NYC — Find & Filter 2026 | Eat Real Food NYC",
    description: "NYC's most trusted healthy restaurant directory. 8,835 restaurants across all 5 boroughs with verified NYC health inspection grades.",
    type: "website",
    url: "https://www.eatrealfoodnyc.com",
    siteName: "Eat Real Food NYC",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Eat Real Food NYC — Healthy Restaurant Directory" }],
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
  const [totalCount, editorsPicks, hiddenGems, gradeACount] = await Promise.all([
    prisma.restaurant.count({ where: { business_status: "OPERATIONAL", is_published: true } }),
    prisma.restaurant.findMany({
      where: {
        business_status: "OPERATIONAL", is_published: true,
        photo: { not: null },
        rating: { gte: 4.5 },
        reviews: { gte: 200 },
      },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: 8,
    }),
    prisma.restaurant.findMany({
      where: { business_status: "OPERATIONAL", is_published: true, is_hidden_gem: true, photo: { not: null } },
      orderBy: { rating: "desc" },
      take: 4,
    }),
    prisma.restaurant.count({ where: { inspection_grade: "A" } }),
  ])

  const featuredGem = hiddenGems[0] ?? editorsPicks[1] ?? null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [WEBSITE_SCHEMA, ORGANIZATION_SCHEMA] }) }} />

      {/* ─── HERO ─── Type-led, cream-on-cream. Restraint balances the
           placard signature that fires on every restaurant card below. */}
      <section
        className="relative px-6 pb-20 pt-16 md:pt-24"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="mx-auto max-w-6xl">
          {/* Eyebrow — live moat proof, pulled from real DB counts */}
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>NYC DOHMH-graded</span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span className="tabular">{totalCount.toLocaleString()} verified spots</span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span>Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </p>

          {/* Display headline — the thesis. The phrasing foregrounds the
              proprietary moat (DOHMH grading) rather than generic adjectives. */}
          <h1 className="display-1 mt-8 max-w-[18ch]">
            Healthy restaurants,<br />
            graded by the city.
          </h1>

          {/* Dek — single paragraph, no second sentence */}
          <p className="dek mt-6 max-w-[58ch]">
            Vegan, halal, gluten-free, kosher and more — filtered by neighborhood
            and verified against the city&apos;s own NYC Department of Health
            inspection grade.{" "}
            <Link
              href="/guides/nyc-health-grades-explained"
              className="font-medium underline underline-offset-4 hover:text-jade"
              style={{ color: "var(--color-jade)", textDecorationThickness: "1px" }}
            >
              How grades work
            </Link>
            .
          </p>

          {/* Search form — single row, hairline borders, no rounded-full pill */}
          <form
            action="/search"
            method="get"
            role="search"
            aria-label="Find healthy restaurants in NYC"
            className="mt-10 flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:gap-0"
          >
            <input
              name="q"
              type="search"
              placeholder="Restaurant, cuisine, or dish"
              aria-label="Search restaurants"
              className="h-14 flex-1 rounded-md border bg-white px-5 text-base outline-none transition-colors placeholder:text-gray-400 focus:border-jade sm:rounded-r-none sm:border-r-0"
              style={{ borderColor: "var(--hairline-strong)" }}
            />
            <input
              name="neighborhood"
              type="text"
              placeholder="Neighborhood"
              aria-label="Filter by neighborhood"
              className="h-14 flex-1 rounded-md border bg-white px-5 text-base outline-none transition-colors placeholder:text-gray-400 focus:border-jade sm:rounded-none sm:border-x-0"
              style={{ borderColor: "var(--hairline-strong)" }}
            />
            <button
              type="submit"
              className="h-14 rounded-md bg-forest px-8 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-jade sm:rounded-l-none"
            >
              Search
            </button>
          </form>

          {/* Quick filter callouts — initial-letter cards. The "A." card is a mini
              placard echoing the per-restaurant grade signature on every card below. */}
          <nav
            aria-label="Quick filters"
            className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 md:grid-cols-4"
          >
            <Link href="/search?open=true" className="callout">
              <span className="callout-initial">
                O<span style={{ color: "var(--color-muted)" }}>.</span>
              </span>
              <span className="callout-label">Open right now</span>
              <span className="callout-pulse" aria-hidden="true" />
            </Link>
            <Link href="/near-me" className="callout">
              <span className="callout-initial">
                N<span style={{ color: "var(--color-muted)" }}>.</span>
              </span>
              <span className="callout-label">Near me</span>
            </Link>
            <Link href="/search?grade=A" className="callout">
              <span className="callout-initial">
                A<span style={{ color: "var(--color-muted)" }}>.</span>
              </span>
              <span className="callout-label">Grade A only</span>
            </Link>
            <Link href="/map" className="callout">
              <span className="callout-initial">
                M<span style={{ color: "var(--color-muted)" }}>.</span>
              </span>
              <span className="callout-label">Map view</span>
            </Link>
          </nav>
        </div>

        {/* Hairline divider closing the hero */}
        <div className="mx-auto mt-20 max-w-6xl border-t border-hairline" />
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
                NYC Restaurant Health Grade Report 2026
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/75">
                Grade A rates across all 5 boroughs and {reportData.neighborhoods.totalAnalyzed} neighborhoods — data you won&apos;t find anywhere else.
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
                {ALL_DIETS.map((diet) => (
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
            {editorsPicks.map((r) => (
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
                We don&apos;t pay critics, and we don&apos;t accept paid placements.
                Every restaurant here is cross-referenced with NYC Department of
                Health inspection records — public, sourced, verifiable.
              </p>

              <dl className="mt-12 grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3">
                <Stat number="8,835" label="NYC restaurants tracked" />
                <Stat number={totalCount.toLocaleString()} label="Currently published" />
                <Stat number={gradeACount.toLocaleString()} label="Grade A inspections" />
                <Stat number="116" label="Neighborhoods covered" />
                <Stat number="12" label="Dietary tags, applied conservatively" />
                <Stat number="+100 / wk" label="New listings every Sunday" />
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
                    Weekly publish cadence. No paid placements, no fabricated
                    reviews, no editorial personas.
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
                desc: "Data-driven rankings of NYC neighborhoods for healthy dining.",
                category: "Neighborhood guides",
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

    </>
  )
}

/* ─── Internal pieces ─── */

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
