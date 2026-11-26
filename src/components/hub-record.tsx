import { getCanonicalUrl } from "@/config/seo"
import { formatLongDate } from "@/lib/inspection-dates"
import {
  hubGradeNote,
  hubOpening,
  isoDay,
  listingSentence,
  type HubListingLine,
  type HubRecordInput,
} from "@/lib/hub-record"
import { DOHMH_INSPECTION_DATASET_URL } from "@/lib/schema"

export function HubRecord({
  urlPath,
  listings,
  ...input
}: HubRecordInput & {
  urlPath: string
  listings?: HubListingLine[]
}) {
  const opening = hubOpening(input)
  const note = hubGradeNote(input)
  const label = input.updated ? formatLongDate(input.updated) : null
  const iso = input.updated ? isoDay(input.updated) : null
  return (
    <div className="mt-4" style={{ maxWidth: "68ch" }}>
      <p className="text-base leading-relaxed" style={{ color: "var(--color-text)" }}>{opening}</p>
      <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>{note}</p>
      <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
        Inspection letters and dates on this page are matched from the{" "}
        <a
          href={DOHMH_INSPECTION_DATASET_URL}
          className="font-semibold underline underline-offset-4"
          style={{ color: "var(--color-jade)" }}
        >
          NYC DOHMH restaurant inspection results
        </a>
        {" "}on NYC Open Data.
      </p>
      {label ? (
        <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>Updated {label}.</p>
      ) : null}
      {listings && listings.length > 0 ? (
        <ul className="mt-4 space-y-2 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
          {listings.map((listing, index) => (
            <li key={`${index}-${listing.name}`}>{listingSentence(input.place, listing)}</li>
          ))}
        </ul>
      ) : null}
      {iso ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              url: getCanonicalUrl(urlPath),
              dateModified: iso,
            }),
          }}
        />
      ) : null}
    </div>
  )
}
