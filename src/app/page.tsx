import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { boroughToSlug, parseDietaryTags, formatDietaryTag, formatPriceRange } from "@/lib/utils"
import { getCanonicalUrl } from "@/config/seo"
import EatForYourGoal from "@/components/eat-for-your-goal"
import SavedPreview from "@/components/saved-preview"
import NearMeButton from "@/components/near-me-button"

export const metadata: Metadata = {
  title: "Healthy Restaurants NYC — Find & Filter 2026 | Eat Real Food NYC",
  description:
    "NYC's most trusted healthy restaurant directory. 8,835 restaurants across all 5 boroughs — every listing verified with NYC health inspection grades. Filter by vegan, halal, gluten-free, kosher, and 8 more dietary needs.",
  alternates: {
    canonical: "https://www.eatrealfoodnyc.com",
  },
  openGraph: {
    title: "Healthy Restaurants NYC — Find & Filter 2026 | Eat Real Food NYC",
    description: "NYC's most trusted healthy restaurant directory. 8,835 restaurants across all 5 boroughs with verified NYC health inspection grades.",
    type: "website",
    url: "https://www.eatrealfoodnyc.com",
    siteName: "Eat Real Food NYC",
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

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

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

  const heroPhoto = editorsPicks[0]?.photo ?? null
  const featuredGem = hiddenGems[0] ?? editorsPicks[1] ?? null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Eat Real Food NYC",
    url: siteUrl,
    description: "NYC restaurant directory with health inspection grades and dietary filtering.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eat Real Food NYC",
    url: siteUrl,
    description: "The curated NYC restaurant directory with health inspection grades, dietary filtering, and neighborhood-level search.",
    foundingDate: "2026",
    areaServed: { "@type": "City", name: "New York City", addressRegion: "NY", addressCountry: "US" },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [webSiteJsonLd, orgJsonLd] }) }} />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[85vh] overflow-hidden bg-forest">
        {heroPhoto && (
          <Image
            src={heroPhoto}
            alt="NYC Healthy Dining"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/70 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex min-h-[85vh] flex-col justify-center px-6 py-20 md:pl-20">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
              The Curated NYC Dining Authority
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
              Find Healthy Restaurants{" "}
              <span className="block text-sage">Across New York City</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/80">
              The curated authority for New York&apos;s health-conscious dining. Inspected, filtered, and verified.
            </p>

            {/* Topical anchor */}
            <p className="mt-3 max-w-lg text-sm text-white/50">
              The only NYC restaurant directory built on{" "}
              <Link href="/guides/nyc-health-grades-explained" className="text-sage/80 underline underline-offset-2 transition-colors hover:text-sage">verified NYC health inspection grades</Link>
              {" "}and{" "}
              <Link href="/about/our-data" className="text-sage/80 underline underline-offset-2 transition-colors hover:text-sage">conservative dietary certification</Link>.
            </p>

            {/* Search bar */}
            <form action="/search" method="get" className="mt-6 w-full max-w-xl">
              <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:flex-row sm:rounded-full">
                <input
                  name="q"
                  placeholder="Restaurant or cuisine..."
                  className="flex-1 border-b border-gray-100 px-5 py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:border-b-0 sm:border-r sm:px-6"
                />
                <input
                  name="neighborhood"
                  placeholder="Neighborhood..."
                  className="flex-1 px-5 py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:px-6"
                />
                <button
                  type="submit"
                  className="w-full bg-forest px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-jade sm:w-auto"
                >
                  Explore
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search?open=true"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Open Right Now
            </Link>
            <NearMeButton
              variant="pill"
              label="Near Me"
              className="border border-white/30 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
            />
          </div>

          <Link
            href="/near-me"
            className="mt-2 inline-block text-xs text-white/50 underline transition-colors hover:text-white/70"
          >
            Browse restaurants near your location →
          </Link>

          <p className="mt-4 text-xs text-white/60">
            Or{" "}
            <Link href="/map" className="text-sage underline transition-colors hover:text-white">
              explore the interactive map →
            </Link>
          </p>
        </div>
      </section>

      {/* ─── SAVED PREVIEW ─── */}
      <SavedPreview />

      {/* ─── CURATION MATRIX ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-bold text-forest">The Curation Matrix</h2>
            <Link
              href="/search"
              className="text-xs font-semibold uppercase tracking-widest text-jade hover:text-forest transition-colors"
            >
              VIEW ALL FILTERS
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-4" style={{ minHeight: "480px" }}>
            {/* Cell 1 — Featured tall card */}
            {featuredGem && (
              <Link
                href={`/restaurants/${featuredGem.slug}`}
                className="relative row-span-2 overflow-hidden rounded-2xl lg:col-span-1"
                style={{ minHeight: "320px" }}
              >
                {featuredGem.photo ? (
                  <Image
                    src={featuredGem.photo}
                    alt={`${featuredGem.name} — ${featuredGem.neighborhood ?? featuredGem.borough ?? "NYC"} hidden gem restaurant`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-forest" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-amber px-3 py-1 text-xs font-bold text-white">
                    FEATURED COLLECTION
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-serif text-2xl font-bold text-white">{featuredGem.name}</p>
                  {featuredGem.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/75">
                      {featuredGem.description}
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* Cell 2 — All 12 dietary filters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                DIETARY FILTERS
              </p>
              <div className="grid grid-cols-4 gap-3">
                {ALL_DIETS.map((diet) => (
                  <Link
                    key={diet.tag}
                    href={`/healthy-restaurants/${diet.tag}`}
                    className="group flex flex-col items-center justify-center rounded-xl border border-gray-100 p-3 transition-all hover:border-sage hover:bg-sage/5"
                  >
                    <span className="text-2xl">{diet.emoji}</span>
                    <span className="mt-1 text-center text-xs font-medium leading-tight text-forest group-hover:text-jade">
                      {diet.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cell 3 — Borough explorer */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                EXPLORE BY BOROUGH
              </p>
              <div className="mt-4 space-y-3">
                {["Manhattan", "Brooklyn", "Queens"].map((borough) => (
                  <Link
                    key={borough}
                    href={`/nyc/${boroughToSlug(borough)}/healthy-restaurants`}
                    className="flex items-center justify-between border-b border-gray-50 py-2 text-sm font-medium text-forest transition-colors hover:text-jade"
                  >
                    <span>{borough}</span>
                    <span className="text-sage">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Compare link below borough explorer */}
            <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 lg:col-span-2">
              <Link
                href="/nyc/compare"
                className="inline-flex items-center gap-2 rounded-full border border-sage/30 px-6 py-3 text-sm font-semibold text-jade transition-colors hover:border-jade hover:text-forest"
              >
                📊 Compare all neighborhoods →
              </Link>
            </div>

            {/* Cell 5 — Nearby */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-forest p-8 text-center">
              <span className="text-3xl">📍</span>
              <p className="mt-3 font-serif text-xl font-bold text-white">Nearby Now</p>
              <p className="mt-2 text-sm text-white/70">
                Find healthy options within 1 mile of your current location
              </p>
              <Link
                href="/search"
                className="mt-4 rounded-full bg-sage px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-jade"
              >
                Find Nearby
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EAT FOR YOUR GOAL ─── */}
      <EatForYourGoal />

      {/* ─── EDITOR'S JOURNAL ─── */}
      <section className="py-20" style={{ backgroundColor: "var(--color-cream)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-serif text-3xl font-bold text-forest">The Editor&apos;s Journal</h2>
          <p className="mt-2 max-w-lg text-sm" style={{ color: "var(--color-muted)" }}>
            Each month, our culinary experts handpick the most vital additions to the NYC dining
            landscape. Not just food — vibrancy.
          </p>

          {/* Horizontal scroll */}
          <div className="scrollbar-hide mt-8 flex gap-6 overflow-x-auto pb-4">
            {editorsPicks.map((r) => {
              const tags = parseDietaryTags(r.dietary_tags)
              const price = formatPriceRange(r.price_range)
              return (
                <Link
                  key={r.id}
                  href={`/restaurants/${r.slug}`}
                  className="w-72 min-w-72 flex-shrink-0 overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-lg"
                >
                  {/* Photo */}
                  <div className="relative aspect-video w-full">
                    {r.photo ? (
                      <Image
                        src={r.photo}
                        alt={`${r.name} — ${r.neighborhood ?? r.borough ?? "NYC"} healthy restaurant`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-jade" />
                    )}
                    {r.rating != null && (
                      <span className="absolute right-3 top-3 rounded-full bg-amber px-2 py-1 text-xs font-bold text-white">
                        ★ {r.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {[r.neighborhood, r.type].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 font-serif text-xl font-bold text-forest">{r.name}</p>
                    {r.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{r.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {price && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {price}
                        </span>
                      )}
                      {tags[0] && (
                        <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-jade">
                          {formatDietaryTag(tags[0])}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-jade">Book Table →</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── DISPATCHES ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Left — Articles */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-forest">Dispatches</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                The latest word from our community of food critics and wellness experts.
              </p>

              {[
                {
                  author: "Elena Vance",
                  role: "Deputy Editor",
                  title: "Is 'Bone Broth Luxe' the new high-end lunch?",
                  excerpt: "A deep dive into NYC's obsession with mineral-dense elixirs.",
                  href: "/search?q=bone+broth",
                },
                {
                  author: "Marcus Thorne",
                  role: "Culinary Strategist",
                  title: "7 Spots for Keto-Friendly Omakase",
                  excerpt: "Where to find world-class fish without the vinegared rice.",
                  href: "/search?q=keto",
                },
              ].map((article) => (
                <Link
                  key={article.author}
                  href={article.href}
                  className="flex gap-4 border-b border-gray-100 py-6 hover:opacity-80 transition-opacity"
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{article.author}</p>
                    <p className="text-xs text-gray-400">{article.role}</p>
                    <p className="mt-2 font-serif text-base font-semibold text-forest">
                      {article.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right — Critics' Choice card */}
            <div>
              <div className="relative h-full overflow-hidden rounded-2xl bg-forest p-10">
                <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-jade/30" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <span className="text-2xl">⭐</span>
                    <h3 className="mt-4 font-serif text-2xl font-bold text-white">
                      Critics&apos; Choice: The 2026 Green List
                    </h3>
                    <p className="mt-3 text-sm text-white/70">
                      Our annual definitive guide to the 50 most sustainable, nutrient-dense, and
                      delicious restaurants across the five boroughs.
                    </p>
                  </div>
                  <Link
                    href="/healthy-restaurants/whole-foods"
                    className="mt-6 w-fit rounded-full bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-jade"
                  >
                    Explore the List →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FROM OUR GUIDES ─── */}
      <section className="border-t border-gray-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">
                KNOWLEDGE BASE
              </p>
              <h2
                className="text-3xl font-bold text-forest"
                style={{ fontFamily: "Georgia, serif" }}
              >
                From our guides
              </h2>
            </div>
            <Link
              href="/guides"
              className="text-sm font-semibold text-jade transition-colors hover:text-forest"
            >
              View all guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                slug: "nyc-health-grades-explained",
                emoji: "🏥",
                title: "NYC Health Grades Explained",
                desc: "What Grade A, B, and C really mean and how the inspection process works.",
                category: "Health & Safety",
              },
              {
                slug: "vegan-nyc-borough-guide",
                emoji: "🌱",
                title: "Vegan NYC — Borough by Borough",
                desc: "The definitive guide to plant-based dining across all five NYC boroughs.",
                category: "Dietary Guides",
              },
              {
                slug: "best-healthy-neighborhoods-nyc",
                emoji: "🗺️",
                title: "Best Healthy Neighborhoods NYC",
                desc: "Data-driven rankings of NYC neighborhoods for healthy dining.",
                category: "Neighborhood Guides",
              },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/guides/${article.slug}`}
                className="group rounded-2xl border border-gray-100 p-6 transition-all hover:border-sage/30 hover:shadow-md"
                style={{ backgroundColor: "var(--color-cream)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{article.emoji}</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-jade">
                    {article.category}
                  </span>
                </div>
                <h3
                  className="text-base font-bold leading-snug text-forest transition-colors group-hover:text-jade"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {article.desc}
                </p>
                <p className="mt-4 text-xs font-semibold text-jade">Read guide →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-forest py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
            {/* Col 1 */}
            <div>
              <p className="font-serif text-xl font-bold">Eat Real Food NYC</p>
              <p className="mt-3 text-sm text-white/60">
                The Curated Culinary Authority of NYC. Dedicated to uncovering the finest
                health-conscious experiences in the city.
              </p>
              <div className="mt-6 flex gap-4 text-xl">
                <span className="cursor-pointer hover:text-sage transition-colors">🐦</span>
                <span className="cursor-pointer hover:text-sage transition-colors">📷</span>
                <span className="cursor-pointer hover:text-sage transition-colors">✉️</span>
              </div>
            </div>

            {/* Col 2 — Geography */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                GEOGRAPHY
              </p>
              <ul className="mt-4 space-y-2">
                {BOROUGHS.map((b) => (
                  <li key={b}>
                    <Link
                      href={`/nyc/${boroughToSlug(b)}/healthy-restaurants`}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Dietary */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                DIETARY
              </p>
              <ul className="mt-4 space-y-2">
                {["Gluten-Free", "Vegan", "Paleo", "Halal", "Kosher", "Whole Foods"].map((d) => (
                  <li key={d}>
                    <Link
                      href={`/healthy-restaurants/${d.toLowerCase().replace(" ", "-")}`}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {d}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Company */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                COMPANY
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Our Data", href: "/about/our-data" },
                  { label: "Editorial Standards", href: "/about/editorial-standards" },
                  { label: "Meet the Team", href: "/about/team" },
                  { label: "Dining Guides", href: "/guides" },
                  { label: "Contact", href: "/contact" },
                  { label: "Press", href: "/press" },
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5 — Tools */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                TOOLS
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  { label: "Interactive Map", href: "/map" },
                  { label: "Compare Neighborhoods", href: "/nyc/compare" },
                  { label: "Open Right Now", href: "/search?open=true" },
                  { label: "Hidden Gems", href: "/search?hidden_gem=true" },
                  { label: "Grade A Only", href: "/search?grade=A" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/40">
            © 2026 Eat Real Food NYC. All rights reserved.
            <span className="mx-2">·</span>
            <a href="/sitemap.xml" className="text-white/40 transition-colors hover:text-white/60">Sitemap</a>
          </div>
        </div>
      </footer>
    </>
  )
}
