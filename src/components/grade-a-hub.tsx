import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle, gradeAPageDescription, gradeAPagedTitle } from "@/lib/seo-titles"
import { buildHubItemList, dohmhInspectionDataset } from "@/lib/schema"
import { withPartnerStatus } from "@/lib/partner-status-db"
import RestaurantCard from "@/components/restaurant-card"
import FAQSection from "@/components/faq-section"
import TopicalBreadcrumb from "@/components/topical-breadcrumb"
import AboutThisData from "@/components/about-this-data"
import {
  GRADE_A_MIN,
  GRADE_A_PAGE_SIZE,
  GRADE_A_WHERE,
  countGradeA,
  gradeABoroughCounts,
  gradeABoroughPath,
  gradeACityPath,
  gradeANeighborhoodPath,
  gradeAPageCount,
  latestGradeAMonth,
} from "@/lib/grade-a"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import { HubRecord } from "@/components/hub-record"
import { hubStamp } from "@/lib/hub-record"

export interface GradeAScope {
  boroughName?: string
  neighborhoodName?: string
  page: number
}

function placeLabel(scope: GradeAScope) {
  if (scope.neighborhoodName) return scope.neighborhoodName
  if (scope.boroughName) return scope.boroughName
  return "New York City"
}

function pathFor(scope: GradeAScope, page = scope.page) {
  if (scope.boroughName && scope.neighborhoodName) {
    return gradeANeighborhoodPath(scope.boroughName, scope.neighborhoodName, page)
  }
  if (scope.boroughName) return gradeABoroughPath(scope.boroughName, page)
  return gradeACityPath(page)
}

function keyword(scope: GradeAScope) {
  if (scope.boroughName || scope.neighborhoodName) return `Grade A Restaurants in ${placeLabel(scope)}`
  return "Grade A Restaurants NYC"
}

export async function gradeAMetadata(scope: GradeAScope) {
  const total = await countGradeA({
    borough: scope.boroughName,
    neighborhood: scope.neighborhoodName,
  })
  if (scope.page > 1 && (scope.page > gradeAPageCount(total) || total < (scope.boroughName ? GRADE_A_MIN : 1))) {
    return { title: "Not Found" }
  }
  const pages = gradeAPageCount(total)
  const benefit = scope.page > 1 ? null : total > 0 ? `${total.toLocaleString("en-US")} listed` : null
  const title = scope.page > 1 ? gradeAPagedTitle(placeLabel(scope), scope.page) : buildPipeTitle(keyword(scope), benefit)
  const description = gradeAPageDescription({
    total,
    place: placeLabel(scope),
    page: scope.page,
    pages,
  })
  return pageMeta({ path: pathFor(scope), title, description, index: scope.page <= 1 })
}

