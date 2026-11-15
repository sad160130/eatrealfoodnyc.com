import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"

/**
 * Paid advertising tiers. A Stripe Payment Link replaces the mailto.
 * After checkout, Stripe returns the buyer to
 * /partner-with-us?status=success&tier=<featured|spotlight|neighborhood_sponsor>.
 * Payment never changes a grade, a Health Score, a dietary tag, or organic rank.
 */
export interface PartnerTier {
  id: "featured" | "spotlight" | "neighborhood-sponsor"
  name: string
  priceMonthlyUsd: number
  stripePaymentLink: string | null
  summary: string
  includes: string[]
}

export const PARTNER_TIERS: PartnerTier[] = [
  {
    id: "featured",
    name: "Featured",
    priceMonthlyUsd: 49,
    stripePaymentLink: "https://buy.stripe.com/4gM4gzgNt7Is3cab9HcV200",
    summary: "A labeled Partner listing for one restaurant.",
    includes: [
      "A Partner label on the listing page",
      "Placement in labeled Partner modules, not in the unlabeled organic list",
      "The official grade, score, date, and dietary tags stay as published",
    ],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    priceMonthlyUsd: 149,
    stripePaymentLink: "https://buy.stripe.com/14A28r40H8Mw7sqelTcV201",
    summary: "The Featured listing, plus a larger labeled module.",
    includes: [
      "Everything in Featured",
      "A larger unit inside a labeled Partner module",
      "No change to organic sort order on neighborhood or diet pages",
    ],
  },
  {
    id: "neighborhood-sponsor",
    name: "Neighborhood Sponsor",
    priceMonthlyUsd: 299,
    stripePaymentLink: "https://buy.stripe.com/dRmdR9gNtfaUcMKfpXcV202",
    summary: "One labeled sponsor unit on a chosen neighborhood page.",
    includes: [
      "A Sponsored or Presented by unit on that neighborhood page",
      "The Featured listing for the sponsor’s restaurant, when the sponsor is a restaurant",
      "The page’s organic restaurant order stays the organic order",
    ],
  },
]

export function partnerTierHref(tier: PartnerTier): string {
  if (tier.stripePaymentLink) return tier.stripePaymentLink
  const subject = encodeURIComponent(`${tier.name} partnership`)
  return `mailto:${PARTNER_INQUIRY_EMAIL}?subject=${subject}`
}

export function partnerTierCta(tier: PartnerTier): string {
  if (tier.stripePaymentLink) return `Continue to payment for ${tier.name}`
  return `Request ${tier.name}`
}
