import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import {
  BEST_PIZZA_CANDIDATE_COUNT,
  BEST_PIZZA_DESCRIPTION,
  BEST_PIZZA_EXCLUDED,
  BEST_PIZZA_FAQS,
  BEST_PIZZA_FITS,
  BEST_PIZZA_INTRO,
  BEST_PIZZA_KEYWORD,
  BEST_PIZZA_MATCH_COUNT,
  BEST_PIZZA_PATH,
  BEST_PIZZA_PUBLISHED,
  BEST_PIZZA_RESTAURANTS,
  BEST_PIZZA_TITLE,
  DOHMH_DATASET_ID,
  DOHMH_MAX_INSPECTION_DATE,
  DOHMH_MAX_INSPECTION_DATE_LABEL,
  articleSchema,
  faqPageSchema,
  introWordCount,
  camisUrl,
  neighborhoodHref,
  organizationSchema,
  pageInternalHrefs,
} from "../data/best-pizza-restaurants-nyc"

assert.equal(BEST_PIZZA_TITLE, "Best Pizza Restaurants in NYC (2026): Top 10 Ranked")
assert.match(BEST_PIZZA_TITLE, /\(2026\)/)
assert.doesNotMatch(BEST_PIZZA_TITLE, /\(2027\)/)
assert.ok(BEST_PIZZA_TITLE.length <= TITLE_MAX, String(BEST_PIZZA_TITLE.length))
assert.ok(BEST_PIZZA_DESCRIPTION.length <= DESCRIPTION_MAX, String(BEST_PIZZA_DESCRIPTION.length))
assert.equal(BEST_PIZZA_PATH, "/guides/best-pizza-restaurants-nyc")
assert.equal(BEST_PIZZA_PATH.startsWith("/guides/best-"), true)
assert.equal(BEST_PIZZA_PATH.startsWith("/best"), false)
assert.equal(BEST_PIZZA_PUBLISHED, "2026-11-24")
assert.equal(BEST_PIZZA_KEYWORD, "best pizza restaurants in nyc")
assert.equal(DOHMH_DATASET_ID, "43nn-pn8j")
assert.equal(DOHMH_MAX_INSPECTION_DATE, "2026-11-22")
assert.equal(DOHMH_MAX_INSPECTION_DATE_LABEL, "November 22, 2026")
assert.equal(BEST_PIZZA_CANDIDATE_COUNT, 56)
assert.equal(BEST_PIZZA_MATCH_COUNT, 19)
assert.equal(introWordCount(), 100)
assert.equal(BEST_PIZZA_INTRO.includes("Juliana"), true)
assert.equal(BEST_PIZZA_INTRO.includes("Grade A"), true)
assert.equal(BEST_PIZZA_INTRO.includes("43nn-pn8j"), true)
assert.equal(BEST_PIZZA_INTRO.includes("not taste"), true)

assert.equal(BEST_PIZZA_RESTAURANTS.length, 10)
assert.deepEqual(
  BEST_PIZZA_RESTAURANTS.map((row) => row.rank),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
)
assert.deepEqual(
  BEST_PIZZA_RESTAURANTS.map((row) => row.slug),
  [
    "julianas",
    "markos-pizzeria",
    "barios",
    "manos-pizzeria",
    "joes-pizza-financial",
    "rubirosa",
    "johns-of-bleecker-street",
    "adriennes-pizzabar",
    "danis-house-of-pizza",
    "emily-clinton",
  ]
)
assert.deepEqual(
  BEST_PIZZA_RESTAURANTS.map((row) => row.score),
  [2, 2, 5, 7, 9, 9, 9, 10, 10, 10]
)
assert.deepEqual(
  BEST_PIZZA_RESTAURANTS.map((row) => row.violationCount),
  [1, 1, 2, 2, 2, 2, 2, 2, 2, 2]
)
assert.equal(new Set(BEST_PIZZA_RESTAURANTS.map((row) => row.slug)).size, 10)
assert.equal(new Set(BEST_PIZZA_RESTAURANTS.map((row) => row.camis)).size, 10)
assert.equal(BEST_PIZZA_RESTAURANTS.every((row) => row.grade === "A"), true)
assert.equal(BEST_PIZZA_RESTAURANTS.every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.inspectionDate)), true)
assert.equal(BEST_PIZZA_RESTAURANTS.every((row) => row.violations.length === row.violationCount), true)
assert.equal(BEST_PIZZA_RESTAURANTS[0].slug, "julianas")
assert.equal(BEST_PIZZA_RESTAURANTS[0].score, 2)
assert.equal(BEST_PIZZA_RESTAURANTS[0].camis, "41700297")
assert.equal(BEST_PIZZA_RESTAURANTS[0].inspectionDate, "2026-09-16")
assert.equal(BEST_PIZZA_RESTAURANTS[4].slug, "joes-pizza-financial")
assert.equal(BEST_PIZZA_RESTAURANTS[4].address.includes("124 Fulton"), true)
assert.equal(BEST_PIZZA_RESTAURANTS[7].cityCuisine, "Italian")
assert.equal(BEST_PIZZA_RESTAURANTS[9].cityCuisine, "American")
assert.equal(BEST_PIZZA_RESTAURANTS[9].officialDba, "EMMY")
assert.equal(BEST_PIZZA_RESTAURANTS.some((row) => row.body.includes("20-06")), true)

