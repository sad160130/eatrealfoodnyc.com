import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  IMPRESSION_404_RESTAURANT_SLUGS,
  impression404Redirects,
  impressionRestaurantDestination,
} from "../lib/impression-404-redirects"

const redirects = impression404Redirects()
assert.equal(IMPRESSION_404_RESTAURANT_SLUGS.length, 127)
assert.equal(new Set(IMPRESSION_404_RESTAURANT_SLUGS).size, 127)
assert.equal(redirects.length, 129)

assert.equal(
  impressionRestaurantDestination("balaji-bhavan-pure-vegetarian-south-indian-restaurant"),
  "/healthy-restaurants"
)
assert.equal(impressionRestaurantDestination("balaji-bhavan"), "/healthy-restaurants")
assert.equal(impressionRestaurantDestination("susans-kitchen-of-great-neck"), "/healthy-restaurants")
assert.equal(impressionRestaurantDestination("chopt-creative-salad-co-bayside"), "/nyc/queens/healthy-restaurants")
assert.equal(impressionRestaurantDestination("capri-rosedale"), "/nyc/queens/healthy-restaurants")

const bySource = new Map(redirects.map((row) => [row.source, row.destination]))
assert.equal(
  bySource.get("/nyc/manhattan/lower-east-side/vegan-restaurants"),
  "/nyc/manhattan/lower-east-side/healthy-restaurants"
)
assert.equal(bySource.get("/nyc/bronx/soundview/healthy-restaurants"), "/nyc/bronx/healthy-restaurants")
assert.equal(
  bySource.get("/restaurants/balaji-bhavan"),
  bySource.get("/restaurants/balaji-bhavan-pure-vegetarian-south-indian-restaurant")
)
for (const row of redirects) {
  assert.equal(row.statusCode, 301)
  assert.notEqual(row.source, row.destination)
  assert.ok(row.destination.startsWith("/"))
}

const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /DIET_TYPES\.map/)
assert.doesNotMatch(sitemap, /DIET_TYPES\.filter/)

const badge = readFileSync(new URL("../app/restaurants/[slug]/badge/page.tsx", import.meta.url), "utf8")
assert.match(badge, /path: `\/restaurants\/\$\{slug\}`/)
assert.doesNotMatch(badge, /index: false/)
const badgeIndex = readFileSync(new URL("../app/badge/page.tsx", import.meta.url), "utf8")
assert.match(badgeIndex, /path: "\/"/)
assert.doesNotMatch(badgeIndex, /index: false/)

console.log("impression 404 redirect tests passed", { redirects: redirects.length })
