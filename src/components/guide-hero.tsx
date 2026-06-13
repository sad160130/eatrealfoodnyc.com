import Link from "next/link"
import { GuideArticle } from "@/config/guides"

interface GuideHeroProps {
  guide: GuideArticle
  subtitle: string
  stats?: Array<{ stat: string; label: string }>
}

export default function GuideHero({ guide, subtitle, stats }: GuideHeroProps) {
  const updatedLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const publishedLabel = new Date(guide.publishedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <header
      className="border-b"
      style={{ borderBottomColor: "var(--hairline)" }}
    >
      <div className="mx-auto max-w-4xl px-6 pb-12 pt-8">
        {/* Breadcrumb */}
        <nav className="eyebrow flex flex-wrap items-center gap-2" style={{ color: "var(--color-muted)" }}>
          <Link href="/" className="transition-colors" style={{ color: "var(--color-forest)" }}>
            Home
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/guides" className="transition-colors" style={{ color: "var(--color-forest)" }}>
            Guides
          </Link>
          <span aria-hidden="true">·</span>
          <span>{guide.shortTitle}</span>
        </nav>

        {/* Article eyebrow */}
        <p className="eyebrow mt-7">
          {guide.category}
          <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
          <span style={{ color: "var(--color-muted)" }}>{guide.readTime}</span>
          <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
          <span style={{ color: "var(--color-muted)" }}>Published {publishedLabel}</span>
          <span aria-hidden="true" className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
          <span style={{ color: "var(--color-jade)" }}>Updated {updatedLabel}</span>
        </p>

        {/* Title */}
        <h1 className="display-1 mt-4">{guide.title}</h1>

        {/* Subtitle / lede */}
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
          {subtitle}
        </p>

        {/* Stats — hairline cards, no white/10 background */}
        {stats && stats.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="border p-4"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "var(--hairline)",
                  borderRadius: "4px",
                }}
              >
                <p
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.75rem",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "var(--color-forest)",
                  }}
                >
                  {item.stat}
                </p>
                <p
                  className="eyebrow mt-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
