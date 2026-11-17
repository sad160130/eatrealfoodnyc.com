"use client"

import { useSearchParams } from "next/navigation"
import { neighborhoodNameFromRef, partnerReferralLine } from "@/lib/partner-entry"

export function PartnerPurchaseNotice() {
  const status = useSearchParams().get("status")
  if (status !== "success") return null
  return (
    <p
      role="status"
      className="mb-10 rounded-md border bg-white px-5 py-4 text-base leading-relaxed"
      style={{ borderColor: "var(--color-jade)", color: "var(--color-forest)" }}
    >
      Thanks! Your placement is confirmed. We&apos;ll email you within 1 business day to set it up.
    </p>
  )
}

export function PartnerReferralLine({
  neighborhoods,
}: {
  neighborhoods: readonly string[]
}) {
  const ref = useSearchParams().get("ref")
  const name = neighborhoodNameFromRef(ref, neighborhoods)
  if (!name) return null
  return (
    <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--color-forest)" }}>
      {partnerReferralLine(name)}
    </p>
  )
}
