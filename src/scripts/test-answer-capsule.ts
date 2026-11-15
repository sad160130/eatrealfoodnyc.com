import assert from "node:assert/strict"
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

console.log("answer capsule tests passed")
