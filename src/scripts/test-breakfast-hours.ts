import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { getGuideBySlug } from "../config/guides"
import {
  BREAKFAST_LIST_LIMIT,
  buildBreakfastGuideData,
  weekdayOpening,
  type BreakfastSourceRow,
} from "../lib/breakfast-hours"
import { breakfastGuideTitle } from "../lib/seo-titles"

function week(weekdayRanges: string[], weekendRanges: string[] = ["10AM-6PM"]): string {
  return JSON.stringify({
    Monday: weekdayRanges,
    Tuesday: weekdayRanges,
    Wednesday: weekdayRanges,
    Thursday: weekdayRanges,
    Friday: weekdayRanges,
    Saturday: weekendRanges,
    Sunday: weekendRanges,
  })
}

function row(partial: Partial<BreakfastSourceRow> & Pick<BreakfastSourceRow, "name" | "slug" | "working_hours">): BreakfastSourceRow {
  return {
    borough: "Manhattan",
    neighborhood: "West Village",
    dietary_tags: null,
    rating: null,
    reviews: null,
    inspection_grade: null,
    inspection_score: null,
    inspection_date: null,
    ...partial,
  }
}

assert.equal(weekdayOpening(week(["7AM-3PM"]))?.label, "7:00 AM")
assert.equal(weekdayOpening(week(["6:30AM-9PM"]))?.label, "6:30 AM")
assert.equal(weekdayOpening(week(["Open 24 hours"]))?.label, "Open 24 hours")
assert.equal(weekdayOpening(week(["11AM-2PM", "6AM-9AM"]))?.label, "6:00 AM")
assert.equal(weekdayOpening(week(["8AM-3PM"]))?.label, "8:00 AM")
assert.equal(weekdayOpening(week(["8:00 AM–3:00 PM"]))?.label, "8:00 AM")
assert.equal(weekdayOpening(week(["7-11AM"]))?.label, "7:00 AM")
assert.equal(weekdayOpening(week(["8-10AM"]))?.label, "8:00 AM")
assert.equal(weekdayOpening(week(["5-10PM"])), null)
assert.equal(weekdayOpening(week(["12-10PM"])), null)
assert.equal(weekdayOpening(week(["9AM-5PM"])), null)
assert.equal(weekdayOpening(week(["8:30AM-3PM"])), null)
assert.equal(weekdayOpening(week(["6AM-7AM"])), null)
assert.equal(weekdayOpening(week(["6AM-8AM"])), null)
assert.equal(weekdayOpening(week(["12-4AM", "11:30AM-12AM"])), null)
assert.equal(weekdayOpening(null), null)
assert.equal(weekdayOpening("not json"), null)
assert.equal(weekdayOpening(week(["Closed"])), null)

const missingFriday = JSON.parse(week(["7AM-3PM"])) as Record<string, string[]>
delete missingFriday.Friday
assert.equal(weekdayOpening(JSON.stringify(missingFriday)), null)

const varied = JSON.parse(week(["7AM-3PM"])) as Record<string, string[]>
varied.Friday = ["8AM-2PM"]
varied.Wednesday = ["6:30AM-2PM"]
const variedOpening = weekdayOpening(JSON.stringify(varied))
assert.equal(variedOpening?.label, "6:30–8:00 AM")
assert.match(variedOpening?.detail ?? "", /Friday 8:00 AM/)

const mixed = JSON.parse(week(["7AM-3PM"])) as Record<string, string[]>
mixed.Monday = ["Open 24 hours"]
assert.equal(weekdayOpening(JSON.stringify(mixed))?.label, "Open 24 hours or by 7:00 AM")

