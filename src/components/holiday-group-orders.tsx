import Link from "next/link"
import { gradeABoroughPath, gradeANeighborhoodPath } from "@/lib/grade-a"
import {
  formatGoogleRating,
  HOLIDAY_GROUP_ORDER_HEADING,
  HOLIDAY_NEIGHBORHOODS_PER_BOROUGH,
  HOLIDAY_RESTAURANTS_PER_NEIGHBORHOOD,
  type HolidayGroupOrders,
} from "@/lib/holiday-catering"
import { boroughToSlug, parseDietaryTags, formatDietaryTag } from "@/lib/utils"
import { BOROUGH_MAP } from "@/config/boroughs"

const KNOWN_BOROUGHS = new Set(Object.values(BOROUGH_MAP))

function countLabel(count: number, noun: string): string {
  return `${count.toLocaleString("en-US")} ${noun}`
}

export default function HolidayGroupOrders({ groups }: { groups: HolidayGroupOrders }) {
  return (
    <section aria-labelledby="group-orders-heading">
      <h2 id="group-orders-heading" className="h2-serif">
        {HOLIDAY_GROUP_ORDER_HEADING}
      </h2>
      <p className="dek mt-4">
        {groups.total.toLocaleString("en-US")} published Grade A restaurants with a borough are grouped below.
        {groups.withoutBorough > 0
          ? ` ${groups.withoutBorough.toLocaleString("en-US")} published Grade A restaurants have no borough on file and are not listed.`
          : ""}{" "}
        The directory has no catering field. These are Grade A restaurants for group orders, not a catering menu.
        Cuisine is the Google Maps type. Inside a neighborhood, the order is Google rating, then review count.
        That order is not a ranking of who will cater a party. Each borough shows up to {HOLIDAY_NEIGHBORHOODS_PER_BOROUGH} neighborhoods,
        the ones with the most published Grade A restaurants. Each of those neighborhoods shows up to {HOLIDAY_RESTAURANTS_PER_NEIGHBORHOOD}.
      </p>
      {groups.boroughs.length === 0 ? (
        <p className="mt-6 text-base" style={{ color: "var(--color-text)" }}>
          No published Grade A restaurants with a borough are on file.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {groups.boroughs.map((borough) => {
            const boroughHref = KNOWN_BOROUGHS.has(borough.borough) ? gradeABoroughPath(borough.borough) : null
            return (
              <section key={borough.borough} aria-labelledby={`borough-${boroughToSlug(borough.borough)}`}>
                <h3 id={`borough-${boroughToSlug(borough.borough)}`} className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: "var(--color-forest)" }}>
                  {boroughHref ? (
                    <Link href={boroughHref} className="underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
                      Grade A restaurants in {borough.borough}
                    </Link>
                  ) : (
                    borough.borough
                  )}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  {countLabel(borough.gradeACount, borough.gradeACount === 1 ? "published Grade A restaurant" : "published Grade A restaurants")} in {borough.borough}.
                </p>
                <div className="mt-6 space-y-8">
                  {borough.neighborhoods.map((neighborhood) => {
                    const shown = neighborhood.restaurants.length
                    const neighborhoodHref = KNOWN_BOROUGHS.has(neighborhood.borough)
                      ? gradeANeighborhoodPath(neighborhood.borough, neighborhood.neighborhood)
                      : null
                    return (
                      <div key={`${neighborhood.borough}-${neighborhood.neighborhood}`}>
                        <h4 className="text-lg font-semibold" style={{ fontFamily: "Georgia, serif", color: "var(--color-forest)" }}>
                          {neighborhoodHref ? (
                            <Link href={neighborhoodHref} className="underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
                              Grade A restaurants in {neighborhood.neighborhood}
                            </Link>
                          ) : (
                            neighborhood.neighborhood
                          )}
                        </h4>
                        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                          {shown === neighborhood.gradeACount
                            ? `All ${neighborhood.gradeACount.toLocaleString("en-US")} published Grade A restaurants in ${neighborhood.neighborhood}.`
                            : `Showing ${shown.toLocaleString("en-US")} of ${neighborhood.gradeACount.toLocaleString("en-US")} published Grade A restaurants in ${neighborhood.neighborhood}.`}
                        </p>
                        <ul className="mt-3 divide-y" style={{ borderColor: "var(--hairline)" }}>
                          {neighborhood.restaurants.map((restaurant) => {
                            const tags = parseDietaryTags(restaurant.dietary_tags).slice(0, 3).map(formatDietaryTag)
                            const rating = formatGoogleRating(restaurant.rating, restaurant.reviews)
                            const cuisine = restaurant.type?.trim() || null
                            return (
                              <li key={restaurant.slug} className="flex gap-3 border-b py-3" style={{ borderColor: "var(--hairline)" }}>
                                <span className="plaque shrink-0" data-grade="A" aria-label="NYC Department of Health inspection grade A">
                                  <span aria-hidden="true">A</span>
                                </span>
                                <div className="min-w-0">
                                  <Link
                                    href={`/restaurants/${restaurant.slug}`}
                                    className="font-semibold underline-offset-4 hover:underline"
                                    style={{ color: "var(--color-jade)" }}
                                  >
                                    {restaurant.name}
                                  </Link>
                                  <p className="mt-0.5 text-sm" style={{ color: "var(--color-text)" }}>
                                    {[cuisine, neighborhood.neighborhood, neighborhood.borough].filter(Boolean).join(" · ")}
                                  </p>
                                  {rating ? (
                                    <p className="mt-0.5 text-sm tabular" style={{ color: "var(--color-muted)" }}>
                                      {rating}
                                    </p>
                                  ) : null}
                                  {tags.length > 0 ? (
                                    <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
                                      {tags.join(" · ")}
                                    </p>
                                  ) : null}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}
