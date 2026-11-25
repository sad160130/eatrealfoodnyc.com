import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { DESCRIPTION_MAX, TITLE_MAX } from "../lib/seo-titles"
import { getYoutubeShort } from "../lib/youtube-shorts"
import {
  GRADE_A_BOROUGH_DESCRIPTION,
  GRADE_A_BOROUGH_FAQS,
  GRADE_A_BOROUGH_KEYWORD,
  GRADE_A_BOROUGH_PATH,
  GRADE_A_BOROUGH_PUBLISHED,
  GRADE_A_BOROUGH_RESTAURANTS,
  GRADE_A_BOROUGH_TITLE,
  articleSchema,
  boroughHref,
  currentGradeARestaurants,
  faqPageSchema,
  itemListSchema,
  neighborhoodHref,
  organizationSchema,
  pageInternalHrefs,
  wordCount,
} from "../data/grade-a-restaurants-by-borough-nyc"
import { getGuideBySlug, getRelatedGuides } from "../config/guides"

assert.equal(GRADE_A_BOROUGH_TITLE, "Grade A Restaurants by Borough: 3 NYC Matches (2026)")
assert.ok(GRADE_A_BOROUGH_TITLE.length <= TITLE_MAX, String(GRADE_A_BOROUGH_TITLE.length))
assert.ok(GRADE_A_BOROUGH_DESCRIPTION.length <= DESCRIPTION_MAX, String(GRADE_A_BOROUGH_DESCRIPTION.length))
assert.equal(GRADE_A_BOROUGH_PATH, "/guides/grade-a-restaurants-by-borough-nyc")
assert.equal(GRADE_A_BOROUGH_PUBLISHED, "2026-11-24")
assert.equal(GRADE_A_BOROUGH_KEYWORD, "grade a restaurants by borough nyc")
assert.match(GRADE_A_BOROUGH_DESCRIPTION, /November 24, 2026/)

assert.equal(GRADE_A_BOROUGH_RESTAURANTS.length, 5)
assert.equal(currentGradeARestaurants().length, 3)
assert.deepEqual(
  currentGradeARestaurants().map((row) => row.slug),
  ["dirt-candy", "city-island-lobster-house", "lakruwana-restaurant"]
)
assert.deepEqual(
  GRADE_A_BOROUGH_RESTAURANTS.filter((row) => !row.currentGradeA).map((row) => row.slug),
  ["alis-trinbago-roti-shop", "pho-hoang"]
)

const expected = {
  "dirt-candy": { score: 7, violations: 2, date: "2025-11-12", grade: "A" },
  "city-island-lobster-house": { score: 9, violations: 3, date: "2025-12-04", grade: "A" },
  "lakruwana-restaurant": { score: 12, violations: 3, date: "2026-08-15", grade: "A" },
  "alis-trinbago-roti-shop": { score: 24, violations: 4, date: "2026-05-20", grade: null },
  "pho-hoang": { score: 40, violations: 6, date: "2026-09-14", grade: null },
} as const

