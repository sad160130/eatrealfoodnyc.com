"use client"

import Image from "next/image"
import Link from "next/link"
import type { Restaurant } from "@/types"
import {
  parseDietaryTags,
  formatDietaryTag,
  formatPriceRange,
  computeHealthScore,
  isRestaurantOpenNow,
  getClosingTime,
} from "@/lib/utils"

interface ComparePageViewProps {
  restaurants: Restaurant[]
}

function GradeCell({ grade }: { grade: string | null }) {
  const style =
    grade === "A"
      ? "bg-green-50 text-green-700 border-green-200"
      : grade === "B"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : grade === "C"
          ? "bg-orange-50 text-orange-700 border-orange-200"
          : "bg-gray-50 text-gray-400 border-gray-200"

  return grade ? (
    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${style}`}>
      Grade {grade}
    </span>
  ) : (
    <span className="text-sm text-gray-400">Not graded</span>
  )
}

function WinnerBadge({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-block rounded-full bg-amber/20 px-2 py-0.5 text-xs font-bold text-amber">
      {label}
    </span>
  )
}

interface RowDef {
  label: string
  render: (r: Restaurant) => React.ReactNode
}

export default function ComparePageView({ restaurants }: ComparePageViewProps) {
  const count = restaurants.length
  const cols = count === 2 ? "grid-cols-2" : "grid-cols-3"

  const healthScores = restaurants.map((r) => computeHealthScore(r))
  const topHealthScore = Math.max(...healthScores.map((h) => h.score))
  const topRating = Math.max(...restaurants.map((r) => r.rating ?? 0))
  const scores = restaurants.filter((r) => r.inspection_score !== null).map((r) => r.inspection_score!)
  const lowestScore = scores.length > 0 ? Math.min(...scores) : null

  const coreRows: RowDef[] = [
    {
      label: "Health Score",
      render: (r) => {
        const hs = computeHealthScore(r)
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: hs.color }}>
              {hs.score}/100
            </span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {hs.label}
            </span>
            {hs.score === topHealthScore && <WinnerBadge label="Best" />}
          </div>
        )
      },
    },
    {
      label: "Star Rating",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: "var(--color-amber)" }}>
            ★ {r.rating ?? "N/A"}
          </span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            ({(r.reviews ?? 0).toLocaleString()} reviews)
          </span>
          {r.rating === topRating && topRating > 0 && <WinnerBadge label="Highest rated" />}
        </div>
      ),
    },
    {
      label: "Inspection Grade",
      render: (r) => <GradeCell grade={r.inspection_grade} />,
    },
    {
      label: "Inspection Score",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-forest">
            {r.inspection_score !== null ? r.inspection_score : "—"}
          </span>
          {r.inspection_score !== null && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              (lower is better)
            </span>
          )}
          {r.inspection_score === lowestScore && lowestScore !== null && (
            <WinnerBadge label="Best score" />
          )}
        </div>
      ),
    },
    {
      label: "Last Inspected",
      render: (r) => (
        <span className="text-sm text-gray-600">
          {r.inspection_date
            ? new Date(r.inspection_date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ]

  const detailRows: RowDef[] = [
    {
      label: "Type",
      render: (r) => <span className="text-sm text-gray-700">{r.type ?? "—"}</span>,
    },
    {
      label: "Price Range",
      render: (r) => (
        <span className="text-sm font-semibold text-forest">
          {r.price_range ? formatPriceRange(r.price_range) : "—"}
        </span>
      ),
    },
    {
      label: "Open Now",
      render: (r) => {
        const open = isRestaurantOpenNow(r.working_hours)
        const closing = getClosingTime(r.working_hours)
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${open ? "animate-pulse bg-green-500" : "bg-gray-300"}`}
            />
            <span className={`text-sm font-medium ${open ? "text-green-700" : "text-gray-500"}`}>
              {open ? `Open until ${closing}` : (closing ?? "Unknown")}
            </span>
          </div>
        )
      },
    },
    {
      label: "Address",
      render: (r) => (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-jade transition-colors hover:text-forest hover:underline"
        >
          {r.address}
        </a>
      ),
    },
  ]

  function renderSection(
    sectionLabel: string,
    sectionBg: string,
    sectionTextColor: string,
    rows: RowDef[]
  ) {
    return (
      <>
        <div className={`border-b border-t px-6 py-4 ${sectionBg}`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${sectionTextColor}`}>
            {sectionLabel}
          </p>
        </div>
        {rows.map((row) => (
          <div key={row.label}>
            <div className="border-b border-gray-50 px-6 py-2 lg:hidden" style={{ backgroundColor: "var(--color-cream)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                {row.label}
              </p>
            </div>
            <div className={`grid ${cols} divide-x divide-gray-50 border-b border-gray-50`}>
              {restaurants.map((r, i) => (
                <div key={r.slug} className="flex items-start gap-4 px-6 py-5">
                  {i === 0 && (
                    <div className="hidden w-36 flex-shrink-0 lg:block">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                        {row.label}
                      </p>
                    </div>
                  )}
                  {row.render(r)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    )
  }

  // Shared dietary tags
  const allTagArrays = restaurants.map((r) => parseDietaryTags(r.dietary_tags))
  const sharedTags = allTagArrays[0]?.filter((tag) =>
    allTagArrays.slice(1).every((tags) => tags.includes(tag))
  ) ?? []

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">
            SIDE-BY-SIDE
          </p>
          <h1
            className="text-4xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Restaurant Comparison
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Comparing {count} restaurants
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-sage/30 px-4 py-2 text-sm font-semibold text-jade transition-colors hover:text-forest"
        >
          ← Add more restaurants
        </Link>
      </div>

      {/* Photo headers */}
      <div className={`grid ${cols} mb-8 gap-4`}>
        {restaurants.map((r, idx) => {
          const hs = healthScores[idx]
          return (
            <div
              key={r.slug}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
            >
              <div className="relative h-48 bg-gradient-to-br from-sage/20 to-jade/10">
                {r.photo ? (
                  <Image
                    src={r.photo}
                    alt={`${r.name} — ${r.neighborhood ?? r.borough ?? "NYC"}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
                {r.is_hidden_gem && (
                  <div className="absolute left-3 top-3 rounded-full bg-amber px-2 py-1 text-xs font-bold text-white">
                    💎 Hidden Gem
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2
                  className="text-lg font-bold leading-tight text-forest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {r.name}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                  {r.neighborhood}, {r.borough}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{
                      backgroundColor: hs.color + "20",
                      color: hs.color,
                    }}
                  >
                    {hs.score}/100
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {hs.label}
                  </span>
                </div>
                <Link
                  href={`/restaurants/${r.slug}`}
                  className="mt-4 block rounded-xl border border-sage/30 py-2 text-center text-xs font-semibold text-jade transition-colors hover:border-jade hover:text-forest"
                >
                  View full listing →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {renderSection("CORE METRICS", "bg-forest", "text-white/60", coreRows)}
        {renderSection("DETAILS", "bg-jade/5", "text-jade", detailRows)}

        {/* Dietary tags section */}
        <div className="border-b border-t border-sage/10 bg-sage/5 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-sage">
            DIETARY OPTIONS
          </p>
        </div>
        <div className={`grid ${cols} divide-x divide-gray-50 border-b border-gray-50`}>
          {restaurants.map((r) => {
            const tags = parseDietaryTags(r.dietary_tags)
            return (
              <div key={r.slug} className="px-6 py-5">
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-jade"
                      >
                        {formatDietaryTag(tag)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No tags</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Shared dietary tags */}
        {sharedTags.length > 0 && (
          <div className="border-t border-sage/10 bg-sage/10 px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-jade">
              ✅ SHARED DIETARY OPTIONS — All {count} restaurants offer:
            </p>
            <div className="flex flex-wrap gap-2">
              {sharedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-white"
                >
                  {formatDietaryTag(tag)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description section */}
        <div className="border-b border-t border-amber/10 bg-amber/5 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-amber)" }}>
            ABOUT
          </p>
        </div>
        <div className={`grid ${cols} divide-x divide-gray-50`}>
          {restaurants.map((r) => (
            <div key={r.slug} className="px-6 py-5">
              <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">
                {r.description ?? "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className={`grid ${cols} divide-x divide-gray-100 border-t border-gray-100`} style={{ backgroundColor: "var(--color-cream)" }}>
          {restaurants.map((r) => (
            <div key={r.slug} className="flex flex-col gap-3 px-6 py-5">
              <Link
                href={`/restaurants/${r.slug}`}
                className="block rounded-xl bg-forest px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-jade"
              >
                View full listing
              </Link>
              {r.website && (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-sage/30 px-4 py-2.5 text-center text-sm font-medium text-jade transition-colors hover:border-jade"
                >
                  Visit website →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add more note */}
      {count < 3 && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="mb-3 text-2xl">⚖️</p>
          <p className="font-semibold text-forest">Add one more restaurant to compare</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Browse the site and click the ⚖️ button on any restaurant card
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl border border-sage/30 px-6 py-2.5 text-sm font-semibold text-jade transition-colors hover:border-jade hover:text-forest"
          >
            Browse restaurants →
          </Link>
        </div>
      )}
    </div>
  )
}
