import Link from "next/link"

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

const DIETS = [
  "Vegan", "Vegetarian", "Gluten-Free", "Halal", "Kosher", "Dairy-Free",
  "Keto", "Paleo", "Whole Foods", "Low Calorie", "Raw Food", "Nut-Free",
]

const COMPANY = [
  { label: "About", href: "/about" },
  { label: "Our Data", href: "/about/our-data" },
  { label: "Editorial Standards", href: "/about/editorial-standards" },
  { label: "Team", href: "/about/team" },
  { label: "Dining Guides", href: "/guides" },
  { label: "Contact", href: "/contact" },
  { label: "Press", href: "/press" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

const TOOLS = [
  { label: "Health Grade Report", href: "/data/nyc-restaurant-health-grade-report" },
  { label: "Best-Rated Restaurants", href: "/data/best-rated-restaurants" },
  { label: "Interactive Map", href: "/map" },
  { label: "Compare Neighborhoods", href: "/nyc/compare" },
  { label: "Open Right Now", href: "/search?open=true" },
  { label: "Hidden Gems", href: "/search?hidden_gem=true" },
  { label: "Grade A Only", href: "/search?grade=A" },
]

function boroughToSlug(borough: string): string {
  return borough.toLowerCase().replace(/ /g, "-")
}

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-forest)",
        color: "var(--color-cream)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* ─── Top row: brand + colophon ─── */}
        <div className="grid grid-cols-1 gap-10 border-b pb-12 md:grid-cols-12" style={{ borderBottomColor: "rgba(248, 246, 241, 0.10)" }}>
          {/* Brand mark — typographic, cream version of the placard */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-3" aria-label="Eat Real Food NYC — home">
              <span
                aria-hidden="true"
                className="flex items-center justify-center"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: "var(--color-cream)",
                  color: "var(--color-forest)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.375rem",
                  borderRadius: "4px",
                  letterSpacing: "-0.02em",
                }}
              >
                A
              </span>
              <span className="flex items-baseline gap-1.5">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    letterSpacing: "-0.015em",
                    color: "var(--color-cream)",
                  }}
                >
                  Eat Real Food
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--color-sage)",
                  }}
                >
                  NYC
                </span>
              </span>
            </Link>

            <p
              className="mt-6 max-w-md"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.0625rem",
                lineHeight: 1.55,
                color: "rgba(248, 246, 241, 0.78)",
                fontStyle: "italic",
              }}
            >
              An independent NYC dining directory, ranked by real city inspection data — not paid placements.
            </p>

            {/* Social — single-line, restrained */}
            <div className="mt-8">
              <p className="eyebrow" style={{ color: "rgba(248, 246, 241, 0.45)" }}>
                Follow
              </p>
              <div className="mt-3 flex items-center gap-5">
                <SocialLink
                  href="https://www.instagram.com/nyc_healthyeats/"
                  label="Instagram — @nyc_healthyeats"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </SocialLink>
                <SocialLink
                  href="https://www.youtube.com/@EatRealFoodNYC"
                  label="YouTube — @EatRealFoodNYC"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                  </svg>
                </SocialLink>
              </div>
            </div>
          </div>

          {/* Trust badge — set on the right of the brand row */}
          <div className="md:col-span-7 md:pl-12">
            <div className="grid grid-cols-3 gap-8">
              <TrustStat number="1,500+" label="Restaurants listed" />
              <TrustStat number="116" label="NYC neighborhoods" />
              <TrustStat number="A" label="DOHMH source data" plaque />
            </div>
          </div>
        </div>

        {/* ─── Link columns ─── */}
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          <FooterCol label="Geography">
            {BOROUGHS.map((b) => (
              <FooterLink key={b} href={`/nyc/${boroughToSlug(b)}/healthy-restaurants`}>
                {b}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol label="Dietary">
            {DIETS.map((d) => (
              <FooterLink key={d} href={`/healthy-restaurants/${d.toLowerCase().replace(/ /g, "-")}`}>
                {d}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol label="Company">
            {COMPANY.map((c) => (
              <FooterLink key={c.href} href={c.href}>
                {c.label}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol label="Tools">
            {TOOLS.map((t) => (
              <FooterLink key={t.href} href={t.href}>
                {t.label}
              </FooterLink>
            ))}
          </FooterCol>
        </div>

        {/* ─── Colophon ─── */}
        <div
          className="mt-16 flex flex-col items-start justify-between gap-3 border-t pt-6 md:flex-row md:items-center"
          style={{ borderTopColor: "rgba(248, 246, 241, 0.10)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "rgba(248, 246, 241, 0.45)",
              letterSpacing: "0.02em",
            }}
          >
            &copy; {new Date().getFullYear()} Eat Real Food NYC. All rights reserved.
            <span className="mx-2" style={{ color: "rgba(248, 246, 241, 0.25)" }}>·</span>
            <Link href="/sitemap.xml" style={{ color: "rgba(248, 246, 241, 0.55)" }}>Sitemap</Link>
            <span className="mx-2" style={{ color: "rgba(248, 246, 241, 0.25)" }}>·</span>
            <Link href="/privacy" style={{ color: "rgba(248, 246, 241, 0.55)" }}>Privacy</Link>
            <span className="mx-2" style={{ color: "rgba(248, 246, 241, 0.25)" }}>·</span>
            <Link href="/terms" style={{ color: "rgba(248, 246, 241, 0.55)" }}>Terms</Link>
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8125rem",
              color: "rgba(248, 246, 241, 0.45)",
              fontStyle: "italic",
              letterSpacing: "-0.005em",
            }}
          >
            Updated weekly. Sundays.
          </p>
        </div>
      </div>

    </footer>
  )
}

/* ─── Internal pieces ─── */

function TrustStat({
  number,
  label,
  plaque = false,
}: {
  number: string
  label: string
  plaque?: boolean
}) {
  return (
    <div>
      {plaque ? (
        <span
          aria-hidden="true"
          className="flex items-center justify-center"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            backgroundColor: "var(--color-cream)",
            color: "var(--color-forest)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.375rem",
            borderRadius: "4px",
            letterSpacing: "-0.02em",
          }}
        >
          {number}
        </span>
      ) : (
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "2rem",
            lineHeight: 1,
            color: "var(--color-cream)",
            letterSpacing: "-0.02em",
          }}
        >
          {number}
        </p>
      )}
      <p
        className="eyebrow mt-2"
        style={{ color: "rgba(248, 246, 241, 0.55)" }}
      >
        {label}
      </p>
    </div>
  )
}

function FooterCol({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="eyebrow" style={{ color: "rgba(248, 246, 241, 0.45)" }}>
        {label}
      </p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "rgba(248, 246, 241, 0.72)",
          transition: "color 180ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cream)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248, 246, 241, 0.72)")}
      >
        {children}
      </Link>
    </li>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{ color: "rgba(248, 246, 241, 0.55)", transition: "color 180ms ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cream)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248, 246, 241, 0.55)")}
    >
      {children}
    </a>
  )
}
