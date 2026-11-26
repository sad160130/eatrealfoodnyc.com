import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import { FOOD_SAFETY_SENTENCE } from "../lib/nta-grade-share"
import { pickLatestInspection } from "../lib/latest-scored-inspection"
import { getGuideBySlug } from "../config/guides"
import {
  AWASH_CAMIS,
  AWASH_SLUG,
  DOHMH_DATASET_ID,
  DOHMH_FILE_ROWS,
  DOHMH_NEWEST_INSPECTION_DATE,
  DOHMH_NEWEST_INSPECTION_LABEL,
  DOHMH_RECORD_DATE,
  DOHMH_RECORD_DATE_LABEL,
  ETHIOPIAN_DESCRIPTION,
  ETHIOPIAN_ESTABLISHMENT_COUNT,
  ETHIOPIAN_FAQS,
  ETHIOPIAN_GRADE_A_COUNT,
  ETHIOPIAN_INTRO,
  ETHIOPIAN_KEYWORD,
  ETHIOPIAN_NOT_YET_INSPECTED_COUNT,
  ETHIOPIAN_PATH,
  ETHIOPIAN_RESTAURANTS,
  ETHIOPIAN_TITLE,
  articleSchema,
  faqPageSchema,
  pageInternalHrefs,
} from "../data/ethiopian-restaurants-nyc"

assert.equal(ETHIOPIAN_KEYWORD, "Ethiopian restaurants NYC")
assert.equal(ETHIOPIAN_TITLE, "Ethiopian Restaurants NYC: Inspection Grades Checked (2026)")
assert.ok(ETHIOPIAN_TITLE.length <= TITLE_MAX, String(ETHIOPIAN_TITLE.length))
assert.ok(ETHIOPIAN_DESCRIPTION.length <= DESCRIPTION_MAX, `${ETHIOPIAN_DESCRIPTION.length}: ${ETHIOPIAN_DESCRIPTION}`)
assert.equal(ETHIOPIAN_PATH, "/guides/ethiopian-restaurants-nyc")
assert.equal(DOHMH_DATASET_ID, "43nn-pn8j")
assert.equal(DOHMH_RECORD_DATE, "2026-11-25T06:00:23.000")
assert.equal(DOHMH_RECORD_DATE_LABEL, "November 25, 2026")
assert.equal(DOHMH_NEWEST_INSPECTION_DATE, "2026-11-23")
assert.equal(DOHMH_NEWEST_INSPECTION_LABEL, "November 23, 2026")
assert.equal(DOHMH_FILE_ROWS, 295389)
assert.equal(ETHIOPIAN_ESTABLISHMENT_COUNT, 19)
assert.equal(ETHIOPIAN_GRADE_A_COUNT, 13)
assert.equal(ETHIOPIAN_NOT_YET_INSPECTED_COUNT, 0)
assert.equal(ETHIOPIAN_RESTAURANTS.length, 19)
assert.equal(new Set(ETHIOPIAN_RESTAURANTS.map((row) => row.camis)).size, 19)
assert.match(ETHIOPIAN_INTRO, /Ethiopian restaurants NYC/)
assert.ok(ETHIOPIAN_INTRO.includes(FOOD_SAFETY_SENTENCE))
assert.ok(ETHIOPIAN_INTRO.includes("19"))
assert.ok(ETHIOPIAN_INTRO.includes("13"))
assert.equal(FOOD_SAFETY_SENTENCE, "Grade A is a food-safety grade, not a health claim.")

const awash = ETHIOPIAN_RESTAURANTS.find((row) => row.camis === AWASH_CAMIS)
assert.ok(awash)
assert.equal(awash.slug, AWASH_SLUG)
assert.equal(awash.gradeCode, "A")
assert.equal(awash.score, 13)
assert.equal(awash.inspectionDate, "2026-09-16")
assert.equal(awash.place, "Cobble Hill, Brooklyn")
assert.equal(awash.address, "242 Court Street, Brooklyn, NY 11201")

const eastSixth = ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "41044592")
assert.equal(eastSixth?.slug, null)
assert.equal(eastSixth?.gradeCode, "A")
assert.equal(eastSixth?.score, 12)

const amsterdam = ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "41426727")
assert.equal(amsterdam?.slug, "awash-ethiopian-restaurant")
assert.equal(amsterdam?.score, 12)
assert.equal(amsterdam?.inspectionDate, "2026-08-27")

assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "50065115")?.slug, "benyam")
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "40388091")?.slug, "massawa")
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "50170694")?.gradeCode, "N")
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "50170694")?.gradeLabel, "Not Yet Graded")
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "50168459")?.score, 0)
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.camis === "50168459")?.gradeLabel, "Not Yet Graded")
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.slug === "addey-ababa")?.gradeCode, null)
assert.equal(ETHIOPIAN_RESTAURANTS.find((row) => row.slug === "addey-ababa")?.score, 32)