for (let i = 1; i < BEST_PIZZA_RESTAURANTS.length; i++) {
  const prev = BEST_PIZZA_RESTAURANTS[i - 1]
  const cur = BEST_PIZZA_RESTAURANTS[i]
  const prevKey = [prev.score, prev.violationCount, -Date.parse(prev.inspectionDate)]
  const curKey = [cur.score, cur.violationCount, -Date.parse(cur.inspectionDate)]
  assert.ok(
    prevKey[0] < curKey[0] ||
      (prevKey[0] === curKey[0] && prevKey[1] < curKey[1]) ||
      (prevKey[0] === curKey[0] && prevKey[1] === curKey[1] && prevKey[2] <= curKey[2]),
    `${prev.slug} should rank above ${cur.slug}`
  )
}

assert.equal(BEST_PIZZA_FAQS.length, 6)
assert.equal(BEST_PIZZA_FITS.length, 6)
assert.equal(BEST_PIZZA_EXCLUDED.length, 5)
assert.equal(BEST_PIZZA_EXCLUDED.some((row) => row.slug === "prince-street-pizza" && row.why.includes("September 17, 2026")), true)
assert.ok(pageInternalHrefs().length >= 10, String(pageInternalHrefs().length))
assert.ok(pageInternalHrefs().includes("/restaurants/julianas"))
assert.ok(pageInternalHrefs().includes("/nyc/brooklyn/dumbo/healthy-restaurants"))
assert.ok(pageInternalHrefs().includes("/nyc/staten-island/willowbrook/healthy-restaurants"))
assert.ok(pageInternalHrefs().includes("/guides/best-italian-restaurants-nyc"))
assert.ok(pageInternalHrefs().includes("/guides/nyc-health-grades-explained"))

const siteUrl = "https://www.eatrealfoodnyc.com"
const article = articleSchema(siteUrl)
const faqs = faqPageSchema()
const org = organizationSchema(siteUrl)
assert.equal(article["@type"], "Article")
assert.equal(article.headline, BEST_PIZZA_TITLE)
assert.doesNotMatch(article.headline, /\(2027\)/)
assert.equal(faqs["@type"], "FAQPage")
assert.equal(faqs.mainEntity.length, 6)
assert.equal(org["@type"], "Organization")
assert.equal(org.name, "Eat Real Food NYC")

const pageSource = readFileSync(new URL("../app/guides/best-pizza-restaurants-nyc/page.tsx", import.meta.url), "utf8")
assert.match(pageSource, /application\/ld\+json/)
assert.match(pageSource, /articleSchema/)
assert.match(pageSource, /faqPageSchema/)
assert.match(pageSource, /organizationSchema/)
assert.match(pageSource, /How we picked them/)
assert.match(pageSource, /Which one fits whom/)
assert.match(pageSource, /DOHMH_DATASET_ID/)
assert.match(pageSource, /DOHMH_MAX_INSPECTION_DATE_LABEL/)
assert.doesNotMatch(pageSource, /\(2027\)/)
assert.doesNotMatch(pageSource, /YoutubeLongformEmbed|YoutubeShort/)
assert.doesNotMatch(pageSource, /export const revalidate/)

assert.equal(neighborhoodHref("Staten Island", "Willowbrook"), "/nyc/staten-island/willowbrook/healthy-restaurants")
assert.equal(neighborhoodHref("Queens", "Kew Gardens"), "/nyc/queens/kew-gardens/healthy-restaurants")
assert.equal(neighborhoodHref("Manhattan", "SoHo"), "/nyc/manhattan/soho/healthy-restaurants")
const pizzaCamis = BEST_PIZZA_RESTAURANTS[0].camis
const pizzaRecord = decodeURIComponent(camisUrl(pizzaCamis))
assert.match(pizzaRecord, /43nn-pn8j/)
assert.match(pizzaRecord, new RegExp(`camis='${pizzaCamis}'`))
assert.doesNotMatch(pizzaRecord, /a816-health/)

const guides = readFileSync(new URL("../config/guides.ts", import.meta.url), "utf8")
assert.match(guides, /best-pizza-restaurants-nyc/)
assert.match(guides, /Best Pizza Restaurants in NYC \(2026\): Top 10 Ranked/)
assert.doesNotMatch(guides, /\(2027\)/)

const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /GUIDES\.map/)

const llms = readFileSync(new URL("../lib/llms-txt.ts", import.meta.url), "utf8")
assert.match(llms, /guides\/best-pizza-restaurants-nyc/)
assert.match(llms, /43nn-pn8j/)
assert.match(llms, /2026-11-22/)
assert.doesNotMatch(llms, /\(2027\)/)

const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/best-pizza-restaurants-nyc/)
assert.match(llmsFull, /43nn-pn8j/)

const italian = readFileSync(new URL("../app/guides/best-italian-restaurants-nyc/page.tsx", import.meta.url), "utf8")
assert.match(italian, /best-pizza-restaurants-nyc/)
assert.match(italian, /NNkuZAOiVCU|bestItalianLongformVideo/)

console.log("best pizza restaurants tests passed")
