import Link from "next/link"
import { prisma } from "@/lib/db"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { boroughToSlug, formatDietaryTag, neighborhoodToSlug } from "@/lib/utils"
import { getBuiltNeighborhoodHubs, hasBuiltHub } from "@/lib/neighborhood-hubs"
import { neighborhoodIndexPath } from "@/lib/restaurant-index"

/**
 * In-body links from the grades guide into neighborhood and diet hubs.
 * Counts are queried from published rows. A neighborhood without a hub
 * falls through to its plain restaurant list.
 */
export default async function GradeHubLinks() {
  const [groups, hubs] = await Promise.all([
    prisma.restaurant.groupBy({
      by: ["borough", "neighborhood"],
      where: {
        is_published: true,
        business_status: "OPERATIONAL",
        inspection_grade: "A",
        borough: { not: null },
        neighborhood: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    getBuiltNeighborhoodHubs(),
  ])

  const places = groups.flatMap((group) => {
    if (!group.borough || !group.neighborhood || group._count.id < 1) return []
    const hub = hasBuiltHub(hubs, group.borough, group.neighborhood)
    const href = hub
      ? `/nyc/${boroughToSlug(group.borough)}/${neighborhoodToSlug(group.neighborhood)}/healthy-restaurants`
      : neighborhoodIndexPath(group.borough, group.neighborhood)
    return [{ name: group.neighborhood, count: group._count.id, href }]
  })

  const diets = (
    await Promise.all(
      Object.entries(DIET_CONFIG).map(async ([tag, config]) => {
        const count = await prisma.restaurant.count({
          where: {
            is_published: true,
            business_status: "OPERATIONAL",
            dietary_tags: { contains: tag },
          },
        })
        return { tag, label: config.label, count }
      })
    )
  ).filter((diet) => diet.count > 0)

  if (places.length === 0 && diets.length === 0) return null

  return (
    <section className="mb-16" id="where-grades-cluster">
      <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        Where Grade A listings cluster
      </h2>
      {places.length > 0 && (
        <p className="mb-4 text-lg leading-relaxed text-gray-700">
          These neighborhoods currently have the most published listings with a NYC DOHMH Grade A.{" "}
          {places.map((place, index) => (
            <span key={place.href}>
              {index > 0 && (index === places.length - 1 ? ", and " : ", ")}
              <Link href={place.href} className="font-medium text-jade underline underline-offset-2 hover:text-forest">
                Grade A restaurants in {place.name}
              </Link>
              {" "}({place.count.toLocaleString("en-US")})
            </span>
          ))}
          .
        </p>
      )}
      {diets.length > 0 && (
        <p className="text-lg leading-relaxed text-gray-700">
          Diet hubs only include restaurants tagged for that diet.{" "}
          {diets.map((diet, index) => (
            <span key={diet.tag}>
              {index > 0 && (index === diets.length - 1 ? ", and " : ", ")}
              <Link
                href={`/healthy-restaurants/${diet.tag}`}
                className="font-medium text-jade underline underline-offset-2 hover:text-forest"
              >
                {formatDietaryTag(diet.tag).toLowerCase()} restaurants in NYC
              </Link>
              {" "}({diet.count.toLocaleString("en-US")})
            </span>
          ))}
          .
        </p>
      )}
    </section>
  )
}
