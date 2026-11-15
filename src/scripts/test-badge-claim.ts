import { badgeKind, badgeSnippet, inspectionLabel, renderBadgeSvg } from "../lib/badge"
import { claimContent, claimHoneypotTripped, validateClaim } from "../lib/claim-submission"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

assert(badgeKind("A") === "grade-a", "A is a Grade A badge")
assert(badgeKind("a") === "grade-a", "lowercase a is a Grade A badge")
assert(badgeKind("B") === "listed", "B is the neutral badge")
assert(badgeKind("Z") === "listed", "pending is the neutral badge")
assert(badgeKind(null) === "listed", "a missing grade is the neutral badge")
assert(badgeKind("") === "listed", "a blank grade is the neutral badge")

assert(inspectionLabel("11/10/2026") === "Inspected Nov 2026", "inspection month uses the stored date")
assert(inspectionLabel("1/1/1900") === null, "the 1900 placeholder is not an inspection month")
assert(inspectionLabel(null) === null, "a missing date has no inspection line")

const gradeA = renderBadgeSvg({ kind: "grade-a", inspected: "Inspected Nov 2026", theme: "light", width: 180, height: 60 })
assert(gradeA.includes("<title>Grade A on Eat Real Food NYC</title>"), "Grade A svg has a title")
assert(gradeA.includes(">Grade A<"), "Grade A svg shows the letter grade")
assert(gradeA.includes("Inspected Nov 2026"), "Grade A svg shows the inspection month")
assert(gradeA.includes('width="180"'), "default badge is 180 wide")

const smallDark = renderBadgeSvg({ kind: "grade-a", inspected: "Inspected Nov 2026", theme: "dark", width: 140, height: 47 })
assert(smallDark.includes('width="140"') && smallDark.includes('fill="#1B3A2D"'), "small dark badge keeps a forest field")

const listed = renderBadgeSvg({ kind: "listed", inspected: null, theme: "light", width: 180, height: 60 })
assert(listed.includes("Listed on Eat Real Food NYC"), "neutral badge has no grade claim")
assert(!listed.includes(">Grade A<"), "neutral badge does not print Grade A")

const snippet = badgeSnippet("dirt-candy", "grade-a")
assert(snippet.includes('href="https://www.eatrealfoodnyc.com/restaurants/dirt-candy?ref=badge"'), "snippet links to the listing")
assert(snippet.includes('src="https://www.eatrealfoodnyc.com/badge/dirt-candy.svg"'), "snippet loads the svg")
assert(!snippet.includes("nofollow"), "snippet does not nofollow our own page")

assert(validateClaim({ restaurantSlug: "dirt-candy", name: "Ada", role: "Owner", email: "ada@example.com", phone: "2125550100" }) === null, "a complete claim is valid")
assert(validateClaim({ restaurantSlug: "", name: "Ada", role: "Owner", email: "ada@example.com", phone: "2125550100" }) === "missing", "a claim needs a restaurant")
const content = claimContent({
  restaurantSlug: "dirt-candy",
  name: "Ada",
  role: "Owner",
  email: "ada@example.com",
  phone: "2125550100",
  fixes: ["hours", "diet tags", "not-a-fix"],
  dietTags: ["vegan", "made-up"],
  notes: "Open until 10",
})
assert(content.includes("Fixes: hours, diet tags"), "corrections are stored as text")
assert(content.includes("Diet tags: vegan"), "known diet tags are stored")
assert(!content.includes("made-up") && !content.includes("not-a-fix"), "unknown corrections are dropped")
assert(claimHoneypotTripped("http://spam"), "a filled honeypot trips")
assert(!claimHoneypotTripped("  "), "an empty honeypot does not trip")

console.log("badge and claim tests passed")
