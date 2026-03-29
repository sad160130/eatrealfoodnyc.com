"use client"

import dynamic from "next/dynamic"
import { useState, useCallback } from "react"
import Link from "next/link"
import type { MapRestaurant } from "@/components/restaurant-map"
import NearMeButton from "@/components/near-me-button"

const RestaurantMap = dynamic(() => import("@/components/restaurant-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
    </div>
  ),
})

export default function MapPageClient() {
  const [filters, setFilters] = useState({
    borough: null as string | null,
    grade: null as string | null,
    diet: null as string | null,
    hiddenGems: false,
    openNow: false,
  })
  const [selectedRestaurant, setSelectedRestaurant] = useState<MapRestaurant | null>(null)
  const [filteredCount, setFilteredCount] = useState(0)

  const handleFilteredCountChange = useCallback((count: number) => {
    setFilteredCount(count)
  }, [])

  const handleRestaurantClick = useCallback((restaurant: MapRestaurant) => {
    setSelectedRestaurant(restaurant)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden pt-16">
      {/* LEFT PANEL — Filter sidebar (desktop only) */}
      <aside className="hidden w-80 flex-shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white md:flex">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl font-bold text-forest"
                style={{ fontFamily: "Georgia, serif" }}
              >
                NYC Health Map
              </h1>
              <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
                Color-coded by inspection grade
              </p>
            </div>
            <Link href="/" className="text-xs font-medium text-jade hover:text-forest">
              ← Back
            </Link>
          </div>
        </div>

        {/* Open Now toggle */}
        <div className="border-b border-gray-100 px-6 py-4">
          <button
            onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
              filters.openNow
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:border-green-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  filters.openNow ? "animate-pulse bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-sm font-medium">Open Right Now</span>
            </div>
            <div
              className={`relative h-5 w-10 rounded-full transition-colors ${
                filters.openNow ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  filters.openNow ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Grade legend */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            MAP LEGEND
          </p>
          <div className="space-y-2">
            {[
              { grade: "A" as string | null, label: "Grade A — Excellent", color: "#52B788" },
              { grade: "B" as string | null, label: "Grade B — Good", color: "#D4A853" },
              { grade: "C" as string | null, label: "Grade C — Acceptable", color: "#E07B54" },
              { grade: null, label: "Ungraded", color: "#9CA3AF" },
            ].map((item) => (
              <button
                key={item.grade || "none"}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    grade: f.grade === item.grade ? null : item.grade,
                  }))
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  filters.grade === item.grade ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
                {filters.grade === item.grade && (
                  <span className="ml-auto text-xs font-semibold text-jade">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Borough filter */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            BOROUGH
          </p>
          <div className="flex flex-wrap gap-2">
            {["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].map((borough) => (
              <button
                key={borough}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    borough: f.borough === borough ? null : borough,
                  }))
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.borough === borough
                    ? "border-forest bg-forest text-white"
                    : "border-gray-200 text-gray-600 hover:border-jade hover:text-jade"
                }`}
              >
                {borough}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary filter */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            DIETARY NEED
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { tag: "vegan", label: "Vegan" },
              { tag: "vegetarian", label: "Vegetarian" },
              { tag: "gluten-free", label: "Gluten-Free" },
              { tag: "halal", label: "Halal" },
              { tag: "kosher", label: "Kosher" },
              { tag: "keto", label: "Keto" },
              { tag: "whole-foods", label: "Whole Foods" },
            ].map((item) => (
              <button
                key={item.tag}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    diet: f.diet === item.tag ? null : item.tag,
                  }))
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.diet === item.tag
                    ? "border-sage bg-sage text-white"
                    : "border-gray-200 text-gray-600 hover:border-sage hover:text-jade"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hidden gems toggle */}
        <div className="border-b border-gray-100 px-6 py-4">
          <button
            onClick={() => setFilters((f) => ({ ...f, hiddenGems: !f.hiddenGems }))}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
              filters.hiddenGems
                ? "border-amber bg-amber/10 text-amber"
                : "border-gray-200 text-gray-600 hover:border-amber"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>💎</span>
              <span className="text-sm font-medium">Hidden Gems Only</span>
            </div>
            <div
              className={`h-5 w-10 rounded-full transition-colors ${
                filters.hiddenGems ? "bg-amber" : "bg-gray-200"
              }`}
            >
              <div
                className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  filters.hiddenGems ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Clear filters */}
        {(filters.borough || filters.grade || filters.diet || filters.hiddenGems || filters.openNow) && (
          <div className="px-6 py-4">
            <button
              onClick={() =>
                setFilters({ borough: null, grade: null, diet: null, hiddenGems: false, openNow: false })
              }
              className="w-full rounded-xl border border-sage/30 py-2 text-xs font-semibold uppercase tracking-widest text-jade transition-colors hover:border-jade hover:text-forest"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Near Me on map */}
        <div className="border-t border-gray-100 px-6 py-4">
          <NearMeButton
            variant="full"
            label="Center on my location"
            className="rounded-xl bg-forest py-3 text-white hover:bg-jade"
            radius={1}
          />
          <p className="mt-2 text-center text-xs" style={{ color: "var(--color-muted)" }}>
            Redirects to Near Me page
          </p>
        </div>

        {/* Selected restaurant card */}
        {selectedRestaurant && (
          <div className="border-t border-gray-100 px-6 py-4" style={{ backgroundColor: "var(--color-cream)" }}>
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              SELECTED RESTAURANT
            </p>
            <div className="rounded-xl border bg-white p-4">
              <p
                className="text-sm font-bold text-forest"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {selectedRestaurant.name}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                {selectedRestaurant.neighborhood}, {selectedRestaurant.borough}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {selectedRestaurant.inspection_grade && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{
                      backgroundColor:
                        selectedRestaurant.inspection_grade === "A"
                          ? "#52B788"
                          : selectedRestaurant.inspection_grade === "B"
                            ? "#D4A853"
                            : "#E07B54",
                    }}
                  >
                    Grade {selectedRestaurant.inspection_grade}
                  </span>
                )}
                {selectedRestaurant.rating && (
                  <span className="text-xs font-semibold" style={{ color: "var(--color-amber)" }}>
                    ★ {selectedRestaurant.rating}
                  </span>
                )}
                {selectedRestaurant.is_hidden_gem && <span className="text-xs">💎</span>}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
                {selectedRestaurant.address}
              </p>
              <Link
                href={`/restaurants/${selectedRestaurant.slug}`}
                className="mt-3 block rounded-xl bg-forest px-4 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-jade"
              >
                View full listing →
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT PANEL — Map */}
      <div className="relative flex-1">
        {/* Stats bar floating at top of map */}
        <div className="pointer-events-none absolute left-4 right-4 top-4 z-[1000] flex gap-3">
          <div className="pointer-events-auto rounded-xl border border-gray-100 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm">
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Showing
            </p>
            <p className="text-sm font-bold text-forest">{filteredCount} restaurants</p>
          </div>
          {filters.grade && (
            <div className="pointer-events-auto rounded-xl border border-gray-100 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm">
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Grade filter
              </p>
              <p className="text-sm font-bold text-forest">Grade {filters.grade} only</p>
            </div>
          )}
          {filters.borough && (
            <div className="pointer-events-auto rounded-xl border border-gray-100 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm">
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Borough
              </p>
              <p className="text-sm font-bold text-forest">{filters.borough}</p>
            </div>
          )}
        </div>

        {/* The actual map */}
        <div className="h-full w-full">
          <RestaurantMap
            filters={filters}
            onRestaurantClick={handleRestaurantClick}
            onFilteredCountChange={handleFilteredCountChange}
          />
        </div>
      </div>
    </div>
  )
}
