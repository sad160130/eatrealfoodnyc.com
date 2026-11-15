import Link from "next/link"
import { prisma } from "@/lib/db"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import AboutThisData from "@/components/about-this-data"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"

export const revalidate = 86400

const title = buildPipeTitle("Healthy restaurants in NYC by diet", null)

export const metadata = pageMeta({
  path: "/healthy-restaurants",
  title,
  description:
    "Twelve dietary directories for New York City. Each hub lists published restaurants that carry that tag, with the NYC DOHMH inspection grade on the listing.",
})

export default async function HealthyRestaurantsIndexPage() {
  const tags = Object.entries(DIET_CONFIG)
  const counts = await Promise.all(
    tags.map(async ([tag]) => {
      const count = await prisma.restaurant.count({
        where: { ...PUBLISHED_LISTING_WHERE, dietary_tags: { contains: tag } },
      })
      return [tag, count] as const
    })
  )
  const countByTag = new Map(counts)

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb items={[{ label: "Healthy Restaurants" }]} />
          <p className="eyebrow mt-6">Dietary directories</p>
          <h1 className="display-1 mt-3">Healthy restaurants in NYC by diet</h1>
          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            Each diet hub lists published restaurants that carry that tag. A tag is applied only when the restaurant says so, or when the menu has substantial coverage. The inspection grade on each listing is the matched NYC DOHMH record.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map(([tag, config]) => {
            const count = countByTag.get(tag) ?? 0
            return (
              <li key={tag}>
                <Link
                  href={`/healthy-restaurants/${tag}`}
                  className="block h-full border p-5 transition-colors hover:border-jade"
                  style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}
                >
                  <p className="eyebrow" style={{ color: "var(--color-jade)" }}>{config.label}</p>
                  <p className="mt-2 text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-forest)" }}>
                    {config.label} restaurants in NYC
                  </p>
                  <p className="mt-2 text-sm tabular" style={{ color: "var(--color-muted)" }}>
                    {count.toLocaleString("en-US")} published {count === 1 ? "listing" : "listings"}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <AboutThisData variant="hub" />
      </div>
    </div>
  )
}
