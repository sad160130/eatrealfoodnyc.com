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
  HEALTH_GRADES_GUIDE_DESCRIPTION,
  HEALTH_GRADES_GUIDE_TITLE,
  healthGradesGuideDescription,
  healthGradesGuideTitle,
  hubMetaDescription,
  lateNightGuideDescription,
  lateNightGuideTitle,
  neighborhoodTitle,
  renderedTitleLength,
  restaurantMetaDescription,
  clipListingTitle,
  dietHubTitle,
  gradeAPageDescription,
  gradeAPagedTitle,
  restaurantListingTitle,
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
  const branded = withBrand(guide.metaTitle)
  if (branded.length <= TITLE_MAX) expectWithin(guide.slug, guide.metaTitle)
  else assert.ok(guide.metaTitle.length <= TITLE_MAX, `${guide.slug} title ${guide.metaTitle.length}: ${guide.metaTitle}`)
  assert.ok(guide.metaTitle.split("|")[0].trim().length > 0, guide.slug)
  const description = GUIDE_DESCRIPTIONS[guide.slug]
  if (!description) continue
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

for (const gradeA of counts) {
  for (const earlyOpeners of counts) {
    const breakfastTitle = breakfastGuideTitle(gradeA)
    const breakfastDescription = breakfastGuideDescription({ earlyOpeners, gradeA })
    if (gradeA > 0 && earlyOpeners > 0) {
      expectCtr("breakfast", breakfastTitle, breakfastDescription)
      assert.ok(breakfastTitle.startsWith("Healthy Breakfast NYC"), breakfastTitle)
      assert.match(breakfastTitle, /Grade A/, breakfastTitle)
    } else {
      assert.ok(breakfastTitle.length <= TITLE_MAX, breakfastTitle)
      assert.ok(breakfastDescription.length <= 155, breakfastDescription)
    }
  }
}
for (const neighborhoods of hoods) {
  for (const restaurants of counts) {
    const lateTitle = lateNightGuideTitle(neighborhoods)
    const lateDescription = lateNightGuideDescription({ restaurants, neighborhoods })
    if (neighborhoods > 0 && restaurants > 0) expectCtr("late night", lateTitle, lateDescription)
    else assert.ok(lateTitle.length <= TITLE_MAX, lateTitle)
  }
}
const gradesTitle = healthGradesGuideTitle()
const gradesDescription = healthGradesGuideDescription()
assert.equal(gradesTitle, HEALTH_GRADES_GUIDE_TITLE)
assert.ok(gradesTitle.startsWith("NYC Restaurant Grades"), gradesTitle)
assert.ok(gradesTitle.length <= TITLE_MAX, `${gradesTitle.length}: ${gradesTitle}`)
assert.equal(gradesDescription, HEALTH_GRADES_GUIDE_DESCRIPTION)
assert.equal(gradesDescription.split(".").filter(Boolean).length, 1, gradesDescription)
assert.match(gradesDescription, /0–13/)
assert.match(gradesDescription, /14–27/)
assert.match(gradesDescription, /28 or more/)
assert.match(gradesDescription, /official NYC DOHMH/)
assert.ok(gradesDescription.length <= 160, `${gradesDescription.length}: ${gradesDescription}`)
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

const emptyDiet = dietHubTitle("Keto", 0, 0, 2026)
assert.ok(!emptyDiet.includes("0 Listed"), emptyDiet)
assert.ok(!emptyDiet.includes("0 Grade A"), emptyDiet)
assert.ok(emptyDiet.length <= TITLE_MAX, emptyDiet)

const listedDiet = dietHubTitle("Vegan", 80, 40, 2026)
assert.ok(listedDiet.includes("80 Listed"), listedDiet)
assert.ok(listedDiet.includes("40 Grade A"), listedDiet)

const manhattanPage = gradeAPagedTitle("Manhattan", 2)
assert.match(manhattanPage, /Page 2/)
assert.ok(manhattanPage.length <= TITLE_MAX, `${manhattanPage.length}: ${manhattanPage}`)
const islandPage = gradeAPagedTitle("Staten Island", 13)
assert.match(islandPage, /Page 13/)
assert.ok(islandPage.length <= TITLE_MAX, islandPage)
const longPlace = gradeAPagedTitle("A Very Long Neighborhood Name That Keeps Going", 4)
assert.match(longPlace, /Page 4/)
assert.ok(longPlace.length <= TITLE_MAX, longPlace)

const pageDesc = gradeAPageDescription({ total: 400, place: "Manhattan", page: 2, pages: 13 })
assert.match(pageDesc, /Page 2 of 13\./)
assert.ok(pageDesc.length <= DESCRIPTION_MAX, pageDesc)
const firstDesc = gradeAPageDescription({ total: 400, place: "Manhattan", page: 1, pages: 13 })
assert.ok(!firstDesc.includes("Page 1"), firstDesc)

const tapName = "TAP Brazilian Café – 100% Gluten-Free | Tapioca Sandwiches & Açaí | Astoria – NYC"
const tapTitle = restaurantListingTitle({
  name: tapName,
  neighborhood: "Astoria",
  borough: "Queens",
  grade: "B",
  inspectionDate: "7/22/2025",
  type: "Cafe",
  snapshot: new Date("2026-11-25T00:00:00Z"),
})
assert.ok(tapTitle.length <= TITLE_MAX, `${tapTitle.length}: ${tapTitle}`)
assert.ok(tapTitle.startsWith("TAP Brazilian"), tapTitle)
assert.equal(clipListingTitle(tapTitle), tapTitle)
const clippedName = clipListingTitle(tapName)
assert.ok(tapName.startsWith(clippedName), clippedName)
assert.ok(clippedName.length <= TITLE_MAX, clippedName)
const nextChar = tapName[clippedName.length]
if (nextChar) assert.ok(nextChar === " " || nextChar === "|", `cut mid-word: ${clippedName}`)

console.log("seo title tests passed")
for (const guide of GUIDES) {
  console.log(`${renderedTitleLength(guide.metaTitle).toString().padStart(2)}  ${withBrand(guide.metaTitle)}`)
}
