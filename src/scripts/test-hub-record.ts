import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { hubOpening, wordCount } from "../lib/hub-record"
import { lateNightGuideLede } from "../lib/seo-titles"
import { OUR_DATA_PAGE_DATE, TEAM_PAGE_DATE, teamOpeningText } from "../lib/visible-dates"

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
assert.match(lede, /^Healthy food open late in NYC means a meal after 10pm\./)
assert.match(lede, /2,212 restaurant listings/)
assert.match(lede, /113 neighborhoods/)
assert.equal(TEAM_PAGE_DATE, "2026-11-27")
assert.equal(OUR_DATA_PAGE_DATE, "2026-11-26")
const teamOpening = teamOpeningText()
const teamWords = wordCount(teamOpening)
assert.ok(teamWords >= 40, `team opening is ${teamWords} words`)
assert.match(teamOpening, /Snket Desai/)
assert.match(teamOpening, /Rohan Kadam/)
assert.match(teamOpening, /DOHMH New York City Restaurant Inspection Results/)
assert.doesNotMatch(teamOpening, /Editor-in-Chief/)

const boroughPage = readFileSync(new URL("../app/nyc/[borough]/healthy-restaurants/page.tsx", import.meta.url), "utf8")
const hubAt = boroughPage.indexOf("<HubRecord")
const nearAt = boroughPage.indexOf("Find healthy food near you")
assert.ok(hubAt > 0 && nearAt > hubAt, "the near-me sentence follows the borough answer")

const listPage = readFileSync(new URL("../components/neighborhood-restaurant-list.tsx", import.meta.url), "utf8")
assert.ok(listPage.indexOf("<HubRecord") < listPage.indexOf("published {total"), "the name-list answer precedes the short count line")

for (const mode of ["grade-a", "diet"] as const) {
  const text = hubOpening({
    place: "SoHo",
    total: 1,
    gradeA: 1,
    updated: null,
    mode,
    dietLabel: "Vegan",
  })
  assert.ok(wordCount(text) >= 40, `${mode} opening is ${wordCount(text)} words`)
}

const ourData = readFileSync(new URL("../app/about/our-data/page.tsx", import.meta.url), "utf8")
assert.match(ourData, /OUR_DATA_PAGE_DATE/)
assert.doesNotMatch(ourData, /latestInspectionAt/)
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /\/about\/our-data": OUR_DATA_PAGE_DATE/)
assert.match(sitemap, /\/about\/team": TEAM_PAGE_DATE/)

console.log("hub record tests passed", { opening: wordCount(opening), lede: ledeWords, teamWords })
