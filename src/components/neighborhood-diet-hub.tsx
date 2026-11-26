import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import { COMBO_MIN_RESTAURANTS, DIET_CONFIG } from "@/config/dietary-tags"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import { buildHubItemList, dohmhInspectionDataset } from "@/lib/schema"
import { parseDietaryTags, boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import { formatAverageRating, roundAverage } from "@/lib/ratings"
import { withPartnerStatus } from "@/lib/partner-status-db"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import AboutThisData from "@/components/about-this-data"
import { formatMonthYear, latestInspectionDate } from "@/lib/inspection-dates"
import { HubRecord } from "@/components/hub-record"
import { hubStamp } from "@/lib/hub-record"
import {
  dietLabel,
  neighborhoodDietPath,
  type NeighborhoodDietTag,
} from "@/lib/neighborhood-diet"

const CARD_CAP = 48

export async function neighborhoodDietMetadata(input: {
  boroughName: string
  neighborhoodName: string
  tag: NeighborhoodDietTag
}) {
  const listed = await loadListed(input)
  if (listed.length < COMBO_MIN_RESTAURANTS) return { title: "Not Found" }
  const gradeA = listed.filter((row) => row.inspection_grade === "A").length
  const label = dietLabel(input.tag)
  const title = buildPipeTitle(
    `${label} restaurants in ${input.neighborhoodName}`,
    gradeA > 0 ? `${gradeA.toLocaleString("en-US")} Grade A` : null
  )
  const description = `${listed.length.toLocaleString("en-US")} published ${label.toLowerCase()} restaurants in ${input.neighborhoodName}, ${input.boroughName}. ${gradeA.toLocaleString("en-US")} hold a NYC DOHMH Grade A.`
  return pageMeta({
    path: neighborhoodDietPath(input.boroughName, input.neighborhoodName, input.tag),
    title,
    description,
  })
}

async function loadListed(input: {
  boroughName: string
  neighborhoodName: string
  tag: NeighborhoodDietTag
}) {
  const rows = await prisma.restaurant.findMany({
    where: {
      ...PUBLISHED_LISTING_WHERE,
      borough: input.boroughName,
      neighborhood: input.neighborhoodName,
      dietary_tags: { contains: input.tag },
    },
    orderBy: [{ rating: "desc" }, { reviews: "desc" }, { name: "asc" }],
  })
  return rows.filter((row) => parseDietaryTags(row.dietary_tags).includes(input.tag))
}

export async function NeighborhoodDietHub(input: {
  boroughName: string
  neighborhoodName: string
  tag: NeighborhoodDietTag
}) {
  const listed = await loadListed(input)
  if (listed.length < COMBO_MIN_RESTAURANTS) notFound()
  const [restaurants, boroughDietCount] = await Promise.all([
    withPartnerStatus(listed),
    prisma.restaurant.count({
      where: {
        ...PUBLISHED_LISTING_WHERE,
        borough: input.boroughName,
        dietary_tags: { contains: input.tag },
      },
    }),
  ])
  const label = dietLabel(input.tag)
  const config = DIET_CONFIG[input.tag]
  const gradeA = restaurants.filter((row) => row.inspection_grade === "A").length
  const rated = restaurants.filter((row) => (row.rating ?? 0) > 0)
  const avg = roundAverage(
    rated.length ? rated.reduce((sum, row) => sum + (row.rating ?? 0), 0) / rated.length : null
  )
  const latest = latestInspectionDate(restaurants.map((row) => row.inspection_date))
  const latestMonth = latest ? formatMonthYear(latest) : null
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const path = neighborhoodDietPath(input.boroughName, input.neighborhoodName, input.tag)
  const itemList = buildHubItemList({
    name: `${label} restaurants in ${input.neighborhoodName}`,
    description: `${restaurants.length} published ${label.toLowerCase()} restaurants in ${input.neighborhoodName}, ${input.boroughName}.`,
    siteUrl,
    restaurants: restaurants.slice(0, 10),
  })
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${label} restaurants in ${input.neighborhoodName}, ${input.boroughName}`,
    description: `Published restaurants in ${input.neighborhoodName} tagged ${label.toLowerCase()}, with matched NYC DOHMH grades.`,
    url: `${siteUrl}${path}`,
    creator: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: dohmhInspectionDataset(),
    spatialCoverage: { "@type": "Place", name: `${input.neighborhoodName}, ${input.boroughName}` },
    variableMeasured: [`${label} tag`, "NYC DOHMH inspection grade"],
  }
  const faqs = [
    {
      question: `How many ${label.toLowerCase()} restaurants are in ${input.neighborhoodName}?`,
      answer: `${restaurants.length.toLocaleString("en-US")} published restaurants in ${input.neighborhoodName} carry the ${label.toLowerCase()} tag. The tag is applied only when the restaurant identifies that way or has substantial menu coverage.`,
    },
    {
      question: `How many of those hold a NYC DOHMH Grade A?`,
      answer: `${gradeA.toLocaleString("en-US")} of the ${restaurants.length.toLocaleString("en-US")} hold Grade A. The letter is the matched city inspection grade.`,
    },
    {
      question: `What is the average rating of ${label.toLowerCase()} restaurants in ${input.neighborhoodName}?`,
      answer: avg != null
        ? `${rated.length.toLocaleString("en-US")} rated listings average ${formatAverageRating(avg)}. Unrated listings are left out of that average.`
        : "None of these listings has a community rating stored.",
    },
  ]

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([itemList, dataset]) }} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb
            items={[
              { label: input.boroughName, href: `/nyc/${boroughToSlug(input.boroughName)}/healthy-restaurants` },
              {
                label: input.neighborhoodName,
                href: `/nyc/${boroughToSlug(input.boroughName)}/${neighborhoodToSlug(input.neighborhoodName)}/healthy-restaurants`,
              },
              { label: `${label} restaurants` },
            ]}
          />
          <p className="eyebrow mt-6">{label} in {input.neighborhoodName}</p>
          <h1 className="display-1 mt-3">{label} restaurants in {input.neighborhoodName}</h1>
          <HubRecord
            place={`${input.neighborhoodName}, ${input.boroughName}`}
            urlPath={path}
            total={restaurants.length}
            gradeA={gradeA}
            updated={hubStamp(restaurants)}
            mode="diet"
            dietLabel={label}
          />
          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            {restaurants.length.toLocaleString("en-US")} published {label.toLowerCase()} restaurants in {input.neighborhoodName}, {input.boroughName}.{" "}
            {gradeA.toLocaleString("en-US")} hold a NYC DOHMH Grade A
            {latestMonth ? `, and the newest matched inspection month is ${latestMonth}` : ""}.{" "}
            {avg != null
              ? `The ${rated.length.toLocaleString("en-US")} rated listings average ${formatAverageRating(avg)}.`
              : "No community rating is stored on these listings."}{" "}
            {config.whatIs}
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.slice(0, CARD_CAP).map((restaurant) => (
            <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
        {restaurants.length > CARD_CAP && (
          <ul className="mt-8 space-y-2">
            {restaurants.slice(CARD_CAP).map((restaurant) => (
              <li key={restaurant.slug}>
                <Link href={`/restaurants/${restaurant.slug}`} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                  {restaurant.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-10 text-sm">
          <Link href={`/nyc/${boroughToSlug(input.boroughName)}/${neighborhoodToSlug(input.neighborhoodName)}/healthy-restaurants`} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            Healthy restaurants in {input.neighborhoodName}
          </Link>
          <span className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
          {boroughDietCount >= COMBO_MIN_RESTAURANTS && (
            <>
              <Link href={`/nyc/${boroughToSlug(input.boroughName)}/${input.tag}-restaurants`} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                {label} restaurants in {input.boroughName}
              </Link>
              <span className="mx-2" style={{ color: "var(--color-muted)" }}>·</span>
            </>
          )}
          <Link href={`/healthy-restaurants/${input.tag}`} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            {label} restaurants in NYC
          </Link>
        </p>
      </section>
      <FAQSection faqs={faqs} heading={`${label} restaurants in ${input.neighborhoodName}`} />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <AboutThisData variant="hub" restaurantCount={restaurants.length} gradeACount={gradeA} dietaryTag={label} dietaryCount={restaurants.length} borough={input.boroughName} />
      </div>
    </div>
  )
}
