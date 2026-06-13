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
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* ─── HERO ─── */}
      <header
        className="border-b"
        style={{ borderBottomColor: "var(--hairline)" }}
      >
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-8">
          <nav className="eyebrow flex flex-wrap items-center gap-2" style={{ color: "var(--color-muted)" }}>
            <Link href="/" style={{ color: "var(--color-forest)" }}>Home</Link>
            <span aria-hidden="true">·</span>
            <span>Guides</span>
          </nav>

          <p className="eyebrow mt-7">The knowledge base</p>
          <h1 className="display-1 mt-3">
            NYC healthy dining guides.
          </h1>
          <p
            className="mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.25rem",
              lineHeight: 1.5,
              color: "var(--color-text)",
              maxWidth: "62ch",
            }}
          >
            Deeply researched guides for health-conscious diners navigating New York City — written from real data, NYC Department of Health records, and our restaurant database.
          </p>

          {/* Inline stats */}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Guides</span>
              <span className="tabular font-semibold">{GUIDES.length}</span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Categories</span>
              <span className="tabular font-semibold">{GUIDE_CATEGORIES.length}</span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-text)" }}>
              <span className="eyebrow mr-1.5" style={{ color: "var(--color-muted)" }}>Restaurants covered</span>
              <span className="tabular font-semibold">8,835</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-14">
        {/* ─── Featured ─── */}
        <section className="mb-16">
          <p className="eyebrow">Featured guides</p>
          <h2 className="h2-serif mt-2" style={{ fontSize: "1.75rem" }}>The essentials</h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {featured.map((g, i) => {
              const isLead = i === 0
              return (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className={`group block border p-8 transition-colors ${isLead ? "md:col-span-2" : ""}`}
                  style={{
                    backgroundColor: isLead ? "var(--color-forest)" : "#FFFFFF",
                    borderColor: isLead ? "var(--color-forest)" : "var(--hairline)",
                    borderRadius: "4px",
                    color: isLead ? "var(--color-cream)" : undefined,
                  }}
                >
                  <p
                    className="eyebrow"
                    style={{ color: isLead ? "var(--color-sage)" : "var(--color-muted)" }}
                  >
                    {g.category}
                    <span aria-hidden="true" className="mx-2" style={{ opacity: 0.5 }}>·</span>
                    <span style={{ opacity: 0.8 }}>{g.readTime}</span>
                  </p>
                  <h3
                    className="mt-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: isLead ? "clamp(1.625rem, 2.5vw + 1rem, 2.5rem)" : "1.375rem",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      color: isLead ? "var(--color-cream)" : "var(--color-forest)",
                    }}
                  >
                    {g.title}
                  </h3>
                  <p
                    className="mt-3 line-clamp-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: isLead ? "1.0625rem" : "0.95rem",
                      lineHeight: 1.55,
                      color: isLead ? "rgba(248, 246, 241, 0.78)" : "var(--color-muted)",
                      maxWidth: "62ch",
                    }}
                  >
                    {g.description}
                  </p>
                  <p
                    className="eyebrow mt-5 inline-flex items-center gap-1.5"
                    style={{ color: isLead ? "var(--color-sage)" : "var(--color-jade)" }}
                  >
                    Read guide
                    <span aria-hidden="true">→</span>
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ─── Categories ─── */}
        {GUIDE_CATEGORIES.map((category, idx) => {
          const categoryGuides = getGuidesByCategory(category)
          if (categoryGuides.length === 0) return null
          return (
            <section key={category} className="mb-14">
              <div
                className="mb-6 flex items-end justify-between gap-3 border-b pb-4"
                style={{ borderBottomColor: "var(--hairline)" }}
              >
                <div>
                  <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
                    Category {String(idx + 1).padStart(2, "0")}
                  </p>
                  <h2 className="h2-serif mt-1.5">{category}</h2>
                </div>
                <span
                  className="tabular text-sm flex-shrink-0"
                  style={{ color: "var(--color-muted)" }}
                >
                  {categoryGuides.length} {categoryGuides.length === 1 ? "guide" : "guides"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group block border p-5 transition-colors"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "var(--hairline)",
                      borderRadius: "4px",
                    }}
                  >
                    <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
                      {g.readTime}
                    </p>
                    <h3
                      className="mt-2.5"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1.0625rem",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        color: "var(--color-forest)",
                      }}
                    >
                      {g.shortTitle}
                    </h3>
                    <p
                      className="mt-2 line-clamp-2 text-xs"
                      style={{ color: "var(--color-muted)", lineHeight: 1.5 }}
                    >
                      {g.description}
                    </p>
                    <p
                      className="eyebrow mt-3 inline-flex items-center gap-1.5"
                      style={{ color: "var(--color-jade)" }}
                    >
                      Read
                      <span aria-hidden="true">→</span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
