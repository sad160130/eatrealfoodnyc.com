import Link from "next/link"
import { prisma } from "@/lib/db"
import { DIET_CONFIG, COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"
import { boroughToSlug, formatDietaryTag, neighborhoodToSlug } from "@/lib/utils"
import { getBuiltNeighborhoodHubs, hasBuiltHub } from "@/lib/neighborhood-hubs"

const BOROUGH_HUBS = [
  { label: "Healthy restaurants in Manhattan", href: "/nyc/manhattan/healthy-restaurants" },
  { label: "Healthy restaurants in Brooklyn", href: "/nyc/brooklyn/healthy-restaurants" },
  { label: "Healthy restaurants in Queens", href: "/nyc/queens/healthy-restaurants" },
  { label: "Healthy restaurants in the Bronx", href: "/nyc/bronx/healthy-restaurants" },
  { label: "Healthy restaurants in Staten Island", href: "/nyc/staten-island/healthy-restaurants" },
]

/**
 * In-body links from the grades guide into borough hubs, the neighborhood
 * hubs with the most published Grade A listings, and diet hubs.
 * Counts are queried from published rows. Neighborhoods without a hub are skipped.
 */
export default async function GradeHubLinks() {
  const [groups, hubs, diets] = await Promise.all([
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
      take: 24,
    }),
    getBuiltNeighborhoodHubs(),
    Promise.all(
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
    ),
  ])

  const places = groups.flatMap((group) => {
    if (!group.borough || !group.neighborhood || group._count.id < 1) return []
    if (!hasBuiltHub(hubs, group.borough, group.neighborhood)) return []
    const href = `/nyc/${boroughToSlug(group.borough)}/${neighborhoodToSlug(group.neighborhood)}/healthy-restaurants`
    return [{ name: group.neighborhood, borough: group.borough, count: group._count.id, href }]
  }).slice(0, 6)

  const taggedDiets = diets.filter((diet) => diet.count >= COMBO_MIN_RESTAURANTS)

  return (
    <section className="mb-16" id="look-up-by-borough">
      <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        Look up a grade by borough
      </h2>
      <p className="mb-4 text-lg leading-relaxed text-gray-700">
        Each borough hub lists the published restaurants in that borough and the grade on file.{" "}
        {BOROUGH_HUBS.map((borough, index) => (
          <span key={borough.href}>
            {index > 0 && (index === BOROUGH_HUBS.length - 1 ? ", and " : ", ")}
            <Link href={borough.href} className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              {borough.label}
            </Link>
          </span>
        ))}
        .
      </p>
      {places.length > 0 && (
        <p className="mb-4 text-lg leading-relaxed text-gray-700">
          These neighborhood hubs currently have the most published listings with a NYC DOHMH Grade A.{" "}
          {places.map((place, index) => (
            <span key={place.href}>
              {index > 0 && (index === places.length - 1 ? ", and " : ", ")}
              <Link href={place.href} className="font-medium text-jade underline underline-offset-2 hover:text-forest">
                Healthy restaurants in {place.name}, {place.borough}
              </Link>
              {" "}({place.count.toLocaleString("en-US")} Grade A)
            </span>
          ))}
          .
        </p>
      )}
      {taggedDiets.length > 0 && (
        <p className="text-lg leading-relaxed text-gray-700">
          Diet hubs only include restaurants tagged for that diet.{" "}
          {taggedDiets.map((diet, index) => (
            <span key={diet.tag}>
              {index > 0 && (index === taggedDiets.length - 1 ? ", and " : ", ")}
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
