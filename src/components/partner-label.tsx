"use client"

import Link from "next/link"
import {
  isPartnerStatus,
  partnerLabelText,
  type PartnerStatus,
} from "@/lib/partner-status"

/**
 * Visible Partner or Sponsored label. Paid placements use these words only —
 * never "Recommended", "Featured", "Spotlight", or "Hand-picked".
 * Outbound links that exist because of the placement use rel="sponsored"
 * via partnerLinkRel().
 */
export default function PartnerLabel({
  kind,
  tone = "on-light",
}: {
  kind: PartnerStatus
  /** `on-dark` is the cream plaque treatment, for forest backgrounds. */
  tone?: "on-light" | "on-dark"
}) {
  const label = partnerLabelText(kind)
  return (
    <span
      className={tone === "on-dark" ? "partner-label partner-label-on-dark" : "partner-label"}
      data-partner={kind}
    >
      {label}
    </span>
  )
}

export function PartnerDisclosure({
  kind,
}: {
  kind: string | null | undefined
}) {
  if (!isPartnerStatus(kind)) return null
  const label = partnerLabelText(kind)
  const noun = kind === "sponsored" ? "Sponsored placement" : "Partner placement"

  return (
    <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
      <PartnerLabel kind={kind} />
      <span className="ml-2">
        {noun}: this restaurant is a current {label === "Sponsored" ? "sponsor" : "Partner"}.
        That is paid advertising. It does not change the official NYC health grade,
        the Health Score, dietary tags, or where this restaurant sits in organic results.{" "}
        <Link
          href="/about/editorial-standards#editorial-partnership-policy"
          className="font-semibold text-jade hover:text-forest"
        >
          Editorial &amp; Partnership Policy
        </Link>
      </span>
    </p>
  )
}
