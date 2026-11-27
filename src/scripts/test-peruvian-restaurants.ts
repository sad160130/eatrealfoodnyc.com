import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import { FOOD_SAFETY_SENTENCE } from "../lib/nta-grade-share"
import { getGuideBySlug } from "../config/guides"
import { getYoutubeShort } from "../lib/youtube-shorts"
import {
  DOHMH_DATASET_ID,
  DOHMH_FILE_ROWS,
  DOHMH_NEWEST_INSPECTION_DATE,
  DOHMH_NEWEST_INSPECTION_LABEL,
  DOHMH_RECORD_DATE,
  DOHMH_RECORD_DATE_LABEL,
  JORA,
  JORA_CAMIS,
  JORA_SHORT_VIDEO_ID,
  JORA_SLUG,
  LIC_HUB,
  PERUVIAN_BOROUGHS,
  PERUVIAN_DESCRIPTION,
  PERUVIAN_ESTABLISHMENT_COUNT,
  PERUVIAN_FAQS,
  PERUVIAN_GRADE_A_COUNT,
  PERUVIAN_GRADE_B_COUNT,
  PERUVIAN_GRADE_C_COUNT,
  PERUVIAN_GRADE_PENDING_COUNT,
  PERUVIAN_INSPECTED_COUNT,
  PERUVIAN_INTRO,
  PERUVIAN_KEYWORD,
  PERUVIAN_LINKED_COUNT,
  PERUVIAN_NOT_YET_GRADED_COUNT,
  PERUVIAN_NOT_YET_INSPECTED_COUNT,
  PERUVIAN_PATH,
  PERUVIAN_PLACEHOLDER_ROW_COUNT,
  PERUVIAN_RESTAURANTS,
  PERUVIAN_ROW_COUNT,
  PERUVIAN_TITLE,
  PERUVIAN_UNMATCHED,
  QUEENS_HUB,
  articleSchema,
  faqPageSchema,
  pageInternalHrefs,
} from "../data/peruvian-restaurants-nyc"

assert.equal(PERUVIAN_KEYWORD, "peruvian restaurants nyc")
assert.equal(PERUVIAN_TITLE, "Peruvian Restaurants NYC: Inspection Grades Checked (2026)")
assert.ok(PERUVIAN_TITLE.length <= TITLE_MAX, String(PERUVIAN_TITLE.length))
assert.ok(PERUVIAN_DESCRIPTION.length <= DESCRIPTION_MAX, `${PERUVIAN_DESCRIPTION.length}: ${PERUVIAN_DESCRIPTION}`)
assert.equal(PERUVIAN_PATH, "/guides/peruvian-restaurants-nyc")
assert.equal(DOHMH_DATASET_ID, "43nn-pn8j")
assert.equal(DOHMH_RECORD_DATE, "2026-11-26T06:00:29.000")
assert.equal(DOHMH_RECORD_DATE_LABEL, "November 26, 2026")
assert.equal(DOHMH_NEWEST_INSPECTION_DATE, "2026-11-24")
assert.equal(DOHMH_NEWEST_INSPECTION_LABEL, "November 24, 2026")
assert.equal(DOHMH_FILE_ROWS, 295608)
assert.equal(PERUVIAN_ESTABLISHMENT_COUNT, 106)
assert.equal(PERUVIAN_ROW_COUNT, 1320)
assert.equal(PERUVIAN_GRADE_A_COUNT, 53)
assert.equal(PERUVIAN_GRADE_B_COUNT, 12)
assert.equal(PERUVIAN_GRADE_C_COUNT, 0)
assert.equal(PERUVIAN_GRADE_PENDING_COUNT, 4)
assert.equal(PERUVIAN_NOT_YET_GRADED_COUNT, 37)
assert.equal(PERUVIAN_INSPECTED_COUNT, 106)
assert.equal(PERUVIAN_NOT_YET_INSPECTED_COUNT, 0)
assert.equal(PERUVIAN_PLACEHOLDER_ROW_COUNT, 0)
assert.equal(PERUVIAN_LINKED_COUNT, 11)
assert.equal(PERUVIAN_UNMATCHED.length, 5)
assert.equal(PERUVIAN_RESTAURANTS.length, 106)
assert.equal(new Set(PERUVIAN_RESTAURANTS.map((row) => row.camis)).size, 106)
assert.match(PERUVIAN_INTRO, /peruvian restaurants nyc/)
assert.ok(PERUVIAN_INTRO.includes(FOOD_SAFETY_SENTENCE))
assert.ok(PERUVIAN_INTRO.includes("106"))
assert.ok(PERUVIAN_INTRO.includes("53"))
assert.equal(FOOD_SAFETY_SENTENCE, "Grade A is a food-safety grade, not a health claim.")
assert.equal(
  PERUVIAN_GRADE_A_COUNT + PERUVIAN_GRADE_B_COUNT + PERUVIAN_GRADE_C_COUNT + PERUVIAN_GRADE_PENDING_COUNT + PERUVIAN_NOT_YET_GRADED_COUNT,
  PERUVIAN_ESTABLISHMENT_COUNT
)

