"use client"

import { useComparison } from "@/hooks/use-comparison"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ComparisonTray() {
  const { compared, remove, clearAll, count, isLoaded } = useComparison()
  const router = useRouter()

  if (!isLoaded || count === 0) return null

  const handleCompare = () => {
    const slugs = compared.map((r) => r.slug).join(",")
    router.push(`/compare?restaurants=${slugs}`)
  }

  return (
    <aside
      role="complementary"
      aria-label={`Compare restaurants — ${count} of 3 selected`}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 p-4"
    >
      <p className="sr-only" aria-live="polite">
        {count === 0
          ? "Comparison tray is empty"
          : `${count} restaurant${count > 1 ? "s" : ""} selected for comparison`}
      </p>
      <div className="pointer-events-auto mx-auto max-w-3xl">
        <div className="rounded-2xl border border-jade/30 bg-forest p-4 shadow-2xl">
          <div className="flex flex-wrap items-center gap-4">
            {/* Label */}
            <div className="flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                COMPARING
              </p>
              <p className="mt-0.5 text-sm font-bold text-white">{count} of 3 restaurants</p>
            </div>

            {/* Restaurant thumbnails */}
            <ul role="list" className="flex flex-1 items-center gap-3">
              {compared.map((restaurant) => (
                <li
                  key={restaurant.slug}
                  className="flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2"
                >
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-jade/30">
                    {restaurant.photo ? (
                      <Image
                        src={restaurant.photo}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-xs">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="max-w-32 truncate text-xs font-semibold text-white">
                      {restaurant.name}
                    </p>
                    <p className="truncate text-xs text-white/50">{restaurant.neighborhood}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(restaurant.slug)}
                    aria-label={`Remove ${restaurant.name} from comparison`}
                    className="ml-1 flex-shrink-0 text-white/40 transition-colors hover:text-white cursor-pointer"
                    title={`Remove ${restaurant.name}`}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </li>
              ))}

              {Array.from({ length: 3 - count }).map((_, i) => (
                <li
                  key={i}
                  aria-hidden="true"
                  className="flex h-12 w-32 items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-xs text-white/30"
                >
                  + Add
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                aria-label="Clear all restaurants from comparison"
                className="text-xs font-medium text-white/50 transition-colors hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleCompare}
                disabled={count < 2}
                aria-label={count < 2 ? "Add at least one more restaurant before comparing" : `Compare ${count} selected restaurants`}
                className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                  count >= 2
                    ? "bg-sage text-white hover:bg-white hover:text-forest cursor-pointer"
                    : "cursor-not-allowed bg-white/10 text-white/40"
                }`}
              >
                {count < 2 ? "Add 1 more" : "Compare now →"}
              </button>
            </div>
          </div>

          {count < 2 && (
            <p className="mt-3 text-center text-xs text-white/40">
              Add at least 2 restaurants to start comparing
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
