import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { buildBreadcrumbList } from "../lib/schema"
import { DESCRIPTION_MAX, TITLE_MAX, withBrand } from "../lib/seo-titles"
import { isCateringSource, withCateringSource } from "../lib/catering-source"
import {
  HOLIDAY_CATERING_FAQS,
  HOLIDAY_CATERING_PATH,
  HOLIDAY_CATERING_SOURCE,
  HOLIDAY_CATERING_TITLE,
  HOLIDAY_GROUP_ORDER_HEADING,
  formatGoogleRating,
  groupGradeAForHoliday,
  holidayCateringDescription,
  holidayCateringTitleFits,
  type HolidayCateringRestaurant,
} from "../lib/holiday-catering"

assert.equal(holidayCateringTitleFits(), true)
assert.ok(withBrand(HOLIDAY_CATERING_TITLE).length <= TITLE_MAX, withBrand(HOLIDAY_CATERING_TITLE))
assert.equal(withBrand(HOLIDAY_CATERING_TITLE), "Holiday Party Catering NYC | Eat Real Food NYC")

const description = holidayCateringDescription()
assert.ok(description.length <= DESCRIPTION_MAX, `${description.length}: ${description}`)
assert.match(description, /office parties/i)
assert.match(description, /Thanksgiving/)
assert.match(description, /Grade A restaurants for group orders/)
assert.equal(description.includes("$"), false)

assert.equal(HOLIDAY_CATERING_FAQS.length, 6)
assert.equal(HOLIDAY_GROUP_ORDER_HEADING, "Grade A restaurants for group orders")
const faqText = HOLIDAY_CATERING_FAQS.map((faq) => `${faq.question} ${faq.answer}`).join("\n")
assert.match(faqText, /lead time/i)
assert.match(faqText, /1 to 5,000/)
assert.match(faqText, /vegan/i)
assert.match(faqText, /Department of Health/)
assert.match(faqText, /free for the person filling out the form/)
assert.match(faqText, /does not record whether a restaurant offers catering/)
assert.equal(faqText.includes("$"), false)
assert.equal(/guarantee/i.test(faqText), false)
assert.equal(/per person/i.test(faqText), false)

assert.equal(isCateringSource(HOLIDAY_CATERING_SOURCE), true)
assert.equal(isCateringSource("Holiday"), false)
assert.equal(isCateringSource("holiday-landing"), false)
assert.equal(
  withCateringSource(HOLIDAY_CATERING_PATH, HOLIDAY_CATERING_SOURCE),
  "/catering/holiday-party-catering-nyc?source=holiday_landing"
)
assert.equal(
  withCateringSource("/catering?restaurant=abc", HOLIDAY_CATERING_SOURCE),
  "/catering?restaurant=abc&source=holiday_landing"
)
assert.equal(withCateringSource("https://evil.example/catering", HOLIDAY_CATERING_SOURCE), "https://evil.example/catering")
assert.equal(withCateringSource("//evil.example", HOLIDAY_CATERING_SOURCE), "//evil.example")

const crumbs = buildBreadcrumbList(
  [
    { name: "Eat Real Food NYC", path: "/" },
    { name: "Catering", path: "/catering" },
    { name: "Holiday party catering NYC", path: HOLIDAY_CATERING_PATH },
  ],
  "https://www.eatrealfoodnyc.com"
)
assert.equal(crumbs["@type"], "BreadcrumbList")
assert.equal(crumbs.itemListElement.length, 3)
assert.equal(crumbs.itemListElement[2].item, "https://www.eatrealfoodnyc.com/catering/holiday-party-catering-nyc")

assert.equal(formatGoogleRating(4.24, 1200), "4.2 · 1,200 Google reviews")
assert.equal(formatGoogleRating(4, null), "4.0")
assert.equal(formatGoogleRating(null, 10), null)

function row(partial: Partial<HolidayCateringRestaurant> & Pick<HolidayCateringRestaurant, "slug" | "borough" | "neighborhood">): HolidayCateringRestaurant {
  return {
    name: partial.slug,
    type: partial.type ?? "Restaurant",
    rating: partial.rating ?? null,
    reviews: partial.reviews ?? null,
    dietary_tags: partial.dietary_tags ?? null,
    ...partial,
  }
}

