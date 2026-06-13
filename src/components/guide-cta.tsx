import Link from "next/link"

interface GuideCTAProps {
  heading: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export default function GuideCTA({
  heading,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: GuideCTAProps) {
  return (
    <section
      className="my-12 p-10 md:p-14"
      style={{
        backgroundColor: "var(--color-forest)",
        color: "var(--color-cream)",
        borderRadius: "4px",
      }}
    >
      <p className="eyebrow" style={{ color: "var(--color-sage)" }}>
        Next step
      </p>
      <h2
        className="mt-3"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(1.625rem, 2vw + 1rem, 2.25rem)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--color-cream)",
        }}
      >
        {heading}
      </h2>
      <p
        className="mt-3"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          lineHeight: 1.6,
          color: "rgba(248, 246, 241, 0.78)",
          maxWidth: "52ch",
        }}
      >
        {body}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 border px-6 py-3"
          style={{
            backgroundColor: "var(--color-cream)",
            color: "var(--color-forest)",
            borderColor: "var(--color-cream)",
            borderRadius: "3px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: "0.02em",
          }}
        >
          {primaryLabel}
          <span aria-hidden="true">→</span>
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="eyebrow inline-flex items-center gap-1.5"
            style={{ color: "var(--color-sage)" }}
          >
            {secondaryLabel}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  )
}