assert.equal(JORA.camis, JORA_CAMIS)
assert.equal(JORA.slug, JORA_SLUG)
assert.equal(JORA.gradeCode, "A")
assert.equal(JORA.score, 9)
assert.equal(JORA.inspectionDate, "2026-10-17")
assert.equal(JORA.inspectionDateLabel, "October 17, 2026")
assert.equal(JORA.place, "Long Island City, Queens")
assert.equal(JORA.address, "47-46 11th St, Queens, NY 11101")
assert.match(JORA.factualLine, /Published as Jora in Long Island City, Queens/)
assert.match(JORA.factualLine, /4\.5 from 2,067 reviews/)
assert.equal(JORA.olderGrade, null)
assert.equal(getYoutubeShort(JORA_SLUG)?.videoId, JORA_SHORT_VIDEO_ID)

assert.deepEqual(
  PERUVIAN_BOROUGHS.map((group) => [group.borough, group.restaurants.length, group.gradeA, group.inspected]),
  [
    ["Queens", 60, 31, 60],
    ["Manhattan", 20, 8, 20],
    ["Brooklyn", 16, 8, 16],
    ["Bronx", 4, 3, 4],
    ["Staten Island", 6, 3, 6],
  ]
)

for (const group of PERUVIAN_BOROUGHS) {
  for (let i = 1; i < group.restaurants.length; i += 1) {
    const prev = group.restaurants[i - 1]
    const cur = group.restaurants[i]
    if (prev.gradeCode === "A" && cur.gradeCode === "A") {
      assert.ok(prev.score != null && cur.score != null)
      assert.ok(
        prev.score < cur.score ||
          (prev.score === cur.score && (prev.inspectionDate ?? "") >= (cur.inspectionDate ?? "")),
        `${prev.name} should rank above ${cur.name}`
      )
    }
  }
}

for (const row of PERUVIAN_RESTAURANTS) {
  assert.doesNotMatch(row.factualLine, /\$\d|lomo saltado|delicious|hours|quote/i)
  assert.match(row.factualLine, /Peruvian|Published as/)
  if (!row.slug) assert.match(row.factualLine, /No published listing matched/)
  if (row.inspectionDate) assert.ok(row.inspectionDate >= "1901-01-01", row.camis)
}

assert.equal(PERUVIAN_FAQS.length, 5)
assert.match(PERUVIAN_FAQS[2].answer, /50164818/)
assert.match(PERUVIAN_FAQS[2].answer, /October 17, 2026/)
assert.match(PERUVIAN_FAQS[2].answer, /scored 9/)
assert.match(PERUVIAN_FAQS[2].answer, /letter on that inspection is A/)
assert.match(PERUVIAN_FAQS[4].answer, /1900/)
assert.match(PERUVIAN_FAQS[3].answer, /Queens has 60/)

const siteUrl = "https://www.eatrealfoodnyc.com"
const article = articleSchema(siteUrl)
const faqs = faqPageSchema()
assert.equal(article["@type"], "Article")
assert.equal(article.headline, PERUVIAN_TITLE)
assert.equal(article.dateModified, "2026-11-27")
assert.equal(article.author.length, 2)
assert.equal(faqs["@type"], "FAQPage")
assert.equal(faqs.mainEntity.length, 5)

const guide = getGuideBySlug("peruvian-restaurants-nyc")
assert.ok(guide)
assert.equal(guide.title, PERUVIAN_TITLE)
assert.equal(guide.metaTitle, PERUVIAN_TITLE)
assert.equal(guide.description, PERUVIAN_DESCRIPTION)
assert.deepEqual(guide.keywords, [PERUVIAN_KEYWORD])

for (const href of [
  "/guides/nyc-health-grades-explained",
  "/data/nyc-restaurant-score-13-cliff",
  QUEENS_HUB,
  LIC_HUB,
  "/restaurants/jora",
  "/restaurants/costa-y-mar",
]) {
  assert.ok(pageInternalHrefs().includes(href), href)
}

const page = readFileSync(new URL("../app/guides/peruvian-restaurants-nyc/page.tsx", import.meta.url), "utf8")
assert.match(page, /<table/)
assert.match(page, /GuideYoutubeShort/)
assert.match(page, /JORA_SLUG/)
assert.match(page, /faqPageSchema/)
assert.match(page, /articleSchema/)
assert.match(page, /PERUVIAN_INTRO/)
assert.match(page, /1900/)
assert.doesNotMatch(page, /export const revalidate/)

const guides = readFileSync(new URL("../config/guides.ts", import.meta.url), "utf8")
assert.match(guides, /peruvian-restaurants-nyc/)
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /GUIDES\.map/)
const llms = readFileSync(new URL("../lib/llms-txt.ts", import.meta.url), "utf8")
assert.match(llms, /guides\/peruvian-restaurants-nyc/)
assert.match(llms, /2026-11-26T06:00:29\.000/)
assert.match(llms, /2026-11-24/)
const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/peruvian-restaurants-nyc/)
const links = readFileSync(new URL("../lib/listing-guide-links.ts", import.meta.url), "utf8")
assert.match(links, /peruvian-restaurants-nyc/)
const context = readFileSync(new URL("../components/inspection-context.tsx", import.meta.url), "utf8")
assert.match(context, /peruvian-restaurants-nyc/)
assert.match(context, /long island city/)
const listingPage = readFileSync(new URL("../app/restaurants/[slug]/page.tsx", import.meta.url), "utf8")
assert.match(listingPage, /name=\{restaurant\.name\}/)

console.log("peruvian restaurants tests passed")
