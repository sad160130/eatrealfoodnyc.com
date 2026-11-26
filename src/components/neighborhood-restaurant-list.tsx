import Link from "next/link"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { HubRecord } from "@/components/hub-record"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"
import { neighborhoodIndexPath } from "@/lib/restaurant-index"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import type { HubListingLine } from "@/lib/hub-record"

export default function NeighborhoodRestaurantList({
  borough,
  neighborhood,
  restaurants,
  page,
  pages,
  total,
  gradeA,
  gradeB,
  gradeC,
  updated,
  listings,
}: {
  borough: string
  neighborhood: string
  restaurants: Array<{ name: string; slug: string }>
  page: number
  pages: number
  total: number
  gradeA: number
  gradeB: number
  gradeC: number
  updated: Date | null
  listings: HubListingLine[]
}) {
  const boroughSlug = boroughToSlug(borough)
  const pageLinks = Array.from({ length: pages }, (_, index) => index + 1)
  const hubHref = total >= NEIGHBORHOOD_HUB_MIN_RESTAURANTS
    ? `/nyc/${boroughSlug}/${neighborhoodToSlug(neighborhood)}/healthy-restaurants`
    : null
  const faqs = [
    {
      question: `How many published restaurants are in ${neighborhood}?`,
      answer: `${total.toLocaleString("en-US")} published ${total === 1 ? "listing is" : "listings are"} in ${neighborhood}, ${borough}.`,
    },
    {
      question: `Where is the ${neighborhood} healthy-restaurant hub?`,
      answer: hubHref
        ? `The ${neighborhood} hub is the page of healthy restaurants in ${neighborhood}. This page is the full name list.`
        : `${neighborhood} does not have a separate healthy-restaurant hub. This page is the name list for its ${total.toLocaleString("en-US")} published ${total === 1 ? "listing" : "listings"}.`,
    },
  ]

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
          <HubRecord
            place={`${neighborhood}, ${borough}`}
            urlPath={neighborhoodIndexPath(borough, neighborhood, page)}
            total={total}
            gradeA={gradeA}
            gradeB={gradeB}
            gradeC={gradeC}
            updated={updated}
            mode="all"
            listings={listings}
          />
          <h2 className="h2-serif mt-8">How many published restaurants are in {neighborhood}?</h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
            {faqs[0].answer}{" "}
            {hubHref ? (
              <Link href={hubHref} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                Healthy restaurants in {neighborhood}
              </Link>
            ) : null}
            {hubHref ? " is the neighborhood hub." : ""}
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
        <section className="mt-12" aria-labelledby="neighborhood-index-faq">
          <h2 id="neighborhood-index-faq" className="h2-serif">Questions about this list</h2>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: { "@type": "Answer", text: faq.answer },
                })),
              }),
            }}
          />
          {faqs.map((faq) => (
            <div key={faq.question} className="mt-6">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-forest)" }}>{faq.question}</h3>
              <p className="mt-2 text-base leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </section>
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
