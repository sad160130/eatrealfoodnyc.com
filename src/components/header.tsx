"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSavedRestaurants } from "@/hooks/use-saved-restaurants"

const BOROUGHS = [
  { label: "Manhattan", slug: "manhattan" },
  { label: "Brooklyn", slug: "brooklyn" },
  { label: "Queens", slug: "queens" },
  { label: "Bronx", slug: "bronx" },
  { label: "Staten Island", slug: "staten-island" },
]

const DIETS = [
  { label: "Vegan", tag: "vegan" },
  { label: "Vegetarian", tag: "vegetarian" },
  { label: "Gluten-Free", tag: "gluten-free" },
  { label: "Halal", tag: "halal" },
  { label: "Kosher", tag: "kosher" },
  { label: "Dairy-Free", tag: "dairy-free" },
  { label: "Keto", tag: "keto" },
  { label: "Paleo", tag: "paleo" },
  { label: "Whole Foods", tag: "whole-foods" },
  { label: "Low Calorie", tag: "low-calorie" },
  { label: "Raw Food", tag: "raw-food" },
  { label: "Nut-Free", tag: "nut-free" },
]

const GUIDE_LINKS = [
  { label: "NYC Health Grades Explained", href: "/guides/nyc-health-grades-explained" },
  { label: "NYC Inspection Process", href: "/guides/nyc-restaurant-inspection-process" },
  { label: "Vegan NYC Guide", href: "/guides/vegan-nyc-borough-guide" },
  { label: "Halal Food Guide", href: "/guides/halal-food-guide-nyc" },
  { label: "Gluten-Free Dining", href: "/guides/gluten-free-dining-nyc" },
  { label: "Kosher Dining", href: "/guides/kosher-dining-nyc-guide" },
  { label: "Best Healthy Neighborhoods", href: "/guides/best-healthy-neighborhoods-nyc" },
  { label: "Hidden Gem Restaurants", href: "/guides/hidden-gem-restaurants-nyc" },
  { label: "Healthy on $15", href: "/guides/how-eat-healthy-nyc-15-dollars" },
  { label: "Late-Night Healthy", href: "/guides/late-night-healthy-eating-nyc" },
]

const DATA_LINKS = [
  { label: "Health Grade Report", href: "/data/nyc-restaurant-health-grade-report" },
  { label: "Best-Rated Restaurants", href: "/data/best-rated-restaurants" },
]

const ABOUT_LINKS = [
  { label: "About", href: "/about" },
  { label: "Our Data", href: "/about/our-data" },
  { label: "Editorial Standards", href: "/about/editorial-standards" },
  { label: "Team", href: "/about/team" },
  { label: "Contact", href: "/contact" },
]

