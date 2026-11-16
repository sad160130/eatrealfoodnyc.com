import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import NeighborhoodScorecard from "../components/neighborhood-scorecard"
import {
  MIN_GRADED_LISTINGS_FOR_RATE_LEADER,
  buildNeighborhoodScorecard,
  gradeARateOfGraded,
  type ScorecardListing,
} from "../lib/neighborhood-scorecard"

function row(partial: Partial<ScorecardListing> & Pick<ScorecardListing, "neighborhood">): ScorecardListing {
  return {
    inspection_grade: null,
    is_hidden_gem: false,
    dietary_tags: null,
    ...partial,
  }
}

function repeat(count: number, partial: Partial<ScorecardListing> & Pick<ScorecardListing, "neighborhood">) {
  return Array.from({ length: count }, () => row(partial))
}

const listings: ScorecardListing[] = [
  ...repeat(30, { neighborhood: "Williamsburg", inspection_grade: "A", dietary_tags: "vegan" }),
  ...repeat(10, { neighborhood: "Williamsburg", inspection_grade: "B", dietary_tags: "halal" }),
  ...repeat(4, { neighborhood: "Williamsburg", inspection_grade: "C" }),
  ...repeat(2, { neighborhood: "Williamsburg", inspection_grade: null, is_hidden_gem: true }),
  ...repeat(2, { neighborhood: "Williamsburg", inspection_grade: "Z", is_hidden_gem: true, dietary_tags: "vegan|vegan|not-a-tag" }),
  // 100% on a single graded listing must not win the tile.
  row({ neighborhood: "Carroll Gardens", inspection_grade: "A" }),
  // No letter grade: the cell is a dash, not 0%.
  ...repeat(3, { neighborhood: "Bushwick", inspection_grade: null, dietary_tags: "organic" }),
  ...repeat(5, { neighborhood: "Park Slope", inspection_grade: "A", dietary_tags: "halal|vegan" }),
  row({ neighborhood: "Park Slope", inspection_grade: "B" }),
  // 0% is a real rate. All five are graded.
  ...repeat(5, { neighborhood: "Red Hook", inspection_grade: "B" }),
  // Lowercase and pending codes are not A/B/C, matching the hub's exact match.
  row({ neighborhood: "Red Hook", inspection_grade: "a" }),
  row({ neighborhood: null, inspection_grade: "A", is_hidden_gem: true, dietary_tags: "vegan" }),
]

const scorecard = buildNeighborhoodScorecard(listings)

assert.equal(scorecard.totalRestaurants, listings.length)
assert.equal(
  scorecard.neighborhoods.reduce((sum, hood) => sum + hood.total, 0),
  listings.length
)
assert.equal(scorecard.neighborhoods.find((hood) => hood.neighborhood === "Williamsburg")?.total, 48)
assert.equal(scorecard.gradeA, 30 + 1 + 5 + 1)
assert.equal(scorecard.gradeB, 10 + 1 + 5)
assert.equal(scorecard.gradeC, 4)
assert.equal(scorecard.graded, scorecard.gradeA + scorecard.gradeB + scorecard.gradeC)
assert.equal(scorecard.gradeARate, gradeARateOfGraded(scorecard.gradeA, scorecard.graded))

const williamsburg = scorecard.neighborhoods.find((hood) => hood.neighborhood === "Williamsburg")!
assert.equal(williamsburg.gradeA, 30)
assert.equal(williamsburg.graded, 44)
assert.equal(williamsburg.gradeARate, Math.round((30 / 44) * 100))
assert.equal(williamsburg.hiddenGems, 4)
// "vegan|vegan" counts once. The two Z-grade rows add two more vegan listings (32), halal is 10.
assert.equal(williamsburg.topDietaryTag, "vegan")
assert.equal(williamsburg.topDietaryLabel, "Vegan")
assert.equal(williamsburg.topDietaryCount, 32)

const bushwick = scorecard.neighborhoods.find((hood) => hood.neighborhood === "Bushwick")!
assert.equal(bushwick.total, 3)
assert.equal(bushwick.graded, 0)
assert.equal(bushwick.gradeARate, null)
assert.equal(bushwick.topDietaryTag, null)

const parkSlope = scorecard.neighborhoods.find((hood) => hood.neighborhood === "Park Slope")!
assert.equal(parkSlope.graded, 6)
assert.equal(parkSlope.gradeARate, Math.round((5 / 6) * 100))
// Five listings carry both tags, so the counts tie. Canonical order keeps vegan.
assert.equal(parkSlope.topDietaryTag, "vegan")
assert.equal(parkSlope.topDietaryCount, 5)

