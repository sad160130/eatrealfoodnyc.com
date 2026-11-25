import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { CITYWIDE_RESTAURANT_GRADES } from "../data/citywide-restaurant-grades"
import {
  highestGradeABoroughs,
  percentOneDecimal,
  summarizeCitywideGrades,
} from "../lib/citywide-grades"

const tied = summarizeCitywideGrades({
  letterRows: [
    { camis: "1", boro: "Manhattan", grade: "A", latest: "2026-01-01T00:00:00.000" },
    { camis: "1", boro: "Brooklyn", grade: "B", latest: "2026-06-01T00:00:00.000" },
    { camis: "2", boro: "Queens", grade: "A", latest: "2026-05-01T00:00:00.000" },
    { camis: "2", boro: "Bronx", grade: "C", latest: "2026-05-01T00:00:00.000" },
    { camis: "3", boro: "Staten Island", grade: "A", latest: "2026-04-01T00:00:00.000" },
    { camis: "3", boro: "MANHATTAN", grade: "A", latest: "2026-04-01T00:00:00.000" },
  ],
  anyGradeRows: [
    { camis: "1", grade: "B", latest: "2026-06-01T00:00:00.000" },
    { camis: "1", grade: "Z", latest: "2026-08-01T00:00:00.000" },
    { camis: "1", grade: null, latest: "2026-08-01T00:00:00.000" },
    { camis: "4", grade: "P", latest: "2026-03-01T00:00:00.000" },
    { camis: "4", grade: "A", latest: "2026-01-01T00:00:00.000" },
    { camis: "5", grade: "Z", latest: "2026-02-01T00:00:00.000" },
    { camis: "5", grade: "A", latest: "2026-02-01T00:00:00.000" },
    { camis: "6", grade: null, latest: "2026-07-01T00:00:00.000" },
  ],
})

assert.equal(tied.a, 1, "same letter on two boroughs still counts as A")
assert.equal(tied.b, 1, "older A is not the latest letter")
assert.equal(tied.c, 0)
assert.equal(tied.letterTies, 1, "two letters on the same date are left out")
assert.equal(tied.boroughUnassigned, 1, "two boroughs on the same letter date are not assigned")
assert.equal(tied.boroughs.find((borough) => borough.borough === "Brooklyn")?.b, 1)
assert.equal(tied.pendingZ, 1, "Z beside a blank grade on the newest date counts as Z")
assert.equal(tied.pendingP, 1, "a later P with no other code counts as P")
assert.equal(tied.pending, 2)
assert.equal(tied.pendingAmbiguous, 1, "Z and A on the same newest date are not called pending")

assert.equal(percentOneDecimal(22236, 24855), "89.5%")
assert.equal(percentOneDecimal(8811, 9706), "90.8%")
assert.equal(percentOneDecimal(0, 10), "0.0%")

const live = CITYWIDE_RESTAURANT_GRADES
assert.equal(live.datasetId, "43nn-pn8j")
assert.equal(live.pulledOn, "2026-11-25")
assert.equal(live.newestInspectionDate, "2026-11-23")
assert.equal(live.a, 22236)
assert.equal(live.b, 1974)
assert.equal(live.c, 645)
assert.equal(live.letterGraded, 24855)
assert.equal(live.a + live.b + live.c, live.letterGraded)
assert.equal(live.pendingZ, 1004)
assert.equal(live.pendingP, 0)
assert.equal(live.pending, 1004)
assert.equal(live.letterTies, 0)
assert.equal(live.pendingAmbiguous, 0)
assert.equal(live.boroughUnassigned, 21)
const boroughSum = live.boroughs.reduce((sum, borough) => sum + borough.letterGraded, 0)
assert.equal(boroughSum + live.boroughUnassigned, live.letterGraded)
for (const borough of live.boroughs) {
  assert.equal(borough.a + borough.b + borough.c, borough.letterGraded, borough.borough)
}
const winners = highestGradeABoroughs(live.boroughs)
assert.deepEqual(winners.map((borough) => borough.borough), ["Manhattan"])

const page = readFileSync(new URL("../app/guides/nyc-health-grades-explained/page.tsx", import.meta.url), "utf8")
assert.match(page, /Citywide NYC restaurant grades/)
assert.match(page, /not the directory counts/)
assert.match(page, /CITYWIDE_RESTAURANT_GRADES/)

const llms = readFileSync(new URL("../../public/llms.txt", import.meta.url), "utf8")
assert.match(llms, /NYC Restaurant Grades Explained/)
assert.match(llms, /pulled 2026-11-25/)
assert.match(llms, /2026-11-23/)

console.log("citywide grade tests passed")
