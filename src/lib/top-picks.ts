import { isExcludedFromRankedLists } from "@/config/listing-overrides"

/**
 * Curated Top-N modules on diet, borough, neighborhood, and diet+borough hubs.
 *
 * The full "All N restaurants" lists stay on the organic order
 * (priority rank, rating, review count). This helper is only for the
 * card modules. It does not read partner_status, rating values beyond
 * "is there a rating", or any paid field.
 *
 * Preferred, in the order given: Grade A with a community rating, and
 * ungraded listings that have a community rating. Ungraded means the
 * stored letter is not A, B, or C (blank, N, Z, P, or anything else).
 *
 * Fallback, only to fill `limit`, after every preferred listing, still
 * in the order given: Grade B, and listings with no rating. No rating
 * means `rating` is null or the review count is 0.
 *
 * Grade C is left out even when nothing else can fill the module.
 */

export interface TopPickListing {
  slug?: string | null
  inspection_grade?: string | null
  rating?: number | null
  reviews?: number | null
}

export const TOP_PICKS_EXPLAINER =
  "Ranked by grade, editorial priority, rating, and review depth. Grade C listings are not included in top picks."

function letterGrade(grade: string | null | undefined): "A" | "B" | "C" | null {
  const code = (grade ?? "").trim().toUpperCase()
  if (code === "A" || code === "B" || code === "C") return code
  return null
}

/** A community rating is a non-null score with at least one review. */
export function hasTopPickRating(listing: TopPickListing): boolean {
  return listing.rating != null && (listing.reviews ?? 0) > 0
}

function isPreferred(listing: TopPickListing): boolean {
  const grade = letterGrade(listing.inspection_grade)
  if (grade === "B" || grade === "C") return false
  return hasTopPickRating(listing)
}

export function selectTopPicks<T extends TopPickListing>(
  listings: readonly T[],
  limit: number
): T[] {
  if (limit <= 0) return []
  const preferred: T[] = []
  const fallback: T[] = []
  for (const listing of listings) {
    if (isExcludedFromRankedLists(listing.slug)) continue
    if (letterGrade(listing.inspection_grade) === "C") continue
    if (isPreferred(listing)) preferred.push(listing)
    else fallback.push(listing)
  }
  const picks: T[] = []
  for (const listing of preferred) {
    if (picks.length >= limit) return picks
    picks.push(listing)
  }
  for (const listing of fallback) {
    if (picks.length >= limit) return picks
    picks.push(listing)
  }
  return picks
}
