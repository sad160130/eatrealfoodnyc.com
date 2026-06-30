"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Restaurant } from "@/types"
import {
  formatPriceRange,
  parseDietaryTags,
  formatDietaryTag,
  getRestaurantImageAlt,
} from "@/lib/utils"
import SaveButton from "@/components/save-button"
import OpenNowBadge from "@/components/open-now-badge"
import CompareButton from "@/components/compare-button"
import VerifiedBadge from "@/components/VerifiedBadge"

interface RestaurantCardProps {
  restaurant: Restaurant
  priority?: boolean
}

/**
 * The signature element of the site — every card carries a small cream
 * placard at the top-left of its photo, framing the inspection grade letter
 * in Georgia bold. Echoes the actual NYC DOHMH placard that hangs in every
 * restaurant window. The letter is the typographic hook; colour stays the
 * same across A/B/C (the LETTER carries the meaning, not the colour).
 *
 * Composition decisions vs. the previous card:
 *   - 4:3 photo (deliberate, photographic) instead of 16:9 (cinematic, web-default)
 *   - Plaque replaces the rounded "Grade A" pill and the 0–100 Health Score badge
 *     (the composite score lives on the detail page; the directory cards trust
 *     the DOHMH grade alone)
 *   - Dietary tags become inline lowercase text with mid-dot separators
 *     instead of green pill chips — calmer, more typographic
 *   - "Hidden Gem" emoji becomes a single Georgia ✦ in amber next to the name
 *     (amber's only role on the site)
 *   - Top-rated badge removed: the rating numerals already say it
 */
export default function RestaurantCard({ restaurant, priority = false }: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false)
  const price = formatPriceRange(restaurant.price_range)
  const tags = parseDietaryTags(restaurant.dietary_tags).slice(0, 3)
  const restaurantUrl = `/restaurants/${restaurant.slug}`
  const locationLabel = [restaurant.neighborhood, restaurant.borough].filter(Boolean).join(" · ")
  const cardLabel = `${restaurant.name} — healthy restaurant${locationLabel ? ` in ${locationLabel}` : " in New York City"}`
  const grade = restaurant.inspection_grade || ""
  const gradeAria = grade
    ? `NYC Department of Health inspection grade ${grade}`
    : "NYC Department of Health inspection grade pending"

  return (
    <article
      aria-label={cardLabel}
      className="group relative overflow-hidden rounded-lg border border-hairline bg-white transition-shadow duration-300 hover:shadow-lg"
    >
      {/* ─── PHOTO ──────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
        <Link
          href={restaurantUrl}
          aria-label={`View full listing for ${restaurant.name}`}
          className="block h-full w-full"
        >
          {restaurant.photo && !imageError ? (
            <Image
              src={restaurant.photo}
              alt={getRestaurantImageAlt({
                name: restaurant.name,
                type: restaurant.type,
                neighborhood: restaurant.neighborhood,
                borough: restaurant.borough,
              })}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              role="img"
              aria-label={`${restaurant.name} — no photo available`}
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest to-jade"
            >
              <span
                aria-hidden="true"
                className="font-bold text-cream"
                style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", letterSpacing: "-0.02em" }}
              >
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
        </Link>

        {/* Plaque — the signature element. Top-left corner of the photo. */}
        <span
          className="plaque pointer-events-none absolute left-3 top-3 z-10"
          data-grade={grade}
          aria-label={gradeAria}
        >
          {grade || "–"}
        </span>

        {/* Action buttons — top-right corner of the photo */}
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

      {/* ─── BODY ───────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-4">
        {/* Name + hidden-gem mark + price */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="min-w-0 flex-1 text-base font-semibold leading-snug"
            style={{ color: "var(--color-text)" }}
          >
            <Link href={restaurantUrl} className="line-clamp-1 transition-colors hover:text-jade">
              {restaurant.name}
            </Link>
            {restaurant.is_hidden_gem && (
              <span
                className="gem-mark ml-1.5 align-baseline"
                aria-label="Hidden gem"
                title="Hidden gem"
              >
                ✦
              </span>
            )}
            {restaurant.isVerified && (
              <span className="ml-1 inline-flex align-baseline">
                <VerifiedBadge />
              </span>
            )}
          </h3>
          {price && (
            <span
              aria-label={`Price range ${price}`}
              className="tabular shrink-0 text-sm font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              {price}
            </span>
          )}
        </div>

        {/* Location */}
        {locationLabel && (
          <p
            className="mt-1 line-clamp-1 text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            {locationLabel}
          </p>
        )}

        {/* Rating + open status */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {restaurant.rating !== null ? (
            <span
              aria-label={`Rated ${restaurant.rating.toFixed(1)} out of 5 from ${(restaurant.reviews ?? 0).toLocaleString()} reviews`}
              className="tabular inline-flex items-center gap-1"
              style={{ color: "var(--color-text)" }}
            >
              <span aria-hidden="true" style={{ color: "var(--color-amber)" }}>★</span>
              <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
              <span style={{ color: "var(--color-muted)" }}>
                ({(restaurant.reviews ?? 0).toLocaleString()})
              </span>
            </span>
          ) : (
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              No rating yet
            </span>
          )}
          <OpenNowBadge
            workingHours={restaurant.working_hours}
            showClosingTime={false}
            size="sm"
          />
        </div>

        {/* Dietary tags — inline lowercase text, mid-dot separators */}
        {tags.length > 0 && (
          <ul
            role="list"
            aria-label="Dietary tags"
            className="mt-3 flex flex-wrap items-center gap-x-1 text-xs"
          >
            {tags.map((tag, i) => (
              <li key={tag} role="listitem" className="inline-flex items-center">
                {i > 0 && (
                  <span aria-hidden="true" className="mr-1" style={{ color: "var(--color-muted)" }}>
                    ·
                  </span>
                )}
                <Link
                  href={`/healthy-restaurants/${tag}`}
                  aria-label={`See more ${formatDietaryTag(tag)} restaurants`}
                  className="lowercase transition-colors hover:underline"
                  style={{
                    color: "var(--color-jade)",
                    textDecorationThickness: "1px",
                    textUnderlineOffset: "2px",
                  }}
                >
                  {formatDietaryTag(tag)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
