"use client"

import Link from "next/link"
import { track } from "@vercel/analytics"
import { PartnerCta } from "@/components/tracked-external-link"
import {
  CLAIM_LISTING_LABEL,
  GRADE_A_BADGE_LABEL,
  LISTING_OWNER_TRACK,
  OWNER_BOX_TITLE,
  listingOwnerPartnerHref,
  listingOwnerPartnerLabel,
} from "@/lib/partner-entry"

const freeLinkClass = "font-semibold underline underline-offset-4"

export default function ClaimListing({
  restaurantSlug,
  showBadge = false,
}: {
  restaurantSlug: string
  restaurantName: string
  showBadge?: boolean
}) {
  return (
    <aside
      aria-label={OWNER_BOX_TITLE}
      className="mt-5 max-w-md border p-4"
      style={{ borderColor: "var(--hairline)", borderRadius: "4px" }}
    >
      <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-forest)" }}>
        {OWNER_BOX_TITLE}
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm" style={{ color: "var(--color-text)" }}>
        <li>
          <Link
            href={`/claim?r=${restaurantSlug}`}
            className={freeLinkClass}
            style={{ color: "var(--color-jade)" }}
            onClick={() => track("claim_listing_click")}
          >
            {CLAIM_LISTING_LABEL} (free)
          </Link>
        </li>
        {showBadge ? (
          <li>
            <Link
              href={`/restaurants/${restaurantSlug}/badge`}
              className={freeLinkClass}
              style={{ color: "var(--color-jade)" }}
            >
              {GRADE_A_BADGE_LABEL}
            </Link>
          </li>
        ) : null}
        <li className="text-xs leading-relaxed">
          <PartnerCta
            tier={LISTING_OWNER_TRACK.tier}
            source={LISTING_OWNER_TRACK.source}
            href={listingOwnerPartnerHref()}
            className="font-medium underline underline-offset-4 text-jade"
          >
            {listingOwnerPartnerLabel()}
          </PartnerCta>
        </li>
      </ol>
    </aside>
  )
}
