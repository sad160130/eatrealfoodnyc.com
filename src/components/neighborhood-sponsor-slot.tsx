import { PartnerCta } from "@/components/tracked-external-link"
import {
  NEIGHBORHOOD_SLOT_TRACK,
  SPONSOR_SLOT_CTA,
  SPONSOR_SLOT_LEAD,
  SPONSOR_SLOT_TITLE,
  neighborhoodSponsorDetail,
  neighborhoodSponsorHref,
} from "@/lib/partner-entry"

/**
 * Open neighborhood-sponsor slot. Rendered under the organic restaurant list.
 * Not included in ItemList JSON-LD. The link is internal and is not nofollow.
 */
export default function NeighborhoodSponsorSlot({
  neighborhoodSlug,
}: {
  neighborhoodSlug: string
}) {
  return (
    <aside
      aria-label={SPONSOR_SLOT_TITLE}
      className="mt-10 max-w-xl border p-4"
      style={{ borderColor: "var(--hairline)", borderRadius: "4px" }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--color-forest)" }}>
        {SPONSOR_SLOT_TITLE}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
        {SPONSOR_SLOT_LEAD}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {neighborhoodSponsorDetail()}
      </p>
      <PartnerCta
        tier={NEIGHBORHOOD_SLOT_TRACK.tier}
        source={NEIGHBORHOOD_SLOT_TRACK.source}
        href={neighborhoodSponsorHref(neighborhoodSlug)}
        className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 text-jade"
      >
        {SPONSOR_SLOT_CTA}
      </PartnerCta>
    </aside>
  )
}
