import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

interface RestaurantRow {
  name: string
  slug: string
  neighborhood: string | null
  borough: string | null
  type: string | null
  rating: number | null
  reviews: number | null
  inspection_grade: string | null
  dietary_tags: string | null
  photo?: string | null
  address?: string
}

const QUALIFYING_RATING = 4.5
const ELITE_RATING = 4.7

async function pullBestRatedRestaurants() {
  console.log("Building Best-Rated Restaurants Index dataset...\n")

  const BASE = {
    is_published: true,
    business_status: "OPERATIONAL",
    rating: { gte: QUALIFYING_RATING },
  }

  // ── SUMMARY STATS ─────────────────────────────────────────────
  const total = await prisma.restaurant.count({ where: BASE })

  const eliteCount = await prisma.restaurant.count({
    where: { ...BASE, rating: { gte: ELITE_RATING } },
  })

  const perfectFiveCount = await prisma.restaurant.count({
    where: { ...BASE, rating: 5.0 },
  })

  const withGradeA = await prisma.restaurant.count({
    where: { ...BASE, inspection_grade: "A" },
  })
  const withAnyGrade = await prisma.restaurant.count({
    where: { ...BASE, inspection_grade: { not: null } },
  })

  const ratingAgg = await prisma.restaurant.aggregate({
    where: BASE,
    _avg: { rating: true, reviews: true },
  })

  // ── BY BOROUGH ────────────────────────────────────────────────
  const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

  const byBorough = await Promise.all(
    boroughs.map(async (borough) => {
      const count = await prisma.restaurant.count({ where: { ...BASE, borough } })
      const elite = await prisma.restaurant.count({
        where: { ...BASE, borough, rating: { gte: ELITE_RATING } },
      })
      const gradeA = await prisma.restaurant.count({
        where: { ...BASE, borough, inspection_grade: "A" },
      })
      const avgR = await prisma.restaurant.aggregate({
        where: { ...BASE, borough },
        _avg: { rating: true },
      })
      const topRestaurant = await prisma.restaurant.findFirst({
        where: { ...BASE, borough },
        orderBy: [{ rating: "desc" }, { reviews: "desc" }],
        select: {
          name: true,
          slug: true,
          neighborhood: true,
          rating: true,
          reviews: true,
          inspection_grade: true,
          type: true,
          dietary_tags: true,
        },
      })
      return {
        borough,
        count,
        elite,
        elitePct: count > 0 ? Math.round((elite / count) * 100) : 0,
        gradeA,
        gradeAPct: count > 0 ? Math.round((gradeA / count) * 100) : 0,
        avgRating: avgR._avg.rating ? Math.round(avgR._avg.rating * 100) / 100 : null,
        topRestaurant,
      }
    })
  )

  // ── BY NEIGHBORHOOD (top 12 by best-rated count, min 3) ───────
  const neighborhoodGroups = await prisma.restaurant.groupBy({
    by: ["neighborhood", "borough"],
    where: { ...BASE, neighborhood: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 30,
  })
  const byNeighborhood = neighborhoodGroups
    .filter((n) => n._count.id >= 3)
    .slice(0, 12)
    .map((n) => ({
      neighborhood: n.neighborhood,
      borough: n.borough,
      count: n._count.id,
    }))

  // ── BY DIETARY TAG ────────────────────────────────────────────
  const tags = [
    "vegan",
    "vegetarian",
    "halal",
    "kosher",
    "gluten-free",
    "dairy-free",
    "keto",
    "whole-foods",
    "raw-food",
  ]
  const byTag = await Promise.all(
    tags.map(async (tag) => {
      const count = await prisma.restaurant.count({
        where: { ...BASE, dietary_tags: { contains: tag } },
      })
      return { tag, count }
    })
  )

  // ── FEATURED — top 5 per borough by rating, reviews tiebreak ──
  const featuredByBorough: Record<string, RestaurantRow[]> = {}
  for (const borough of boroughs) {
    const rows = await prisma.restaurant.findMany({
      where: { ...BASE, borough },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: 5,
      select: {
        name: true,
        slug: true,
        neighborhood: true,
        borough: true,
        type: true,
        rating: true,
        reviews: true,
        inspection_grade: true,
        dietary_tags: true,
        photo: true,
        address: true,
      },
    })
    featuredByBorough[borough] = rows
  }

  // ── PERFECT 5.0 (highest review-count first) ──────────────────
  const perfectScore = await prisma.restaurant.findMany({
    where: { ...BASE, rating: 5.0 },
    orderBy: { reviews: "desc" },
    take: 15,
    select: {
      name: true,
      slug: true,
      neighborhood: true,
      borough: true,
      type: true,
      rating: true,
      reviews: true,
      inspection_grade: true,
      dietary_tags: true,
    },
  })

  // ── ELITE TIER — rating >= 4.7, sorted by rating then reviews ─
  const eliteList = await prisma.restaurant.findMany({
    where: { ...BASE, rating: { gte: ELITE_RATING } },
    orderBy: [{ rating: "desc" }, { reviews: "desc" }],
    take: 25,
    select: {
      name: true,
      slug: true,
      neighborhood: true,
      borough: true,
      type: true,
      rating: true,
      reviews: true,
      inspection_grade: true,
      dietary_tags: true,
    },
  })

  // ── COMPILE ───────────────────────────────────────────────────
  const output = {
    generatedAt: new Date().toISOString(),
    reportDate: "May 2026",
    algorithm: {
      qualifyingRating: QUALIFYING_RATING,
      eliteRating: ELITE_RATING,
      status: "OPERATIONAL",
    },
    summary: {
      total,
      eliteCount,
      perfectScoreCount: perfectFiveCount,
      withGradeA,
      withAnyGrade,
      gradeAPct: total > 0 ? Math.round((withGradeA / total) * 100) : 0,
      gradedPct: total > 0 ? Math.round((withAnyGrade / total) * 100) : 0,
      avgRating: ratingAgg._avg.rating
        ? Math.round(ratingAgg._avg.rating * 100) / 100
        : null,
      avgReviews: ratingAgg._avg.reviews ? Math.round(ratingAgg._avg.reviews) : null,
    },
    byBorough,
    byNeighborhood,
    byTag: byTag.filter((t) => t.count > 0).sort((a, b) => b.count - a.count),
    featuredByBorough,
    perfectScore,
    eliteList,
  }

  const outputPath = path.join(process.cwd(), "src/data/best-rated-restaurants.json")
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log("=== BEST-RATED RESTAURANTS INDEX SUMMARY ===\n")
  console.log(
    `Qualifying threshold: rating ≥ ${QUALIFYING_RATING} · Elite threshold: rating ≥ ${ELITE_RATING}\n`
  )
  console.log(`Total best-rated restaurants: ${total}`)
  console.log(`Elite tier (rating ≥ ${ELITE_RATING}): ${eliteCount}`)
  console.log(`Perfect 5.0 rating: ${perfectFiveCount}`)
  console.log(`Average rating: ${output.summary.avgRating}`)
  console.log(`Average reviews: ${output.summary.avgReviews}`)
  console.log(
    `Grade A holders: ${withGradeA}${total > 0 ? ` (${output.summary.gradeAPct}% of qualifying)` : ""}`
  )
  console.log(`\nBy borough:`)
  byBorough.forEach((b) =>
    console.log(
      `  ${b.borough}: ${b.count} best-rated · ${b.elite} elite · avg ★${b.avgRating}${b.topRestaurant ? ` — top: ${b.topRestaurant.name} (★${b.topRestaurant.rating})` : ""}`
    )
  )
  console.log(`\nTop neighborhoods by best-rated count (min 3):`)
  byNeighborhood.slice(0, 6).forEach((n, i) =>
    console.log(`  ${i + 1}. ${n.neighborhood}, ${n.borough}: ${n.count} restaurants`)
  )
  console.log(`\nBest-rated by dietary tag:`)
  byTag
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .forEach((t) => console.log(`  ${t.tag}: ${t.count}`))
  console.log(`\nElite tier head (top 5):`)
  eliteList.slice(0, 5).forEach((r) =>
    console.log(
      `  ★${r.rating} ${r.name} (${r.neighborhood ?? "—"}, ${r.borough ?? "—"}) — ${r.reviews} reviews`
    )
  )
  console.log(`\n✅ Written to src/data/best-rated-restaurants.json`)

  await prisma.$disconnect()
}

pullBestRatedRestaurants().catch((err) => {
  console.error(err)
  process.exit(1)
})
