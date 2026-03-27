"use client"

import { useState, useEffect } from "react"
import { parseWorkingHours, getOpenStatus } from "@/lib/utils"

interface HoursAccordionProps {
  workingHours: string | null
}

export default function HoursAccordion({ workingHours }: HoursAccordionProps) {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hours = parseWorkingHours(workingHours)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (hours.length === 0) return null

  const today = mounted
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
        new Date().getDay()
      ]
    : null
  const todayEntry = today ? hours.find((h) => h.day === today) : null
  const openStatus = mounted ? getOpenStatus(workingHours) : null

  return (
    <div>
      <div className="flex items-center gap-3">
        {todayEntry && (
          <span className="text-sm text-gray-700">
            <span className="font-medium">Today:</span> {todayEntry.hours}
          </span>
        )}
        {openStatus && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              openStatus === "Open now"
                ? "bg-green-100 text-green-800"
                : openStatus === "Closed"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {openStatus}
          </span>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-sm font-medium text-green-700 hover:text-green-900"
      >
        {expanded ? "Hide hours" : "See all hours"}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {hours.map((h) => (
            <div
              key={h.day}
              className={`flex justify-between text-sm ${
                today && h.day === today
                  ? "font-medium text-gray-900"
                  : "text-gray-600"
              }`}
            >
              <span className="w-28">{h.day}</span>
              <span>{h.hours}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
