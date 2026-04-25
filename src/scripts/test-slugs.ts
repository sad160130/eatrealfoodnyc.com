import { neighborhoodToSlug, boroughToSlug } from "../lib/utils"

const tests: [string, string][] = [
  ["Hell's Kitchen", "hells-kitchen"],
  ["Co-op City", "co-op-city"],
  ["St. George", "st-george"],
  ["Hunters Point", "hunters-point"],
  ["Bedford-Stuyvesant", "bedford-stuyvesant"],
  ["Crown Heights", "crown-heights"],
  ["Jackson Heights", "jackson-heights"],
  ["Flushing", "flushing"],
  ["East New York", "east-new-york"],
  ["Bay Ridge", "bay-ridge"],
  ["Park Slope", "park-slope"],
  ["Fort Greene", "fort-greene"],
  ["Boerum Hill", "boerum-hill"],
  ["Carroll Gardens", "carroll-gardens"],
  ["Windsor Terrace", "windsor-terrace"],
]

let pass = 0
let fail = 0
for (const [input, expected] of tests) {
  const result = neighborhoodToSlug(input)
  const ok = result === expected
  if (ok) pass++
  else fail++
  console.log((ok ? "✅" : "❌") + " " + input + " → " + result + (ok ? "" : " (expected: " + expected + ")"))
}
console.log("\nPass: " + pass + "/" + (pass + fail))

console.log("\n=== Borough tests ===")
for (const b of ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]) {
  console.log(b + " → " + boroughToSlug(b))
}
