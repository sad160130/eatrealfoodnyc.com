import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { computeHealthScore } from "../lib/utils"
import NeighborhoodSponsorSlot from "../components/neighborhood-sponsor-slot"
import ClaimListing from "../components/claim-listing"
import PartnerTierCards from "../components/partner-tier-cards"
import {
  ORGANIC_SORT_KEYS,
  organicRankKey,
  partnerLinkRel,
} from "../lib/partner-status"
import {
  PARTNER_INQUIRY_OFFERS,
  PARTNER_TIERS,
  partnerInquiryHref,
  partnerTierHref,
  partnerTierPrice,
} from "../config/partner-tiers"
import {
  CLAIM_LISTING_LABEL,
  GRADE_A_BADGE_LABEL,
  LISTING_OWNER_TRACK,
  NEIGHBORHOOD_SLOT_TRACK,
  SPONSOR_SLOT_CTA,
  SPONSOR_SLOT_LEAD,
  SPONSOR_SLOT_TITLE,
  listingOwnerPartnerHref,
  listingOwnerPartnerLabel,
  neighborhoodNameFromRef,
  neighborhoodSponsorDetail,
  neighborhoodSponsorHref,
  partnerReferralLine,
} from "../lib/partner-entry"
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

assert(partnerTierPrice(PARTNER_TIERS[0]) === "$49/month", "Featured price is one text string")
assert(partnerTierPrice(PARTNER_TIERS[1]) === "$149/month", "Spotlight price is one text string")
assert(partnerTierPrice(PARTNER_TIERS[2]) === "$299/month", "Neighborhood Sponsor price is one text string")
assert(PARTNER_TIERS.map((tier) => tier.name).join("|") === "Featured|Spotlight|Neighborhood Sponsor", "tier names")
assert(
  partnerTierHref(PARTNER_TIERS[0]) === "https://buy.stripe.com/4gM4gzgNt7Is3cab9HcV200" &&
    partnerTierHref(PARTNER_TIERS[1]) === "https://buy.stripe.com/14A28r40H8Mw7sqelTcV201" &&
    partnerTierHref(PARTNER_TIERS[2]) === "https://buy.stripe.com/dRmdR9gNtfaUcMKfpXcV202",
  "Stripe Payment Links are unchanged"
)
assert(
  PARTNER_INQUIRY_OFFERS.map((offer) => offer.id).join("|") ===
    "sponsored_guide|newsletter_sponsor|catering_referral",
  "inquiry offer ids match the tracked tiers"
)
assert(PARTNER_INQUIRY_OFFERS[0].price === "$250 per placement", "guide placement price")
assert(PARTNER_INQUIRY_OFFERS[0].label === "Sponsored", "guide placement is labeled Sponsored")
assert(PARTNER_INQUIRY_OFFERS[1].price === "$150 per weekly issue", "newsletter slot price")
assert(PARTNER_INQUIRY_OFFERS[1].label === "Sponsored", "newsletter slot is labeled Sponsored")
assert(
  PARTNER_INQUIRY_OFFERS[2].price === "$50 per accepted catering lead, or 10% of the first order",
  "catering referral price"
)
assert(
  decodeURIComponent(partnerInquiryHref(PARTNER_INQUIRY_OFFERS[0]).split("subject=")[1]) ===
    "Sponsored guide placement",
  "guide inquiry mailto subject"
)
assert(
  partnerInquiryHref(PARTNER_INQUIRY_OFFERS[1]).startsWith("mailto:partner@eatrealfoodnyc.com?subject="),
  "newsletter inquiry uses the partner inbox"
)

assert(
  PARTNER_TIERS.map((tier) => tier.id).join("|") === "featured|spotlight|neighborhood-sponsor",
  "tier ids are the partner-page anchors"
)
assert(neighborhoodSponsorDetail() === "A labeled Sponsored unit for a restaurant or brand that fits this directory. $299/month. It never changes grades or the order of the list.", "sponsor slot copy")
assert(listingOwnerPartnerLabel() === "Optional: labeled Partner placement from $49/month", "listing owner paid step")
assert(neighborhoodSponsorHref("kips-bay") === "/partner-with-us?ref=nbhd-kips-bay#neighborhood-sponsor", "neighborhood sponsor href")
assert(listingOwnerPartnerHref() === "/partner-with-us?ref=listing#featured", "listing owner href")
assert(
  partnerReferralLine("Kips Bay") === "You came from the Kips Bay page. The Neighborhood Sponsor slot on that page is open.",
  "neighborhood referral line"
)
assert(NEIGHBORHOOD_SLOT_TRACK.tier === "neighborhood_sponsor" && NEIGHBORHOOD_SLOT_TRACK.source === "neighborhood_slot", "neighborhood slot tracking")
assert(LISTING_OWNER_TRACK.tier === "featured" && LISTING_OWNER_TRACK.source === "listing_owner_box", "listing owner tracking")

