"use client"

import Link from "next/link"
import Image from "next/image"
import { useSavedRestaurants } from "@/hooks/use-saved-restaurants"

export default function SavedPreview() {
  const { saved, isLoaded } = useSavedRestaurants()

  if (!isLoaded || saved.length === 0) return null

  const preview = saved.slice(0, 3)

  return (
    <section className="border-y border-sage/10 bg-sage/5 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sage">
              YOUR LIST
            </p>
            <h2
              className="text-xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Continue exploring — {saved.length} saved{" "}
              {saved.length === 1 ? "restaurant" : "restaurants"}
            </h2>
          </div>
          <Link
            href="/saved"
            className="text-sm font-semibold text-jade transition-colors hover:text-forest"
          >
            View all →
          </Link>
        </div>

        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
          {preview.map((restaurant) => (
            <Link
              key={restaurant.slug}
              href={`/restaurants/${restaurant.slug}`}
              className="w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
            >
              <div className="relative h-32 w-full bg-gradient-to-br from-sage/20 to-jade/10">
                {restaurant.photo ? (
                  <Image
                    src={restaurant.photo}
                    alt={`${restaurant.name} — ${restaurant.neighborhood ?? "NYC"}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-3">
                <p
                  className="line-clamp-1 text-sm font-semibold text-forest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {restaurant.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                  {restaurant.neighborhood}
                </p>
                {restaurant.inspection_grade && (
                  <span className="mt-2 inline-block text-xs font-bold text-jade">
                    Grade {restaurant.inspection_grade}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {saved.length > 3 && (
            <Link
              href="/saved"
              className="flex w-40 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-forest text-white transition-colors hover:bg-jade"
            >
              <span className="text-2xl font-bold">+{saved.length - 3}</span>
              <span className="mt-1 text-xs text-white/70">more saved</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
