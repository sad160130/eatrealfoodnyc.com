import Link from "next/link"
import { GuideArticle, getRelatedGuides } from "@/config/guides"

interface GuideLayoutProps {
  guide: GuideArticle
  children: React.ReactNode
}

export default function GuideLayout({ guide, children }: GuideLayoutProps) {
  const relatedGuides = getRelatedGuides(guide.slug)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      {children}

      <div className="mx-auto max-w-4xl px-6 pb-12">
        {/* Related hub pages */}
        <section
          className="mt-12 border-t pt-10"
          style={{ borderTopColor: "var(--hairline)" }}
        >
          <p className="eyebrow">Explore on our site</p>
          <h2 className="h2-serif mt-2" style={{ fontSize: "1.5rem" }}>
            Continue with the listings
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {guide.relatedHubPages.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 border px-4 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "var(--hairline)",
                  borderRadius: "3px",
                  color: "var(--color-forest)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                }}
              >
                {link.label}
                <span aria-hidden="true" style={{ color: "var(--color-jade)" }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <section
            className="mt-12 border-t pt-10"
            style={{ borderTopColor: "var(--hairline)" }}
          >
            <p className="eyebrow">Related guides</p>
            <h2 className="h2-serif mt-2" style={{ fontSize: "1.5rem" }}>
              Keep reading
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link
                  key={related.slug}
                  href={`/guides/${related.slug}`}
                  className="group block border p-5 transition-colors"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "var(--hairline)",
                    borderRadius: "4px",
                  }}
                >
                  <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
                    {related.category} <span className="mx-1">·</span> {related.readTime}
                  </p>
                  <h3
                    className="mt-3 transition-colors"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                      color: "var(--color-forest)",
                    }}
                  >
                    {related.shortTitle}
                  </h3>
                  <p
                    className="mt-2 line-clamp-2 text-xs"
                    style={{ color: "var(--color-muted)", lineHeight: 1.5 }}
                  >
                    {related.description}
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
        )}

        <div
          className="border-t py-10 text-center"
          style={{ borderTopColor: "var(--hairline)" }}
        >
          <Link
            href="/guides"
            className="eyebrow inline-flex items-center gap-1.5"
            style={{ color: "var(--color-jade)" }}
          >
            <span aria-hidden="true">←</span>
            Browse all guides
          </Link>
        </div>
      </div>
    </div>
  )
}
