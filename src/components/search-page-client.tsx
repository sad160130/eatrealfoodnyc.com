"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import RestaurantCard from "@/components/restaurant-card"
import type { Restaurant } from "@/types"
import { HEALTH_GOALS } from "@/config/health-goals"

const DIET_LABELS: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "gluten-free": "Gluten-Free",
  halal: "Halal",
  kosher: "Kosher",
  "dairy-free": "Dairy-Free",
  keto: "Keto",
  paleo: "Paleo",
  "whole-foods": "Whole Foods",
  "low-calorie": "Low Calorie",
  "raw-food": "Raw Food",
  "nut-free": "Nut-Free",
}

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]
const GRADES = ["A", "B", "C"]

interface SearchPageClientProps {
  searchParams: {
    q?: string
    borough?: string
    diet?: string | string[]
    grade?: string
    page?: string
    open?: string
  }
}

export default function SearchPageClient({ searchParams }: SearchPageClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.q || ""
  const borough = searchParams.borough || ""
  const grade = searchParams.grade || ""
  const page = parseInt(searchParams.page || "1", 10) || 1
  const diets: string[] = Array.isArray(searchParams.diet)
    ? searchParams.diet
    : searchParams.diet
      ? [searchParams.diet]
      : []

  const [openNow, setOpenNow] = useState(searchParams.open === "true")
  const [isPending, startTransition] = useTransition()

  const [searchText, setSearchText] = useState(q)

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (borough) params.set("borough", borough)
      if (grade) params.set("grade", grade)
      params.set("page", String(page))
      params.set("limit", "24")
      for (const d of diets) params.append("diet", d)
      if (openNow) params.set("open", "true")

      const res = await fetch(`/api/search?${params.toString()}`)
      const data = await res.json()
      setRestaurants(data.restaurants || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      setRestaurants([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [q, borough, grade, page, diets.join(","), openNow])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  function buildUrl(overrides: Record<string, string | string[] | boolean | undefined>) {
    const p = new URLSearchParams()
    const vals = { q, borough, grade, diet: diets, page: "1", open: openNow, ...overrides }
    if (vals.q) p.set("q", vals.q as string)
    if (vals.borough) p.set("borough", vals.borough as string)
    if (vals.grade) p.set("grade", vals.grade as string)
    const d = vals.diet as string[]
    if (d) for (const t of d) p.append("diet", t)
    if (vals.open) p.set("open", "true")
    if (vals.page && vals.page !== "1") p.set("page", vals.page as string)
    return `/search?${p.toString()}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl({ q: searchText.trim() || undefined }))
  }

  function toggleDiet(tag: string) {
    const next = diets.includes(tag)
      ? diets.filter((d: string) => d !== tag)
      : [...diets, tag]
    router.push(buildUrl({ diet: next }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Mobile filter toggle */}
      <button
        type="button"
        onClick={() => setFiltersOpen(!filtersOpen)}
        aria-label={`Filter restaurants — ${total} results shown`}
        aria-expanded={filtersOpen}
        aria-controls="search-filters-panel"
        className="mb-4 rounded-lg border px-4 py-2 text-sm font-medium md:hidden cursor-pointer"
      >
        <span aria-hidden="true">🔧</span> Filters
      </button>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside
          id="search-filters-panel"
          role="search"
          aria-label="Filter healthy restaurants"
          className={`w-72 shrink-0 space-y-6 ${filtersOpen ? "block" : "hidden"} md:block`}
        >
          {/* Search */}
          <form onSubmit={handleSearch} role="search" aria-label="Refine results">
            <label htmlFor="restaurant-search" className="sr-only">
              Search healthy restaurants in NYC
            </label>
            <input
              id="restaurant-search"
              name="q"
              type="search"
              role="searchbox"
              autoComplete="off"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search restaurants..."
              aria-label="Search healthy restaurants in NYC"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </form>

          {/* Open Now toggle */}
          <div className="border-b border-gray-100 pb-6">
            <button
              type="button"
              onClick={() => {
                const next = !openNow
                setOpenNow(next)
                router.push(buildUrl({ open: next }))
              }}
              aria-pressed={openNow}
              aria-label={openNow ? "Currently filtering to open restaurants — turn off" : "Filter to currently open restaurants"}
              className={`flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all cursor-pointer ${
                openNow
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    openNow ? "animate-pulse bg-green-500" : "bg-gray-300"
                  }`}
                />
                <div className="text-left">
                  <p className="text-sm font-semibold">Open Right Now</p>
                  <p
                    className={`mt-0.5 text-xs ${
                      openNow ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {openNow
                      ? "Showing only open restaurants"
                      : "Filter to currently open restaurants"}
                  </p>
                </div>
              </div>
              <div
                className={`relative h-6 w-12 rounded-full transition-colors ${
                  openNow ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    openNow ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Borough */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Borough</legend>
            <div className="space-y-1">
              <label htmlFor="borough-all" className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  id="borough-all"
                  type="radio"
                  name="borough"
                  checked={!borough}
                  onChange={() => router.push(buildUrl({ borough: undefined }))}
                />
                All boroughs
              </label>
              {BOROUGHS.map((b) => {
                const id = `borough-${b.toLowerCase().replace(/\s+/g, "-")}`
                return (
                  <label key={b} htmlFor={id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      id={id}
                      type="radio"
                      name="borough"
                      checked={borough === b}
                      onChange={() => router.push(buildUrl({ borough: b }))}
                    />
                    {b}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Dietary */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Dietary Tags</legend>
            <div className="space-y-1" role="group" aria-label="Dietary tag filters">
              {Object.entries(DIET_LABELS).map(([tag, label]) => {
                const id = `diet-${tag}`
                return (
                  <label key={tag} htmlFor={id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      id={id}
                      type="checkbox"
                      name="diet"
                      value={tag}
                      checked={diets.includes(tag)}
                      onChange={() => toggleDiet(tag)}
                      aria-label={`Filter by ${label} restaurants${diets.includes(tag) ? " — currently active" : ""}`}
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Grade */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Inspection Grade</legend>
            <div className="space-y-1">
              {GRADES.map((g) => {
                const id = `grade-${g}`
                return (
                  <label key={g} htmlFor={id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      id={id}
                      type="radio"
                      name="grade"
                      checked={grade === g}
                      onChange={() => router.push(buildUrl({ grade: g }))}
                    />
                    Grade {g}
                  </label>
                )
              })}
              <label htmlFor="grade-any" className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  id="grade-any"
                  type="radio"
                  name="grade"
                  checked={!grade}
                  onChange={() => router.push(buildUrl({ grade: undefined }))}
                />
                Any grade
              </label>
            </div>
          </fieldset>

          {/* Clear */}
          <Link
            href="/search"
            className="block text-center text-sm text-green-700 hover:text-green-900"
          >
            Clear all filters
          </Link>
        </aside>

        {/* Results */}
        <div className={`min-w-0 flex-1 transition-opacity duration-150 ${isPending ? "opacity-60" : "opacity-100"}`}>
          {/* Header */}
          <div className="mb-6">
            {(() => {
              const matchedGoal = HEALTH_GOALS.find(
                (goal) =>
                  goal.tags.every((tag) => diets.includes(tag)) ||
                  diets.every((tag) => goal.tags.includes(tag))
              )
              if (matchedGoal) {
                return (
                  <>
                    <h1
                      className="text-2xl font-bold text-forest"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {matchedGoal.emoji} {matchedGoal.label} — {total} restaurants
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                      {matchedGoal.description}
                    </p>
                  </>
                )
              }
              if (q) {
                return (
                  <h1 className="text-xl font-bold">
                    Results for &ldquo;{q}&rdquo; &mdash; {total} restaurants found
                  </h1>
                )
              }
              return (
                <h1 className="text-xl font-bold">
                  {total} healthy restaurants in NYC
                </h1>
              )
            })()}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl border bg-gray-100"
                />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-500">
                No restaurants found. Try broadening your search.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm text-green-700 hover:text-green-900"
              >
                Back to homepage
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((r, i) => (
                  <RestaurantCard key={r.id} restaurant={r} priority={i === 0} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Search results pagination"
                  className="mt-8 flex items-center justify-center gap-4"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      router.push(buildUrl({ page: String(page - 1) }))
                    }
                    aria-label="Go to previous page of results"
                    className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500" aria-current="page">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      router.push(buildUrl({ page: String(page + 1) }))
                    }
                    aria-label="Go to next page of results"
                    className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