assert.deepEqual(
  ETHIOPIAN_RESTAURANTS.map((row) => row.rank),
  ETHIOPIAN_RESTAURANTS.map((_, index) => index + 1)
)
for (let i = 1; i < ETHIOPIAN_RESTAURANTS.length; i += 1) {
  const prev = ETHIOPIAN_RESTAURANTS[i - 1]
  const cur = ETHIOPIAN_RESTAURANTS[i]
  if (prev.gradeCode === "A" && cur.gradeCode === "A") {
    assert.ok(prev.score != null && cur.score != null)
    assert.ok(
      prev.score < cur.score || (prev.score === cur.score && (prev.inspectionDate ?? "") >= (cur.inspectionDate ?? "")),
      `${prev.name} should rank above ${cur.name}`
    )
  }
}
assert.equal(ETHIOPIAN_RESTAURANTS.filter((row) => row.gradeCode === "A").every((row, index) => row.rank === index + 1), true)
assert.ok(ETHIOPIAN_RESTAURANTS.find((row) => row.gradeCode === "B")!.rank > ETHIOPIAN_GRADE_A_COUNT)

for (const row of ETHIOPIAN_RESTAURANTS) {
  assert.doesNotMatch(row.factualLine, /\$\d|injera|delicious|kitfo|hours|quote/i)
  assert.match(row.factualLine, /Ethiopian|Published as/)
  if (!row.slug) assert.match(row.factualLine, /No published listing matched/)
}

assert.equal(ETHIOPIAN_FAQS.length, 4)
assert.match(ETHIOPIAN_FAQS[2].answer, /score of 13 is the last point of the A band/)
assert.match(ETHIOPIAN_FAQS[2].answer, /14 starts the B band/)
assert.match(ETHIOPIAN_FAQS[2].answer, /41653556/)

const placeholder = pickLatestInspection([
  { inspectionDate: "1900-01-01T00:00:00.000", grade: "A", score: "2" },
])
assert.equal(placeholder.kind, "not-yet-inspected")

const laterScore = pickLatestInspection([
  { inspectionDate: "2025-02-11T00:00:00.000", grade: "A", score: "9" },
  { inspectionDate: "2026-09-03T00:00:00.000", grade: null, score: "32" },
])
assert.equal(laterScore.inspectionDate, "2026-09-03")
assert.equal(laterScore.grade, null)
assert.equal(laterScore.score, 32)
assert.equal(laterScore.olderGrade?.grade, "A")
assert.equal(laterScore.olderGrade?.score, 9)

const blankAdmin = pickLatestInspection([
  { inspectionDate: "2025-08-06T00:00:00.000", grade: "B", score: "15" },
  { inspectionDate: "2026-04-09T00:00:00.000", grade: null, score: null },
])
assert.equal(blankAdmin.inspectionDate, "2025-08-06")
assert.equal(blankAdmin.grade, "B")
assert.equal(blankAdmin.skippedBlankDate, "2026-04-09")

const pending = pickLatestInspection([{ inspectionDate: "2026-01-01T00:00:00.000", grade: "Z", score: "5" }])
assert.equal(pending.grade, "Z")

const siteUrl = "https://www.eatrealfoodnyc.com"
const article = articleSchema(siteUrl)
const faqs = faqPageSchema()
assert.equal(article["@type"], "Article")
assert.equal(article.headline, ETHIOPIAN_TITLE)
assert.equal(article.dateModified, "2026-11-26")
assert.equal(faqs["@type"], "FAQPage")
assert.equal(faqs.mainEntity.length, 4)

const guide = getGuideBySlug("ethiopian-restaurants-nyc")
assert.ok(guide)
assert.equal(guide.title, ETHIOPIAN_TITLE)
assert.equal(guide.metaTitle, ETHIOPIAN_TITLE)
assert.equal(guide.description, ETHIOPIAN_DESCRIPTION)
assert.equal(guide.keywords[0], ETHIOPIAN_KEYWORD)

for (const href of [
  "/guides/nyc-health-grades-explained",
  "/data/nyc-restaurant-score-13-cliff",
  "/data/nyc-restaurant-health-grade-report",
  "/nyc/brooklyn/healthy-restaurants",
  "/nyc/manhattan/healthy-restaurants",
  "/restaurants/awash",
]) {
  assert.ok(pageInternalHrefs().includes(href), href)
}

const page = readFileSync(new URL("../app/guides/ethiopian-restaurants-nyc/page.tsx", import.meta.url), "utf8")
assert.match(page, /<table/)
assert.match(page, /GuideYoutubeShort/)
assert.match(page, /AWASH_SLUG/)
assert.match(page, /How to read an inspection record/)
assert.match(page, /faqPageSchema/)
assert.match(page, /articleSchema/)
assert.match(page, /FOOD_SAFETY_SENTENCE/)
assert.match(page, /ETHIOPIAN_INTRO/)
assert.doesNotMatch(page, /export const revalidate/)

const guides = readFileSync(new URL("../config/guides.ts", import.meta.url), "utf8")
assert.match(guides, /ethiopian-restaurants-nyc/)
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /GUIDES\.map/)
const llms = readFileSync(new URL("../lib/llms-txt.ts", import.meta.url), "utf8")
assert.match(llms, /guides\/ethiopian-restaurants-nyc/)
assert.match(llms, /2026-11-25T06:00:23\.000/)
assert.match(llms, /2026-11-23/)
const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/ethiopian-restaurants-nyc/)
const links = readFileSync(new URL("../lib/listing-guide-links.ts", import.meta.url), "utf8")
assert.match(links, /ethiopian-restaurants-nyc/)

console.log("ethiopian restaurants tests passed")
