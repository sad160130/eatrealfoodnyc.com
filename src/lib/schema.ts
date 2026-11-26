import type { RestaurantReview, ReviewsSummary } from "./reviews"
import { presentGrade } from "@/lib/grade-display"
import { stripReviewMarkup } from "@/lib/review-text"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Eat Real Food NYC",
  url: SITE_URL,
  logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, url: `${SITE_URL}/logo.png`, contentUrl: `${SITE_URL}/logo.png`, caption: "Eat Real Food NYC" },
  description: "A directory of healthy restaurants in New York City, with NYC Department of Health inspection grades when a record is matched.",
  foundingDate: "2026",
  areaServed: { "@type": "City", name: "New York City", address: { "@type": "PostalAddress", addressRegion: "NY", addressCountry: "US" } },
  knowsAbout: [
    "Healthy restaurants in New York City",
    "NYC restaurant health inspection grades",
    "Vegan restaurants NYC",
    "Halal restaurants NYC",
    "Gluten-free restaurants NYC",
    "Kosher restaurants NYC",
    "NYC Department of Health restaurant grading",
  ],
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "hello@eatrealfoodnyc.com" },
  sameAs: ["https://www.youtube.com/@EatRealFoodNYC"],
  founder: [
    { "@type": "Person", name: "Snket Desai" },
    { "@type": "Person", name: "Rohan Kadam" },
  ],
}

/** NYC Open Data terms that cover dataset 43nn-pn8j. */
export const NYC_OPEN_DATA_TERMS_URL = "https://www.nyc.gov/home/terms-of-use.page"

export const DOHMH_INSPECTION_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"

const DOHMH_ORG = {
  "@type": "Organization" as const,
  name: "NYC Department of Health and Mental Hygiene",
}

/**
 * Nested Dataset for isBasedOn. Google's Dataset rich result requires
 * description, and publisher must be Organization or Person.
 */
export function dohmhInspectionDataset(identifier?: string) {
  return {
    "@type": "Dataset" as const,
    name: "DOHMH New York City Restaurant Inspection Results",
    description:
      "Restaurant inspection results published by the NYC Department of Health and Mental Hygiene on NYC Open Data, including grades, scores, and violation records.",
    url: DOHMH_INSPECTION_DATASET_URL,
    license: NYC_OPEN_DATA_TERMS_URL,
    creator: DOHMH_ORG,
    publisher: DOHMH_ORG,
    ...(identifier ? { identifier } : {}),
  }
}

export const WEBSITE_SCHEMA = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Eat Real Food NYC",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
}

export const PUBLISHER_REF = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Eat Real Food NYC",
  url: SITE_URL,
}

export function stateCode(state: string | null | undefined): string {
  const value = (state ?? "").trim()
  if (!value || /^new york$/i.test(value) || value.toUpperCase() === "NY") return "NY"
  if (/^[A-Za-z]{2}$/.test(value)) return value.toUpperCase()
  return "NY"
}

function clockToken(token: string): string | null {
  const match = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (!match) return null
  let hour = Number(match[1])
  const minute = match[2] ?? "00"
  const meridiem = match[3].toUpperCase()
  if (hour < 1 || hour > 12 || Number(minute) > 59) return null
  if (meridiem === "AM") hour = hour === 12 ? 0 : hour
  else if (hour !== 12) hour += 12
  return `${String(hour).padStart(2, "0")}:${minute}`
}

export function openingHoursSpecification(raw: string | null | undefined) {
  if (!raw) return undefined
  let parsed: Record<string, string[]>
  try {
    parsed = JSON.parse(raw) as Record<string, string[]>
  } catch {
    return undefined
  }
  const specs: Array<{ "@type": "OpeningHoursSpecification"; dayOfWeek: string; opens: string; closes: string }> = []
  for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
    for (const range of parsed[day] ?? []) {
      const [openRaw, closeRaw] = range.split(/\s*[–-]\s*/)
      if (!openRaw || !closeRaw) continue
      const opens = clockToken(openRaw)
      const closes = clockToken(closeRaw)
      if (!opens || !closes) continue
      specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: day, opens, closes })
    }
  }
  return specs.length > 0 ? specs : undefined
}

