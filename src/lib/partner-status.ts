/**
 * Partner and sponsor placements are advertising.
 *
 * `partner_status` must never change:
 * - rating or review count
 * - inspection_grade or inspection_score
 * - Health Score (computeHealthScore does not read this field)
 * - dietary_tags
 * - is_hidden_gem
 * - default or organic sort order
 *
 * Organic listing order is priority rank, then rating, then review count.
 * Search text-rank and distance sorts also ignore partner status.
 */

export const PARTNER_STATUSES = ["partner", "sponsored"] as const

export type PartnerStatus = (typeof PARTNER_STATUSES)[number]

/** Fields that may determine organic order. `partner_status` is absent on purpose. */
export const ORGANIC_SORT_KEYS = ["priorityRank", "rating", "reviews"] as const

export function isPartnerStatus(
  value: string | null | undefined
): value is PartnerStatus {
  return value === "partner" || value === "sponsored"
}

/**
 * rel for an outbound link. Partner and sponsor links are sponsored.
 * Every other outbound link stays a normal external link.
 */
export function partnerLinkRel(
  status: string | null | undefined
): "sponsored noopener noreferrer" | "noopener noreferrer" {
  return isPartnerStatus(status)
    ? "sponsored noopener noreferrer"
    : "noopener noreferrer"
}

export function partnerLabelText(status: PartnerStatus): "Partner" | "Sponsored" {
  return status === "sponsored" ? "Sponsored" : "Partner"
}

/**
 * The only inputs organic ranking may use. Partner status is dropped so two
 * listings that differ only by payment compare as equal.
 */
export function organicRankKey(restaurant: {
  priorityRank?: number | null
  rating: number | null
  reviews: number | null
  partner_status?: string | null
}): { priorityRank: number; rating: number | null; reviews: number } {
  return {
    priorityRank: restaurant.priorityRank ?? 0,
    rating: restaurant.rating,
    reviews: restaurant.reviews ?? 0,
  }
}
