import assert from "node:assert/strict"
import { HEALTH_GRADE_FAQS } from "../content/health-grade-faqs"
import { summarizePublishedGrades } from "../lib/grade-guide-snapshot"

const snapshot = summarizePublishedGrades([
  { inspection_grade: "A", inspection_date: "9/30/2026" },
  { inspection_grade: " a ", inspection_date: "1/5/2026" },
  { inspection_grade: "B", inspection_date: "11/2/2026" },
  { inspection_grade: "C", inspection_date: "2/28/2026" },
  { inspection_grade: "Z", inspection_date: "10/2/2026" },
  { inspection_grade: "P", inspection_date: "1/1/1900" },
  { inspection_grade: "N", inspection_date: null },
  { inspection_grade: null, inspection_date: "13/40/2026" },
  { inspection_grade: "", inspection_date: "  " },
])

assert.equal(snapshot.published, 9)
assert.equal(snapshot.A, 2)
assert.equal(snapshot.B, 1)
assert.equal(snapshot.C, 1)
assert.equal(snapshot.pendingZ, 1)
assert.equal(snapshot.pendingP, 1)
assert.equal(snapshot.pending, 2)
assert.equal(snapshot.ungraded, 3)
assert.equal(snapshot.gradeAShareOfPublished, 22)
assert.equal(snapshot.latestInspectionIso, "2026-11-02", "November wins over September and a 1900 placeholder")
assert.equal(snapshot.latestInspectionLabel, "November 2, 2026")
assert.notEqual(
  ["9/30/2026", "11/2/2026"].sort().reverse()[0],
  "11/2/2026",
  "M/D/YYYY string sort still hides November behind September",
)

const empty = summarizePublishedGrades([])
assert.equal(empty.published, 0)
assert.equal(empty.gradeAShareOfPublished, 0)
assert.equal(empty.latestInspectionIso, null)
assert.equal(empty.latestInspectionLabel, null)

assert.ok(HEALTH_GRADE_FAQS.length >= 5 && HEALTH_GRADE_FAQS.length <= 7, "grades guide keeps 5–7 FAQs")
const questions = HEALTH_GRADE_FAQS.map((faq) => faq.question)
for (const expected of [
  "What does Grade Pending mean in NYC?",
  "How often are NYC restaurants inspected?",
  "What score is a C in NYC?",
  "Can a restaurant post a different grade?",
]) {
  assert.ok(questions.includes(expected), expected)
}
for (const faq of HEALTH_GRADE_FAQS) {
  assert.ok(faq.answer.length > 40, faq.question)
}
const c = HEALTH_GRADE_FAQS.find((faq) => faq.question === "What score is a C in NYC?")
assert.ok(c?.answer.includes("28"), "C answer states the 28-point cutoff")
const posting = HEALTH_GRADE_FAQS.find((faq) => faq.question === "Can a restaurant post a different grade?")
assert.equal(posting?.answer.startsWith("No."), true)

console.log("grade guide snapshot tests passed")
