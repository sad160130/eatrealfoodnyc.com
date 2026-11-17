import assert from "node:assert/strict"
import { GUIDES } from "../config/guides"
import { formatInspectionMonth } from "../lib/seo-titles"
import {
  DESCRIPTION_MAX,
  GUIDE_DESCRIPTIONS,
  TITLE_MAX,
  boroughTitle,
  breakfastGuideDescription,
  breakfastGuideTitle,
  buildPipeTitle,
  dietCtrDescription,
  dietCtrTitle,
  dietTitle,
  healthGradesGuideDescription,
  healthGradesGuideTitle,
  hubMetaDescription,
  lateNightGuideDescription,
  lateNightGuideTitle,
  neighborhoodTitle,
  renderedTitleLength,
  restaurantMetaDescription,
  restaurantTitle,
  withBrand,
} from "../lib/seo-titles"

function expectWithin(label: string, inner: string) {
  const rendered = withBrand(inner)
  assert.ok(
    rendered.length <= TITLE_MAX,
    `${label} is ${rendered.length} chars: ${rendered}`
  )
  assert.ok(rendered.endsWith("| Eat Real Food NYC"), `${label} missing brand: ${rendered}`)
  assert.equal(renderedTitleLength(inner), rendered.length)
}

// Keyword stays first. Benefit is present only when it fits.
const soho = neighborhoodTitle("SoHo", 12)
expectWithin("SoHo", soho)
assert.ok(soho.startsWith("Healthy Restaurants"), soho)
assert.ok(soho.includes("12 Grade A"), soho)

const williamsburg = neighborhoodTitle("Williamsburg", 40)
expectWithin("Williamsburg", williamsburg)
assert.ok(williamsburg.startsWith("Healthy Restaurants"), williamsburg)

const longHood = neighborhoodTitle("Bedford-Stuyvesant", 8)
expectWithin("Bedford-Stuyvesant", longHood)
assert.ok(longHood.startsWith("Healthy Restaurants"), longHood)

const noGrade = neighborhoodTitle("SoHo", 0)
expectWithin("SoHo no grade", noGrade)
assert.ok(!noGrade.includes("Grade"), noGrade)

const vegan = dietTitle("Vegan", 80)
expectWithin("vegan", vegan)
assert.ok(vegan.startsWith("Vegan"), vegan)
assert.ok(vegan.includes("80 Grade A"), vegan)

const none = dietTitle("Paleo", 0)
expectWithin("paleo", none)
assert.ok(!none.includes("Grade"), none)

expectWithin("manhattan", boroughTitle("Manhattan", 400))
expectWithin("combo", dietTitle("Gluten-Free", 4))

const graded = restaurantTitle({
  name: "Joe's Pizza",
  inspectionGrade: "A",
  inspectionDate: "2026-03-02",
  neighborhood: "SoHo",
})
expectWithin("joe", graded)
assert.ok(graded.startsWith("Joe's Pizza"), graded)
assert.ok(graded.includes("Grade A"), graded)
assert.ok(graded.includes("Mar 2026"), graded)

const ungraded = restaurantTitle({
  name: "Corner Spot",
  inspectionGrade: null,
  inspectionDate: null,
  neighborhood: "Astoria",
})
expectWithin("ungraded", ungraded)
assert.ok(!ungraded.includes("Grade"), ungraded)
assert.ok(ungraded.includes("Astoria"), ungraded)

const longName = restaurantTitle({
  name: "The Extremely Long Restaurant Name That Goes On And On Forever",
  inspectionGrade: "B",
  inspectionDate: "2025-11-01",
  neighborhood: "Washington Heights",
})
expectWithin("long name", longName)
assert.ok(longName.startsWith("The Extremely"), longName)

const badDate = restaurantTitle({
  name: "Date Missing",
  inspectionGrade: "A",
  inspectionDate: "not-a-date",
  neighborhood: "Chelsea",
})
expectWithin("bad date", badDate)
assert.ok(badDate.includes("Grade A"), badDate)
assert.ok(!badDate.toLowerCase().includes("not-a-date"), badDate)
assert.equal(formatInspectionMonth("not-a-date"), null)
assert.equal(formatInspectionMonth(null), null)

const desc = hubMetaDescription({
  count: 18,
  place: "SoHo, Manhattan",
  gradeA: 0,
  latestMonth: null,
})
assert.ok(desc.length <= DESCRIPTION_MAX, desc)
assert.ok(!desc.includes("Grade A"), desc)
assert.ok(desc.includes("18"), desc)

