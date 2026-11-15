import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"
import { roundAverage } from "@/lib/ratings"

export async function GET() {
  try {
    const publishedWhere = {
      business_status: "OPERATIONAL" as const,
      is_published: true,
      neighborhood: { not: null },
      borough: { not: null },
    }
    const [neighborhoods, ratedNeighborhoods] = await Promise.all([
      prisma.restaurant.groupBy({
        by: ["neighborhood", "borough"],
        where: publishedWhere,
        _count: { id: true },
      }),
      prisma.restaurant.groupBy({
        by: ["neighborhood", "borough"],
        where: { ...publishedWhere, rating: { gt: 0 } },
        _avg: { rating: true },
      }),
    ])
    const avgByHood = new Map(
      ratedNeighborhoods.map((row) => [
        `${row.borough}::${row.neighborhood}`,
        roundAverage(row._avg.rating),
      ])
    )

    const enriched = await Promise.all(
      neighborhoods
        .filter(
          (n: typeof neighborhoods[number]) =>
            n.neighborhood && n.borough && n._count.id >= NEIGHBORHOOD_HUB_MIN_RESTAURANTS
        )
        .map(async (n: typeof neighborhoods[number]) => {
          const [gradeA, hiddenGems, dietaryData] = await Promise.all([
            prisma.restaurant.count({
              where: {
                neighborhood: n.neighborhood,
                borough: n.borough,
                business_status: "OPERATIONAL",
                is_published: true,
                inspection_grade: "A",
              },
            }),
            prisma.restaurant.count({
              where: {
                neighborhood: n.neighborhood,
                borough: n.borough,
                business_status: "OPERATIONAL",
                is_published: true,
                is_hidden_gem: true,
              },
            }),
            prisma.$queryRaw<Array<{ tag: string; count: bigint }>>`
              SELECT
                unnest(string_to_array(dietary_tags, '|')) as tag,
                count(*) as count
              FROM restaurants
              WHERE neighborhood = ${n.neighborhood}
                AND borough = ${n.borough}
                AND business_status = 'OPERATIONAL'
                AND is_published = true
                AND dietary_tags IS NOT NULL
                AND dietary_tags != ''
              GROUP BY tag
              ORDER BY count DESC
              LIMIT 1
            `,
          ])

          const total = n._count.id
          const gradeAPercent = total > 0 ? Math.round((gradeA / total) * 100) : 0
          const avgRating = avgByHood.get(`${n.borough}::${n.neighborhood}`) ?? null
          const topTag = dietaryData.length > 0 ? dietaryData[0].tag : null

          const healthScore = Math.round(
            gradeAPercent * 0.4 +
              (avgRating ? (avgRating / 5) * 100 * 0.3 : 0) +
              Math.min(total / 50, 1) * 100 * 0.2 +
              Math.min(hiddenGems / 5, 1) * 100 * 0.1
          )

          return {
            neighborhood: n.neighborhood!,
            borough: n.borough!,
            totalRestaurants: total,
            avgRating,
            gradeACount: gradeA,
            gradeAPercent,
            hiddenGems,
            topDietaryTag: topTag,
            healthScore,
          }
        })
    )

    const sorted = enriched.sort((a: { healthScore: number }, b: { healthScore: number }) => b.healthScore - a.healthScore)

    return NextResponse.json({ neighborhoods: sorted })
  } catch (error) {
    console.error("Neighborhood stats error:", error)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
