import assert from "node:assert/strict"
import score from "../data/score-13-cliff.json"
import uninspected from "../data/not-yet-inspected.json"
import closures from "../data/restaurant-closures.json"

const histogramTotal = score.histogram.reduce((sum, row) => sum + row.n, 0) + score.above30
assert.equal(histogramTotal, score.n)
assert.equal(score.histogram.length, 31)
assert.equal(score.histogram[0].score, 0)
assert.equal(score.histogram[30].score, 30)
assert.equal(score.recordDate, "2026-11-24T06:00:34.000")
assert.ok(score.n > 0)

const boroughTotal = uninspected.byBorough.reduce((sum, row) => sum + row.count, 0)
assert.equal(boroughTotal, uninspected.uninspected)
assert.ok(uninspected.uninspected < uninspected.establishments)

assert.equal(closures.latestMonth, "2026-11")
assert.equal(closures.months[closures.months.length - 1].month, closures.latestMonth)
for (const month of closures.months) {
  const boroughEvents = month.byBorough.reduce((sum, row) => sum + row.events, 0)
  const boroughRestaurants = month.byBorough.reduce((sum, row) => sum + row.restaurants, 0)
  assert.ok(boroughEvents <= month.events)
  assert.ok(boroughRestaurants <= month.restaurants)
}

console.log("inspection series tests passed")
