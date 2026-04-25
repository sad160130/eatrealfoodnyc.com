import type { Restaurant } from "@/types"

export function formatPriceRange(price: number | null): string {
  if (price === null || price < 1 || price > 4) return ""
  return "$".repeat(price)
}

export function parseDietaryTags(tags: string | null): string[] {
  if (!tags || tags.trim() === "") return []
  return tags.split("|").map((t) => t.trim()).filter(Boolean)
}

export function formatDietaryTag(tag: string): string {
  return tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function boroughToSlug(borough: string): string {
  return borough
    .toLowerCase()
    // Strip apostrophes (ASCII + curly) and other vanish-chars BEFORE hyphenation
    .replace(/['\u2018\u2019\u201C\u201D".,]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

export function neighborhoodToSlug(neighborhood: string): string {
  return neighborhood
    .toLowerCase()
    // Strip apostrophes (ASCII + curly) and other vanish-chars BEFORE hyphenation
    .replace(/['\u2018\u2019\u201C\u201D".,]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

export function parseWorkingHours(
  json: string | null
): { day: string; hours: string }[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json) as Record<string, string[]>
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]
    return days.map((day) => ({
      day,
      hours: parsed[day] ? parsed[day].join(", ") : "Closed",
    }))
  } catch {
    return []
  }
}

export function getOpenStatus(json: string | null): string | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as Record<string, string[]>
    const now = new Date()
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const today = dayNames[now.getDay()]
    const todayHours = parsed[today]

    if (!todayHours || todayHours.length === 0 || todayHours[0] === "Closed") {
      return "Closed"
    }

    for (const range of todayHours) {
      const match = range.match(
        /^(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)$/i
      )
      if (!match) continue

      const openMin = parseTimeToMinutes(match[1])
      const closeMin = parseTimeToMinutes(match[2])
      if (openMin === null || closeMin === null) continue

      const nowMin = now.getHours() * 60 + now.getMinutes()

      if (nowMin >= openMin && nowMin < closeMin) {
        const closeLabel = match[2].trim()
        if (closeMin - nowMin <= 60) {
          return `Closes at ${closeLabel}`
        }
        return "Open now"
      }
    }

    return "Closed"
  } catch {
    return null
  }
}

export function computeHealthScore(restaurant: Restaurant): {
  score: number
  label: "Exceptional" | "Great" | "Good" | "Limited Info"
  color: string
  breakdown: { label: string; points: number; max: number; earned: number }[]
} {
  const breakdown: { label: string; points: number; max: number; earned: number }[] = []
  let total = 0

  // Inspection grade — max 40 points
  const gradePoints =
    restaurant.inspection_grade === "A" ? 40 :
    restaurant.inspection_grade === "B" ? 20 :
    restaurant.inspection_grade === "C" ? 5 : 0
  breakdown.push({ label: "Health inspection grade", points: gradePoints, max: 40, earned: gradePoints })
  total += gradePoints

  // Dietary tag count — max 20 points
  const tags = parseDietaryTags(restaurant.dietary_tags)
  const tagPoints = Math.min(tags.length * 4, 20)
  breakdown.push({ label: "Dietary transparency", points: tagPoints, max: 20, earned: tagPoints })
  total += tagPoints

  // Hidden gem — 10 points
  const gemPoints = restaurant.is_hidden_gem ? 10 : 0
  breakdown.push({ label: "Hidden gem status", points: gemPoints, max: 10, earned: gemPoints })
  total += gemPoints

  // Rating above 4.5 — 10 points
  const ratingPoints = restaurant.rating && restaurant.rating >= 4.5 ? 10 : 0
  breakdown.push({ label: "Community rating", points: ratingPoints, max: 10, earned: ratingPoints })
  total += ratingPoints

  // Reviews above 200 — 10 points
  const reviewPoints = restaurant.reviews && restaurant.reviews >= 200 ? 10 : 0
  breakdown.push({ label: "Proven track record", points: reviewPoints, max: 10, earned: reviewPoints })
  total += reviewPoints

  const label =
    total >= 75 ? "Exceptional" :
    total >= 50 ? "Great" :
    total >= 25 ? "Good" : "Limited Info"

  const color =
    total >= 75 ? "#52B788" :
    total >= 50 ? "#2D6A4F" :
    total >= 25 ? "#D4A853" : "#9CA3AF"

  return { score: total, label, color, breakdown }
}

export function isRestaurantOpenNow(workingHours: string | null): boolean {
  if (!workingHours) return false

  try {
    const hours = JSON.parse(workingHours) as Record<string, string[]>

    const now = new Date()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayName = dayNames[now.getDay()]
    const todayHours = hours[todayName]

    if (!todayHours || todayHours.length === 0) return false
    const hoursStr = todayHours[0]
    if (hoursStr.toLowerCase() === "closed") return false
    if (hoursStr.toLowerCase().includes("open 24")) return true

    const parts = hoursStr.split("-")
    if (parts.length !== 2) return false

    const parseT = (timeStr: string): number => {
      const cleaned = timeStr.trim().toUpperCase()
      const isPM = cleaned.includes("PM")
      const isAM = cleaned.includes("AM")
      const numeric = cleaned.replace("AM", "").replace("PM", "").trim()
      const [hourStr, minStr] = numeric.split(":")
      let hour = parseInt(hourStr, 10)
      const min = parseInt(minStr || "0", 10)
      if (isPM && hour !== 12) hour += 12
      if (isAM && hour === 12) hour = 0
      return hour * 60 + min
    }

    const openMinutes = parseT(parts[0])
    let closeMinutes = parseT(parts[1])

    if (closeMinutes < openMinutes) closeMinutes += 24 * 60

    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  } catch {
    return false
  }
}

export function getClosingTime(workingHours: string | null): string | null {
  if (!workingHours) return null

  try {
    const hours = JSON.parse(workingHours) as Record<string, string[]>
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayName = dayNames[new Date().getDay()]
    const todayHours = hours[todayName]

    if (!todayHours || todayHours.length === 0) return null
    const hoursStr = todayHours[0]
    if (hoursStr.toLowerCase() === "closed") return "Closed today"

    const parts = hoursStr.split("-")
    if (parts.length !== 2) return null

    return parts[1].trim()
  } catch {
    return null
  }
}

export function getDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return "Less than 0.1 mi"
  if (miles < 1) return `${Math.round((miles * 5280) / 100) * 100} ft`
  return `${miles.toFixed(1)} mi`
}

function parseTimeToMinutes(time: string): number | null {
  const cleaned = time.trim().toUpperCase()
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = match[2] ? parseInt(match[2], 10) : 0
  const period = match[3]

  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0

  return hours * 60 + minutes
}

export function buildTitle(
  parts: { name: string; location?: string | null; suffix?: string },
  maxLength: number = 60
): string {
  const { name, location, suffix } = parts
  const full = [name, location, suffix].filter(Boolean).join(" — ")
  if (full.length <= maxLength) return full
  const withoutSuffix = [name, location].filter(Boolean).join(" — ")
  if (withoutSuffix.length <= maxLength) return withoutSuffix
  const locationPart = location ? ` — ${location}` : ""
  const maxName = maxLength - locationPart.length - 3
  return `${name.slice(0, maxName)}...${locationPart}`
}

export function getRestaurantImageAlt(restaurant: {
  name: string
  type: string | null
  neighborhood: string | null
  borough: string | null
}): string {
  const parts = [restaurant.name]
  if (restaurant.type) parts.push(restaurant.type.toLowerCase())
  if (restaurant.neighborhood) parts.push(`in ${restaurant.neighborhood}`)
  if (restaurant.borough) parts.push(restaurant.borough)
  parts.push("NYC")
  return parts.join(" — ")
}

export function getHubImageAlt(
  context: "borough" | "neighborhood" | "diet",
  name: string,
  borough?: string
): string {
  if (context === "borough") return `Healthy restaurants in ${name}, New York City`
  if (context === "neighborhood") return `Healthy restaurants in ${name}${borough ? `, ${borough}` : ""}, NYC`
  if (context === "diet") return `${name} restaurants in New York City`
  return `Eat Real Food NYC — ${name}`
}
