import type { RestaurantReview, ReviewsSummary } from "./reviews"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

export const FOUNDER_ROHAN = {
  "@type": "Person",
  "@id": `${SITE_URL}/#rohan-kadam`,
  name: "Rohan Kadam",
  jobTitle: "Founder & Marketing Lead",
  url: `${SITE_URL}/about/team`,
  sameAs: ["https://www.linkedin.com/in/rohan-kadam-176922204"],
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Mumbai" },
  worksFor: { "@id": `${SITE_URL}/#organization` },
}

export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Eat Real Food NYC",
  url: SITE_URL,
  logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, url: `${SITE_URL}/logo.png`, contentUrl: `${SITE_URL}/logo.png`, caption: "Eat Real Food NYC" },
  description: "NYC's most trusted healthy restaurant directory, built on verified NYC Department of Health inspection data.",
  foundingDate: "2026",
  founder: [FOUNDER_ROHAN],
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
  sameAs: [
    "https://www.instagram.com/nyc_healthyeats/",
    "https://www.youtube.com/@EatRealFoodNYC",
  ],
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

export function aggregateRatingFields(
  rating: number | null | undefined,
  reviewCount: number | null | undefined
) {
  if (rating == null || reviewCount == null || reviewCount < 1) return undefined
  return {
    "@type": "AggregateRating",
    ratingValue: rating,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  }
}

export function buildRestaurantSchema(restaurant: {
  name: string; slug: string; address: string; city?: string | null; state?: string | null;
  latitude: number | null; longitude: number | null;
  phone: string | null; website: string | null; type: string | null; rating: number | null;
  reviews: number | null; inspection_grade: string | null; inspection_score?: number | null;
  updated_at: string | Date;
}) {
  const additionalProperty = [
    ...(restaurant.inspection_grade
      ? [{ "@type": "PropertyValue" as const, name: "NYC Health Inspection Grade", value: restaurant.inspection_grade }]
      : []),
    ...(restaurant.inspection_score != null
      ? [{ "@type": "PropertyValue" as const, name: "NYC Health Inspection Score", value: restaurant.inspection_score }]
      : []),
  ]
  const aggregateRating = aggregateRatingFields(restaurant.rating, restaurant.reviews)
  return {
    "@type": "Restaurant",
    "@id": `${SITE_URL}/restaurants/${restaurant.slug}#restaurant`,
    name: restaurant.name,
    url: `${SITE_URL}/restaurants/${restaurant.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city || "New York",
      addressRegion: restaurant.state || "NY",
      addressCountry: "US",
    },
    ...(restaurant.latitude && restaurant.longitude && { geo: { "@type": "GeoCoordinates", latitude: restaurant.latitude, longitude: restaurant.longitude } }),
    ...(restaurant.phone && { telephone: restaurant.phone }),
    ...(restaurant.website && { sameAs: [restaurant.website] }),
    servesCuisine: restaurant.type ? [restaurant.type] : undefined,
    ...(aggregateRating && { aggregateRating }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
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
      const aggregateRating = aggregateRatingFields(restaurant.rating, restaurant.reviews)
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Restaurant",
          name: restaurant.name,
          url: `${input.siteUrl}/restaurants/${restaurant.slug}`,
          ...(aggregateRating && { aggregateRating }),
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

export function buildArticleSchema(guide: { title: string; slug: string; description: string; publishedDate: string }) {
  return {
    "@type": "Article",
    "@id": `${SITE_URL}/guides/${guide.slug}#article`,
    headline: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${guide.slug}`,
    datePublished: guide.publishedDate,
    dateModified: new Date().toISOString().split("T")[0],
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
      reviewBody: r.text.length > 500 ? r.text.slice(0, 497) + "..." : r.text,
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