const data = buildBreakfastGuideData([
  row({
    name: "Late Cafe",
    slug: "late-cafe",
    borough: "Brooklyn",
    working_hours: week(["9AM-5PM"]),
    inspection_grade: "A",
    inspection_date: "11/2/2026",
  }),
  row({
    name: "Plain Diner",
    slug: "plain-diner",
    borough: "Manhattan",
    working_hours: week(["7AM-3PM"]),
    inspection_grade: "A",
    rating: 4.9,
    reviews: 20,
    inspection_score: 4,
    inspection_date: "9/30/2026",
  }),
  row({
    name: "Tagged Bowl",
    slug: "tagged-bowl",
    borough: "Manhattan",
    working_hours: week(["6:30AM-2PM"]),
    inspection_grade: "a",
    dietary_tags: "vegan|gluten-free",
    rating: 4.2,
    reviews: 10,
    inspection_score: 9,
    inspection_date: "10/1/2026",
  }),
  row({
    name: "Grade B Bagel",
    slug: "grade-b-bagel",
    borough: "Queens",
    working_hours: week(["Open 24 hours"]),
    inspection_grade: "B",
    inspection_date: "1/5/2026",
  }),
  row({
    name: "No Borough",
    slug: "no-borough",
    borough: null,
    working_hours: week(["7AM-11AM"]),
    inspection_grade: "A",
    inspection_date: "8/1/2026",
  }),
  ...Array.from({ length: 12 }, (_, index) =>
    row({
      name: `Extra ${index}`,
      slug: `extra-${index}`,
      borough: "Bronx",
      working_hours: week(["7AM-1PM"]),
      inspection_grade: "A",
      rating: index / 10,
      inspection_date: "3/1/2026",
    }),
  ),
])

assert.equal(data.earlyOpeners, 16)
assert.equal(data.gradeA, 15)
assert.equal(data.newestInspectionLabel, "October 1, 2026")
assert.equal(data.unassignedEarlyOpeners, 1)
assert.equal(data.unassignedGradeA, 1)

const manhattan = data.boroughs.find((borough) => borough.borough === "Manhattan")
assert.ok(manhattan)
assert.equal(manhattan.earlyOpeners, 2)
assert.equal(manhattan.gradeA, 2)
assert.equal(manhattan.href, "/nyc/manhattan/healthy-restaurants")
assert.deepEqual(manhattan.shown.map((spot) => spot.slug), ["tagged-bowl", "plain-diner"])
assert.equal(manhattan.shown[0]?.weekdayOpenLabel, "6:30 AM")
assert.equal(manhattan.shown[1]?.inspectionScore, 4)
assert.equal(manhattan.shown[1]?.inspectionDateLabel, "September 30, 2026")

const brooklyn = data.boroughs.find((borough) => borough.borough === "Brooklyn")
assert.equal(brooklyn?.earlyOpeners, 0)
assert.equal(brooklyn?.shown.length, 0)

const queens = data.boroughs.find((borough) => borough.borough === "Queens")
assert.equal(queens?.earlyOpeners, 1)
assert.equal(queens?.gradeA, 0)
assert.equal(queens?.shown.length, 0)

const bronx = data.boroughs.find((borough) => borough.borough === "Bronx")
assert.equal(bronx?.gradeA, 12)
assert.equal(bronx?.shown.length, BREAKFAST_LIST_LIMIT)
assert.equal(data.boroughs.map((borough) => borough.borough).join(","), "Manhattan,Brooklyn,Queens,Bronx,Staten Island")
assert.equal(data.listed.length, manhattan.shown.length + BREAKFAST_LIST_LIMIT)

assert.equal(getGuideBySlug("healthy-breakfast-nyc")?.title, "Healthy breakfast in NYC")
assert.equal(breakfastGuideTitle(239), "Healthy Breakfast NYC: 239 Grade A Spots Open by 8 AM")

const page = readFileSync(new URL("../app/guides/healthy-breakfast-nyc/page.tsx", import.meta.url), "utf8")
const grades = readFileSync(new URL("../app/guides/nyc-health-grades-explained/page.tsx", import.meta.url), "utf8")
assert.match(page, /export const revalidate = 86400/)
assert.match(page, /ClaimListingCta source="breakfast_guide"/)
assert.match(page, /Own a Grade A breakfast spot\? Claim your free listing/)
assert.match(page, /buildHubItemList/)
assert.match(page, /FAQSchema/)
assert.doesNotMatch(page, /Why healthy breakfast matters|organic ingredients|near me/i)
assert.match(grades, /href: "\/guides\/healthy-breakfast-nyc", label: "healthy breakfast in NYC"/)
assert.match(readFileSync(new URL("../../public/llms.txt", import.meta.url), "utf8"), /guides\/healthy-breakfast-nyc/)
assert.match(readFileSync(new URL("../../src/app/sitemap.ts", import.meta.url), "utf8"), /guide\.updatedDate \?\? guide\.publishedDate/)

console.log("breakfast hours tests passed")
