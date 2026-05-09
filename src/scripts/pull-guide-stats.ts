import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// Import after env is loaded so DATABASE_URL is available
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

async function pullGuideStats() {
  console.log("Pulling statistics from database...\n")

  // ── GLOBAL STATS ──────────────────────────────────────────────
  const totalPublished = await prisma.restaurant.count({
    where: { is_published: true, business_status: "OPERATIONAL" },
  })

  const totalWithGrade = await prisma.restaurant.count({
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      inspection_grade: { not: null },
    },
  })

  const gradeACounts = await prisma.restaurant.groupBy({
    by: ["borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      inspection_grade: "A",
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const totalByBorough = await prisma.restaurant.groupBy({
    by: ["borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      borough: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  // Grade A rates by borough
  const boroughGradeAMap: Record<string, { total: number; gradeA: number; rate: number }> = {}
  totalByBorough.forEach((b) => {
    if (b.borough) {
      boroughGradeAMap[b.borough] = { total: b._count.id, gradeA: 0, rate: 0 }
    }
  })
  gradeACounts.forEach((b) => {
    if (b.borough && boroughGradeAMap[b.borough]) {
      boroughGradeAMap[b.borough].gradeA = b._count.id
      boroughGradeAMap[b.borough].rate = Math.round(
        (b._count.id / boroughGradeAMap[b.borough].total) * 100
      )
    }
  })

  // ── TOP NEIGHBORHOODS BY GRADE A RATE ─────────────────────────
  const neighborhoodTotals = await prisma.restaurant.groupBy({
    by: ["neighborhood", "borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      neighborhood: { not: null },
      borough: { not: null },
    },
    _count: { id: true },
  })

  const neighborhoodGradeA = await prisma.restaurant.groupBy({
    by: ["neighborhood", "borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      inspection_grade: "A",
      neighborhood: { not: null },
    },
    _count: { id: true },
  })

  const gradeAByHood: Record<string, number> = {}
  neighborhoodGradeA.forEach((n) => {
    if (n.neighborhood) gradeAByHood[n.neighborhood] = n._count.id
  })

  const neighborhoodRates = neighborhoodTotals
    .filter((n) => n._count.id >= 10)
    .map((n) => ({
      neighborhood: n.neighborhood!,
      borough: n.borough!,
      total: n._count.id,
      gradeA: gradeAByHood[n.neighborhood!] || 0,
      rate: Math.round(((gradeAByHood[n.neighborhood!] || 0) / n._count.id) * 100),
    }))
    .sort((a, b) => b.rate - a.rate)

  const topNeighborhoodsByGradeA = neighborhoodRates.slice(0, 10)
  const bottomNeighborhoodsByGradeA = neighborhoodRates.slice(-5).reverse()

  // ── HIDDEN GEMS ───────────────────────────────────────────────
  const totalHiddenGems = await prisma.restaurant.count({
    where: { is_published: true, business_status: "OPERATIONAL", is_hidden_gem: true },
  })

  const hiddenGemsByBorough = await prisma.restaurant.groupBy({
    by: ["borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      is_hidden_gem: true,
      borough: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const topNeighborhoodsByGems = await prisma.restaurant.groupBy({
    by: ["neighborhood", "borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      is_hidden_gem: true,
      neighborhood: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  })

  const hiddenGemGradeA = await prisma.restaurant.count({
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      is_hidden_gem: true,
      inspection_grade: "A",
    },
  })

  // ── DIETARY TAGS ──────────────────────────────────────────────
  const dietaryCounts: Record<string, number> = {}
  const dietaryTags = [
    "vegan",
    "vegetarian",
    "halal",
    "kosher",
    "gluten-free",
    "dairy-free",
    "keto",
    "paleo",
    "whole-foods",
    "low-calorie",
    "raw-food",
    "nut-free",
  ]

  for (const tag of dietaryTags) {
    dietaryCounts[tag] = await prisma.restaurant.count({
      where: {
        is_published: true,
        business_status: "OPERATIONAL",
        dietary_tags: { contains: tag },
      },
    })
  }

  // Dietary tag counts by borough
  const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]
  const dietaryByBorough: Record<string, Record<string, number>> = {}

  for (const borough of boroughs) {
    dietaryByBorough[borough] = {}
    for (const tag of dietaryTags) {
      dietaryByBorough[borough][tag] = await prisma.restaurant.count({
        where: {
          is_published: true,
          business_status: "OPERATIONAL",
          borough,
          dietary_tags: { contains: tag },
        },
      })
    }
  }

  // Top neighborhoods per dietary tag
  const topHoodsByTag: Record<
    string,
    Array<{ neighborhood: string; borough: string; count: number }>
  > = {}
  for (const tag of ["vegan", "halal", "kosher", "gluten-free"]) {
    const results = await prisma.restaurant.groupBy({
      by: ["neighborhood", "borough"],
      where: {
        is_published: true,
        business_status: "OPERATIONAL",
        dietary_tags: { contains: tag },
        neighborhood: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    })
    topHoodsByTag[tag] = results.map((r) => ({
      neighborhood: r.neighborhood!,
      borough: r.borough!,
      count: r._count.id,
    }))
  }

  // ── AVERAGE RATINGS ───────────────────────────────────────────
  const avgRatingByBorough = await prisma.restaurant.groupBy({
    by: ["borough"],
    where: {
      is_published: true,
      business_status: "OPERATIONAL",
      rating: { not: null },
      borough: { not: null },
    },
    _avg: { rating: true },
    orderBy: { _avg: { rating: "desc" } },
  })

  // ── COVERAGE STATS ────────────────────────────────────────────
  const totalUniqueNeighborhoods = await prisma.restaurant.findMany({
    distinct: ["neighborhood"],
    where: { is_published: true, neighborhood: { not: null } },
    select: { neighborhood: true },
  })

  const gradeACoverage = Math.round((totalWithGrade / totalPublished) * 100)

  // ── COMPILE ALL STATS ─────────────────────────────────────────
  const stats = {
    generatedAt: new Date().toISOString(),
    global: {
      totalPublished,
      totalWithGrade,
      gradeACoverage,
      totalUniqueNeighborhoods: totalUniqueNeighborhoods.length,
      totalHiddenGems,
      hiddenGemGradeA,
      boroughs: boroughGradeAMap,
      avgRatingByBorough: Object.fromEntries(
        avgRatingByBorough.map((b) => [
          b.borough,
          Math.round((b._avg.rating || 0) * 10) / 10,
        ])
      ),
    },
    neighborhoods: {
      topByGradeA: topNeighborhoodsByGradeA,
      bottomByGradeA: bottomNeighborhoodsByGradeA,
      topByHiddenGems: topNeighborhoodsByGems.map((n) => ({
        neighborhood: n.neighborhood,
        borough: n.borough,
        count: n._count.id,
      })),
    },
    hiddenGems: {
      total: totalHiddenGems,
      byBorough: Object.fromEntries(
        hiddenGemsByBorough.map((b) => [b.borough, b._count.id])
      ),
      topNeighborhoods: topNeighborhoodsByGems.map((n) => ({
        neighborhood: n.neighborhood,
        borough: n.borough,
        count: n._count.id,
      })),
      percentWithGradeA:
        totalHiddenGems > 0 ? Math.round((hiddenGemGradeA / totalHiddenGems) * 100) : 0,
    },
    dietary: {
      counts: dietaryCounts,
      byBorough: dietaryByBorough,
      topNeighborhoodsByTag: topHoodsByTag,
    },
  }

  // Write to JSON
  const outputPath = path.join(process.cwd(), "src/data/guide-stats.json")
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2))

  // Print summary
  console.log("=== GUIDE STATISTICS SUMMARY ===\n")
  console.log(`Total published restaurants: ${totalPublished.toLocaleString()}`)
  console.log(
    `Restaurants with health grade: ${totalWithGrade.toLocaleString()} (${gradeACoverage}%)`
  )
  console.log(`Total hidden gems: ${totalHiddenGems.toLocaleString()}`)
  console.log(`Unique neighborhoods: ${totalUniqueNeighborhoods.length}`)
  console.log(`\nGrade A rates by borough:`)
  Object.entries(boroughGradeAMap)
    .sort((a, b) => b[1].rate - a[1].rate)
    .forEach(([borough, data]) => {
      console.log(
        `  ${borough}: ${data.gradeA} Grade A of ${data.total} total (${data.rate}%)`
      )
    })
  console.log(`\nDietary tag counts:`)
  Object.entries(dietaryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count.toLocaleString()}`)
    })
  console.log(`\nTop 5 neighborhoods by Grade A rate (min 10 restaurants):`)
  topNeighborhoodsByGradeA.slice(0, 5).forEach((n, i) => {
    console.log(
      `  ${i + 1}. ${n.neighborhood}, ${n.borough}: ${n.rate}% (${n.gradeA}/${n.total})`
    )
  })
  console.log(`\nTop 5 neighborhoods for hidden gems:`)
  topNeighborhoodsByGems.slice(0, 5).forEach((n, i) => {
    console.log(`  ${i + 1}. ${n.neighborhood} (${n.borough}): ${n._count.id} hidden gems`)
  })
  console.log(`\n✅ Stats written to src/data/guide-stats.json`)

  await prisma.$disconnect()
}

pullGuideStats().catch((err) => {
  console.error(err)
  process.exit(1)
})
