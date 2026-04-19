const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Eat Real Food NYC",
  url: SITE_URL,
  description: "NYC's most trusted healthy restaurant directory, built on verified NYC Department of Health inspection data.",
  foundingDate: "2026",
  areaServed: { "@type": "City", name: "New York City", addressRegion: "NY", addressCountry: "US" },
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
  "@context": "https://schema.org",
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

export function buildRestaurantSchema(restaurant: {
  name: string; slug: string; address: string; latitude: number | null; longitude: number | null;
  phone: string | null; website: string | null; type: string | null; rating: number | null;
  reviews: number | null; inspection_grade: string | null; updated_at: string | Date;
}) {
  return {
    "@type": "Restaurant",
    "@id": `${SITE_URL}/restaurants/${restaurant.slug}#restaurant`,
    name: restaurant.name,
    url: `${SITE_URL}/restaurants/${restaurant.slug}`,
    address: { "@type": "PostalAddress", streetAddress: restaurant.address, addressLocality: "New York", addressRegion: "NY", addressCountry: "US" },
    ...(restaurant.latitude && restaurant.longitude && { geo: { "@type": "GeoCoordinates", latitude: restaurant.latitude, longitude: restaurant.longitude } }),
    ...(restaurant.phone && { telephone: restaurant.phone }),
    ...(restaurant.website && { sameAs: restaurant.website }),
    servesCuisine: restaurant.type ? [restaurant.type] : ["Healthy food"],
    ...(restaurant.rating && restaurant.reviews && { aggregateRating: { "@type": "AggregateRating", ratingValue: restaurant.rating, reviewCount: restaurant.reviews, bestRating: 5, worstRating: 1 } }),
    ...(restaurant.inspection_grade && { additionalProperty: [{ "@type": "PropertyValue", name: "NYC Health Inspection Grade", value: restaurant.inspection_grade }] }),
    publisher: PUBLISHER_REF,
    dateModified: new Date(restaurant.updated_at).toISOString(),
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
