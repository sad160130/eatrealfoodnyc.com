import "dotenv/config"
import { prisma } from "../lib/db"

async function main() {
  const reviewed = await prisma.review.findMany({
    distinct: ["restaurant_slug"],
    select: { restaurant_slug: true },
  })
  const reviewedSet = new Set(reviewed.map((r) => r.restaurant_slug))

  const published = await prisma.restaurant.findMany({
    where: { is_published: true, business_status: "OPERATIONAL" },
    select: { slug: true, name: true, rating: true, reviews: true },
    orderBy: [{ priorityRank: "desc" }, { rating: "desc" }],
  })

  const noReviews = published.filter((r) => !reviewedSet.has(r.slug)).slice(0, 3)
  console.log("Published restaurants WITHOUT scraped reviews (first 3):")
  for (const r of noReviews) {
    console.log(`  ${r.slug.padEnd(40)} (${r.name} — Google rating ${r.rating}, ${r.reviews ?? 0} reviews)`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
