"use client"

import { useComparison, CompareRestaurant } from "@/hooks/use-comparison"

interface CompareButtonProps {
  restaurant: CompareRestaurant
  variant?: "icon" | "full" | "small"
}

export default function CompareButton({ restaurant, variant = "small" }: CompareButtonProps) {
  const { isCompared, canAdd, toggleCompare, isLoaded } = useComparison()
  const added = isCompared(restaurant.slug)

  if (!isLoaded) return null

  if (!added && !canAdd) {
    return (
      <button
        type="button"
        disabled
        aria-label="Comparison is full — remove a restaurant first"
        aria-pressed={false}
        className={
          variant === "full"
            ? "flex cursor-not-allowed items-center gap-2 rounded-xl border border-gray-100 px-4 py-2.5 text-xs font-medium text-gray-300"
            : "cursor-not-allowed px-2 text-xs text-gray-300"
        }
        title="Maximum 3 restaurants can be compared at once"
      >
        {variant === "full" ? (
          <>
            <span aria-hidden="true">⚖️</span> Compare (max 3)
          </>
        ) : (
          "Max reached"
        )}
      </button>
    )
  }

  const ariaLabel = added
    ? `Remove ${restaurant.name} from comparison`
    : `Add ${restaurant.name} to comparison`

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleCompare(restaurant)
      }}
      aria-label={ariaLabel}
      aria-pressed={added}
      className={
        variant === "full"
          ? `flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              added
                ? "border-amber bg-amber/10 text-amber hover:bg-amber/20"
                : "border-gray-200 text-gray-600 hover:border-amber hover:text-amber"
            }`
          : variant === "icon"
            ? `flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all cursor-pointer ${
                added
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-gray-200 text-gray-400 hover:border-amber hover:text-amber"
              }`
            : `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                added
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-gray-200 text-gray-500 hover:border-amber hover:text-amber"
              }`
      }
      title={added ? "Remove from comparison" : "Add to comparison"}
    >
      {variant === "full" ? (
        <>
          <span aria-hidden="true">⚖️</span>
          {added ? "Added to compare" : "Compare"}
        </>
      ) : variant === "icon" ? (
        <>
          <span aria-hidden="true">⚖️</span>
          <span className="sr-only">{added ? "Remove from compare" : "Add to compare"}</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">⚖️</span>
          {added ? "Added" : "Compare"}
        </>
      )}
    </button>
  )
}
