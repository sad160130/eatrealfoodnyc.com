/** One-off: confirm osteria-la-baia now has queryable reviews after batch 2. */
import "dotenv/config"
import { getReviewsForRestaurant } from "../lib/reviews"

async function main() {
  const summary = await getReviewsForRestaurant("osteria-la-baia", 15)
  console.log("Has reviews:", summary.hasReviews)
  console.log("Total:", summary.totalCount, "| Avg:", summary.averageStars)
  console.log(
    "First reviewer:",
    summary.reviews[0]?.reviewerName,
    summary.reviews[0]?.stars + "★"
  )
  console.log(
    "First review text (first 80 chars):",
    (summary.reviews[0]?.text || "").slice(0, 80) +
      ((summary.reviews[0]?.text || "").length > 80 ? "..." : "")
  )
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
