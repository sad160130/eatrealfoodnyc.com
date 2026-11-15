import { computeHealthScore } from "../lib/utils"
import {
  ORGANIC_SORT_KEYS,
  organicRankKey,
  partnerLinkRel,
} from "../lib/partner-status"
import type { Restaurant } from "../types"

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL: " + message)
    process.exitCode = 1
    throw new Error(message)
  }
  console.log("ok: " + message)
}

const base: Restaurant = {
  id: 1,
  name: "Test Kitchen",
  slug: "test-kitchen",
  type: "Cafe",
  borough: "Manhattan",
  neighborhood: "Harlem",
  address: "1 Main St",
  street: null,
  city: "New York",
  state: "NY",
  latitude: null,
  longitude: null,
  rating: 4.6,
  reviews: 220,
  price_range: 2,
  dietary_tags: "vegan|gluten-free",
  inspection_grade: "A",
  inspection_date: "2026-01-01",
  inspection_score: 10,
  description: null,
  phone: null,
  website: "https://example.com",
  working_hours: null,
  photo: null,
  street_view: null,
  business_status: "OPERATIONAL",
  is_hidden_gem: true,
  priorityRank: 4,
  partner_status: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
}

const unpaid = computeHealthScore(base)
const partner = computeHealthScore({ ...base, partner_status: "partner" })
const sponsored = computeHealthScore({ ...base, partner_status: "sponsored" })

assert(
  JSON.stringify(unpaid) === JSON.stringify(partner) &&
    JSON.stringify(unpaid) === JSON.stringify(sponsored),
  "Health Score ignores partner and sponsored status"
)

const gradeB = computeHealthScore({ ...base, inspection_grade: "B" })
assert(
  gradeB.score !== unpaid.score,
  "Health Score still changes when the official grade changes"
)

const lowerRating = computeHealthScore({ ...base, rating: 4.0, partner_status: "partner" })
assert(
  lowerRating.score !== unpaid.score,
  "Health Score still changes when the rating changes"
)

assert(
  JSON.stringify(organicRankKey(base)) ===
    JSON.stringify(organicRankKey({ ...base, partner_status: "partner" })) &&
    JSON.stringify(organicRankKey(base)) ===
      JSON.stringify(organicRankKey({ ...base, partner_status: "sponsored" })),
  "organic rank key ignores partner status"
)

assert(
  organicRankKey({ ...base, rating: 3 }).rating !== organicRankKey(base).rating,
  "organic rank key still includes rating"
)

assert(
  !(ORGANIC_SORT_KEYS as readonly string[]).includes("partner_status"),
  "organic sort keys do not include partner_status"
)

assert(partnerLinkRel(null) === "noopener noreferrer", "unpaid links are not sponsored")
assert(partnerLinkRel(undefined) === "noopener noreferrer", "missing status is not sponsored")
assert(
  partnerLinkRel("partner") === "sponsored noopener noreferrer",
  "partner links use rel=sponsored"
)
assert(
  partnerLinkRel("sponsored") === "sponsored noopener noreferrer",
  "sponsored links use rel=sponsored"
)
assert(
  partnerLinkRel("featured") === "noopener noreferrer",
  "vague labels are not treated as partner links"
)

if (process.exitCode) {
  console.error("\nPartner-status tests failed")
} else {
  console.log("\nPartner-status tests passed")
}
