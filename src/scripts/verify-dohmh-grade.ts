import {
  latestGradedInspection,
  matchLatestGrades,
  addressKeyFromListing,
  type DohmhInspection,
} from "../lib/dohmh-grade"

function row(partial: Partial<DohmhInspection> & Pick<DohmhInspection, "camis" | "name" | "inspectionDate">): DohmhInspection {
  return {
    borough: "Manhattan",
    grade: null,
    score: null,
    building: null,
    street: null,
    zip: null,
    ...partial,
  }
}

const chamoun = latestGradedInspection([
  row({ camis: "1", name: "CHAMOUN'S WAY", inspectionDate: "2026-03-26", grade: null, score: 16 }),
  row({ camis: "1", name: "CHAMOUN'S WAY", inspectionDate: "2025-09-16", grade: "B", score: 16 }),
  row({ camis: "1", name: "CHAMOUN'S WAY", inspectionDate: "2023-05-23", grade: "A", score: 9 }),
])
if (chamoun?.grade !== "B" || chamoun.inspectionDate !== "2025-09-16") {
  console.error("expected Chamoun's latest graded inspection to be B on 2025-09-16", chamoun)
  process.exit(1)
}

const loaded = latestGradedInspection([
  row({ camis: "2", name: "LOADED", inspectionDate: "2026-05-28", grade: "Z", score: 61 }),
])
if (loaded?.grade !== "Z") {
  console.error("expected LOADED to stay Z", loaded)
  process.exit(1)
}

if (addressKeyFromListing("33-07 Ditmars Blvd, Queens, NY 11105") !== "33-07|ditmars blvd|11105") {
  console.error("address key failed", addressKeyFromListing("33-07 Ditmars Blvd, Queens, NY 11105"))
  process.exit(1)
}

const tap = matchLatestGrades(
  [{
    id: 9,
    name: "TAP Brazilian Café – 100% Gluten-Free | Tapioca Sandwiches & Açaí | Astoria – NYC",
    borough: "Queens",
    address: "33-07 Ditmars Blvd, Queens, NY 11105",
    inspection_grade: "A",
  }],
  [{
    camis: "50142142",
    name: "TAP NYC",
    borough: "queens",
    grade: "B",
    score: 24,
    inspectionDate: "2025-07-22",
    addressKey: "33-07|ditmars blvd|11105",
  }]
)
if (tap.changes.length !== 1 || tap.changes[0].toGrade !== "B" || tap.changes[0].matchedBy !== "address") {
  console.error("expected TAP NYC to match by address and replace A with B", tap)
  process.exit(1)
}

console.log("DOHMH grade selection checks passed")
