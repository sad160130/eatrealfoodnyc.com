import { prisma } from "./db"

export interface RestaurantReview {
  id: string
  stars: number
  reviewerName: string | null
  isLocalGuide: boolean
  publishedAt: Date | null
  publishedAgo: string | null
  likesCount: number
  text: string
  ownerResponse: string | null
  reviewUrl: string | null
}

export interface ReviewsSummary {
  reviews: RestaurantReview[]
  totalCount: number
  averageStars: number | null
  starBreakdown: Record<number, number> // { 5: 10, 4: 3, ... }
  ownerResponseCount: number
  hasReviews: boolean
}

/**
 * Fetch reviews for a single restaurant by slug.
 * Returns reviews sorted most-helpful first: by likes, then by recency.
 * Excludes empty-text reviews defensively.
 */
export async function getReviewsForRestaurant(
  slug: string,
  limit = 15
): Promise<ReviewsSummary> {
  const rows = await prisma.review.findMany({
    where: {
      restaurant_slug: slug,
      text: { not: "" },
    },
    orderBy: [{ likes_count: "desc" }, { published_at: "desc" }],
    take: limit,
  })

  if (rows.length === 0) {
    return {
      reviews: [],
      totalCount: 0,
      averageStars: null,
      starBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      ownerResponseCount: 0,
      hasReviews: false,
    }
  }

  // Aggregate across ALL reviews for this restaurant (not just the limited set)
  const allForAgg = await prisma.review.findMany({
    where: { restaurant_slug: slug, text: { not: "" } },
    select: { stars: true, owner_response: true },
  })

  const starBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let starSum = 0
  let ownerResponseCount = 0

  allForAgg.forEach((r) => {
    if (r.stars >= 1 && r.stars <= 5) {
      starBreakdown[r.stars]++
      starSum += r.stars
    }
    if (r.owner_response) ownerResponseCount++
  })

  const averageStars =
    allForAgg.length > 0
      ? Math.round((starSum / allForAgg.length) * 10) / 10
      : null

  return {
    reviews: rows.map((r) => ({
      id: r.id,
      stars: r.stars,
      reviewerName: r.reviewer_name,
      isLocalGuide: r.is_local_guide,
      publishedAt: r.published_at,
      publishedAgo: r.published_ago,
      likesCount: r.likes_count,
      text: r.text,
      ownerResponse: r.owner_response,
      reviewUrl: r.review_url,
    })),
    totalCount: allForAgg.length,
    averageStars,
    starBreakdown,
    ownerResponseCount,
    hasReviews: true,
  }
}

/**
 * Returns the set of slugs that have reviews — used to decide whether
 * to render the reviews section at all, and for static generation hints.
 */
export async function getSlugsWithReviews(): Promise<string[]> {
  const rows = await prisma.review.findMany({
    distinct: ["restaurant_slug"],
    select: { restaurant_slug: true },
  })
  return rows.map((r) => r.restaurant_slug)
}
