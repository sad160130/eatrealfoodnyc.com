import Link from "next/link"
import { GuideArticle } from "@/config/guides"

interface GuideHeroProps {
  guide: GuideArticle
  subtitle: string
  /** Visible H1 when it must match a count-based title instead of guide.title. */
  heading?: string
  stats?: Array<{ stat: string; label: string }>
  /** A data-derived line under the lede, such as the newest inspection date. */
  note?: string | null
}

export default function GuideHero({ guide, subtitle, heading, stats, note }: GuideHeroProps) {
  const publishedLabel = new Date(`${guide.publishedDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })

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
        </p>

        {/* Title */}
        <p className="mt-4 text-sm" style={{ color: "var(--color-text)" }}>
          By{" "}
          <Link href="/about/team" className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            Snket Desai and Rohan Kadam
          </Link>
        </p>

        <h1 className="display-1 mt-4">{heading ?? guide.title}</h1>

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

        {note ? (
          <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>
            {note}
          </p>
        ) : null}

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
