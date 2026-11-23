import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import {
  BEST_ITALIAN_DESCRIPTION,
  BEST_ITALIAN_FAQS,
  BEST_ITALIAN_FITS,
  BEST_ITALIAN_INTRO,
  BEST_ITALIAN_KEYWORD,
  BEST_ITALIAN_KEYWORD_VOLUME,
  BEST_ITALIAN_PATH,
  BEST_ITALIAN_PUBLISHED,
  BEST_ITALIAN_RESTAURANTS,
  BEST_ITALIAN_TITLE,
  articleSchema,
  faqPageSchema,
  introWordCount,
  neighborhoodHref,
  organizationSchema,
  pageInternalHrefs,
} from "../data/best-italian-restaurants-nyc"

assert.equal(BEST_ITALIAN_TITLE, "Best Italian Restaurants in NYC (2027): Top 10 Ranked")
assert.ok(BEST_ITALIAN_TITLE.length <= TITLE_MAX, BEST_ITALIAN_TITLE.length)
assert.ok(BEST_ITALIAN_DESCRIPTION.length <= DESCRIPTION_MAX, BEST_ITALIAN_DESCRIPTION.length)
assert.equal(BEST_ITALIAN_PATH, "/guides/best-italian-restaurants-nyc")
assert.equal(BEST_ITALIAN_PUBLISHED, "2026-11-23")
assert.equal(BEST_ITALIAN_KEYWORD, "best italian restaurants in nyc")
assert.equal(BEST_ITALIAN_KEYWORD_VOLUME, 27100)
assert.equal(introWordCount(), 100)
assert.equal(BEST_ITALIAN_INTRO.includes("Morandi"), true)
assert.equal(BEST_ITALIAN_INTRO.includes("Grade A"), true)
assert.equal(BEST_ITALIAN_INTRO.includes("43nn-pn8j"), true)

assert.equal(BEST_ITALIAN_RESTAURANTS.length, 10)
assert.deepEqual(
  BEST_ITALIAN_RESTAURANTS.map((row) => row.rank),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
)
assert.equal(new Set(BEST_ITALIAN_RESTAURANTS.map((row) => row.slug)).size, 10)
assert.equal(new Set(BEST_ITALIAN_RESTAURANTS.map((row) => row.camis)).size, 10)
assert.equal(BEST_ITALIAN_RESTAURANTS.every((row) => row.grade === "A"), true)
assert.equal(BEST_ITALIAN_RESTAURANTS.every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.inspectionDate)), true)
assert.equal(BEST_ITALIAN_RESTAURANTS.every((row) => row.violations.length === row.violationCount), true)
assert.equal(BEST_ITALIAN_RESTAURANTS[0].slug, "morandi")
assert.equal(BEST_ITALIAN_RESTAURANTS[0].score, 2)
assert.equal(BEST_ITALIAN_RESTAURANTS[0].camis, "50076526")
assert.equal(BEST_ITALIAN_RESTAURANTS[1].slug, "carmines-upper-west-side")
assert.equal(BEST_ITALIAN_RESTAURANTS[6].slug, "olive-garden-italian-restaurant-east")

for (let i = 1; i < BEST_ITALIAN_RESTAURANTS.length; i++) {
  const prev = BEST_ITALIAN_RESTAURANTS[i - 1]
  const cur = BEST_ITALIAN_RESTAURANTS[i]
  const prevKey = [prev.score, prev.violationCount, -Date.parse(prev.inspectionDate)]
  const curKey = [cur.score, cur.violationCount, -Date.parse(cur.inspectionDate)]
  assert.ok(
    prevKey[0] < curKey[0] ||
      (prevKey[0] === curKey[0] && prevKey[1] < curKey[1]) ||
      (prevKey[0] === curKey[0] && prevKey[1] === curKey[1] && prevKey[2] <= curKey[2]),
    `${prev.slug} should rank above ${cur.slug}`
  )
}

assert.equal(BEST_ITALIAN_FAQS.length, 6)
assert.equal(BEST_ITALIAN_FITS.length, 6)
assert.ok(pageInternalHrefs().length >= 10, String(pageInternalHrefs().length))
assert.ok(pageInternalHrefs().includes("/restaurants/morandi"))
assert.ok(pageInternalHrefs().includes("/nyc/manhattan/greenwich-village/healthy-restaurants"))
assert.ok(pageInternalHrefs().includes("/guides/nyc-health-grades-explained"))

const siteUrl = "https://www.eatrealfoodnyc.com"
const article = articleSchema(siteUrl)
const faqs = faqPageSchema()
const org = organizationSchema(siteUrl)
assert.equal(article["@type"], "Article")
assert.equal(article.headline, BEST_ITALIAN_TITLE)
assert.equal(faqs["@type"], "FAQPage")
assert.equal(faqs.mainEntity.length, 6)
assert.equal(org["@type"], "Organization")
assert.equal(org.name, "Eat Real Food NYC")

const pageSource = readFileSync(new URL("../app/guides/best-italian-restaurants-nyc/page.tsx", import.meta.url), "utf8")
assert.match(pageSource, /application\/ld\+json/)
assert.match(pageSource, /articleSchema/)
assert.match(pageSource, /faqPageSchema/)
assert.match(pageSource, /organizationSchema/)
assert.match(pageSource, /How we picked them/)
assert.match(pageSource, /Which one fits whom/)

const robots = readFileSync(new URL("../app/robots.ts", import.meta.url), "utf8")
for (const agent of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot", "Bingbot"]) {
  assert.match(robots, new RegExp(agent))
}

assert.equal(neighborhoodHref("Staten Island", "Stapleton"), "/nyc/staten-island/stapleton/healthy-restaurants")

const guides = readFileSync(new URL("../config/guides.ts", import.meta.url), "utf8")
assert.match(guides, /best-italian-restaurants-nyc/)

const llms = readFileSync(new URL("../../public/llms.txt", import.meta.url), "utf8")
assert.match(llms, /guides\/best-italian-restaurants-nyc/)
assert.match(llms, /43nn-pn8j/)

const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/best-italian-restaurants-nyc/)

console.log("best italian restaurants tests passed")
