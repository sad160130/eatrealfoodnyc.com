"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
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
  { label: "🏥 NYC Health Grades Explained", href: "/guides/nyc-health-grades-explained" },
  { label: "📋 NYC Inspection Process", href: "/guides/nyc-restaurant-inspection-process" },
  { label: "🌱 Vegan NYC Guide", href: "/guides/vegan-nyc-borough-guide" },
  { label: "🕌 Halal Food Guide", href: "/guides/halal-food-guide-nyc" },
  { label: "🌾 Gluten-Free NYC Guide", href: "/guides/gluten-free-dining-nyc" },
  { label: "✡️ Kosher Dining NYC", href: "/guides/kosher-dining-nyc-guide" },
  { label: "🗺️ Best Healthy Neighborhoods", href: "/guides/best-healthy-neighborhoods-nyc" },
  { label: "💎 Hidden Gem Restaurants", href: "/guides/hidden-gem-restaurants-nyc" },
  { label: "💵 Eat Healthy on $15", href: "/guides/how-eat-healthy-nyc-15-dollars" },
  { label: "🌙 Late Night Healthy Eating", href: "/guides/late-night-healthy-eating-nyc" },
]

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<"boroughs" | "dietary" | "guides" | null>(null)
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

  // Close mobile menu on route change
  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Eat Real Food NYC"
            width={160}
            height={160}
            className="h-14 w-14"
            priority
          />
        </Link>

        {/* Center nav — desktop only */}
        <nav className="hidden items-center gap-8 lg:flex" ref={navRef}>
          {/* Boroughs dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "boroughs" ? null : "boroughs") }}
              className="text-xs font-semibold uppercase tracking-widest text-gray-600 transition-colors hover:text-jade"
            >
              BOROUGHS
            </button>
            {openDropdown === "boroughs" && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-52 -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
                <div className="p-2">
                  {BOROUGHS.map((b) => (
                    <Link key={b.slug} href={`/nyc/${b.slug}/healthy-restaurants`} onClick={() => setOpenDropdown(null)} className="block rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-cream hover:text-jade">
                      {b.label}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-gray-100 pt-1">
                    <Link href="/nyc/compare" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-jade hover:bg-gray-50">
                      📊 Compare neighborhoods
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dietary dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "dietary" ? null : "dietary") }}
              className="text-xs font-semibold uppercase tracking-widest text-gray-600 transition-colors hover:text-jade"
            >
              DIETARY
            </button>
            {openDropdown === "dietary" && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {DIETS.map((d) => (
                    <Link key={d.tag} href={`/healthy-restaurants/${d.tag}`} onClick={() => setOpenDropdown(null)} className="rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-cream hover:text-jade">
                      {d.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guides dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "guides" ? null : "guides") }}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-600 transition-colors hover:text-jade"
            >
              GUIDES <span className="text-[10px] text-gray-400">▾</span>
            </button>
            {openDropdown === "guides" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                {GUIDE_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpenDropdown(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-jade">
                    {item.label}
                  </Link>
                ))}
                <div className="mt-1 border-t border-gray-100 pt-1">
                  <Link href="/guides" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-jade hover:bg-gray-50">
                    View all guides →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          {/* Saved — always show */}
          <Link href="/saved" className="relative flex items-center rounded-lg px-2 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-jade">
            <span>🤍</span>
            {savedLoaded && savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sage text-[10px] font-bold leading-none text-white">
                {savedCount > 9 ? "9+" : savedCount}
              </span>
            )}
          </Link>

          {/* Search icon — always show */}
          <Link href="/search" className="flex items-center rounded-lg px-2 py-2 text-gray-500 transition-colors hover:bg-gray-100" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          {/* Explore — hide on mobile */}
          <Link href="/search" className="hidden rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-jade sm:block">
            Explore
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex items-center rounded-lg px-2 py-2 text-gray-600 transition-colors hover:text-jade lg:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 max-h-[80vh] overflow-y-auto border-b border-gray-200 bg-white shadow-xl lg:hidden">
          {/* Boroughs */}
          <div className="border-b border-gray-100 px-6 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Boroughs</p>
            {BOROUGHS.map((b) => (
              <Link key={b.slug} href={`/nyc/${b.slug}/healthy-restaurants`} onClick={closeMobile} className="block py-2.5 text-sm text-gray-700 hover:text-jade">
                {b.label}
              </Link>
            ))}
            <Link href="/nyc/compare" onClick={closeMobile} className="block py-2.5 text-sm font-semibold text-jade">
              📊 Compare neighborhoods
            </Link>
          </div>

          {/* Dietary */}
          <div className="border-b border-gray-100 px-6 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Dietary</p>
            <div className="grid grid-cols-2 gap-1">
              {DIETS.map((d) => (
                <Link key={d.tag} href={`/healthy-restaurants/${d.tag}`} onClick={closeMobile} className="py-2 text-sm text-gray-700 hover:text-jade">
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Guides */}
          <div className="border-b border-gray-100 px-6 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Guides</p>
            {GUIDE_LINKS.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMobile} className="block py-2.5 text-sm text-gray-700 hover:text-jade">
                {item.label}
              </Link>
            ))}
          </div>

          {/* Quick links */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/near-me" onClick={closeMobile} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-jade">
                📍 Near Me
              </Link>
              <Link href="/map" onClick={closeMobile} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-jade">
                🗺️ Map
              </Link>
            </div>
            <Link href="/search" onClick={closeMobile} className="mt-3 block w-full rounded-xl bg-forest py-3 text-center text-sm font-semibold text-white hover:bg-jade">
              Explore All Restaurants →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