type DropdownKey = "boroughs" | "dietary" | "guides" | "data" | "about" | null

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const { count: savedCount, isLoaded: savedLoaded } = useSavedRestaurants()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const closeMobile = () => setMobileMenuOpen(false)
  const close = () => setOpenDropdown(null)

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 h-16 border-b"
      style={{
        backgroundColor: "var(--color-cream)",
        borderBottomColor: "var(--hairline)",
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        {/* ─── Brand mark ─── */}
        {/* The placard IS the brand. A small jade-letter placard followed by a
            Georgia wordmark and an NYC eyebrow. Carries the design signature
            from the homepage cards into the global chrome. */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="Eat Real Food NYC — home">
          <span
            aria-hidden="true"
            className="plaque"
            style={{ width: "2.25rem", height: "2.25rem", fontSize: "1.15rem" }}
          >
            A
          </span>
          <span className="flex items-baseline gap-1.5">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.0625rem",
                lineHeight: 1,
                letterSpacing: "-0.015em",
                color: "var(--color-forest)",
              }}
            >
              Eat Real Food
            </span>
            <span
              className="eyebrow"
              style={{ fontSize: "0.625rem", color: "var(--color-jade)" }}
            >
              NYC
            </span>
          </span>
        </Link>

        {/* ─── Center nav (desktop) ─── */}
        <nav className="hidden items-center gap-7 lg:flex" ref={navRef}>
          <NavTrigger
            label="Boroughs"
            isOpen={openDropdown === "boroughs"}
            onClick={() => setOpenDropdown(openDropdown === "boroughs" ? null : "boroughs")}
          >
            <DropdownEyebrow>Five boroughs</DropdownEyebrow>
            <ul role="list">
              {BOROUGHS.map((b) => (
                <DropdownItem
                  key={b.slug}
                  href={`/nyc/${b.slug}/healthy-restaurants`}
                  onClick={close}
                >
                  {b.label}
                </DropdownItem>
              ))}
            </ul>
            <DropdownDivider />
            <DropdownItem href="/nyc/compare" onClick={close} variant="action">
              Compare neighborhoods
            </DropdownItem>
          </NavTrigger>

          <NavTrigger
            label="Dietary"
            isOpen={openDropdown === "dietary"}
            onClick={() => setOpenDropdown(openDropdown === "dietary" ? null : "dietary")}
            width="w-80"
          >
            <DropdownEyebrow>Twelve canonical tags</DropdownEyebrow>
            <ul role="list" className="grid grid-cols-2">
              {DIETS.map((d) => (
                <DropdownItem
                  key={d.tag}
                  href={`/healthy-restaurants/${d.tag}`}
                  onClick={close}
                >
                  {d.label}
                </DropdownItem>
              ))}
            </ul>
          </NavTrigger>

          <NavTrigger
            label="Guides"
            isOpen={openDropdown === "guides"}
            onClick={() => setOpenDropdown(openDropdown === "guides" ? null : "guides")}
          >
            <DropdownEyebrow>Editorial</DropdownEyebrow>
            <ul role="list">
              {GUIDE_LINKS.map((g) => (
                <DropdownItem key={g.href} href={g.href} onClick={close}>
                  {g.label}
                </DropdownItem>
              ))}
            </ul>
            <DropdownDivider />
            <DropdownItem href="/guides" onClick={close} variant="action">
              View all guides
            </DropdownItem>
          </NavTrigger>

          <NavTrigger
            label="Data"
            isOpen={openDropdown === "data"}
            onClick={() => setOpenDropdown(openDropdown === "data" ? null : "data")}
            width="w-64"
          >
            <DropdownEyebrow>Original research</DropdownEyebrow>
            <ul role="list">
              {DATA_LINKS.map((d) => (
                <DropdownItem key={d.href} href={d.href} onClick={close}>
                  {d.label}
                </DropdownItem>
              ))}
            </ul>
          </NavTrigger>

          <NavTrigger
            label="About"
            isOpen={openDropdown === "about"}
            onClick={() => setOpenDropdown(openDropdown === "about" ? null : "about")}
            width="w-56"
          >
            <ul role="list">
              {ABOUT_LINKS.map((a) => (
                <DropdownItem key={a.href} href={a.href} onClick={close}>
                  {a.label}
                </DropdownItem>
              ))}
            </ul>
          </NavTrigger>
        </nav>

        {/* ─── Right utility ─── */}
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-3">
          {/* Search */}
          <Link
            href="/search"
            aria-label="Search restaurants"
            className="flex h-9 w-9 items-center justify-center transition-colors"
            style={{ color: "var(--color-forest)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          {/* Saved */}
          <Link
            href="/saved"
            aria-label={savedCount > 0 ? `Saved restaurants (${savedCount})` : "Saved restaurants"}
            className="relative flex h-9 w-9 items-center justify-center transition-colors"
            style={{ color: "var(--color-forest)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {savedLoaded && savedCount > 0 && (
              <span
                className="tabular absolute -right-1 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center px-1 text-[10px] font-semibold leading-none text-white"
                style={{ backgroundColor: "var(--color-sage)", borderRadius: "2px" }}
              >
                {savedCount > 9 ? "9+" : savedCount}
              </span>
            )}
          </Link>

          {/* Browse — quiet eyebrow link, replaces the marketing "Explore" pill */}
          <Link
            href="/search"
            className="eyebrow hidden items-center gap-1.5 transition-colors sm:inline-flex"
            style={{ color: "var(--color-forest)" }}
          >
            Browse
            <span aria-hidden="true" style={{ color: "var(--color-jade)" }}>→</span>
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center lg:hidden"
            style={{ color: "var(--color-forest)" }}
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ─── Mobile menu ─── */}
      {mobileMenuOpen && (
        <div
          className="absolute left-0 right-0 top-16 z-50 max-h-[80vh] overflow-y-auto border-b"
          style={{
            backgroundColor: "var(--color-cream)",
            borderBottomColor: "var(--hairline)",
            boxShadow: "0 12px 24px -12px rgba(27, 58, 45, 0.18)",
          }}
        >
          <MobileSection label="Five boroughs">
            {BOROUGHS.map((b) => (
              <MobileLink
                key={b.slug}
                href={`/nyc/${b.slug}/healthy-restaurants`}
                onClick={closeMobile}
              >
                {b.label}
              </MobileLink>
            ))}
            <MobileLink href="/nyc/compare" onClick={closeMobile} action>
              Compare neighborhoods
            </MobileLink>
          </MobileSection>

          <MobileSection label="Twelve dietary tags">
            <div className="grid grid-cols-2">
              {DIETS.map((d) => (
                <MobileLink
                  key={d.tag}
                  href={`/healthy-restaurants/${d.tag}`}
                  onClick={closeMobile}
                >
                  {d.label}
                </MobileLink>
              ))}
            </div>
          </MobileSection>

          <MobileSection label="Editorial">
            {GUIDE_LINKS.map((item) => (
              <MobileLink key={item.href} href={item.href} onClick={closeMobile}>
                {item.label}
              </MobileLink>
            ))}
            <MobileLink href="/guides" onClick={closeMobile} action>
              View all guides
            </MobileLink>
          </MobileSection>

          <MobileSection label="Original research">
            {DATA_LINKS.map((d) => (
              <MobileLink key={d.href} href={d.href} onClick={closeMobile}>
                {d.label}
              </MobileLink>
            ))}
          </MobileSection>

          <MobileSection label="About">
            {ABOUT_LINKS.map((a) => (
              <MobileLink key={a.href} href={a.href} onClick={closeMobile}>
                {a.label}
              </MobileLink>
            ))}
          </MobileSection>

          <div className="px-6 py-6">
            <Link
              href="/search"
              onClick={closeMobile}
              className="block w-full border py-3.5 text-center"
              style={{
                backgroundColor: "var(--color-forest)",
                color: "var(--color-cream)",
                borderColor: "var(--color-forest)",
                borderRadius: "4px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.875rem",
                letterSpacing: "0.04em",
              }}
            >
              Browse all restaurants  →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   Internal pieces — kept local so the header file is the whole spec
   ───────────────────────────────────────────────────────────────────────── */

function NavTrigger({
  label,
  isOpen,
  onClick,
  width = "w-60",
  children,
}: {
  label: string
  isOpen: boolean
  onClick: () => void
  width?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        aria-expanded={isOpen}
        className="eyebrow flex items-center gap-1 transition-colors"
        style={{ color: isOpen ? "var(--color-jade)" : "var(--color-forest)" }}
      >
        {label}
        <span
          aria-hidden="true"
          style={{
            color: "var(--color-muted)",
            fontSize: "0.625rem",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 180ms ease",
          }}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div
          className={`absolute left-1/2 top-full z-50 mt-4 ${width} -translate-x-1/2 border`}
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "var(--hairline)",
            borderRadius: "4px",
            boxShadow: "0 12px 28px -8px rgba(27, 58, 45, 0.14)",
            padding: "0.5rem",
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function DropdownEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow px-3 pb-2 pt-1" style={{ color: "var(--color-muted)" }}>
      {children}
    </p>
  )
}

function DropdownDivider() {
  return (
    <div className="my-1 h-px" style={{ backgroundColor: "var(--hairline)" }} />
  )
}

function DropdownItem({
  href,
  onClick,
  children,
  variant = "default",
}: {
  href: string
  onClick?: () => void
  children: React.ReactNode
  variant?: "default" | "action"
}) {
  const isAction = variant === "action"
  return (
    <li role="listitem">
      <Link
        href={href}
        onClick={onClick}
        className="block px-3 py-2 text-sm transition-colors"
        style={{
          color: isAction ? "var(--color-jade)" : "var(--color-forest)",
          fontWeight: isAction ? 600 : 500,
          borderRadius: "3px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-cream)"
          e.currentTarget.style.color = "var(--color-jade)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
          e.currentTarget.style.color = isAction ? "var(--color-jade)" : "var(--color-forest)"
        }}
      >
        {children}
        {isAction && <span aria-hidden="true" className="ml-1">→</span>}
      </Link>
    </li>
  )
}

function MobileSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b px-6 py-5" style={{ borderBottomColor: "var(--hairline)" }}>
      <p className="eyebrow mb-3" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function MobileLink({
  href,
  onClick,
  children,
  action = false,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
  action?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-sm"
      style={{
        color: action ? "var(--color-jade)" : "var(--color-forest)",
        fontWeight: action ? 600 : 500,
      }}
    >
      {children}
      {action && <span aria-hidden="true" className="ml-1">→</span>}
    </Link>
  )
}
