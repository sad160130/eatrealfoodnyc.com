import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

const DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "halal",
  "kosher",
  "gluten-free",
  "dairy-free",
  "keto",
  "whole-foods",
  "low-calorie",
  "raw-food",
]

const DIETARY_LABELS: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  halal: "Halal",
  kosher: "Kosher",
  "gluten-free": "Gluten-Free",
  "dairy-free": "Dairy-Free",
  keto: "Keto",
  "whole-foods": "Whole Foods",
  "low-calorie": "Low Calorie",
  "raw-food": "Raw Food",
}

interface NeighborhoodScore {
  neighborhood: string
  borough: string
  total: number
  gradeA: number
  gradeARate: number
  hiddenGems: number
  avgRating: number | null
  topDietaryTag: string | null
  topDietaryLabel: string | null
  topDietaryCount: number
}

async function pullNeighborhoodScorecards() {
  console.log("Building neighborhood scorecards...\n")

  const scorecardsByBorough: Record<string, NeighborhoodScore[]> = {}

  for (const borough of BOROUGHS) {
    console.log(`Processing ${borough}...`)

    const neighborhoods = await prisma.restaurant.groupBy({
      by: ["neighborhood"],
      where: {
        borough,
        is_published: true,
        business_status: "OPERATIONAL",
        neighborhood: { not: null },
      },
      _count: { id: true },
      _avg: { rating: true },
      orderBy: { _count: { id: "desc" } },
    })

    const gradeACounts = await prisma.restaurant.groupBy({
      by: ["neighborhood"],
      where: {
        borough,
        is_published: true,
        business_status: "OPERATIONAL",
        inspection_grade: "A",
        neighborhood: { not: null },
      },
      _count: { id: true },
    })
    const gradeAMap: Record<string, number> = {}
    gradeACounts.forEach((n) => {
      if (n.neighborhood) gradeAMap[n.neighborhood] = n._count.id
    })

    const hiddenGemCounts = await prisma.restaurant.groupBy({
      by: ["neighborhood"],
      where: {
        borough,
        is_published: true,
        business_status: "OPERATIONAL",
        is_hidden_gem: true,
        neighborhood: { not: null },
      },
      _count: { id: true },
    })
    const hiddenGemMap: Record<string, number> = {}
    hiddenGemCounts.forEach((n) => {
      if (n.neighborhood) hiddenGemMap[n.neighborhood] = n._count.id
    })

    const dietaryCountsPerHood: Record<string, Record<string, number>> = {}
    for (const tag of DIETARY_TAGS) {
      const tagCounts = await prisma.restaurant.groupBy({
        by: ["neighborhood"],
        where: {
          borough,
          is_published: true,
          business_status: "OPERATIONAL",
          dietary_tags: { contains: tag },
          neighborhood: { not: null },
        },
        _count: { id: true },
      })
      tagCounts.forEach((n) => {
        if (n.neighborhood) {
          if (!dietaryCountsPerHood[n.neighborhood]) dietaryCountsPerHood[n.neighborhood] = {}
          dietaryCountsPerHood[n.neighborhood][tag] = n._count.id
        }
      })
    }

    const scorecards: NeighborhoodScore[] = neighborhoods.map((n) => {
      const neighborhood = n.neighborhood!
      const total = n._count.id
      const gradeA = gradeAMap[neighborhood] || 0
      const gradeARate = total > 0 ? Math.round((gradeA / total) * 100) : 0
      const hiddenGems = hiddenGemMap[neighborhood] || 0
      const avgRating = n._avg.rating ? Math.round(n._avg.rating * 10) / 10 : null

      const tagCounts = dietaryCountsPerHood[neighborhood] || {}
      const topTag = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .find(([, count]) => count > 0)

      return {
        neighborhood,
        borough,
        total,
        gradeA,
        gradeARate,
        hiddenGems,
        avgRating,
        topDietaryTag: topTag?.[0] ?? null,
        topDietaryLabel: topTag ? (DIETARY_LABELS[topTag[0]] ?? topTag[0]) : null,
        topDietaryCount: topTag?.[1] ?? 0,
      }
    })

    scorecardsByBorough[borough] = scorecards

    const topGradeA = [...scorecards].sort((a, b) => b.gradeARate - a.gradeARate)[0]
    const topGems = [...scorecards].sort((a, b) => b.hiddenGems - a.hiddenGems)[0]
    console.log(`  ${scorecards.length} neighborhoods found`)
    console.log(
      `  Top by Grade A: ${topGradeA?.neighborhood ?? "—"} (${topGradeA?.gradeARate ?? 0}%)`
    )
    console.log(
      `  Top by hidden gems: ${topGems?.neighborhood ?? "—"} (${topGems?.hiddenGems ?? 0} gems)`
    )
  }

  const outputPath = path.join(process.cwd(), "src/data/neighborhood-scorecards.json")
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(scorecardsByBorough, null, 2))

  console.log("\n✅ Neighborhood scorecards written to src/data/neighborhood-scorecards.json")
  console.log("\nSummary:")
  Object.entries(scorecardsByBorough).forEach(([borough, hoods]) => {
    console.log(`  ${borough}: ${hoods.length} neighborhoods`)
  })

  await prisma.$disconnect()
}

pullNeighborhoodScorecards().catch((err) => {
  console.error(err)
  process.exit(1)
})
