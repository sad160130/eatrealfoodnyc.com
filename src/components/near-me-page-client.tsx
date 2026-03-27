"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import RestaurantCard from "@/components/restaurant-card"
import NearMeButton from "@/components/near-me-button"
import { formatDistance } from "@/lib/utils"
import type { Restaurant } from "@/types"

interface RestaurantWithDistance extends Restaurant {
  distance?: number
}

export default function NearMePageClient() {
  const searchParams = useSearchParams()

  const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null
  const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null
  const [radius, setRadius] = useState(
    searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 1.0
  )

  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [gradeFilter, setGradeFilter] = useState<string | null>(null)
  const [dietFilter, setDietFilter] = useState<string | null>(null)
  const [openNowFilter, setOpenNowFilter] = useState(false)

  useEffect(() => {
    if (!lat || !lng) return

    setLoading(true)
    const params = new URLSearchParams()
    params.set("lat", lat.toString())
    params.set("lng", lng.toString())
    params.set("radius", radius.toString())
    params.set("limit", "24")
    if (gradeFilter) params.set("grade", gradeFilter)
    if (dietFilter) params.append("diet", dietFilter)
    if (openNowFilter) params.set("open", "true")

    fetch(`/api/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lat, lng, radius, gradeFilter, dietFilter, openNowFilter])

  // No location — landing state
  if (!lat || !lng) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="mb-6 text-7xl">📍</p>
        <h1
          className="text-4xl font-bold text-forest"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Healthy restaurants
          <br />
          near you
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg" style={{ color: "var(--color-muted)" }}>
          Share your location to find the best healthy restaurants within walking distance, sorted
          by proximity.
        </p>

        <NearMeButton
          variant="full"
          label="Find restaurants near me"
          className="mx-auto mt-8 max-w-sm bg-forest text-white hover:bg-jade"
        />

        <p className="mt-4 text-xs" style={{ color: "var(--color-muted)" }}>
          Your location is never stored. It is only used to sort results.
        </p>

        <div className="mt-16">
          <p
            className="mb-4 text-sm font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            Or browse by borough
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].map((borough) => (
              <Link
                key={borough}
                href={`/nyc/${borough.toLowerCase().replace(/ /g, "-")}/healthy-restaurants`}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-jade hover:text-jade"
              >
                {borough}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">
            YOUR LOCATION
          </p>
          <h1
            className="text-4xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Healthy restaurants
            <br />
            near you
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--color-muted)" }}>
            {loading
              ? "Searching..."
              : `${total} restaurants within ${radius} mile${radius !== 1 ? "s" : ""}`}
          </p>
        </div>

        <NearMeButton
          variant="pill"
          label="Update location"
          className="border border-gray-200 text-gray-600 hover:border-jade hover:text-jade"
        />
      </div>

      {/* Radius selector */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            SEARCH RADIUS
          </p>
          <p className="text-sm font-bold text-forest">
            {radius} mile{radius !== 1 ? "s" : ""}
          </p>
        </div>
        <input
          type="range"
          min="0.25"
          max="5"
          step="0.25"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          className="w-full accent-jade"
        />
        <div className="mt-1 flex justify-between text-xs" style={{ color: "var(--color-muted)" }}>
          <span>0.25 mi</span>
          <span>1 mi</span>
          <span>2 mi</span>
          <span>5 mi</span>
        </div>
      </div>

      {/* Quick filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setOpenNowFilter((p) => !p)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
            openNowFilter
              ? "border-green-400 bg-green-50 text-green-700"
              : "border-gray-200 text-gray-600 hover:border-green-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              openNowFilter ? "animate-pulse bg-green-500" : "bg-gray-300"
            }`}
          />
          Open Now
        </button>

        <button
          onClick={() => setGradeFilter((p) => (p === "A" ? null : "A"))}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
            gradeFilter === "A"
              ? "border-sage bg-sage text-white"
              : "border-gray-200 text-gray-600 hover:border-sage hover:text-jade"
          }`}
        >
          ⭐ Grade A Only
        </button>

        {["vegan", "halal", "gluten-free", "kosher"].map((tag) => (
          <button
            key={tag}
            onClick={() => setDietFilter((p) => (p === tag ? null : tag))}
            className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition-all ${
              dietFilter === tag
                ? "border-forest bg-forest text-white"
                : "border-gray-200 text-gray-600 hover:border-jade hover:text-jade"
            }`}
          >
            {tag}
          </button>
        ))}

        {(gradeFilter || dietFilter || openNowFilter) && (
          <button
            onClick={() => {
              setGradeFilter(null)
              setDietFilter(null)
              setOpenNowFilter(false)
            }}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-50"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border bg-gray-100" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-4 text-4xl">🔍</p>
          <h3
            className="text-xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No restaurants found nearby
          </h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Try increasing the search radius or removing some filters
          </p>
          <button
            onClick={() => setRadius((r) => Math.min(r + 1, 5))}
            className="mt-6 rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-jade"
          >
            Expand to {Math.min(radius + 1, 5)} miles
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <div key={restaurant.slug} className="relative">
                {restaurant.distance !== undefined && (
                  <div className="absolute left-3 top-3 z-20 rounded-full border border-gray-100 bg-white/95 px-3 py-1.5 text-xs font-bold text-forest shadow-sm backdrop-blur-sm">
                    📍 {formatDistance(restaurant.distance)}
                  </div>
                )}
                <RestaurantCard restaurant={restaurant} priority={index < 3} />
              </div>
            ))}
          </div>

          {total > 24 && (
            <div className="mt-10 text-center">
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Showing 24 of {total} restaurants within {radius} mile
                {radius !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setRadius((r) => Math.min(r + 0.5, 5))}
                className="mt-3 text-sm font-semibold text-jade transition-colors hover:text-forest"
              >
                Expand search radius to see more →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
