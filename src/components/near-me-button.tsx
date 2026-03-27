"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface NearMeButtonProps {
  radius?: number
  className?: string
  label?: string
  variant?: "pill" | "full" | "icon"
}

export default function NearMeButton({
  radius = 1,
  className = "",
  label = "Near Me",
  variant = "pill",
}: NearMeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLoading(false)
        router.push(`/near-me?lat=${latitude}&lng=${longitude}&radius=${radius}`)
      },
      (err) => {
        setLoading(false)
        if (err.code === 1) {
          alert("Please enable location access in your browser to use this feature.")
        } else {
          alert("Could not get your location. Please try again.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const baseClasses: Record<string, string> = {
    pill: `flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${className}`,
    full: `flex items-center justify-center gap-3 w-full text-base font-semibold px-6 py-4 rounded-2xl transition-all ${className}`,
    icon: `flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${className}`,
  }

  return (
    <button onClick={handleClick} disabled={loading} className={baseClasses[variant]}>
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Getting location...
        </>
      ) : (
        <>
          <span>📍</span>
          {label}
        </>
      )}
    </button>
  )
}
