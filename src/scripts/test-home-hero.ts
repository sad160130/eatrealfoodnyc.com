import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { HOME_HERO_GRADE_A_PATH, homeHeroCopy } from "../lib/home-hero"
import { skipImageOptimizer } from "../lib/photo-src"

const live = homeHeroCopy({
  published: 2212,
  gradeA: 1227,
  latestInspectionLabel: "November 18, 2026",
})

assert.equal(live.headingLead, "Healthy restaurants in NYC")
assert.equal(live.headingRest, "with a city Grade A.")
assert.equal(
  live.subhead,
  "1,227 of 2,212 published listings hold a NYC Department of Health Grade A. The newest inspection date on a published listing is November 18, 2026."
)
assert.equal(live.ctaLabel, "Find a Grade A restaurant")
assert.equal(live.ctaHref, HOME_HERO_GRADE_A_PATH)
const gradeASource = readFileSync(new URL("../lib/grade-a.ts", import.meta.url), "utf8")
assert.match(gradeASource, /page <= 1 \? "\/healthy-restaurants\/grade-a"/)
assert.equal(live.showGradeMark, true)
assert.equal(live.headingLead.includes("Healthy restaurants"), true)

const noDate = homeHeroCopy({ published: 10, gradeA: 4, latestInspectionLabel: null })
assert.equal(noDate.subhead.includes("newest inspection"), false)
assert.equal(noDate.subhead, "4 of 10 published listings hold a NYC Department of Health Grade A.")

const none = homeHeroCopy({ published: 10, gradeA: 0, latestInspectionLabel: "November 18, 2026" })
assert.equal(none.showGradeMark, false)
assert.equal(none.ctaHref, "/search")
assert.equal(none.ctaLabel, "Browse healthy restaurants")
assert.equal(none.headingLead, "Healthy restaurants in NYC")
assert.equal(none.subhead.includes("0 of"), false)
assert.equal(none.subhead.includes("November 18, 2026"), true)

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const cta = readFileSync(new URL("../components/home-hero-cta.tsx", import.meta.url), "utf8")
assert.equal(page.split("<h1").length - 1, 1)
assert.equal(page.includes("<form"), false)
assert.equal(page.includes('className="callout"'), false)
assert.match(page, /homeHeroCopy/)
assert.match(page, /HomeHeroCta/)
assert.match(page, /HolidayCateringBanner/)
assert.match(page, /NewsletterSignup/)
assert.match(cta, /track\("home_hero_cta_click"\)/)
assert.equal(cta.split("track(").length - 1, 1)

// The Grade A hub renders next/image cards. An external photo outside
// remotePatterns must skip the optimizer or that page throws during render.
assert.equal(skipImageOptimizer("https://lh3.googleusercontent.com/a"), true)
assert.equal(skipImageOptimizer("https://bareburger.com/photo.webp"), true)
assert.equal(skipImageOptimizer("/logo.png"), false)
assert.equal(skipImageOptimizer(null), false)

console.log("home hero tests passed")