for (const restaurant of GRADE_A_BOROUGH_RESTAURANTS) {
  const want = expected[restaurant.slug as keyof typeof expected]
  assert.equal(restaurant.latestScore, want.score, restaurant.slug)
  assert.equal(restaurant.violationCount, want.violations, restaurant.slug)
  assert.equal(restaurant.violations.length, restaurant.violationCount, restaurant.slug)
  assert.equal(restaurant.latestDate, want.date, restaurant.slug)
  assert.equal(restaurant.latestGrade, want.grade, restaurant.slug)
  const words = wordCount(restaurant.body)
  assert.ok(words >= 120 && words <= 200, `${restaurant.slug} body is ${words} words`)
  assert.equal(restaurant.listingGrade, "A")
  if (restaurant.currentGradeA) {
    assert.equal(restaurant.latestGrade, "A")
    assert.ok(restaurant.latestScore <= 13)
    assert.equal(restaurant.listingScore, restaurant.latestScore)
    assert.equal(restaurant.listingDate, restaurant.latestDate)
  } else {
    assert.equal(restaurant.latestGrade, null)
    assert.ok(restaurant.latestScore >= 14)
  }
  const short = getYoutubeShort(restaurant.slug)
  assert.ok(short, restaurant.slug)
  assert.match(short.shortUrl, /youtube\.com\/shorts\//)
}

assert.equal(neighborhoodHref("Staten Island", "Stapleton"), "/nyc/staten-island/stapleton/healthy-restaurants")
assert.equal(neighborhoodHref("Bronx", "Throgs Neck"), "/nyc/bronx/throgs-neck/healthy-restaurants")
assert.equal(boroughHref("Queens"), "/nyc/queens/healthy-restaurants")

const cityIsland = GRADE_A_BOROUGH_RESTAURANTS.find((row) => row.slug === "city-island-lobster-house")
assert.ok(cityIsland)
assert.equal(cityIsland.placeLabel, "City Island, Bronx")
assert.equal(cityIsland.neighborhood, "Throgs Neck")
assert.match(cityIsland.body, /City Island, Bronx/)
assert.match(cityIsland.body, /Throgs Neck/)
assert.doesNotMatch(GRADE_A_BOROUGH_DESCRIPTION, /Ali'|Pho Hoang|\(2027\)/)
assert.doesNotMatch(GRADE_A_BOROUGH_TITLE, /\(2027\)/)

const ungradedCopy = GRADE_A_BOROUGH_RESTAURANTS.filter((row) => !row.currentGradeA)
for (const restaurant of ungradedCopy) {
  assert.doesNotMatch(restaurant.honestLine, /Grade A/)
  assert.equal(restaurant.latestGrade, null)
}

assert.equal(GRADE_A_BOROUGH_FAQS.length, 5)
assert.ok(pageInternalHrefs().includes("/restaurants/dirt-candy"))
assert.ok(pageInternalHrefs().includes("/nyc/brooklyn/bedford-stuyvesant/healthy-restaurants"))
assert.ok(pageInternalHrefs().includes("/guides/nyc-health-grades-explained"))

const siteUrl = "https://www.eatrealfoodnyc.com"
const article = articleSchema(siteUrl)
const faqs = faqPageSchema()
const org = organizationSchema(siteUrl)
const itemList = itemListSchema(siteUrl)
assert.equal(article["@type"], "Article")
assert.equal(article.headline, GRADE_A_BOROUGH_TITLE)
assert.doesNotMatch(article.headline, /\(2027\)/)
assert.doesNotMatch(article.description, /Ali'|Pho Hoang|\(2027\)/)
assert.equal(faqs["@type"], "FAQPage")
assert.equal(faqs.mainEntity.length, 5)
assert.equal(org["@type"], "Organization")
assert.equal(org.name, "Eat Real Food NYC")
assert.equal("aggregateRating" in org, false)
assert.equal("review" in org, false)
assert.equal(itemList["@type"], "ItemList")
assert.equal(itemList.numberOfItems, 3)
assert.deepEqual(
  itemList.itemListElement.map((item) => item.name),
  ["Dirt Candy", "City Island Lobster House", "Lakruwana Restaurant"]
)
const itemListJson = JSON.stringify(itemList)
assert.doesNotMatch(itemListJson, /Ali'|Pho Hoang|Throgs Neck|\(2027\)/)
const ungradedFaq = faqs.mainEntity.find((item) => item.name.includes("Ali's Trinbago"))
assert.ok(ungradedFaq)
assert.doesNotMatch(ungradedFaq.name, /Grade A/)
assert.doesNotMatch(ungradedFaq.acceptedAnswer.text, /Grade A/)

const pageSource = readFileSync(
  new URL("../app/guides/grade-a-restaurants-by-borough-nyc/page.tsx", import.meta.url),
  "utf8"
)
assert.match(pageSource, /GuideLayout/)
assert.match(pageSource, /articleSchema/)
assert.match(pageSource, /faqPageSchema/)
assert.match(pageSource, /organizationSchema/)
assert.match(pageSource, /ClaimListing/)
assert.match(pageSource, /GuideYoutubeShort/)
assert.match(pageSource, /nyc-health-grades-explained/)
assert.match(pageSource, /Latest inspection not yet graded/)
assert.match(pageSource, /itemListSchema/)
assert.match(pageSource, /placeLabel/)
assert.match(pageSource, /publicTitle/)
assert.doesNotMatch(pageSource, /viewCount|view_count|aggregateRating/)
assert.doesNotMatch(pageSource, /\(2027\)/)
assert.doesNotMatch(pageSource, /not current Grade A/)

const guideRecord = getGuideBySlug("grade-a-restaurants-by-borough-nyc")
assert.ok(guideRecord)
assert.equal(guideRecord.title, GRADE_A_BOROUGH_TITLE)
assert.doesNotMatch(guideRecord.title, /\(2027\)/)
assert.doesNotMatch(guideRecord.description, /\(2027\)/)
for (const related of getRelatedGuides(guideRecord.slug)) {
  assert.doesNotMatch(related.shortTitle, /\(2027\)/)
  assert.doesNotMatch(related.description, /\(2027\)/)
}

const embed = readFileSync(new URL("../components/guide-youtube-short.tsx", import.meta.url), "utf8")
assert.match(embed, /YoutubeShortPlayer/)
assert.match(embed, /buildYoutubeShortVideoObject/)
assert.doesNotMatch(embed, /viewCount|view_count|likeCount/)

const guides = readFileSync(new URL("../config/guides.ts", import.meta.url), "utf8")
assert.match(guides, /grade-a-restaurants-by-borough-nyc/)

const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")
assert.match(sitemap, /grade-a-restaurants-by-borough-nyc/)
assert.match(sitemap, /0\.8/)

const links = readFileSync(new URL("../lib/internal-links.ts", import.meta.url), "utf8")
assert.match(links, /grade A restaurants by borough in NYC/)
assert.match(links, /\/guides\/grade-a-restaurants-by-borough-nyc/)

const llms = readFileSync(new URL("../lib/llms-txt.ts", import.meta.url), "utf8")
assert.match(llms, /guides\/grade-a-restaurants-by-borough-nyc/)
const llmsFull = readFileSync(new URL("../../public/llms-full.txt", import.meta.url), "utf8")
assert.match(llmsFull, /guides\/grade-a-restaurants-by-borough-nyc/)

const layout = readFileSync(new URL("../components/guide-layout.tsx", import.meta.url), "utf8")
assert.match(layout, /BreadcrumbJsonLd/)

console.log("grade a borough guide tests passed")
