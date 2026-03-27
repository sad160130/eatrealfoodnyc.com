"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSavedRestaurants } from "@/hooks/use-saved-restaurants"
import { parseDietaryTags, formatDietaryTag } from "@/lib/utils"

interface SharedRestaurant {
  slug: string
  name: string
  neighborhood: string | null
  borough: string | null
  rating: number | null
  inspection_grade: string | null
  dietary_tags: string | null
  photo: string | null
  is_hidden_gem: boolean
}

interface SavedPageClientProps {
  sharedRestaurants?: SharedRestaurant[] | null
}

export default function SavedPageClient({ sharedRestaurants }: SavedPageClientProps) {
  const { saved, clearAll, isSaved, toggleSave, isLoaded } = useSavedRestaurants()
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [sortBy, setSortBy] = useState<"savedAt" | "rating" | "name">("savedAt")

  useEffect(() => {
    if (saved.length === 0) {
      setShareUrl("")
      return
    }
    const base = window.location.origin
    const slugs = saved.map((r) => r.slug).join(",")
    setShareUrl(`${base}/saved?list=${slugs}`)
  }, [saved])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sorted = [...saved].sort((a, b) => {
    if (sortBy === "savedAt")
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0)
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0
  })

  function gradeColor(grade: string | null): string {
    return grade === "A"
      ? "#52B788"
      : grade === "B"
        ? "#D4A853"
        : grade === "C"
          ? "#E07B54"
          : "#9CA3AF"
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
      </div>
    )
  }

  // Empty state (no shared list either)
  if (saved.length === 0 && !sharedRestaurants) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-16 text-center">
          <p className="mb-6 text-6xl">🤍</p>
          <h1
            className="text-4xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Your saved list is empty
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg" style={{ color: "var(--color-muted)" }}>
            Tap the heart icon on any restaurant to save it here. No account needed — your list is
            stored on this device.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-8 py-4 font-semibold text-white transition-colors hover:bg-jade"
          >
            Start exploring →
          </Link>
        </div>

        <div className="mt-8">
          <p
            className="mb-6 text-center text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            POPULAR PICKS TO GET YOU STARTED
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "🌱 Top Vegan Restaurants", href: "/healthy-restaurants/vegan" },
              { label: "🏆 Grade A Only", href: "/search?grade=A" },
              { label: "💎 Hidden Gems", href: "/search?hidden_gem=true" },
              { label: "🗺️ Near Me", href: "/map" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-sage hover:shadow-sm"
              >
                <span className="font-medium text-forest">{item.label}</span>
                <span className="text-jade">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Shared list banner */}
      {sharedRestaurants && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sage/30 bg-sage/15 p-5">
          <div>
            <p className="text-sm font-semibold text-forest">
              📋 Someone shared their restaurant list with you
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
              {sharedRestaurants.length} restaurants in this shared list
            </p>
          </div>
          <button
            onClick={() => {
              sharedRestaurants.forEach((r) => {
                if (!isSaved(r.slug)) {
                  toggleSave({ ...r, savedAt: new Date().toISOString() })
                }
              })
            }}
            className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-jade"
          >
            Save all to my list →
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">
            YOUR COLLECTION
          </p>
          <h1
            className="text-4xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Saved Restaurants
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--color-muted)" }}>
            {saved.length} {saved.length === 1 ? "restaurant" : "restaurants"} saved on this device
          </p>
        </div>

        <div className="mt-2 flex items-center gap-3">
          {shareUrl && (
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                copied
                  ? "border-sage bg-sage/20 text-jade"
                  : "border-gray-200 text-gray-600 hover:border-sage hover:text-jade"
              }`}
            >
              <span>{copied ? "✅" : "🔗"}</span>
              {copied ? "Copied!" : "Share list"}
            </button>
          )}
          <button
            onClick={() => {
              if (confirm("Clear all saved restaurants? This cannot be undone.")) {
                clearAll()
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-200 hover:bg-red-50"
          >
            🗑️ Clear all
          </button>
        </div>
      </div>

      {/* Sort controls */}
      <div className="mb-6 flex items-center gap-2">
        <span
          className="mr-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Sort by:
        </span>
        {(
          [
            { value: "savedAt", label: "Recently saved" },
            { value: "rating", label: "Highest rated" },
            { value: "name", label: "Name A–Z" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              sortBy === option.value
                ? "border-forest bg-forest text-white"
                : "border-gray-200 text-gray-600 hover:border-jade hover:text-jade"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Saved restaurant cards */}
      <div className="space-y-4">
        {sorted.map((restaurant) => {
          const tags = parseDietaryTags(restaurant.dietary_tags)

          return (
            <div
              key={restaurant.slug}
              className="flex gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
            >
              {/* Photo */}
              <Link href={`/restaurants/${restaurant.slug}`} className="flex-shrink-0">
                <div className="relative h-36 w-40 bg-gradient-to-br from-sage/20 to-jade/10">
                  {restaurant.photo ? (
                    <Image
                      src={restaurant.photo}
                      alt={`${restaurant.name} — ${restaurant.neighborhood ?? restaurant.borough ?? "NYC"}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🍽️
                    </div>
                  )}
                  {restaurant.is_hidden_gem && (
                    <div className="absolute left-2 top-2 rounded-full bg-amber/90 px-2 py-0.5 text-xs font-bold text-white">
                      💎
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between py-4 pr-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/restaurants/${restaurant.slug}`}>
                        <h3
                          className="text-lg font-bold leading-tight text-forest transition-colors hover:text-jade"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {restaurant.name}
                        </h3>
                      </Link>
                      <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
                        {restaurant.neighborhood}
                        {restaurant.neighborhood && restaurant.borough ? ", " : ""}
                        {restaurant.borough}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSave(restaurant)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {restaurant.rating && (
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--color-amber)" }}
                      >
                        ★ {restaurant.rating}
                      </span>
                    )}
                    {restaurant.inspection_grade && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: gradeColor(restaurant.inspection_grade) }}
                      >
                        Grade {restaurant.inspection_grade}
                      </span>
                    )}
                    {tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-jade"
                      >
                        {formatDietaryTag(tag)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    Saved{" "}
                    {new Date(restaurant.savedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <Link
                    href={`/restaurants/${restaurant.slug}`}
                    className="text-xs font-semibold text-jade transition-colors hover:text-forest"
                  >
                    View listing →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Share section */}
      {saved.length >= 2 && (
        <div className="mt-10 rounded-2xl bg-forest p-8 text-center">
          <p className="mb-3 text-2xl">🔗</p>
          <h3
            className="text-xl font-bold text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Share your list
          </h3>
          <p className="mt-2 text-sm text-white/60">
            Copy the link below to share your saved restaurants with friends
          </p>
          <div className="mx-auto mt-5 flex max-w-lg items-center gap-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/80 outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`flex-shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                copied
                  ? "bg-sage text-white"
                  : "bg-white text-forest hover:bg-sage hover:text-white"
              }`}
            >
              {copied ? "✅ Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
