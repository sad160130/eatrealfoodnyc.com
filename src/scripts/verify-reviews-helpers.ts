/** One-off: verify reviews query helper + Review JSON-LD builders. */
import "dotenv/config"
import { getReviewsForRestaurant } from "../lib/reviews"
import { buildReviewSchema, buildReviewAggregateRating } from "../lib/schema"

async function main() {
  const slug = "chirping-chicken-upper"
  const summary = await getReviewsForRestaurant(slug, 15)

  console.log("=== Test 1: getReviewsForRestaurant ===")
  console.log("Has reviews:", summary.hasReviews)
  console.log("Total count:", summary.totalCount)
  console.log("Average stars:", summary.averageStars)
  console.log("Star breakdown:", JSON.stringify(summary.starBreakdown))
  console.log("Owner responses:", summary.ownerResponseCount)
  console.log("Reviews returned:", summary.reviews.length)
  console.log(
    "First reviewer:",
    summary.reviews[0]?.reviewerName,
    "—",
    summary.reviews[0]?.stars + "★"
  )
  console.log(
    "First review text (first 80 chars):",
    summary.reviews[0]?.text.slice(0, 80) + (summary.reviews[0]?.text.length > 80 ? "..." : "")
  )

  console.log("\n=== Test 2: buildReviewSchema + buildReviewAggregateRating ===")
  const reviewSchema = buildReviewSchema(summary.reviews)
  const agg = buildReviewAggregateRating(summary)
  console.log("Review schema objects:", reviewSchema.length)
  console.log("First review schema:")
  console.log(JSON.stringify(reviewSchema[0], null, 2))
  console.log("AggregateRating:")
  console.log(JSON.stringify(agg, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
