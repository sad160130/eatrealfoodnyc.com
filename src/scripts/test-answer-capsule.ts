import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dietCapsule, neighborhoodCapsule, restaurantCapsule, wordCount } from "../lib/answer-capsule"

function expectRange(label: string, text: string) {
  const words = wordCount(text)
  assert.ok(words >= 25 && words <= 45, `${label} is ${words} words: ${text}`)
}

const graded = restaurantCapsule({
  name: "Joe's Pizza",
  neighborhood: "SoHo",
  borough: "Manhattan",
  grade: "A",
  score: 9,
  inspectionDate: "2026-03-02",
  tags: ["Vegetarian"],
  address: "7 Carmine Street, New York, NY",
  type: "Pizza",
})
expectRange("graded", graded)
assert.ok(graded.includes("Grade A"))
assert.ok(graded.includes("score 9"))
assert.ok(graded.includes("Mar 2026"))
assert.ok(!graded.toLowerCase().includes("highly acclaimed"))

const bare = restaurantCapsule({
  name: "Corner Spot",
  neighborhood: "Astoria",
  borough: "Queens",
  grade: null,
  score: null,
  inspectionDate: null,
  tags: [],
  address: "1 30th Avenue, Astoria, NY",
  type: null,
})
expectRange("bare", bare)
assert.ok(bare.includes("no NYC DOHMH grade matched"))
assert.ok(!bare.includes("Grade A"))

const hood = neighborhoodCapsule({
  neighborhood: "SoHo",
  count: 20,
  graded: 12,
  gradeA: 9,
  latestMonth: "Mar 2026",
  tagged: 8,
})
expectRange("hood", hood)
assert.ok(hood.includes("12"))
assert.ok(hood.includes("Grade A"))
assert.ok(hood.includes("Mar 2026"))

const emptyHood = neighborhoodCapsule({
  neighborhood: "Tottenville",
  count: 4,
  graded: 0,
  gradeA: 0,
  latestMonth: null,
  tagged: 0,
})
expectRange("empty hood", emptyHood)
assert.ok(emptyHood.includes("None has a matched"))

const diet = dietCapsule({
  label: "Vegan",
  count: 32,
  gradeA: 10,
  gradeB: 2,
  gradeC: 1,
  latestMonth: "Jan 2026",
})
expectRange("diet", diet)
assert.ok(diet.includes("10 A"))
assert.ok(diet.includes("2 B"))
assert.ok(diet.includes("1 C"))

const kosher = dietCapsule({
  label: "Kosher",
  count: 82,
  gradeA: 61,
  gradeB: 9,
  gradeC: 0,
  latestMonth: "November 2026",
})
expectRange("kosher opening", kosher)
assert.ok(kosher.startsWith("82 kosher restaurants are published"))
assert.ok(kosher.includes("61 A"))
assert.ok(kosher.includes("9 B"))
assert.ok(kosher.includes("0 C"))
assert.equal(kosher.includes("dining guide"), false)

const dietPage = readFileSync(new URL("../app/healthy-restaurants/[diet-type]/page.tsx", import.meta.url), "utf8")
const openingAt = dietPage.indexOf("{capsule}")
const guideLinkAt = dietPage.indexOf('href="/guides/kosher-dining-nyc-guide"')
assert.ok(openingAt > 0 && guideLinkAt > openingAt, "the kosher guide link must follow the count-led opening")
assert.match(dietPage, /THIN_DIET_DATA_DATE = new Set\(\["keto", "paleo", "raw-food"\]\)/)
assert.doesNotMatch(dietPage, /dateModified: new Date\(/)

console.log("answer capsule tests passed")
