import Link from "next/link"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { neighborhoodIndexPath } from "@/lib/restaurant-index"
import { boroughToSlug } from "@/lib/utils"

export default function NeighborhoodRestaurantList({
  borough,
  neighborhood,
  restaurants,
  page,
  pages,
  total,
}: {
  borough: string
  neighborhood: string
  restaurants: Array<{ name: string; slug: string }>
  page: number
  pages: number
  total: number
}) {
  const boroughSlug = boroughToSlug(borough)
  const pageLinks = Array.from({ length: pages }, (_, index) => index + 1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd
        items={[
          { name: borough, path: `/nyc/${boroughSlug}/healthy-restaurants` },
          { name: page === 1 ? `All restaurants in ${neighborhood}` : `All restaurants in ${neighborhood}, page ${page}`, path: neighborhoodIndexPath(borough, neighborhood, page) },
        ]}
      />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-8">
          <p className="eyebrow">{borough}</p>
          <h1 className="display-1 mt-3">All restaurants in {neighborhood}</h1>
          <p className="dek mt-4">
            {total.toLocaleString("en-US")} published {total === 1 ? "listing" : "listings"}.
            {pages > 1 ? ` Page ${page} of ${pages}.` : ""}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <ul className="space-y-2">
          {restaurants.map((restaurant) => (
            <li key={restaurant.slug}>
              <Link href={`/restaurants/${restaurant.slug}`} className="text-lg hover:underline" style={{ color: "var(--color-jade)" }}>
                {restaurant.name}
              </Link>
            </li>
          ))}
        </ul>
        {pages > 1 && (
          <nav className="mt-10 flex flex-wrap gap-3 text-sm" aria-label="Pagination">
            {pageLinks.map((number) => (
              <Link
                key={number}
                href={neighborhoodIndexPath(borough, neighborhood, number)}
                aria-current={number === page ? "page" : undefined}
                className="underline underline-offset-2"
                style={{ color: number === page ? "var(--color-forest)" : "var(--color-jade)", fontWeight: number === page ? 700 : 500 }}
              >
                Page {number}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
