import assert from "node:assert/strict"
import { dataAsOfSentence, gradedPercent, SITE_STATS_FALLBACK } from "../lib/site-stats"

assert.equal(gradedPercent(0, 0), 0)
assert.equal(gradedPercent(513, 1401), 37)
assert.equal(gradedPercent(1, 3), 33)
assert.equal(dataAsOfSentence("November 24, 2026"), "Data as of November 24, 2026.")
assert.equal(dataAsOfSentence(null), "Data as of date not on file.")
assert.equal(SITE_STATS_FALLBACK.source, "fallback")
assert.equal(SITE_STATS_FALLBACK.publishedListings, 0)
assert.doesNotMatch(dataAsOfSentence("November 24, 2026"), /May 2026|quarterly|12\+/)

console.log("site stats tests passed")
