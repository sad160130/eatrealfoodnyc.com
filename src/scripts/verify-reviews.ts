/** One-off: Step 5 verification queries against the imported reviews. */
import "dotenv/config"
import { prisma } from "../lib/db"

async function main() {
  const [total, restaurants, byStars, withOwner, localGuides, sample] = await Promise.all([
    prisma.review.count(),
    prisma.review.findMany({
      distinct: ["restaurant_slug"],
      select: { restaurant_slug: true },
    }),
    prisma.review.groupBy({
      by: ["stars"],
      _count: { id: true },
      orderBy: { stars: "asc" },
    }),
    prisma.review.count({ where: { owner_response: { not: null } } }),
    prisma.review.count({ where: { is_local_guide: true } }),
    prisma.review.findFirst({
      where: { restaurant_slug: "chirping-chicken-upper" },
      select: { reviewer_name: true, stars: true, text: true },
    }),
  ])

  console.log("Total reviews:", total)
  console.log("Unique restaurants:", restaurants.length)
  console.log(
    "Star distribution:",
    byStars.map((s) => `${s.stars}★:${s._count.id}`).join(", ")
  )
  console.log("With owner response:", withOwner)
  console.log("Local guide reviews:", localGuides)
  console.log(
    "Sample review (chirping-chicken-upper):",
    sample?.reviewer_name,
    sample ? `${sample.stars}★` : "(none)"
  )
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