const grouped = groupGradeAForHoliday([
  row({ slug: "low", borough: "Brooklyn", neighborhood: "Williamsburg", rating: 4.2, reviews: 10 }),
  row({ slug: "high", borough: "Brooklyn", neighborhood: "Williamsburg", rating: 4.8, reviews: 4 }),
  row({ slug: "tie-b", borough: "Brooklyn", neighborhood: "Williamsburg", rating: 4.8, reviews: 9 }),
  row({ slug: "tie-a", borough: "Brooklyn", neighborhood: "Williamsburg", rating: 4.8, reviews: 9 }),
  row({ slug: "fifth", borough: "Brooklyn", neighborhood: "Williamsburg", rating: 4.9, reviews: 1 }),
  row({ slug: "park", borough: "Brooklyn", neighborhood: "Park Slope", rating: 4.4, reviews: 3 }),
  row({ slug: "dumbo", borough: "Brooklyn", neighborhood: "DUMBO", rating: 4.1, reviews: 2 }),
  row({ slug: "greenpoint", borough: "Brooklyn", neighborhood: "Greenpoint", rating: 4.0, reviews: 2 }),
  row({ slug: "bushwick-1", borough: "Brooklyn", neighborhood: "Bushwick", rating: 4.0, reviews: 1 }),
  row({ slug: "bushwick-2", borough: "Brooklyn", neighborhood: "Bushwick", rating: 4.0, reviews: 1 }),
  row({ slug: "midtown", borough: "Manhattan", neighborhood: "Midtown", rating: 4.6, reviews: 20 }),
  row({ slug: "no-hood", borough: "Manhattan", neighborhood: "  ", rating: 5, reviews: 1 }),
  row({ slug: "no-borough", borough: "  ", neighborhood: "Midtown", rating: 5, reviews: 99 }),
  row({ slug: "other", borough: "Hoboken", neighborhood: "Downtown", rating: 4, reviews: 1 }),
], { neighborhoodsPerBorough: 3, restaurantsPerNeighborhood: 4 })

assert.equal(grouped.total, 13)
assert.equal(grouped.withoutBorough, 1)
assert.deepEqual(grouped.boroughs.map((borough) => borough.borough), ["Manhattan", "Brooklyn", "Hoboken"])
assert.equal(grouped.boroughs[0].gradeACount, 2)
assert.equal(grouped.boroughs[0].neighborhoods.length, 1)
assert.equal(grouped.boroughs[0].neighborhoods[0].neighborhood, "Midtown")
const brooklyn = grouped.boroughs[1]
assert.equal(brooklyn.gradeACount, 10)
assert.deepEqual(
  brooklyn.neighborhoods.map((neighborhood) => neighborhood.neighborhood),
  ["Williamsburg", "Bushwick", "DUMBO"]
)
assert.equal(brooklyn.neighborhoods[0].gradeACount, 5)
assert.deepEqual(
  brooklyn.neighborhoods[0].restaurants.map((restaurant) => restaurant.slug),
  ["fifth", "tie-a", "tie-b", "high"]
)
assert.equal(brooklyn.neighborhoods.some((neighborhood) => neighborhood.neighborhood === "Park Slope"), false)

const empty = groupGradeAForHoliday([])
assert.equal(empty.total, 0)
assert.equal(empty.boroughs.length, 0)

function source(path: string): string {
  return readFileSync(path, "utf8")
}

const page = source("src/app/catering/holiday-party-catering-nyc/page.tsx")
assert.match(page, /Holiday party catering in NYC/)
assert.match(page, /FAQSection/)
assert.match(page, /BreadcrumbJsonLd/)
assert.match(page, /HOLIDAY_CATERING_SOURCE/)
assert.equal(page.split("<CateringForm").length - 1, 2)
assert.equal(page.includes("$"), false)
assert.match(page, /is_published: true|GRADE_A_WHERE/)

const catering = source("src/app/catering/page.tsx")
assert.match(catering, /HolidayCateringBanner/)
assert.match(catering, /dek mt-4 hidden md:block/)
assert.match(catering, /dek mt-8 md:hidden/)

const form = source("src/components/catering-form.tsx")
assert.match(form, /track\("catering_lead_submit", \{/)
assert.match(form, /\.\.\.\(source \? \{ source \} : \{\}\)/)
assert.match(form, /name="source"/)

assert.match(source("src/app/page.tsx"), /HolidayCateringBanner/)
assert.match(source("src/app/guides/nyc-health-grades-explained/page.tsx"), /\/catering\/holiday-party-catering-nyc/)
assert.match(source("src/app/sitemap.ts"), /HOLIDAY_CATERING_PATH/)
assert.match(source("public/llms.txt"), /https:\/\/www\.eatrealfoodnyc\.com\/catering\/holiday-party-catering-nyc/)
assert.match(source("public/llms-full.txt"), /https:\/\/www\.eatrealfoodnyc\.com\/catering\/holiday-party-catering-nyc/)
assert.match(source("src/app/actions/catering.ts"), /source_path: recordedPath/)

console.log("holiday catering tests passed")