const redHook = scorecard.neighborhoods.find((hood) => hood.neighborhood === "Red Hook")!
assert.equal(redHook.total, 6)
assert.equal(redHook.graded, 5)
assert.equal(redHook.gradeA, 0)
assert.equal(redHook.gradeARate, 0)

assert.equal(scorecard.gradeALeader?.neighborhood, "Park Slope")
assert.notEqual(scorecard.gradeALeader?.neighborhood, "Carroll Gardens")
assert.ok((scorecard.gradeALeader?.graded ?? 0) >= MIN_GRADED_LISTINGS_FOR_RATE_LEADER)
assert.equal(scorecard.gemLeader?.neighborhood, "Williamsburg")
assert.equal(scorecard.gemLeader?.hiddenGems, 4)
assert.ok(scorecard.neighborhoods.some((hood) => hood.neighborhood === "Other"))

const unweighted = Math.round(
  scorecard.neighborhoods.reduce((sum, hood) => sum + (hood.gradeARate ?? 0), 0) /
    scorecard.neighborhoods.length
)
assert.notEqual(scorecard.gradeARate, unweighted)

const meetsThreshold = buildNeighborhoodScorecard(
  repeat(5, { neighborhood: "Carroll Gardens", inspection_grade: "A" })
)
assert.equal(meetsThreshold.neighborhoods[0].graded, 5)
assert.equal(meetsThreshold.gradeALeader?.neighborhood, "Carroll Gardens")

const belowThreshold = buildNeighborhoodScorecard(
  repeat(4, { neighborhood: "Carroll Gardens", inspection_grade: "A" })
)
assert.equal(belowThreshold.gradeARate, 100)
assert.equal(belowThreshold.gradeALeader, null)
assert.equal(belowThreshold.gemLeader, null)

const tie = buildNeighborhoodScorecard([
  ...repeat(5, { neighborhood: "Alpha", inspection_grade: "A" }),
  ...repeat(8, { neighborhood: "Beta", inspection_grade: "A" }),
])
assert.equal(tie.gradeALeader?.neighborhood, "Beta")
assert.equal(tie.gradeALeader?.gradeARate, 100)
assert.equal(tie.gradeALeader?.graded, 8)

const html = renderToStaticMarkup(
  createElement(NeighborhoodScorecard, {
    borough: "Brooklyn",
    scorecard,
    validHubSlugs: ["brooklyn/williamsburg", "brooklyn/park-slope"],
  })
)

assert.match(html, /<table\b/)
assert.match(html, /<thead\b/)
assert.match(html, /<tbody\b/)
assert.match(html, /<th[^>]*scope="col"/)
assert.match(html, /<th[^>]*scope="row"/)
assert.doesNotMatch(html, /grid-cols-12/)
assert.doesNotMatch(html, /<tr[^>]*grid/)
assert.match(html, /Williamsburg/)
assert.match(html, />48</)
const leaderTile = html.match(/Highest Grade A rate<\/dt><dd[^>]*>([\s\S]*?)<\/dd>/)
assert.ok(leaderTile)
assert.match(leaderTile[1], /Park Slope/)
assert.match(leaderTile[1], new RegExp(`${parkSlope.gradeARate}%`))
assert.doesNotMatch(leaderTile[1], /Carroll Gardens/)
assert.match(leaderTile[1], new RegExp(`at least ${MIN_GRADED_LISTINGS_FOR_RATE_LEADER} graded listings`))
assert.match(html, /5 of 6/)
assert.match(html, /Bushwick: no graded listings/)
assert.match(html, new RegExp(`at least ${MIN_GRADED_LISTINGS_FOR_RATE_LEADER} graded listings`))
assert.match(html, /hidden gems/)
assert.match(html, /href="\/nyc\/brooklyn\/williamsburg\/healthy-restaurants"/)
assert.match(html, /href="\/healthy-restaurants\/vegan"/)
assert.doesNotMatch(html, /href="\/nyc\/brooklyn\/bushwick\/healthy-restaurants"/)
assert.match(html, new RegExp(`${scorecard.gradeA} of ${scorecard.graded}`))
assert.match(html, /of listings with an A, B, or C|of A, B, or C/)

const empty = renderToStaticMarkup(
  createElement(NeighborhoodScorecard, {
    borough: "Brooklyn",
    scorecard: buildNeighborhoodScorecard([]),
    validHubSlugs: [],
  })
)
assert.equal(empty, "")

console.log("neighborhood scorecard tests passed")
