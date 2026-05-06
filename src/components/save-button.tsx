"use client"

import { useSavedRestaurants, SavedRestaurant } from "@/hooks/use-saved-restaurants"

interface SaveButtonProps {
  restaurant: SavedRestaurant
  variant?: "icon" | "full"
}

export default function SaveButton({ restaurant, variant = "icon" }: SaveButtonProps) {
  const { isSaved, toggleSave, isLoaded } = useSavedRestaurants()
  const saved = isSaved(restaurant.slug)

  if (!isLoaded) {
    return (
      <button
        type="button"
        aria-label={`Save ${restaurant.name} (loading)`}
        className={
          variant === "full"
            ? "flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
            : "flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-300 cursor-not-allowed"
        }
        disabled
      >
        {variant === "full" ? (
          <>
            <span aria-hidden="true">🤍</span> Save
          </>
        ) : (
          <span aria-hidden="true">🤍</span>
        )}
      </button>
    )
  }

  const ariaLabel = saved
    ? `Remove ${restaurant.name} from saved restaurants`
    : `Save ${restaurant.name} to your list`

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleSave(restaurant)
      }}
      aria-label={ariaLabel}
      aria-pressed={saved}
      className={
        variant === "full"
          ? `flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              saved
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                : "border-gray-200 text-gray-600 hover:border-sage hover:text-jade"
            }`
          : `flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
              saved
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 text-gray-400 hover:border-sage hover:text-jade"
            }`
      }
      title={saved ? "Remove from saved" : "Save restaurant"}
    >
      {variant === "full" ? (
        <>
          <span aria-hidden="true">{saved ? "❤️" : "🤍"}</span>
          {saved ? "Saved" : "Save"}
        </>
      ) : (
        <>
          <span aria-hidden="true">{saved ? "❤️" : "🤍"}</span>
          <span className="sr-only">{saved ? "Saved" : "Save"}</span>
        </>
      )}
    </button>
  )
}
