"use client"

import { useMemo } from "react"
import { isRestaurantOpenNow, getClosingTime } from "@/lib/utils"

interface OpenNowBadgeProps {
  workingHours: string | null
  showClosingTime?: boolean
  size?: "sm" | "md"
}

export default function OpenNowBadge({
  workingHours,
  showClosingTime = true,
  size = "md",
}: OpenNowBadgeProps) {
  const isOpen = useMemo(() => isRestaurantOpenNow(workingHours), [workingHours])
  const closingTime = useMemo(() => getClosingTime(workingHours), [workingHours])

  if (!workingHours) return null

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"

  if (isOpen) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 font-medium text-green-700 ${sizeClasses}`}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        {showClosingTime && closingTime ? `Open until ${closingTime}` : "Open now"}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 font-medium text-gray-500 ${sizeClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      {closingTime === "Closed today" ? "Closed today" : "Closed now"}
    </span>
  )
}
