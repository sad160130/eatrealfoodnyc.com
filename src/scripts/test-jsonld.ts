import assert from "node:assert/strict"
import {
  buildBreadcrumbList,
  buildHubItemList,
  buildRestaurantSchema,
  dohmhInspectionDataset,
  siteGraph,
  stateCode,
} from "../lib/schema"
import { stripReviewMarkup } from "../lib/review-text"
import { extractJsonLd, validateJsonLd, validateVisibleHtml } from "../lib/validate-jsonld"

assert.equal(stripReviewMarkup("Fries, OMG!!<br>The Beyond"), "Fries, OMG!! The Beyond")
assert.equal(stripReviewMarkup("A&lt;br&gt;B"), "A B")
assert.equal(stateCode("New York"), "NY")
assert.equal(stateCode("ny"), "NY")

const restaurant = buildRestaurantSchema({
  name: "Joe's Pizza",
  slug: "joes-pizza",
  address: "7 Carmine St",
  city: "New York",
  state: "NY",
  latitude: 40.73,
  longitude: -74.0,
  phone: "212-555-0100",
  website: "https://example.com",
  type: "Pizza",
  rating: 4.6,
  reviews: 120,
  inspection_grade: "A",
  inspection_score: 9,
  photo: "https://example.com/photo.jpg",
  working_hours: JSON.stringify({ Monday: ["8AM-11PM"] }),
  updated_at: "2026-03-02T00:00:00.000Z",
})
assert.equal(restaurant["@type"], "Restaurant")
assert.equal(restaurant.address.streetAddress, "7 Carmine St")
assert.equal(restaurant.address.addressRegion, "NY")
assert.equal(restaurant.image, "https://example.com/photo.jpg")
assert.equal(restaurant.openingHoursSpecification?.[0]?.opens, "08:00")
assert.equal(restaurant.openingHoursSpecification?.[0]?.closes, "23:00")
assert.equal("aggregateRating" in restaurant, false)
assert.equal("review" in restaurant, false)
assert.ok(restaurant.additionalProperty.some((property) => property.value === "NYC DOHMH Grade A"))
assert.ok(restaurant.additionalProperty.some((property) => property.value === 9))
assert.equal(siteGraph()["@graph"][0].name, "Eat Real Food NYC")
assert.deepEqual(siteGraph()["@graph"][0].sameAs, ["https://www.youtube.com/@EatRealFoodNYC"])
const basedOn = dohmhInspectionDataset("43nn-pn8j")
assert.equal(basedOn.description.length > 0, true)
assert.equal(basedOn.url, "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j")
assert.equal(basedOn.license, "https://www.nyc.gov/home/terms-of-use.page")
assert.equal(basedOn.creator["@type"], "Organization")
assert.equal(basedOn.publisher["@type"], "Organization")
assert.equal(basedOn.publisher.name, "NYC Department of Health and Mental Hygiene")
assert.deepEqual(
  validateJsonLd([{ "@type": "Dataset", name: "Hub", description: "Hub rows.", url: "https://www.eatrealfoodnyc.com/nyc/manhattan/healthy-restaurants", license: "https://creativecommons.org/licenses/by/4.0/", creator: { "@type": "Organization", name: "Eat Real Food NYC" }, isBasedOn: basedOn }], ["Dataset"]),
  []
)
assert.equal("founder" in siteGraph()["@graph"][0], false)

const unrated = buildRestaurantSchema({
  name: "No Reviews",
  slug: "no-reviews",
  address: "1 Main St",
  latitude: null,
  longitude: null,
  phone: null,
  website: null,
  type: null,
  rating: 4,
  reviews: 0,
  inspection_grade: null,
  updated_at: "2026-01-01T00:00:00.000Z",
})
assert.equal("aggregateRating" in unrated, false)
assert.deepEqual(JSON.parse(JSON.stringify(unrated)).servesCuisine, ["Healthy food"])

const list = buildHubItemList({
  name: "Healthy Restaurants in SoHo",
  description: "2 healthy restaurants in SoHo",
  siteUrl: "https://www.eatrealfoodnyc.com",
  restaurants: [
    { name: "A", slug: "a", rating: 4.5, reviews: 10 },
    { name: "B", slug: "b", rating: 5, reviews: 0 },
  ],
})
assert.equal(list.numberOfItems, 2)
assert.equal("aggregateRating" in list.itemListElement[0].item, false)
assert.equal("aggregateRating" in list.itemListElement[1].item, false)

const crumbs = buildBreadcrumbList([
  { name: "Eat Real Food NYC", path: "/" },
  { name: "Guides", path: "/guides" },
])
const site = siteGraph()
const html = `
  <h1>Joe's Pizza</h1>
  <a href="/nyc/manhattan/soho/healthy-restaurants">healthy restaurants in SoHo</a>
  <link rel="canonical" href="https://www.eatrealfoodnyc.com/restaurants/joes-pizza" />
  <title>Joe's Pizza | Grade A | Eat Real Food NYC</title>
  <meta name="description" content="Joe's Pizza in SoHo." />
  <script type="application/ld+json">${JSON.stringify(site)}</script>
  <script type="application/ld+json">${JSON.stringify(restaurant)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>
  <script type="application/ld+json">${JSON.stringify(list)}</script>
`
const nodes = extractJsonLd(html)
const issues = [
  ...validateJsonLd(nodes, ["Organization", "WebSite", "Restaurant", "BreadcrumbList", "ItemList"]),
  ...validateVisibleHtml(html, ["Joe's Pizza", "healthy restaurants in SoHo", "rel=\"canonical\"", "name=\"description\""]),
]
assert.deepEqual(issues, [], JSON.stringify(issues, null, 2))

const broken = validateJsonLd(
  [{ "@type": "ItemList", numberOfItems: 3, itemListElement: [] }],
  ["Restaurant"]
)
assert.ok(broken.some((issue) => issue.message.includes("Missing Restaurant")))
assert.ok(broken.some((issue) => issue.message.includes("numberOfItems")))

console.log("json-ld validation tests passed")
