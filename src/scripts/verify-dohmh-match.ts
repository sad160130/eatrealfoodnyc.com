import { latestGradePerCamis, matchInspections, type DohmhRecord } from "../lib/dohmh-match"
import { latestInspectionDate } from "../lib/inspection-dates"

const older: DohmhRecord = {
  camis: "1",
  name: "Havana Cafe",
  borough: "Bronx",
  grade: "B",
  score: 20,
  gradeDate: "2024-01-01",
  latitude: 40.85,
  longitude: -73.83,
}
const newer: DohmhRecord = { ...older, grade: "A", score: 9, gradeDate: "2025-09-08" }
const latest = latestGradePerCamis([older, newer])
if (latest.length !== 1 || latest[0].grade !== "A") {
  console.error("expected the newer grade to win")
  process.exit(1)
}

const result = matchInspections(
  [
    { id: 10, name: "Havana Café", borough: "The Bronx", latitude: 40.85, longitude: -73.83 },
    { id: 11, name: "Somewhere Else", borough: "Queens", latitude: null, longitude: null },
  ],
  [older, newer]
)
if (result.matched !== 1 || result.updates[0].grade !== "A" || result.updates[0].id !== 10) {
  console.error("match failed", result)
  process.exit(1)
}

const parsed = latestInspectionDate(["12/31/2024", "9/8/2025", "1/2/2025"])
if (!parsed || parsed.toISOString().slice(0, 10) !== "2025-09-08") {
  console.error("date parse failed", parsed)
  process.exit(1)
}

console.log("DOHMH match checks passed")
