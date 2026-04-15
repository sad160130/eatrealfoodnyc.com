"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Restaurant } from "@/types"
import { formatPriceRange, parseDietaryTags, formatDietaryTag, computeHealthScore, getRestaurantImageAlt } from "@/lib/utils"
import SaveButton from "@/components/save-button"
import OpenNowBadge from "@/components/open-now-badge"
import CompareButton from "@/components/compare-button"

interface RestaurantCardProps {
  restaurant: Restaurant
  priority?: boolean
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-sm text-gray-400">No rating</span>
  }

  const rounded = Math.round(rating * 2) / 2
  const stars: React.ReactNode[] = []

  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      )
    } else if (i - 0.5 === rounded) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      )
    } else {
      stars.push(
        <span key={i} className="text-gray-300">★</span>
      )
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {stars}
    </span>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
      {children}
    </span>
  )
}

function InspectionBadge({ grade }: { grade: string | null }) {
  if (!grade) return null

  const styles: Record<string, string> = {
    A: "bg-green-100 text-green-800 border border-green-200",
    B: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    C: "bg-orange-100 text-orange-800 border border-orange-200",
  }

  const style = styles[grade] || "bg-gray-100 text-gray-800 border border-gray-200"

  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${style}`}>
      Grade {grade}
    </span>
  )
}

export default function RestaurantCard({ restaurant, priority = false }: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false)
  const price = formatPriceRange(restaurant.price_range)
  const tags = parseDietaryTags(restaurant.dietary_tags).slice(0, 3)
  const healthScore = computeHealthScore(restaurant)

  const showHiddenGem = restaurant.is_hidden_gem
  const showTopRated =
    !showHiddenGem &&
    restaurant.rating !== null &&
    restaurant.rating >= 4.7 &&
    (restaurant.reviews ?? 0) >= 500

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md cursor-pointer"
    >
      {/* Photo */}
      <div className="relative aspect-[16/9] w-full bg-gray-100">
        {restaurant.photo && !imageError ? (
          <Image
            src={restaurant.photo}
            alt={getRestaurantImageAlt({ name: restaurant.name, type: restaurant.type, neighborhood: restaurant.neighborhood, borough: restaurant.borough })}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={`${restaurant.name} — no photo available`}
            className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-forest to-jade"
          >
            <span className="font-serif text-5xl font-bold text-white">
              {restaurant.name.charAt(0)}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-widest text-white/70">
              {restaurant.type || "Restaurant"}
            </span>
          </div>
        )}
        {showHiddenGem && <Badge>💎 Hidden Gem</Badge>}
        {showTopRated && <Badge>⭐ Top Rated</Badge>}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <SaveButton
            restaurant={{
              slug: restaurant.slug,
              name: restaurant.name,
              neighborhood: restaurant.neighborhood,
              borough: restaurant.borough,
              rating: restaurant.rating,
              inspection_grade: restaurant.inspection_grade,
              dietary_tags: restaurant.dietary_tags,
              photo: restaurant.photo,
              is_hidden_gem: restaurant.is_hidden_gem,
              savedAt: "",
            }}
            variant="icon"
          />
          <CompareButton
            restaurant={{
              slug: restaurant.slug,
              name: restaurant.name,
              neighborhood: restaurant.neighborhood,
              borough: restaurant.borough,
              rating: restaurant.rating,
              reviews: restaurant.reviews,
              inspection_grade: restaurant.inspection_grade,
              inspection_score: restaurant.inspection_score,
              dietary_tags: restaurant.dietary_tags,
              photo: restaurant.photo,
              price_range: restaurant.price_range,
              is_hidden_gem: restaurant.is_hidden_gem,
              type: restaurant.type,
              address: restaurant.address,
              phone: restaurant.phone,
              website: restaurant.website,
              working_hours: restaurant.working_hours,
            }}
            variant="icon"
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Row 1: Name + Price */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold">{restaurant.name}</h3>
          {price && <span className="shrink-0 text-sm text-gray-500">{price}</span>}
        </div>

        {/* Row 2: Location + Open status */}
        <div className="mt-0.5 flex items-center gap-3 flex-wrap">
          {(restaurant.neighborhood || restaurant.borough) && (
            <p className="line-clamp-1 text-sm text-gray-400">
              {[restaurant.neighborhood, restaurant.borough].filter(Boolean).join(", ")}
            </p>
          )}
          <OpenNowBadge
            workingHours={restaurant.working_hours}
            showClosingTime={false}
            size="sm"
          />
        </div>

        {/* Row 3: Rating */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating rating={restaurant.rating} />
          {restaurant.rating !== null && (
            <>
              <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({restaurant.reviews ?? 0})</span>
            </>
          )}
        </div>

        {/* Row 4: Dietary tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/healthy-restaurants/${tag}`}
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200 transition-colors"
              >
                {formatDietaryTag(tag)}
              </Link>
            ))}
          </div>
        )}

        {/* Row 5: Inspection grade + Health score */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <InspectionBadge grade={restaurant.inspection_grade} />
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: healthScore.color + "20",
              color: healthScore.color,
            }}
            title={`Health Score: ${healthScore.score}/100`}
          >
            {healthScore.score}
          </span>
        </div>
      </div>
    </Link>
  )
}