const gradedDesc = restaurantMetaDescription({
  name: "Joe's Pizza",
  neighborhood: "SoHo",
  borough: "Manhattan",
  inspectionGrade: "A",
  inspectionScore: 9,
  inspectionDate: "2026-03-02",
  tags: ["Vegetarian"],
})
assert.ok(gradedDesc.length <= DESCRIPTION_MAX, gradedDesc)
assert.ok(gradedDesc.includes("score 9"), gradedDesc)
assert.ok(gradedDesc.includes("Mar 2026"), gradedDesc)

const missingDesc = restaurantMetaDescription({
  name: "No Grade Cafe",
  neighborhood: null,
  borough: null,
  inspectionGrade: null,
  inspectionScore: null,
  inspectionDate: null,
  tags: [],
})
assert.ok(missingDesc.includes("No NYC DOHMH grade is matched"), missingDesc)
assert.ok(!missingDesc.includes("Grade A"), missingDesc)

for (const guide of GUIDES) {
  expectWithin(guide.slug, guide.metaTitle)
  assert.ok(guide.metaTitle.split("|")[0].trim().length > 0, guide.slug)
  const description = GUIDE_DESCRIPTIONS[guide.slug]
  assert.equal(guide.description, description, `${guide.slug} description drifted`)
  assert.ok(description.length <= DESCRIPTION_MAX, `${guide.slug} description ${description.length}`)
  assert.ok(!/every (restaurant|spot|listing) verified/i.test(description), description)
}

// A benefit that cannot fit is omitted rather than pushing the title over 60.
const tight = buildPipeTitle("Healthy Restaurants in Williamsburg", "400 Grade A")
expectWithin("tight", tight)
assert.ok(!tight.includes("400"), tight)

const counts = [0, 1, 9, 10, 99, 100, 112, 116, 200, 412, 999, 1000, 1816, 2212, 3952, 8835]
const hoods = [0, 1, 5, 12, 99, 100, 112, 116, 200]

function expectCtr(label: string, title: string, description: string) {
  assert.ok(title.length <= TITLE_MAX, `${label} title ${title.length}: ${title}`)
  assert.ok(title.length > 0, label)
  assert.ok(/NYC/i.test(title), `${label} title missing NYC: ${title}`)
  assert.ok(description.length >= 140 && description.length <= 155, `${label} description ${description.length}: ${description}`)
  assert.ok(/official NYC DOHMH/i.test(description), `${label} description missing DOHMH: ${description}`)
  assert.ok(!description.includes("…"), description)
}

for (const neighborhoods of hoods) {
  for (const restaurants of counts) {
    const breakfastTitle = breakfastGuideTitle(neighborhoods)
    const breakfastDescription = breakfastGuideDescription({ restaurants, neighborhoods })
    if (neighborhoods > 0 && restaurants > 0) expectCtr("breakfast", breakfastTitle, breakfastDescription)
    else assert.ok(breakfastTitle.length <= TITLE_MAX, breakfastTitle)
    const lateTitle = lateNightGuideTitle(neighborhoods)
    const lateDescription = lateNightGuideDescription({ restaurants, neighborhoods })
    if (neighborhoods > 0 && restaurants > 0) expectCtr("late night", lateTitle, lateDescription)
    else assert.ok(lateTitle.length <= TITLE_MAX, lateTitle)
  }
}
for (const gradeA of counts) {
  for (const gradeB of counts) {
    for (const gradeC of [0, 1, 28, 280, 1816]) {
      const title = healthGradesGuideTitle(gradeA)
      const description = healthGradesGuideDescription({ gradeA, gradeB, gradeC })
      if (gradeA > 0) expectCtr("grades", title, description)
      else assert.ok(title.length <= TITLE_MAX && description.length >= 140 && description.length <= 155, `${title} / ${description}`)
    }
  }
}
for (const label of ["Gluten-Free", "Vegetarian"]) {
  for (const count of counts) {
    for (const gradeA of counts) {
      const title = dietCtrTitle(label, gradeA, count)
      const description = dietCtrDescription(label, count, gradeA)
      assert.ok(title.startsWith(label), title)
      if (count > 0) expectCtr(label, title, description)
      else assert.ok(title.length <= TITLE_MAX, title)
      if (gradeA > 0) assert.ok(title.includes("Grade A"), title)
    }
  }
}

console.log("seo title tests passed")
for (const guide of GUIDES) {
  console.log(`${renderedTitleLength(guide.metaTitle).toString().padStart(2)}  ${withBrand(guide.metaTitle)}`)
}
