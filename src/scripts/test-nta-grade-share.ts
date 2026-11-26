import assert from "node:assert/strict"
import { listingGuideLinks } from "../lib/listing-guide-links"
import {
  boroughGradeShare,
  matchNta,
  ntaExtremes,
  placeGradeShare,
} from "../lib/nta-grade-share"
import { correctCityIslandListing, isCityIslandAddress } from "../lib/city-island"
import { correctRosebankListing, isRosebankBayStreet } from "../lib/rosebank"
import { omitFromSitemap } from "../lib/sitemap-policy"

assert.equal(isRosebankBayStreet("1203 Bay St, Staten Island, NY 10305", "Staten Island"), true)
assert.equal(isRosebankBayStreet("1372 Bay Street, Staten Island, NY 10305", "Staten Island"), true)
assert.equal(isRosebankBayStreet("668 Bay Street, Staten Island, NY 10304", "Staten Island"), false)
assert.equal(isRosebankBayStreet("1203 Bay St, Staten Island, NY 10305", "Brooklyn"), false)

const bloom = correctRosebankListing({
  address: "1203 Bay St, Staten Island, NY 10305",
  borough: "Staten Island",
  neighborhood: "Stapleton",
  description: "Bloom Cafe is located in Stapleton, Staten Island.",
})
assert.equal(bloom.neighborhood, "Rosebank")
assert.equal(bloom.description, "Bloom Cafe is located in Rosebank, Staten Island.")

const lakruwana = correctRosebankListing({
  address: "668 Bay Street, Staten Island, NY 10304",
  borough: "Staten Island",
  neighborhood: "Stapleton",
  description: "in Stapleton",
})
assert.equal(lakruwana.neighborhood, "Stapleton")
assert.equal(lakruwana.description, "in Stapleton")

assert.equal(isCityIslandAddress("691 Bridge St, Bronx, NY 10464", "Bronx"), true)
assert.equal(isCityIslandAddress("100 Main St, Bronx, NY 10465", "Bronx"), false)
assert.equal(isCityIslandAddress("691 Bridge St, Bronx, NY 10464", "Brooklyn"), false)
const lobster = correctCityIslandListing({
  address: "691 Bridge St, Bronx, NY 10464",
  borough: "Bronx",
  neighborhood: "Throgs Neck",
  description: "Seafood in Throgs Neck.",
})
assert.equal(lobster.neighborhood, "City Island")
assert.equal(lobster.description, "Seafood in City Island.")
const throgs = correctCityIslandListing({
  address: "100 Main St, Bronx, NY 10465",
  borough: "Bronx",
  neighborhood: "Throgs Neck",
  description: "In Throgs Neck.",
})
assert.equal(throgs.neighborhood, "Throgs Neck")
assert.equal(omitFromSitemap("/claim"), true)
assert.equal(omitFromSitemap("/badge"), true)
assert.equal(omitFromSitemap("/restaurants/dirt-candy/badge"), true)
assert.equal(omitFromSitemap("/healthy-restaurants/grade-a/page/2"), true)
assert.equal(omitFromSitemap("/healthy-restaurants/grade-a"), false)
assert.equal(omitFromSitemap("/data"), false)

const east = placeGradeShare("East Village", "Manhattan")
assert.equal(east?.kind, "nta")
assert.equal(east?.place, "East Village")
assert.equal(east?.href, "/data/nyc-restaurant-health-grade-report#neighborhoods")
assert.equal(east?.citywide, "90.2%")
assert.equal(east?.recordDate, "November 13, 2026")

const williamsburg = placeGradeShare("Williamsburg", "Brooklyn")
assert.equal(williamsburg?.kind, "nta")
assert.match(williamsburg?.place ?? "", /North Side-South Side/)

assert.equal(matchNta("Hell's Kitchen", "Manhattan")?.name, "Clinton")
assert.equal(matchNta("Murray Hill", "Queens")?.name, "Murray Hill")
assert.equal(matchNta("Murray Hill", "Manhattan")?.name, "Murray Hill-Kips Bay")
assert.equal(matchNta("Park Slope", "Brooklyn")?.name, "Park Slope-Gowanus")
assert.equal(matchNta("Sunset Park", "Brooklyn"), null)

