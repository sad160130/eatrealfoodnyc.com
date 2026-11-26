import assert from "node:assert/strict"
import {
  CLOSED_LISTINGS,
  PAUSED_LISTINGS,
  closedListingRedirects,
  isClosedSlug,
  isExcludedFromRankedLists,
  pausedNotice,
} from "../config/listing-overrides"
import { isPublicListingWhere, withClosedListingsExcluded } from "../lib/listing-overrides"
import { selectTopPicks } from "../lib/top-picks"

assert.deepEqual(CLOSED_LISTINGS.map((row) => row.slug), ["jajaja-mexicana-lower"])
assert.equal(CLOSED_LISTINGS[0].redirectTo, "/nyc/manhattan/lower-east-side/vegan-restaurants")
assert.equal(CLOSED_LISTINGS[0].closedOn, "2026-08-30")
assert.equal(PAUSED_LISTINGS[0].notice, "Temporarily paused per the owner (Oct 2026).")
assert.equal(pausedNotice("divyas-kitchen"), "Temporarily paused per the owner (Oct 2026).")
assert.equal(pausedNotice("jajaja-mexicana-lower"), null)
assert.equal(isClosedSlug("jajaja-mexicana-lower"), true)
assert.equal(isClosedSlug("divyas-kitchen"), false)
assert.equal(isExcludedFromRankedLists("divyas-kitchen"), true)
assert.equal(isExcludedFromRankedLists("someone-else"), false)

const redirects = closedListingRedirects()
assert.equal(redirects[0].source, "/restaurants/jajaja-mexicana-lower")
assert.equal(redirects[0].destination, "/nyc/manhattan/lower-east-side/vegan-restaurants")
assert.equal(redirects[0].statusCode, 301)
assert.equal(redirects[1].source, "/restaurants/jajaja-mexicana-lower/:path*")

assert.equal(isPublicListingWhere({ is_published: true }), true)
assert.equal(isPublicListingWhere({ business_status: "OPERATIONAL" }), true)
assert.equal(isPublicListingWhere({ slug: "jajaja-mexicana-lower" }), false)

const filtered = withClosedListingsExcluded("findMany", {
  where: { is_published: true, borough: "Manhattan" },
})
assert.deepEqual(filtered.where.AND, [{ slug: { notIn: ["jajaja-mexicana-lower"] } }])
assert.equal(filtered.where.borough, "Manhattan")

const untouched = withClosedListingsExcluded("findUnique", {
  where: { slug: "jajaja-mexicana-lower" },
})
assert.deepEqual(untouched.where, { slug: "jajaja-mexicana-lower" })

const fullDataset = withClosedListingsExcluded("findMany", { where: { borough: "Manhattan" } })
assert.equal("AND" in (fullDataset.where ?? {}), false)

const picks = selectTopPicks(
  [
    { slug: "divyas-kitchen", name: "paused", inspection_grade: "A", rating: 4.8, reviews: 40 },
    { slug: "open-kitchen", name: "open", inspection_grade: "A", rating: 4.2, reviews: 10 },
  ],
  5
)
assert.deepEqual(picks.map((row) => row.slug), ["open-kitchen"])

console.log("listing override tests passed")
