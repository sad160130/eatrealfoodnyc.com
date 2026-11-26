import assert from "node:assert/strict"
import { buildLlmsTxt } from "../lib/llms-txt"
import { dietHubIsIndexable, indexableDietLinks } from "../lib/diet-hub-index"
import { COMBO_MIN_RESTAURANTS } from "../config/dietary-tags"
import { CATERING_FAQS, CATERING_TITLE, DATA_WEEKLY_TITLE, PARTNER_TITLE, dataWeeklyFaqs, homeFaqs, partnerFaqs } from "../lib/money-pages"
import { TITLE_MAX } from "../lib/seo-titles"

assert.equal(dietHubIsIndexable(0), false)
assert.equal(dietHubIsIndexable(COMBO_MIN_RESTAURANTS - 1), false)
assert.equal(dietHubIsIndexable(COMBO_MIN_RESTAURANTS), true)

const links = indexableDietLinks({ vegan: 20, keto: 0, paleo: 0, "raw-food": 2, halal: 8 })
assert.deepEqual(links.map((diet) => diet.tag), ["vegan", "halal"])

const text = buildLlmsTxt({
  published: 2212,
  gradeA: 1227,
  letterGraded: 1800,
  neighborhoods: 103,
  newestInspectionLabel: "November 23, 2026",
  updatedOn: "2026-11-25",
  dietTags: ["vegan", "halal"],
})
assert.match(text, /## Key facts/)
assert.match(text, /Published listings: 2,212/)
assert.match(text, /Grade A listings: 1,227/)
assert.match(text, /Listings with an A, B, or C grade: 1,800/)
assert.match(text, /Neighborhoods: 103/)
assert.match(text, /Newest inspection date on a published listing: November 23, 2026/)
assert.match(text, /43nn-pn8j/)
assert.match(text, /7:00 AM ET/)
assert.match(text, /0 12 \* \* \*/)
assert.match(text, /Last updated: 2026-11-25/)
assert.match(text, /# Last updated: 2026-11-25/)
assert.match(text, /healthy-restaurants\/vegan/)
assert.match(text, /healthy-restaurants\/halal/)
assert.doesNotMatch(text, /healthy-restaurants\/keto/)
assert.doesNotMatch(text, /healthy-restaurants\/paleo/)
assert.doesNotMatch(text, /healthy-restaurants\/raw-food/)
assert.match(text, /guides\/nyc-health-grades-explained/)
assert.match(text, /Record date November 13, 2026/)
assert.match(text, /90\.2% of 23,992 letter-graded restaurants hold an A/)
assert.match(text, /Best-rated restaurants \(May 2026 snapshot\)/)
assert.match(text, /613 operational restaurants rated 4\.5 or higher/)
assert.match(text, /data\/nyc-restaurant-score-13-cliff/)
assert.match(text, /data\/not-yet-inspected-restaurants-nyc/)
assert.match(text, /data\/nyc-restaurant-closures-2026-11/)
assert.match(text, /14,731 unique 2026 cycle initial inspections/)
assert.match(text, /4,084 of 31,581 establishments/)
assert.match(text, /catering\/holiday-party-catering-nyc/)
assert.equal(text.includes("\n\n## What this site is"), true)

for (const title of [CATERING_TITLE, DATA_WEEKLY_TITLE, PARTNER_TITLE]) {
  assert.ok(title.length > 0 && title.length <= TITLE_MAX, `${title.length}: ${title}`)
}
assert.match(CATERING_TITLE, /Catering/)
assert.match(DATA_WEEKLY_TITLE, /Compliance Weekly/)
assert.match(PARTNER_TITLE, /Grade A/)

for (const faqs of [CATERING_FAQS, dataWeeklyFaqs(), partnerFaqs(), homeFaqs()]) {
  assert.ok(faqs.length >= 4 && faqs.length <= 6, String(faqs.length))
  for (const faq of faqs) {
    assert.ok(faq.question.length > 0)
    assert.ok(faq.answer.length > 0)
  }
  JSON.parse(JSON.stringify({
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }))
}
assert.match(dataWeeklyFaqs().map((faq) => faq.answer).join(" "), /43nn-pn8j/)
assert.match(dataWeeklyFaqs().map((faq) => faq.answer).join(" "), /partner@eatrealfoodnyc.com/)
assert.match(partnerFaqs().map((faq) => faq.answer).join(" "), /\$49\/mo/)
assert.match(partnerFaqs().map((faq) => faq.answer).join(" "), /\$149\/mo/)
assert.match(partnerFaqs().map((faq) => faq.answer).join(" "), /\$299\/mo/)
assert.match(homeFaqs().map((faq) => faq.answer).join(" "), /0–13/)

const bare = buildLlmsTxt({
  published: 0,
  gradeA: 0,
  letterGraded: 0,
  neighborhoods: 0,
  newestInspectionLabel: null,
  updatedOn: "2026-11-25",
  dietTags: [],
})
assert.match(bare, /none on file/)
assert.doesNotMatch(bare, /Dietary hubs:\n {2}/)

console.log("llms and diet-hub tests passed")
