import type { Metadata } from "next"
import Link from "next/link"
import { GUIDES, GUIDE_CATEGORIES, getFeaturedGuides, getGuidesByCategory } from "@/config/guides"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "NYC Healthy Dining Guides — Expert Advice on Eating Well in New York City",
  description:
    "In-depth guides for health-conscious diners in NYC. Learn about health inspection grades, dietary options, neighborhood rankings, and how to find the best healthy restaurants.",
  alternates: { canonical: getCanonicalUrl("/guides") },
  robots: { index: true, follow: true },
}

export default function GuidesPage() {
  const featured = getFeaturedGuides()

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Header */}
      <div className="bg-forest px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">Guides</span>
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">
            THE KNOWLEDGE BASE
          </p>
          <h1
            className="text-5xl font-bold leading-tight text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            NYC Healthy Dining<br />Guides
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-white/70">
            Deeply researched guides for health-conscious diners navigating New York City. Written
            using real data from the NYC Department of Health and our restaurant database.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-sage">{GUIDES.length}</p>
              <p className="mt-0.5 text-xs text-white/50">Guides published</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-sage">{GUIDE_CATEGORIES.length}</p>
              <p className="mt-0.5 text-xs text-white/50">Topic categories</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-sage">8,835</p>
              <p className="mt-0.5 text-xs text-white/50">Restaurants covered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Featured guides */}
        <div className="mb-16">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
            FEATURED GUIDES
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featured.map((g, i) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className={`group overflow-hidden rounded-2xl border transition-all hover:shadow-xl ${
                  i === 0 ? "border-forest bg-forest md:col-span-2" : "border-gray-100 bg-white hover:border-sage/30"
                }`}
              >
                <div className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{g.emoji}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-widest ${i === 0 ? "text-sage" : "text-jade"}`}>
                        {g.category}
                      </span>
                      <span className={`text-xs ${i === 0 ? "text-white/30" : "text-gray-300"}`}>·</span>
                      <span className={`text-xs ${i === 0 ? "text-white/50" : ""}`} style={i !== 0 ? { color: "var(--color-muted)" } : undefined}>
                        {g.readTime}
                      </span>
                    </div>
                  </div>
                  <h2
                    className={`font-bold leading-snug transition-opacity group-hover:opacity-80 ${
                      i === 0 ? "text-3xl text-white" : "text-xl text-forest"
                    }`}
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {g.title}
                  </h2>
                  <p className={`mt-3 line-clamp-2 text-base leading-relaxed ${i === 0 ? "text-white/60" : ""}`} style={i !== 0 ? { color: "var(--color-muted)" } : undefined}>
                    {g.description}
                  </p>
                  <p className={`mt-6 flex items-center gap-2 text-sm font-semibold ${i === 0 ? "text-sage" : "text-jade"}`}>
                    Read guide →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All guides by category */}
        {GUIDE_CATEGORIES.map((category) => {
          const categoryGuides = getGuidesByCategory(category)
          if (categoryGuides.length === 0) return null
          return (
            <div key={category} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <h2
                  className="text-xl font-bold text-forest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {category}
                </h2>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>{categoryGuides.length} guides</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-sage/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-2xl">{g.emoji}</span>
                      <span className="text-xs" style={{ color: "var(--color-muted)" }}>{g.readTime}</span>
                    </div>
                    <h3
                      className="text-base font-bold leading-snug text-forest transition-colors group-hover:text-jade"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {g.shortTitle}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                      {g.description}
                    </p>
                    <p className="mt-4 text-xs font-semibold text-jade">Read more →</p>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