export function buildRestaurantSchema(restaurant: {
  name: string; slug: string; address: string; city?: string | null; state?: string | null;
  latitude: number | null; longitude: number | null;
  phone: string | null; website: string | null; type: string | null; rating: number | null;
  reviews: number | null; inspection_grade: string | null; inspection_score?: number | null;
  inspection_date?: string | null;
  photo?: string | null;
  working_hours?: string | null;
  updated_at: string | Date;
}) {
  const gradeView = presentGrade(restaurant.inspection_grade)
  const hours = openingHoursSpecification(restaurant.working_hours)
  const additionalProperty = [
    { "@type": "PropertyValue" as const, name: "NYC Health Inspection Grade", value: gradeView.title },
    ...(restaurant.inspection_score != null
      ? [{ "@type": "PropertyValue" as const, name: "NYC Health Inspection Score", value: restaurant.inspection_score }]
      : []),
  ]
  return {
    "@type": "Restaurant",
    "@id": `${SITE_URL}/restaurants/${restaurant.slug}#restaurant`,
    name: restaurant.name,
    url: `${SITE_URL}/restaurants/${restaurant.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city || "New York",
      addressRegion: stateCode(restaurant.state),
      addressCountry: "US",
    },
    ...(restaurant.photo ? { image: restaurant.photo } : {}),
    ...(restaurant.latitude && restaurant.longitude && { geo: { "@type": "GeoCoordinates", latitude: restaurant.latitude, longitude: restaurant.longitude } }),
    ...(restaurant.phone && { telephone: restaurant.phone }),
    ...(restaurant.website && { sameAs: restaurant.website }),
    ...(hours ? { openingHoursSpecification: hours } : {}),
    servesCuisine: restaurant.type ? [restaurant.type] : ["Healthy food"],
    additionalProperty,
    publisher: PUBLISHER_REF,
    dateModified: new Date(restaurant.updated_at).toISOString(),
  }
}

export function buildHubItemList(input: {
  name: string
  description: string
  siteUrl: string
  restaurants: Array<{ name: string; slug: string; rating: number | null; reviews: number | null }>
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    description: input.description,
    numberOfItems: input.restaurants.length,
    itemListElement: input.restaurants.map((restaurant, index) => {
        return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Restaurant",
          name: restaurant.name,
          url: `${input.siteUrl}/restaurants/${restaurant.slug}`,
        },
      }
    }),
  }
}

export function buildBreadcrumbList(
  items: Array<{ name: string; path?: string }>,
  siteUrl: string = SITE_URL
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path && { item: `${siteUrl}${item.path}` }),
    })),
  }
}

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA],
  }
}

export function buildArticleSchema(guide: { title: string; slug: string; description: string; publishedDate: string; dateModified?: string }) {
  return {
    "@type": "Article",
    "@id": `${SITE_URL}/guides/${guide.slug}#article`,
    headline: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${guide.slug}`,
    datePublished: guide.publishedDate,
    dateModified: guide.dateModified ?? guide.publishedDate,
    author: PUBLISHER_REF,
    publisher: PUBLISHER_REF,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Eat Real Food NYC" },
  }
}

/**
 * Builds Review schema objects to nest inside the Restaurant schema.
 * This is what makes Google show star ratings + review snippets in SERPs
 * and captures review-intent queries.
 *
 * IMPORTANT: Only include real reviews. Never fabricate. AggregateRating
 * must reflect the actual review set on the page.
 */
export function buildReviewSchema(reviews: RestaurantReview[]) {
  return reviews
    .filter((r) => r.text && r.stars >= 1 && r.stars <= 5)
    .map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.stars,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        name: r.reviewerName || "Google user",
      },
      ...(r.publishedAt
        ? { datePublished: r.publishedAt.toISOString().split("T")[0] }
        : {}),
      reviewBody: (() => {
        const text = stripReviewMarkup(r.text)
        return text.length > 500 ? text.slice(0, 497) + "..." : text
      })(),
    }))
}

/**
 * Builds AggregateRating from the real review set on the page.
 * Use the Google-sourced rating/count when available; otherwise derive
 * from the reviews actually shown.
 */
export function buildReviewAggregateRating(summary: ReviewsSummary) {
  if (!summary.hasReviews || summary.averageStars === null) return null
  return {
    "@type": "AggregateRating",
    ratingValue: summary.averageStars,
    reviewCount: summary.totalCount,
    bestRating: 5,
    worstRating: 1,
  }
}
