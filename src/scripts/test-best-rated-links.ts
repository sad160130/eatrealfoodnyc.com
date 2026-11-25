import assert from "node:assert/strict"
import { hubKey } from "../lib/neighborhood-hubs"
import {
  canonicalPublishedSlug,
  dietHubHref,
  neighborhoodHubHref,
  restaurantHref,
  type LinkIndex,
} from "../lib/published-links"

const UNPUBLISHED = [
  "foods-of-ny-tours",
  "funny-hibachi-catering",
  "awesome-hibachi-hibachi-at-home-hibachi-catering",
  "poppy-seed-bagels-catering",
  "boomchia",
  "dish-food-events",
  "bella-lulus",
  "brick-city-vegan-newark-formerly-known-as-urban-vegan",
  "guilt-zero-sweets",
  "catercow",
  "bon-ji-pelhamgood-juice-pelham",
  "just-a-nibble-nyc",
]

const published = new Set([
  "breckenridge-green-cafe",
  "cuffie-ridge-jamaican-vegan-cafe",
  "12-chairs-caf",
  "a-real-listing",
])

for (const slug of UNPUBLISHED) {
  assert.equal(canonicalPublishedSlug(slug, published), null, slug)
  assert.equal(restaurantHref(slug, { slugs: published }), null, slug)
}

assert.equal(canonicalPublishedSlug("breckenridge-green-caf", published), "breckenridge-green-cafe")
assert.equal(
  restaurantHref("breckenridge-green-caf", { slugs: published }),
  "/restaurants/breckenridge-green-cafe"
)
assert.equal(
  restaurantHref("cuffie-ridge-jamaican-vegan-caf", { slugs: published }),
  "/restaurants/cuffie-ridge-jamaican-vegan-cafe"
)
assert.equal(restaurantHref("12-chairs-caf", { slugs: published }), "/restaurants/12-chairs-caf")
assert.equal(restaurantHref("a-real-listing", { slugs: published }), "/restaurants/a-real-listing")
assert.equal(restaurantHref("breckenridge-green-cafe", { slugs: published }), "/restaurants/breckenridge-green-cafe")

const missingCafe = new Set(["a-real-listing"])
assert.equal(restaurantHref("breckenridge-green-caf", { slugs: missingCafe }), null)

const links: LinkIndex = {
  slugs: published,
  hubs: new Set([hubKey("Manhattan", "SoHo")]),
  diets: new Set(["vegan"]),
}

assert.equal(
  neighborhoodHubHref("Staten Island", "Port Richmond", links),
  null
)
assert.equal(neighborhoodHubHref("Bronx", "Fordham", links), null)
assert.equal(
  neighborhoodHubHref("Manhattan", "SoHo", links),
  "/nyc/manhattan/soho/healthy-restaurants"
)
assert.equal(neighborhoodHubHref(null, "SoHo", links), null)
assert.equal(dietHubHref("keto", links), null)
assert.equal(dietHubHref("vegan", links), "/healthy-restaurants/vegan")

console.log("best-rated link tests passed")
