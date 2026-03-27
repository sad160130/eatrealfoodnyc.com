"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface NeighborhoodStat {
  neighborhood: string
  borough: string
  totalRestaurants: number
  avgRating: number | null
  gradeACount: number
  gradeAPercent: number
  hiddenGems: number
  topDietaryTag: string | null
  healthScore: number
}

type SortKey = "healthScore" | "totalRestaurants" | "avgRating" | "gradeAPercent" | "hiddenGems"

function getScoreColor(score: number): string {
  if (score >= 70) return "#52B788"
  if (score >= 50) return "#2D6A4F"
  if (score >= 30) return "#D4A853"
  return "#9CA3AF"
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "Exceptional"
  if (score >= 50) return "Great"
  if (score >= 30) return "Good"
  return "Limited"
}

function neighborhoodSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

function boroughSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, "-")
}

export default function ComparePageClient() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodStat[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>("healthScore")
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
  const [boroughFilter, setBoroughFilter] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/neighborhood-stats")
      .then((res) => res.json())
      .then((data) => {
        setNeighborhoods(data.neighborhoods || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = neighborhoods
    .filter((n) => {
      if (boroughFilter && n.borough !== boroughFilter) return false
      if (search && !n.neighborhood.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      const aVal = a[sortBy] ?? 0
      const bVal = b[sortBy] ?? 0
      return sortDir === "desc"
        ? (bVal as number) - (aVal as number)
        : (aVal as number) - (bVal as number)
    })

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortBy(col)
      setSortDir("desc")
    }
  }

  const sortColumns: { key: SortKey; label: string }[] = [
    { key: "healthScore", label: "Health Score" },
    { key: "totalRestaurants", label: "Restaurants" },
    { key: "avgRating", label: "Avg Rating" },
    { key: "gradeAPercent", label: "Grade A %" },
    { key: "hiddenGems", label: "Hidden Gems" },
  ]

  return (
    <>
      {/* Page header */}
      <div className="border-b border-gray-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
            <Link href="/" className="hover:text-jade">
              Home
            </Link>
            <span>/</span>
            <span>Compare Neighborhoods</span>
          </div>

          <h1
            className="text-4xl font-bold text-forest md:text-5xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Neighborhood Health
            <br />
            Comparison
          </h1>
          <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--color-muted)" }}>
            Every NYC neighborhood ranked by health inspection grades, average restaurant ratings,
            dietary diversity, and hidden gem density. Updated from live NYC Health Department data.
          </p>

          {/* Top 3 stat cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                label: "Neighborhoods tracked",
                value: neighborhoods.length.toString(),
                icon: "🗺️",
              },
              {
                label: "Grade A restaurants",
                value: neighborhoods
                  .reduce((sum, n) => sum + n.gradeACount, 0)
                  .toLocaleString(),
                icon: "⭐",
              },
              {
                label: "Hidden gems found",
                value: neighborhoods
                  .reduce((sum, n) => sum + n.hiddenGems, 0)
                  .toLocaleString(),
                icon: "💎",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 p-5"
                style={{ backgroundColor: "var(--color-cream)" }}
              >
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-forest">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-6">
        {/* Search input */}
        <div className="relative min-w-48 max-w-72 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-muted)" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search neighborhood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-4 text-sm focus:border-jade focus:outline-none"
          />
        </div>

        {/* Borough filter pills */}
        <div className="flex flex-wrap gap-2">
          {[null, "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].map((borough) => (
            <button
              key={borough || "all"}
              onClick={() => setBoroughFilter(borough)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                boroughFilter === borough
                  ? "border-forest bg-forest text-white"
                  : "border-gray-200 text-gray-600 hover:border-jade hover:text-jade"
              }`}
            >
              {borough || "All Boroughs"}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="ml-auto text-sm" style={{ color: "var(--color-muted)" }}>
          Showing <span className="font-semibold text-forest">{filtered.length}</span> neighborhoods
        </p>
      </div>

      {/* Comparison table */}
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100" style={{ backgroundColor: "var(--color-cream)" }}>
                  <th className="w-8 px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                    Neighborhood
                  </th>
                  {sortColumns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer select-none px-6 py-4 text-right text-xs font-semibold uppercase tracking-widest transition-colors hover:text-jade"
                      style={{ color: "var(--color-muted)" }}
                    >
                      <span className="flex items-center justify-end gap-1">
                        {col.label}
                        <span className="text-gray-300">
                          {sortBy === col.key ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
                        </span>
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                    Top Diet Tag
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-6 py-4">
                          <div className="h-4 w-4 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="ml-auto h-4 w-8 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4" />
                      </tr>
                    ))
                  : filtered.map((n, index) => (
                      <tr
                        key={`${n.borough}-${n.neighborhood}`}
                        className="border-b border-gray-50 transition-colors hover:bg-cream/50"
                      >
                        {/* Rank */}
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                          {index + 1}
                        </td>

                        {/* Neighborhood name */}
                        <td className="px-6 py-4">
                          <div>
                            <Link
                              href={`/nyc/${boroughSlug(n.borough)}/${neighborhoodSlug(n.neighborhood)}/healthy-restaurants`}
                              className="text-sm font-semibold text-forest transition-colors hover:text-jade"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              {n.neighborhood}
                            </Link>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                              {n.borough}
                            </p>
                          </div>
                        </td>

                        {/* Health Score */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${n.healthScore}%`,
                                  backgroundColor: getScoreColor(n.healthScore),
                                }}
                              />
                            </div>
                            <span
                              className="w-8 text-right text-sm font-bold"
                              style={{ color: getScoreColor(n.healthScore) }}
                            >
                              {n.healthScore}
                            </span>
                          </div>
                          <p className="mt-0.5 text-right text-xs" style={{ color: "var(--color-muted)" }}>
                            {getScoreLabel(n.healthScore)}
                          </p>
                        </td>

                        {/* Total restaurants */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-forest">
                            {n.totalRestaurants}
                          </span>
                        </td>

                        {/* Avg rating */}
                        <td className="px-6 py-4 text-right">
                          {n.avgRating ? (
                            <span className="text-sm font-semibold" style={{ color: "var(--color-amber)" }}>
                              ★ {n.avgRating}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Grade A % */}
                        <td className="px-6 py-4 text-right">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                n.gradeAPercent >= 50
                                  ? "#52B788"
                                  : n.gradeAPercent >= 25
                                    ? "#D4A853"
                                    : "#9CA3AF",
                            }}
                          >
                            {n.gradeAPercent}%
                          </span>
                          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                            {n.gradeACount} restaurants
                          </p>
                        </td>

                        {/* Hidden gems */}
                        <td className="px-6 py-4 text-right">
                          {n.hiddenGems > 0 ? (
                            <span className="text-sm font-semibold" style={{ color: "var(--color-amber)" }}>
                              💎 {n.hiddenGems}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Top dietary tag */}
                        <td className="px-6 py-4">
                          {n.topDietaryTag ? (
                            <Link
                              href={`/healthy-restaurants/${n.topDietaryTag}`}
                              className="rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-jade transition-colors hover:bg-sage/25"
                            >
                              {n.topDietaryTag}
                            </Link>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* View link */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/nyc/${boroughSlug(n.borough)}/${neighborhoodSlug(n.neighborhood)}/healthy-restaurants`}
                            className="whitespace-nowrap text-xs font-semibold text-jade transition-colors hover:text-forest"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-2xl">🔍</p>
              <p className="mt-3 font-semibold text-forest">No neighborhoods found</p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                Try adjusting your search or borough filter
              </p>
              <button
                onClick={() => {
                  setSearch("")
                  setBoroughFilter(null)
                }}
                className="mt-4 text-xs font-semibold text-jade hover:text-forest"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
