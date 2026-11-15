import { formatDietaryTag, formatPriceRange, parseDietaryTags } from "@/lib/utils"

const MAX_LENGTH = 160

export interface RestaurantDescriptionInput {
  name: string
  type: string | null
  neighborhood: string | null
  borough: string | null
  dietary_tags: string | null
  inspection_grade: string | null
  rating: number | null
  reviews: number | null
  price_range?: number | null
  is_hidden_gem?: boolean
}

function hasRating(rating: number | null | undefined): rating is number {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0
}

function clamp(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= MAX_LENGTH) return normalized
  const sliced = normalized.slice(0, MAX_LENGTH - 1)
  const boundary = sliced.lastIndexOf(" ")
  const cut = boundary > 80 ? sliced.slice(0, boundary) : sliced
  return `${cut.replace(/[.,;\s]+$/, "")}.`
}

/**
 * Meta description built only from fields we actually store.
 * Omits rating, grade, tags, price, and the hidden-gem mark when absent.
 */
export function buildRestaurantMetaDescription(restaurant: RestaurantDescriptionInput): string {
  const place = [restaurant.neighborhood, restaurant.borough].filter(Boolean).join(", ")
  const kind = restaurant.type?.trim() || "restaurant"
  const sentences: string[] = [
    `${restaurant.name} is a ${kind} in ${place || "New York City"}.`,
  ]

  if (restaurant.inspection_grade && /^[ABC]$/.test(restaurant.inspection_grade)) {
    sentences.push(`NYC health grade ${restaurant.inspection_grade}.`)
  }

  const tags = parseDietaryTags(restaurant.dietary_tags).slice(0, 3).map(formatDietaryTag)
  if (tags.length > 0) {
    sentences.push(`Tagged ${tags.join(", ")}.`)
  }

  if (hasRating(restaurant.rating)) {
    const reviews =
      restaurant.reviews && restaurant.reviews > 0
        ? ` from ${restaurant.reviews.toLocaleString()} reviews`
        : ""
    sentences.push(`Rated ${restaurant.rating.toFixed(1)}/5${reviews}.`)
  }

  const price = formatPriceRange(restaurant.price_range ?? null)
  if (price) sentences.push(`${price}.`)
  if (restaurant.is_hidden_gem) sentences.push("Hidden gem.")

  let description = sentences.join(" ")
  if (description.length <= MAX_LENGTH) return description

  // Drop the least specific trailing facts first. Never invent replacements.
  const optional = new Set(["Hidden gem.", `${price}.`])
  description = sentences.filter((sentence) => !optional.has(sentence)).join(" ")
  if (description.length <= MAX_LENGTH) return description

  if (tags.length > 0) {
    description = sentences
      .filter((sentence) => !sentence.startsWith("Tagged ") && !optional.has(sentence))
      .join(" ")
    if (description.length <= MAX_LENGTH) return description
  }

  return clamp(sentences[0] + (restaurant.inspection_grade ? ` NYC health grade ${restaurant.inspection_grade}.` : ""))
}
