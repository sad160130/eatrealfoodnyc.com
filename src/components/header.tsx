"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSavedRestaurants } from "@/hooks/use-saved-restaurants"
import NearMeButton from "@/components/near-me-button"

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

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<"boroughs" | "dietary" | "guides" | null>(null)
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

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">

        {/* Left — Logo */}
        <Link
          href="/"
          className="font-serif text-xl font-bold text-forest"
        >
          Eat Real Food NYC
        </Link>

        {/* Center — Nav (desktop only) */}
        <nav className="hidden items-center gap-10 lg:flex" ref={navRef}>
          {/* Boroughs dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenDropdown(openDropdown === "boroughs" ? null : "boroughs")
              }}
              className="text-xs font-semibold uppercase tracking-widest text-gray-600 transition-colors hover:text-jade"
            >
              BOROUGHS
            </button>
            {openDropdown === "boroughs" && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-52 -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
                <div className="p-2">
                  {BOROUGHS.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/nyc/${b.slug}/healthy-restaurants`}
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-cream hover:text-jade"
                    >
                      {b.label}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-gray-100 pt-1">
                    <Link
                      href="/nyc/compare"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-jade transition-colors hover:bg-gray-50"
                    >
                      📊 Compare all neighborhoods
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dietary dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenDropdown(openDropdown === "dietary" ? null : "dietary")
              }}
              className="text-xs font-semibold uppercase tracking-widest text-gray-600 transition-colors hover:text-jade"
            >
              DIETARY
            </button>
            {openDropdown === "dietary" && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {DIETS.map((d) => (
                    <Link
                      key={d.tag}
                      href={`/healthy-restaurants/${d.tag}`}
                      onClick={() => setOpenDropdown(null)}
                      className="rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-cream hover:text-jade"
                    >
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
              onClick={(e) => {
                e.stopPropagation()
                setOpenDropdown(openDropdown === "guides" ? null : "guides")
              }}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-600 transition-colors hover:text-jade"
            >
              GUIDES
              <span className="text-[10px] text-gray-400">▾</span>
            </button>
            {openDropdown === "guides" && (
              <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                {[
                  { label: "🏥 NYC Health Grades Explained", href: "/guides/nyc-health-grades-explained" },
                  { label: "🌱 Vegan NYC Guide", href: "/guides/vegan-nyc-borough-guide" },
                  { label: "🕌 Halal Food Guide", href: "/guides/halal-food-guide-nyc" },
                  { label: "🗺️ Best Healthy Neighborhoods", href: "/guides/best-healthy-neighborhoods-nyc" },
                  { label: "💎 Hidden Gem Restaurants", href: "/guides/hidden-gem-restaurants-nyc" },
                  { label: "💵 Eat Healthy on $15", href: "/guides/how-eat-healthy-nyc-15-dollars" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-jade"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-1 border-t border-gray-100 pt-1">
                  <Link
                    href="/guides"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-jade transition-colors hover:bg-gray-50"
                  >
                    View all guides →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right — Search + Map + Explore */}
        <div className="flex items-center gap-3">
          <NearMeButton
            variant="icon"
            label="Near Me"
            className="text-gray-600 hover:bg-gray-50 hover:text-jade"
          />

          <Link
            href="/map"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-jade"
            title="View restaurant map"
          >
            <span>🗺️</span>
            <span className="hidden md:inline">Map</span>
          </Link>

          <Link
            href="/saved"
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-jade"
          >
            <span>🤍</span>
            <span className="hidden md:inline">Saved</span>
            {savedLoaded && savedCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sage text-xs font-bold leading-none text-white">
                {savedCount > 9 ? "9+" : savedCount}
              </span>
            )}
          </Link>

          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          <Link
            href="/search"
            className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-jade"
          >
            Explore
          </Link>
        </div>
      </div>
    </header>
  )
}
