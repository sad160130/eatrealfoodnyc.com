import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { buildPipeTitle, withBrand } from "@/lib/seo-titles"
import { groupIndex, loadPublishedIndex, neighborhoodIndexPath, pageCount } from "@/lib/restaurant-index"
import { boroughToSlug } from "@/lib/utils"

const title = buildPipeTitle("NYC Restaurant Sitemap", null)

export const metadata: Metadata = {
  title,
  description: "Every published restaurant in the Eat Real Food NYC directory, grouped by borough and neighborhood.",
  alternates: { canonical: getCanonicalUrl("/html-sitemap") },
  openGraph: { title: withBrand(title), type: "website" },
  robots: { index: true, follow: true },
}

export const revalidate = 86400

export default async function HtmlSitemapPage() {
  const grouped = groupIndex(await loadPublishedIndex())
  const boroughs = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "HTML sitemap", path: "/html-sitemap" }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-8">
          <p className="eyebrow">Directory</p>
          <h1 className="display-1 mt-3">All published restaurants</h1>
          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            Borough, then neighborhood, then each restaurant. Every listing below is a plain link.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        {boroughs.map(([borough, neighborhoods]) => (
          <section key={borough}>
            <h2 className="h2-serif">
              <Link href={`/nyc/${boroughToSlug(borough)}/healthy-restaurants`} className="underline-offset-2 hover:underline" style={{ color: "var(--color-jade)" }}>
                {borough}
              </Link>
            </h2>
            {[...neighborhoods.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([neighborhood, restaurants]) => {
              const pages = pageCount(restaurants.length)
              return (
                <div key={neighborhood} className="mt-6">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "Georgia, serif", color: "var(--color-forest)" }}>
                    <Link href={neighborhoodIndexPath(borough, neighborhood)} style={{ color: "var(--color-jade)" }}>
                      All restaurants in {neighborhood}
                    </Link>
                    {pages > 1 && (
                      <span className="ml-3 text-sm font-normal" style={{ color: "var(--color-muted)" }}>
                        {Array.from({ length: pages }, (_, index) => (
                          <Link key={index + 1} href={neighborhoodIndexPath(borough, neighborhood, index + 1)} className="mr-2 underline">
                            Page {index + 1}
                          </Link>
                        ))}
                      </span>
                    )}
                  </h3>
                  <ul className="mt-2 columns-1 sm:columns-2 lg:columns-3">
                    {restaurants.map((restaurant) => (
                      <li key={restaurant.slug} className="py-0.5" style={{ breakInside: "avoid" }}>
                        <Link href={`/restaurants/${restaurant.slug}`} className="text-sm hover:underline" style={{ color: "var(--color-text)" }}>
                          {restaurant.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
