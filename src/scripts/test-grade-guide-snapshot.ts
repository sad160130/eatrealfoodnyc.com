import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { getGuideBySlug } from "../config/guides"
import { HEALTH_GRADE_FAQS, HEALTH_GRADES_LEDE } from "../content/health-grade-faqs"
import { gradeAListAnswer, gradeAListQuestion } from "../lib/grade-a-faq"
import { HEALTH_GRADES_GUIDE_TITLE } from "../lib/seo-titles"
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

assert.equal(HEALTH_GRADE_FAQS.length, 12, "grades guide keeps the original FAQs and adds the two answer-watch questions")
const questions = HEALTH_GRADE_FAQS.map((faq) => faq.question)
assert.equal(new Set(questions).size, questions.length, "FAQ questions are not duplicated")
for (const expected of [
  "What does Grade Pending mean in NYC?",
  "How often are NYC restaurants inspected?",
  "What score is a C in NYC?",
  "Can a restaurant post a different grade?",
  "What do NYC restaurant grades mean?",
  "How do I look up a NYC restaurant's grade?",
  "How do NYC restaurant inspection grades work?",
  "Where can I check a NYC restaurant's health inspection?",
  "Which NYC borough has the highest share of Grade A restaurants?",
]) {
  assert.ok(questions.includes(expected), expected)
}
const lookup = HEALTH_GRADE_FAQS.find((faq) => faq.question === "How do I look up a NYC restaurant's grade?")
assert.match(lookup?.answer ?? "", /43nn-pn8j/)
assert.match(lookup?.answer ?? "", /data\.cityofnewyork\.us\/Health\/DOHMH-New-York-City-Restaurant-Inspection-Results\/43nn-pn8j/)
assert.doesNotMatch(lookup?.answer ?? "", /a816-health\.nyc\.gov/)
const howGrades = HEALTH_GRADE_FAQS.find((faq) => faq.question === "How do NYC restaurant inspection grades work?")
assert.ok(howGrades)
assert.match(howGrades.answer, /0 to 13/)
assert.match(howGrades.answer, /14 to 27/)
assert.match(howGrades.answer, /28 or more/)
assert.match(howGrades.answer, /Z or P/)
assert.match(howGrades.answer, /Fewer points is a better grade/)
assert.match(howGrades.answer, /posts the card the Department issued/)
assert.doesNotMatch(howGrades.answer, /\bbest\b/i)
assert.doesNotMatch(howGrades.answer, /\d{1,3},\d{3}/)
const whereCheck = HEALTH_GRADE_FAQS.find((faq) => faq.question === "Where can I check a NYC restaurant's health inspection?")
assert.ok(whereCheck)
assert.ok(whereCheck.answer.indexOf("https://a816-health.nyc.gov/ABCEatsRestaurants") < whereCheck.answer.indexOf("43nn-pn8j"))
assert.match(whereCheck.answer, /data\.cityofnewyork\.us\/Health\/DOHMH-New-York-City-Restaurant-Inspection-Results\/43nn-pn8j/)
assert.match(whereCheck.answer, /matched grade, score, and inspection date/)
assert.match(whereCheck.answer, /card in the window/)
assert.doesNotMatch(whereCheck.answer, /\bbest\b/i)
assert.doesNotMatch(whereCheck.answer, /official or complete|complete city list|every inspected restaurant in the city file/i)
const boroughFaq = HEALTH_GRADE_FAQS.find((faq) => faq.question.startsWith("Which NYC borough"))
assert.match(boroughFaq?.answer ?? "", /Manhattan has the highest share/)
assert.match(boroughFaq?.answer ?? "", /90\.8%/)
assert.match(boroughFaq?.answer ?? "", /not the published listings/)
assert.match(boroughFaq?.answer ?? "", /November 25, 2026/)
const ledeWords = HEALTH_GRADES_LEDE.trim().split(/\s+/)
assert.ok(ledeWords.length >= 40 && ledeWords.length <= 60, `lede is ${ledeWords.length} words`)
assert.equal(HEALTH_GRADES_LEDE.match(/NYC restaurant grades/g)?.length, 1)
const guide = getGuideBySlug("nyc-health-grades-explained")
assert.ok(guide)
assert.ok(guide.title.startsWith("NYC Restaurant Grades"), guide.title)
assert.equal(guide.metaTitle, HEALTH_GRADES_GUIDE_TITLE)
assert.equal(guide.updatedDate, "2026-11-25")
const page = readFileSync(new URL("../app/guides/nyc-health-grades-explained/page.tsx", import.meta.url), "utf8")
for (const href of [
  "/guides/grade-a-restaurants-by-borough-nyc",
  "/guides/best-pizza-restaurants-nyc",
  "/guides/best-italian-restaurants-nyc",
  "/data/nyc-restaurant-health-grade-report",
]) {
  assert.ok(page.includes(href), href)
}
assert.match(page, /dateModified: citywide\.pulledOn/)
assert.match(page, /NYC Restaurant Compliance Weekly/)
for (const faq of HEALTH_GRADE_FAQS) {
  assert.ok(faq.answer.length > 40, faq.question)
}
const c = HEALTH_GRADE_FAQS.find((faq) => faq.question === "What score is a C in NYC?")
assert.ok(c?.answer.includes("28"), "C answer states the 28-point cutoff")
const posting = HEALTH_GRADE_FAQS.find((faq) => faq.question === "Can a restaurant post a different grade?")
assert.equal(posting?.answer.startsWith("No."), true)

assert.equal(gradeAListQuestion({ neighborhoodName: "Williamsburg" }), "Which NYC restaurants have an A grade in Williamsburg?")
assert.equal(gradeAListQuestion({ boroughName: "Brooklyn" }), "Which NYC restaurants have an A grade in Brooklyn?")
assert.equal(gradeAListQuestion({}), "Which NYC restaurants have an A grade?")
const williamsburgAnswer = gradeAListAnswer(42, "Williamsburg")
assert.match(williamsburgAnswer, /42 published operational restaurants/)
assert.match(williamsburgAnswer, /not every inspected restaurant in Williamsburg/)
assert.match(williamsburgAnswer, /https:\/\/a816-health\.nyc\.gov\/ABCEatsRestaurants/)
assert.match(williamsburgAnswer, /guides\/nyc-health-grades-explained/)
assert.doesNotMatch(williamsburgAnswer, /\bbest\b/i)
assert.equal(gradeAListAnswer(1102, "Manhattan").includes("1,102"), true)
const hub = readFileSync(new URL("../components/grade-a-hub.tsx", import.meta.url), "utf8")
assert.match(hub, /gradeAListQuestion\(scope\)/)
assert.match(hub, /gradeAListAnswer\(total, place\)/)
assert.match(hub, /Published Grade A listings on this page/)

console.log("grade guide snapshot tests passed")
