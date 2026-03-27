"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import Link from "next/link"
import { isRestaurantOpenNow } from "@/lib/utils"

interface MapRestaurant {
  id: number
  name: string
  slug: string
  type: string | null
  neighborhood: string | null
  borough: string | null
  address: string
  rating: number | null
  reviews: number | null
  inspection_grade: string | null
  dietary_tags: string | null
  photo: string | null
  is_hidden_gem: boolean
  working_hours: string | null
  latitude: number | null
  longitude: number | null
}

export type { MapRestaurant }

interface RestaurantMapProps {
  filters: {
    borough: string | null
    grade: string | null
    diet: string | null
    hiddenGems: boolean
    openNow: boolean
  }
  onRestaurantClick: (restaurant: MapRestaurant) => void
  onFilteredCountChange: (count: number) => void
}

function getGradeColor(grade: string | null): string {
  switch (grade) {
    case "A":
      return "#52B788"
    case "B":
      return "#D4A853"
    case "C":
      return "#E07B54"
    default:
      return "#9CA3AF"
  }
}

function getGradeOpacity(grade: string | null): number {
  return grade === "A" ? 0.85 : grade === "B" ? 0.75 : grade === "C" ? 0.7 : 0.5
}

export default function RestaurantMap({
  filters,
  onRestaurantClick,
  onFilteredCountChange,
}: RestaurantMapProps) {
  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/map-restaurants")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter((r) => {
    if (filters.borough && r.borough !== filters.borough) return false
    if (filters.grade && r.inspection_grade !== filters.grade) return false
    if (filters.diet && !r.dietary_tags?.includes(filters.diet)) return false
    if (filters.hiddenGems && !r.is_hidden_gem) return false
    if (filters.openNow && !isRestaurantOpenNow(r.working_hours)) return false
    return true
  })

  useEffect(() => {
    onFilteredCountChange(filtered.length)
  }, [filtered.length, onFilteredCountChange])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
          <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
            Loading restaurants...
          </p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filtered.map((restaurant) => (
        <CircleMarker
          key={restaurant.id}
          center={[restaurant.latitude!, restaurant.longitude!]}
          radius={restaurant.is_hidden_gem ? 8 : 6}
          fillColor={getGradeColor(restaurant.inspection_grade)}
          fillOpacity={getGradeOpacity(restaurant.inspection_grade)}
          color={
            restaurant.is_hidden_gem
              ? "#D4A853"
              : getGradeColor(restaurant.inspection_grade)
          }
          weight={restaurant.is_hidden_gem ? 2 : 1}
          eventHandlers={{
            click: () => onRestaurantClick(restaurant),
          }}
        >
          <Popup>
            <div className="min-w-48 p-1">
              <p className="text-sm font-bold text-forest">{restaurant.name}</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                {restaurant.neighborhood}, {restaurant.borough}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {restaurant.inspection_grade && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{
                      backgroundColor: getGradeColor(restaurant.inspection_grade),
                    }}
                  >
                    Grade {restaurant.inspection_grade}
                  </span>
                )}
                {restaurant.rating && (
                  <span className="text-xs font-semibold" style={{ color: "var(--color-amber)" }}>
                    ★ {restaurant.rating}
                  </span>
                )}
              </div>
              <Link
                href={`/restaurants/${restaurant.slug}`}
                className="mt-3 block text-xs font-semibold text-jade hover:text-forest"
              >
                View listing →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