export async function GradeAHub({ scope }: { scope: GradeAScope }) {
  if (!Number.isInteger(scope.page) || scope.page < 1) notFound()
  const where = {
    ...GRADE_A_WHERE,
    ...(scope.boroughName ? { borough: scope.boroughName } : {}),
    ...(scope.neighborhoodName ? { neighborhood: scope.neighborhoodName } : {}),
  }
  const total = await countGradeA({
    borough: scope.boroughName,
    neighborhood: scope.neighborhoodName,
  })
  const floor = scope.boroughName || scope.neighborhoodName ? GRADE_A_MIN : 1
  if (total < floor) notFound()
  const pages = gradeAPageCount(total)
  if (scope.page > pages) notFound()

  const [rows, latestMonth, boroughs, dated] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      orderBy: [{ rating: "desc" }, { reviews: "desc" }, { name: "asc" }],
      skip: (scope.page - 1) * GRADE_A_PAGE_SIZE,
      take: GRADE_A_PAGE_SIZE,
    }),
    latestGradeAMonth({ borough: scope.boroughName, neighborhood: scope.neighborhoodName }),
    scope.boroughName ? Promise.resolve([]) : gradeABoroughCounts(),
    prisma.restaurant.findMany({
      where,
      select: { inspection_date: true, updated_at: true },
    }),
  ])
  const restaurants = await withPartnerStatus(rows)
  const place = placeLabel(scope)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
  const itemList = buildHubItemList({
    name: `Grade A restaurants in ${place}`,
    description: `${total.toLocaleString("en-US")} published operational restaurants in ${place} with NYC DOHMH Grade A.`,
    siteUrl,
    restaurants: restaurants.slice(0, 10),
  })
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Grade A restaurants in ${place}`,
    description: `Published restaurants in ${place} whose matched NYC DOHMH inspection grade is A.`,
    url: `${siteUrl}${pathFor({ ...scope, page: 1 })}`,
    creator: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: dohmhInspectionDataset(),
    spatialCoverage: { "@type": "Place", name: place },
    variableMeasured: ["NYC DOHMH inspection grade", "Inspection date"],
  }
  const faqs = [
    {
      question: `How many Grade A restaurants are in ${place}?`,
      answer: `${total.toLocaleString("en-US")} published operational restaurants in ${place} currently hold Grade A. The letter is the matched NYC DOHMH grade, not a score we assign.`,
    },
    {
      question: "What does a NYC DOHMH Grade A mean?",
      answer: "Grade A means fewer than 14 points on the initial inspection or the reinspection. The letter is issued by the NYC Department of Health and Mental Hygiene. A fuller explanation is on the health grades guide.",
    },
    {
      question: `When was the latest matched inspection for these ${place} listings?`,
      answer: latestMonth
        ? `The newest matched inspection date among these Grade A listings is ${latestMonth}.`
        : "No inspection date is stored on these Grade A listings.",
    },
  ]
  const crumbs = [
    ...(scope.boroughName
      ? [{ label: scope.boroughName, href: `/nyc/${boroughToSlug(scope.boroughName)}/healthy-restaurants` }]
      : []),
    ...(scope.boroughName && scope.neighborhoodName
      ? [{
          label: scope.neighborhoodName,
          href: `/nyc/${boroughToSlug(scope.boroughName)}/${neighborhoodToSlug(scope.neighborhoodName)}/healthy-restaurants`,
        }]
      : []),
    { label: "Grade A" },
  ]

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([itemList, dataset]) }} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
          <TopicalBreadcrumb items={crumbs} />
          <p className="eyebrow mt-6">NYC DOHMH Grade A</p>
          <h1 className="display-1 mt-3">Grade A restaurants in {place}</h1>
          <HubRecord
            place={place}
            urlPath={pathFor({ ...scope, page: scope.page })}
            total={total}
            gradeA={total}
            updated={hubStamp(dated)}
            mode="grade-a"
          />
          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>
            {total.toLocaleString("en-US")} published restaurants in {place} hold Grade A.
            The grade is the official NYC Department of Health and Mental Hygiene letter on the matched inspection
            {latestMonth ? `, and the newest matched inspection month is ${latestMonth}` : ""}.
            A blank, pending, or ungraded record is not listed here.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
        {pages > 1 && (
          <nav className="mt-10 flex items-center justify-between text-sm" aria-label="Grade A pages">
            {scope.page > 1 ? (
              <Link href={pathFor(scope, scope.page - 1)} className="font-semibold text-jade">Previous</Link>
            ) : <span />}
            <span className="tabular" style={{ color: "var(--color-muted)" }}>Page {scope.page} of {pages}</span>
            {scope.page < pages ? (
              <Link href={pathFor(scope, scope.page + 1)} className="font-semibold text-jade">Next</Link>
            ) : <span />}
          </nav>
        )}
        {!scope.boroughName && boroughs.length > 0 && (
          <div className="mt-12">
            <h2 className="h2-serif">Grade A by borough</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {boroughs.map((row) => (
                <li key={row.borough}>
                  <Link href={gradeABoroughPath(row.borough)} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                    Grade A restaurants in {row.borough} ({row.count.toLocaleString("en-US")})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {scope.boroughName && (
          <p className="mt-10 text-sm">
            <Link href={gradeACityPath()} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
              Grade A restaurants in New York City
            </Link>
          </p>
        )}
      </section>
      <FAQSection faqs={faqs} heading={`Grade A restaurants in ${place}`} />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <AboutThisData variant="hub" restaurantCount={total} gradeACount={total} />
      </div>
    </div>
  )
}
