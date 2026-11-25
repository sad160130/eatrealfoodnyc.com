import assert from "node:assert/strict"
import { listingGuideLinks } from "../lib/listing-guide-links"
import {
  boroughGradeShare,
  matchNta,
  ntaExtremes,
  placeGradeShare,
} from "../lib/nta-grade-share"
import { correctRosebankListing, isRosebankBayStreet } from "../lib/rosebank"

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

console.log("nta grade share tests passed")
