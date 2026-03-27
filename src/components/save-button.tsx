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
        className={
          variant === "full"
            ? "flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400"
            : "flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-300"
        }
        disabled
      >
        {variant === "full" ? (
          <>
            <span>🤍</span> Save
          </>
        ) : (
          <span>🤍</span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleSave(restaurant)
      }}
      className={
        variant === "full"
          ? `flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              saved
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                : "border-gray-200 text-gray-600 hover:border-sage hover:text-jade"
            }`
          : `flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              saved
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 text-gray-400 hover:border-sage hover:text-jade"
            }`
      }
      title={saved ? "Remove from saved" : "Save restaurant"}
    >
      {variant === "full" ? (
        <>
          <span>{saved ? "❤️" : "🤍"}</span>
          {saved ? "Saved" : "Save"}
        </>
      ) : (
        <span>{saved ? "❤️" : "🤍"}</span>
      )}
    </button>
  )
}
