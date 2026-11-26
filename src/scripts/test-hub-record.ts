import assert from "node:assert/strict"
import { hubOpening, wordCount } from "../lib/hub-record"
import { lateNightGuideLede } from "../lib/seo-titles"
import { TEAM_PAGE_DATE } from "../lib/visible-dates"

const opening = hubOpening({
  place: "Greenpoint, Brooklyn",
  total: 42,
  gradeA: 18,
  gradeB: 3,
  gradeC: 1,
  updated: new Date("2026-11-18T00:00:00.000Z"),
  mode: "all",
})
assert.ok(wordCount(opening) >= 40, `opening is ${wordCount(opening)} words`)
assert.match(opening, /42 published restaurant listings/)
assert.match(opening, /18 listings have a matched NYC Department of Health/)
assert.match(opening, /November 18, 2026/)

const soho = hubOpening({
  place: "SoHo, Manhattan",
  total: 20,
  gradeA: 9,
  gradeB: 1,
  gradeC: 0,
  updated: new Date("2026-11-10T00:00:00.000Z"),
  mode: "all",
})
assert.ok(wordCount(soho) >= 40, `soho opening is ${wordCount(soho)} words`)

const lede = lateNightGuideLede({ restaurants: 2212, neighborhoods: 113 })
const ledeWords = wordCount(lede)
assert.ok(ledeWords >= 40 && ledeWords <= 80, `late-night lede is ${ledeWords} words: ${lede}`)
assert.equal(TEAM_PAGE_DATE, "2026-03-01")

console.log("hub record tests passed", { opening: wordCount(opening), lede: ledeWords })
