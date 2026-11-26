import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import { FOOD_SAFETY_SENTENCE } from "../lib/nta-grade-share"
import { getGuideBySlug } from "../config/guides"
import {
  BAGEL_ANSWER,
  BAGEL_BOROUGHS,
  BAGEL_CUISINE_COUNT,
  BAGEL_DESCRIPTION,
  BAGEL_ESTABLISHMENT_COUNT,
  BAGEL_FAQS,
  BAGEL_GRADE_A_COUNT,
  BAGEL_KEYWORD,
  BAGEL_LINKED,
  BAGEL_NAME_ONLY_COUNT,
  BAGEL_PATH,
  BAGEL_SHOPS,
  BAGEL_TITLE,
  BAGEL_UNMATCHED,
  DOHMH_DATASET_ID,
  DOHMH_RECORD_DATE,
  articleSchema,
  faqPageSchema,
  itemListSchema,
  pageInternalHrefs,
  wordCount,
} from "../data/best-bagels-nyc"

assert.equal(BAGEL_KEYWORD, "best bagels nyc")
assert.equal(BAGEL_TITLE, "Best Bagels in NYC by Inspection Grade (2026)")
assert.ok(BAGEL_TITLE.length <= TITLE_MAX, String(BAGEL_TITLE.length))
assert.ok(BAGEL_DESCRIPTION.length <= DESCRIPTION_MAX, `${BAGEL_DESCRIPTION.length}: ${BAGEL_DESCRIPTION}`)
assert.equal(BAGEL_PATH, "/guides/best-bagels-nyc")
assert.equal(DOHMH_DATASET_ID, "43nn-pn8j")
assert.equal(DOHMH_RECORD_DATE, "2026-11-25T06:00:23.000")
assert.equal(BAGEL_ESTABLISHMENT_COUNT, 402)
assert.equal(BAGEL_GRADE_A_COUNT, 266)
assert.equal(BAGEL_CUISINE_COUNT, 247)
assert.equal(BAGEL_NAME_ONLY_COUNT, 155)
assert.equal(BAGEL_CUISINE_COUNT + BAGEL_NAME_ONLY_COUNT, BAGEL_ESTABLISHMENT_COUNT)
assert.equal(BAGEL_SHOPS.length, 402)
assert.equal(new Set(BAGEL_SHOPS.map((row) => row.camis)).size, 402)
assert.equal(BAGEL_LINKED.length, 13)
assert.ok(wordCount(BAGEL_ANSWER) <= 40, String(wordCount(BAGEL_ANSWER)))
assert.match(BAGEL_ANSWER, /402/)
assert.match(BAGEL_ANSWER, /266/)
assert.match(BAGEL_ANSWER, /November 25, 2026/)
assert.match(BAGEL_ANSWER, /43nn-pn8j/)
assert.match(BAGEL_ANSWER, /best bagels in NYC/i)
assert.ok(BAGEL_FAQS.some((faq) => faq.answer.includes(FOOD_SAFETY_SENTENCE)))
assert.ok(BAGEL_FAQS.some((faq) => faq.answer.includes("It is not a taste claim.")))

assert.deepEqual(
  BAGEL_BOROUGHS.map((group) => [group.borough, group.shops.length, group.gradeA]),
  [
    ["Manhattan", 176, 114],
    ["Brooklyn", 115, 78],
    ["Queens", 88, 60],
    ["Bronx", 5, 2],
    ["Staten Island", 18, 12],
  ]
)

for (const group of BAGEL_BOROUGHS) {
  const gradeA = group.shops.filter((shop) => shop.gradeCode === "A")
  assert.equal(gradeA.length, group.gradeA)
  for (let i = 1; i < gradeA.length; i += 1) {
    const prev = gradeA[i - 1].score ?? Number.POSITIVE_INFINITY
    const cur = gradeA[i].score ?? Number.POSITIVE_INFINITY
    assert.ok(prev <= cur, `${group.borough} score order`)
  }
  assert.ok(group.shops.filter((shop) => shop.gradeCode === "A").every((shop, index) => shop.rank === index + 1))
}

const slugs = new Set(BAGEL_LINKED.map((shop) => shop.slug))
for (const slug of ["bagel-chef", "bagel-pub-crown", "murrays-bagels"]) assert.ok(slugs.has(slug), slug)
for (const slug of ["green-cafe", "utopia-bagels", "best-bagel-coffee"]) assert.equal(slugs.has(slug), false, slug)
assert.equal(BAGEL_UNMATCHED.map((row) => row.slug).includes("utopia-bagels"), true)

const siteUrl = "https://www.eatrealfoodnyc.com"
const article = articleSchema(siteUrl)
const faqs = faqPageSchema()
const list = itemListSchema(siteUrl)
assert.equal(article["@type"], "Article")
assert.equal(faqs["@type"], "FAQPage")
assert.equal(list["@type"], "ItemList")
assert.equal(list.numberOfItems, list.itemListElement.length)
assert.equal(list.numberOfItems, 13)
assert.ok(pageInternalHrefs().includes("/guides/healthy-breakfast-nyc"))
assert.ok(pageInternalHrefs().includes("/restaurants/murrays-bagels"))

const guide = getGuideBySlug("best-bagels-nyc")
assert.ok(guide)
assert.equal(guide.title, BAGEL_TITLE)
assert.equal(guide.description, BAGEL_DESCRIPTION)

const page = readFileSync(new URL("../app/guides/best-bagels-nyc/page.tsx", import.meta.url), "utf8")
assert.match(page, /articleSchema/)
assert.match(page, /faqPageSchema/)
assert.match(page, /itemListSchema/)
assert.match(page, /BAGEL_ANSWER/)
assert.match(page, /FOOD_SAFETY_SENTENCE/)
assert.match(page, /It is not a taste claim/)
const guides = readFileSync(new URL("../config/guides.ts", import.meta.url), "utf8")
assert.match(guides, /best-bagels-nyc/)
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /GUIDES\.map/)
const llms = readFileSync(new URL("../lib/llms-txt.ts", import.meta.url), "utf8")
assert.match(llms, /guides\/best-bagels-nyc/)
assert.match(llms, /266 hold a Grade A/)
assert.match(llms, /2026-11-25T06:00:23\.000/)
const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/best-bagels-nyc/)
const links = readFileSync(new URL("../lib/listing-guide-links.ts", import.meta.url), "utf8")
assert.match(links, /best-bagels-nyc/)
const breakfast = readFileSync(new URL("../app/guides/healthy-breakfast-nyc/page.tsx", import.meta.url), "utf8")
assert.match(breakfast, /\/guides\/best-bagels-nyc/)

console.log("best bagels nyc tests passed")