const stapleton = placeGradeShare("Stapleton", "Staten Island")
assert.equal(stapleton?.kind, "borough")
assert.equal(stapleton?.place, "Staten Island")
assert.equal(stapleton?.href, "/data/nyc-restaurant-health-grade-report#boroughs")

const queens = boroughGradeShare("Queens")
assert.equal(queens?.share, "87.3%")
assert.equal(queens?.href, "/data/nyc-restaurant-health-grade-report#queens")

const extremes = ntaExtremes(10)
assert.equal(extremes.lowest.length, 10)
assert.equal(extremes.highest.length, 10)
assert.equal(extremes.lowest[0].name, "Flushing")
assert.equal(extremes.highest[0].name, "Carroll Gardens-Columbia Street-Red Hook")
assert.ok(extremes.lowest.every((row) => row.letterGraded >= 80))
assert.ok(extremes.highest.every((row) => row.name !== "Missing" && row.letterGraded >= 80))

const italian = listingGuideLinks({
  type: "Italian restaurant",
  dietaryTags: "vegan|gluten-free",
  workingHours: null,
})
assert.deepEqual(
  italian.map((link) => link.href),
  [
    "/guides/best-italian-restaurants-nyc",
    "/guides/vegan-nyc-borough-guide",
    "/guides/gluten-free-dining-nyc",
  ]
)

const pizza = listingGuideLinks({ type: "Pizza restaurant", dietaryTags: "halal", workingHours: null })
assert.ok(pizza.some((link) => link.href === "/guides/best-pizza-restaurants-nyc"))
assert.ok(pizza.some((link) => link.href === "/guides/halal-food-guide-nyc"))

const ethiopian = listingGuideLinks({
  type: "Ethiopian restaurant",
  dietaryTags: "vegetarian",
  workingHours: null,
})
assert.deepEqual(
  ethiopian.map((link) => link.href),
  ["/guides/ethiopian-restaurants-nyc"]
)
assert.equal(ethiopian[0].label, "Ethiopian restaurants NYC")

assert.equal(
  listingGuideLinks({ type: "Seafood restaurant", dietaryTags: null, workingHours: null })[0].href,
  "/guides/seafood-healthy-restaurants-nyc"
)

const early = JSON.stringify({
  Monday: ["7AM-3PM"],
  Tuesday: ["7AM-3PM"],
  Wednesday: ["7AM-3PM"],
  Thursday: ["7AM-3PM"],
  Friday: ["7AM-3PM"],
})
assert.ok(
  listingGuideLinks({ type: "Cafe", dietaryTags: "kosher", workingHours: early }).some(
    (link) => link.href === "/guides/healthy-breakfast-nyc"
  )
)
assert.equal(
  listingGuideLinks({ type: "Cafe", dietaryTags: null, workingHours: JSON.stringify({ Monday: ["11AM-9PM"] }) }).some(
    (link) => link.href === "/guides/healthy-breakfast-nyc"
  ),
  false
)

const bagels = listingGuideLinks({ type: "Bagel shop", dietaryTags: null, workingHours: null })
assert.equal(bagels[0]?.href, "/guides/best-bagels-nyc")
assert.equal(bagels[0]?.label, "best bagels in NYC")
assert.equal(
  listingGuideLinks({ type: "Bakery", dietaryTags: null, workingHours: null }).some(
    (link) => link.href === "/guides/best-bagels-nyc"
  ),
  false
)

const flushing = listingGuideLinks({
  type: "Chinese restaurant",
  dietaryTags: null,
  workingHours: null,
  neighborhood: "Flushing",
  borough: "Queens",
})
assert.equal(flushing[0]?.href, "/guides/best-restaurants-flushing")
assert.equal(flushing[0]?.label, "Grade A restaurants in Flushing")
assert.equal(
  listingGuideLinks({
    type: "Chinese restaurant",
    dietaryTags: null,
    workingHours: null,
    neighborhood: "Flushing",
    borough: "Brooklyn",
  }).some((link) => link.href === "/guides/best-restaurants-flushing"),
  false
)

console.log("nta grade share tests passed")
