import Link from "next/link"
import { GuideArticle, getRelatedGuides } from "@/config/guides"

interface GuideLayoutProps {
  guide: GuideArticle
  children: React.ReactNode
}

export default function GuideLayout({ guide, children }: GuideLayoutProps) {
  const relatedGuides = getRelatedGuides(guide.slug)

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {children}

      <div className="mx-auto max-w-4xl px-6 pb-8">
        {/* Related hub pages */}
        <div className="mb-8 rounded-2xl border border-sage/20 bg-sage/10 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-jade">
            EXPLORE ON OUR SITE
          </p>
          <div className="flex flex-wrap gap-3">
            {guide.relatedHubPages.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl border border-sage/20 bg-white px-4 py-2.5 text-sm font-medium text-jade transition-all hover:border-jade hover:shadow-sm"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <div className="mb-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              RELATED GUIDES
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link
                  key={related.slug}
                  href={`/guides/${related.slug}`}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-sage/30 hover:shadow-md"
                >
                  <span className="text-2xl">{related.emoji}</span>
                  <h3
                    className="mt-3 text-sm font-bold leading-snug text-forest transition-colors group-hover:text-jade"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {related.shortTitle}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {related.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-jade">{related.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 py-8 text-center">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-full border border-sage/30 px-6 py-3 text-sm font-semibold text-jade transition-colors hover:border-jade hover:text-forest"
          >
            ← Browse all guides
          </Link>
        </div>
      </div>
    </div>
  )
}
