import { PARTNER_TIERS, partnerTierPrice } from "@/config/partner-tiers"
import { neighborhoodToSlug } from "@/lib/utils"

/** `partner_cta_click` payload for the neighborhood page slot. */
export const NEIGHBORHOOD_SLOT_TRACK = {
  tier: "neighborhood_sponsor",
  source: "neighborhood_slot",
} as const

/** `partner_cta_click` payload for the listing-page owner box. */
export const LISTING_OWNER_TRACK = {
  tier: "featured",
  source: "listing_owner_box",
} as const

export const SPONSOR_SLOT_TITLE = "Sponsor this neighborhood page"
export const SPONSOR_SLOT_LEAD = "This page has one sponsor slot. It is open."
export const SPONSOR_SLOT_CTA = "See sponsor details"
export const OWNER_BOX_TITLE = "Own this restaurant?"
export const CLAIM_LISTING_LABEL = "Claim this listing"
export const GRADE_A_BADGE_LABEL = "Get the free Grade A badge"

const REF_PREFIX = "nbhd-"

function tierById(id: (typeof PARTNER_TIERS)[number]["id"]) {
  const tier = PARTNER_TIERS.find((item) => item.id === id)
  if (!tier) throw new Error(`Missing partner tier ${id}`)
  return tier
}

export function neighborhoodSponsorDetail(): string {
  return `A labeled Sponsored unit for a restaurant or brand that fits this directory. ${partnerTierPrice(tierById("neighborhood-sponsor"))}. It never changes grades or the order of the list.`
}

export function listingOwnerPartnerLabel(): string {
  return `Optional: labeled Partner placement from ${partnerTierPrice(tierById("featured"))}`
}

export function neighborhoodSponsorHref(neighborhoodSlug: string): string {
  return `/partner-with-us?ref=${REF_PREFIX}${neighborhoodSlug}#neighborhood-sponsor`
}

export function listingOwnerPartnerHref(): string {
  return "/partner-with-us?ref=listing#featured"
}

/**
 * Display name for a `?ref=nbhd-<slug>` arrival.
 * Returns null unless the ref uses that prefix and the slug is a known neighborhood.
 * When two names share a slug, the en-locale first name wins.
 */
export function neighborhoodNameFromRef(
  ref: string | null | undefined,
  neighborhoodNames: readonly string[],
): string | null {
  if (!ref || !ref.startsWith(REF_PREFIX)) return null
  const slug = ref.slice(REF_PREFIX.length)
  if (!slug) return null
  const match = [...neighborhoodNames]
    .sort((a, b) => a.localeCompare(b, "en"))
    .find((name) => neighborhoodToSlug(name) === slug)
  return match ?? null
}

export function partnerReferralLine(neighborhoodName: string): string {
  return `You came from the ${neighborhoodName} page. The Neighborhood Sponsor slot on that page is open.`
}
