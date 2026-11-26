import type { CSSProperties } from "react"
import { getCanonicalUrl } from "@/config/seo"
import { formatLongDate } from "@/lib/inspection-dates"

/** Visible "Updated" line and WebPage dateModified for the same calendar day. */
export function UpdatedWebPage({
  date,
  urlPath,
  hideLabel = false,
  labelStyle,
}: {
  date: Date
  urlPath: string
  hideLabel?: boolean
  labelStyle?: CSSProperties
}) {
  const iso = date.toISOString().slice(0, 10)
  return (
    <>
      {hideLabel ? null : (
        <p className="mt-3 text-sm" style={labelStyle ?? { color: "var(--color-muted)" }}>Updated {formatLongDate(date)}.</p>
      )}
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
    </>
  )
}
