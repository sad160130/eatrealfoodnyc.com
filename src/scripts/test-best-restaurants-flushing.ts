import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import { FOOD_SAFETY_SENTENCE } from "../lib/nta-grade-share"
import { getGuideBySlug } from "../config/guides"
import {
  DOHMH_DATASET_ID,
  DOHMH_RECORD_DATE,
  FLUSHING_ANSWER,
  FLUSHING_CUISINE_PICKS,
  FLUSHING_DESCRIPTION,
  FLUSHING_ESTABLISHMENT_COUNT,
  FLUSHING_FAQS,
  FLUSHING_GRADE_A_LINKED,
  FLUSHING_KEYWORD,
  FLUSHING_LINKED,
  FLUSHING_NOT_GRADE_A,
  FLUSHING_NTA,
  FLUSHING_PATH,
  FLUSHING_SHARE,
  FLUSHING_TITLE,
  PRIOR_FLUSHING,
  articleSchema,
  faqPageSchema,
  itemListSchema,
  pageInternalHrefs,
  wordCount,
} from "../data/best-restaurants-flushing"

assert.equal(FLUSHING_KEYWORD, "restaurants in flushing")
assert.equal(FLUSHING_TITLE, "Grade A Restaurants in Flushing, Queens (2026)")
assert.ok(FLUSHING_TITLE.length <= TITLE_MAX, String(FLUSHING_TITLE.length))
assert.ok(FLUSHING_DESCRIPTION.length <= DESCRIPTION_MAX, `${FLUSHING_DESCRIPTION.length}: ${FLUSHING_DESCRIPTION}`)
assert.equal(FLUSHING_PATH, "/guides/best-restaurants-flushing")
assert.equal(FLUSHING_NTA, "QN22")
assert.equal(DOHMH_DATASET_ID, "43nn-pn8j")
assert.equal(DOHMH_RECORD_DATE, "2026-11-25T06:00:23.000")
assert.equal(FLUSHING_ESTABLISHMENT_COUNT, 631)
assert.equal(FLUSHING_SHARE.share, "78.1%")
assert.equal(FLUSHING_SHARE.a, 345)
assert.equal(FLUSHING_SHARE.letterGraded, 442)
assert.equal(FLUSHING_SHARE.uniqueLowest, true)
assert.equal(FLUSHING_SHARE.ntaCount, 80)
assert.equal(PRIOR_FLUSHING.share, "79.8%")
assert.equal(PRIOR_FLUSHING.a, 332)
assert.equal(PRIOR_FLUSHING.letterGraded, 416)
assert.ok(wordCount(FLUSHING_ANSWER) <= 40, `${wordCount(FLUSHING_ANSWER)}: ${FLUSHING_ANSWER}`)
assert.match(FLUSHING_ANSWER, /78\.1%/)
assert.match(FLUSHING_ANSWER, /345 of 442/)
assert.match(FLUSHING_ANSWER, /November 25, 2026/)
assert.match(FLUSHING_ANSWER, /43nn-pn8j/)
assert.match(FLUSHING_ANSWER, /Restaurants in Flushing/)
assert.equal(FLUSHING_LINKED.length, 15)
assert.equal(FLUSHING_GRADE_A_LINKED.length, 10)
assert.equal(FLUSHING_NOT_GRADE_A.length, 5)
assert.equal(FLUSHING_LINKED.find((row) => row.slug === "pho-hoang")?.gradeCode, null)
assert.equal(FLUSHING_LINKED.find((row) => row.slug === "pho-hoang")?.score, 40)
assert.equal(FLUSHING_LINKED.some((row) => row.slug === "izakaya-nana"), false)
assert.ok(FLUSHING_GRADE_A_LINKED.some((row) => row.slug === "gan-hoo-bbq"))
assert.ok(FLUSHING_CUISINE_PICKS.some((group) => group.cuisine === "Chinese" && group.gradeALinked === 4 && group.picks.length === 3))
assert.ok(FLUSHING_FAQS.some((faq) => faq.answer.includes(FOOD_SAFETY_SENTENCE)))
assert.ok(FLUSHING_FAQS.some((faq) => faq.answer.includes("It is not a taste claim.")))
assert.ok(pageInternalHrefs().includes("/nyc/queens/healthy-restaurants"))
assert.ok(pageInternalHrefs().includes("/data/nyc-restaurant-health-grade-report#neighborhoods"))
assert.ok(pageInternalHrefs().includes("/restaurants/gan-hoo-bbq"))

const siteUrl = "https://www.eatrealfoodnyc.com"
const list = itemListSchema(siteUrl)
assert.equal(articleSchema(siteUrl)["@type"], "Article")
assert.equal(faqPageSchema()["@type"], "FAQPage")
assert.equal(list["@type"], "ItemList")
assert.equal(list.numberOfItems, 10)
assert.equal(list.itemListElement.length, 10)

const guide = getGuideBySlug("best-restaurants-flushing")
assert.ok(guide)
assert.equal(guide.title, FLUSHING_TITLE)
assert.equal(guide.description, FLUSHING_DESCRIPTION)

const page = readFileSync(new URL("../app/guides/best-restaurants-flushing/page.tsx", import.meta.url), "utf8")
assert.match(page, /articleSchema/)
assert.match(page, /faqPageSchema/)
assert.match(page, /itemListSchema/)
assert.match(page, /FLUSHING_ANSWER/)
assert.match(page, /FOOD_SAFETY_SENTENCE/)
assert.match(page, /It is not a taste claim/)
assert.match(page, /REPORT_NEIGHBORHOODS/)
assert.match(page, /QUEENS_HUB/)
const llms = readFileSync(new URL("../lib/llms-txt.ts", import.meta.url), "utf8")
assert.match(llms, /guides\/best-restaurants-flushing/)
assert.match(llms, /78\.1% \(345 of 442\)/)
const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/best-restaurants-flushing/)
const queens = readFileSync(new URL("../components/inspection-context.tsx", import.meta.url), "utf8")
assert.match(queens, /best-restaurants-flushing/)
assert.match(queens, /borough === "Queens"/)
assert.match(queens, /neighborhood.trim\(\).toLowerCase\(\) === "flushing"/)

console.log("flushing restaurants tests passed")
