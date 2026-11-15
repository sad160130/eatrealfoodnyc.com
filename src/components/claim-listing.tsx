"use client"

import Link from "next/link"
import { track } from "@vercel/analytics"

export default function ClaimListing({
  restaurantSlug,
  showBadge = false,
}: {
  restaurantSlug: string
  restaurantName: string
  showBadge?: boolean
}) {
  return (
    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <Link
        href={`/claim?r=${restaurantSlug}`}
        className="font-semibold underline underline-offset-4"
        style={{ color: "var(--color-jade)" }}
        onClick={() => track("claim_listing_click")}
      >
        Claim this listing
      </Link>
      {showBadge ? (
        <Link
          href={`/restaurants/${restaurantSlug}/badge`}
          className="font-semibold underline underline-offset-4"
          style={{ color: "var(--color-jade)" }}
        >
          Get a free badge
        </Link>
      ) : null}
    </p>
  )
}