const neighborhoodNames = ["Harlem", "Kips Bay", "Hell's Kitchen"]
assert(neighborhoodNameFromRef("nbhd-kips-bay", neighborhoodNames) === "Kips Bay", "kips bay ref maps to the neighborhood")
assert(neighborhoodNameFromRef("nbhd-hells-kitchen", neighborhoodNames) === "Hell's Kitchen", "apostrophe slug maps")
assert(neighborhoodNameFromRef("listing", neighborhoodNames) === null, "listing ref is not a neighborhood arrival")
assert(neighborhoodNameFromRef("nbhd-not-a-place", neighborhoodNames) === null, "unknown neighborhood ref shows nothing")
assert(neighborhoodNameFromRef(null, neighborhoodNames) === null, "missing ref shows nothing")
assert(neighborhoodNameFromRef("nbhd-", neighborhoodNames) === null, "empty neighborhood slug shows nothing")
assert(neighborhoodNameFromRef("NBHD-kips-bay", neighborhoodNames) === null, "ref prefix is lowercase nbhd-")

const slotHtml = renderToStaticMarkup(createElement(NeighborhoodSponsorSlot, { neighborhoodSlug: "kips-bay" }))
assert(slotHtml.includes(SPONSOR_SLOT_TITLE), "sponsor slot title is in the html")
assert(slotHtml.includes(SPONSOR_SLOT_LEAD), "sponsor slot lead is in the html")
assert(slotHtml.includes(neighborhoodSponsorDetail()), "sponsor slot detail is in the html")
assert(slotHtml.includes(SPONSOR_SLOT_CTA), "sponsor slot cta is in the html")
assert(slotHtml.includes('href="/partner-with-us?ref=nbhd-kips-bay#neighborhood-sponsor"'), "sponsor slot href is in the html")
assert(!slotHtml.includes("nofollow"), "sponsor slot link is not nofollow")
assert(!slotHtml.includes("ld+json"), "sponsor slot is not json-ld")

const ownerHtml = renderToStaticMarkup(
  createElement(ClaimListing, { restaurantSlug: "dirt-candy", restaurantName: "Dirt Candy", showBadge: true }),
)
assert(ownerHtml.includes("Own this restaurant?"), "owner box heading")
assert(ownerHtml.includes(CLAIM_LISTING_LABEL), "claim link text")
assert(ownerHtml.includes(GRADE_A_BADGE_LABEL), "grade a badge link text")
assert(ownerHtml.includes(listingOwnerPartnerLabel()), "paid step text")
assert(ownerHtml.indexOf(CLAIM_LISTING_LABEL) < ownerHtml.indexOf(GRADE_A_BADGE_LABEL), "claim comes before the badge")
assert(ownerHtml.indexOf(GRADE_A_BADGE_LABEL) < ownerHtml.indexOf(listingOwnerPartnerLabel()), "badge comes before the paid step")
assert(ownerHtml.includes('href="/claim?r=dirt-candy"'), "claim href")
assert(ownerHtml.includes('href="/restaurants/dirt-candy/badge"'), "badge href")
assert(ownerHtml.includes('href="/partner-with-us?ref=listing#featured"'), "paid step href")
assert(!ownerHtml.includes("nofollow"), "owner box links are not nofollow")

const noBadgeHtml = renderToStaticMarkup(
  createElement(ClaimListing, { restaurantSlug: "dirt-candy", restaurantName: "Dirt Candy" }),
)
assert(!noBadgeHtml.includes(GRADE_A_BADGE_LABEL), "badge step is omitted without a Grade A")
assert(noBadgeHtml.indexOf(CLAIM_LISTING_LABEL) < noBadgeHtml.indexOf(listingOwnerPartnerLabel()), "paid step stays last without a badge")

const tierHtml = renderToStaticMarkup(createElement(PartnerTierCards))
assert(tierHtml.includes('id="featured"'), "featured card anchor")
assert(tierHtml.includes('id="spotlight"'), "spotlight card anchor")
assert(tierHtml.includes('id="neighborhood-sponsor"'), "neighborhood sponsor card anchor")

if (process.exitCode) {
  console.error("\nPartner-status tests failed")
} else {
  console.log("\nPartner-status tests passed")
}
