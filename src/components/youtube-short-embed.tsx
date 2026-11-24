import { formatLongDate, parseInspectionDate } from "@/lib/inspection-dates"
import { getCanonicalUrl } from "@/config/seo"
import { buildYoutubeShortVideoObject, getYoutubeShort } from "@/lib/youtube-shorts"
import { YoutubeShortPlayer } from "@/components/youtube-short-player"

function officialInspectionDate(value: string | null): { text: string; dateTime: string | null } {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return { text: "not on file", dateTime: null }
  const parsed = parseInspectionDate(trimmed)
  if (!parsed) return { text: trimmed, dateTime: null }
  return { text: formatLongDate(parsed), dateTime: parsed.toISOString().slice(0, 10) }
}

/**
 * One Short on a listing, rendered only when the slug is in the map.
 * Caption text is server HTML. The player is a facade until click.
 */
export default function YoutubeShortEmbed({
  slug,
  restaurantName,
  inspectionDate,
}: {
  slug: string
  restaurantName: string
  inspectionDate: string | null
}) {
  const short = getYoutubeShort(slug)
  if (!short) return null

  const headingId = `youtube-short-${slug}`
  const inspection = officialInspectionDate(inspectionDate)
  const listingUrl = getCanonicalUrl(`/restaurants/${slug}`)
  const schema = buildYoutubeShortVideoObject(short, listingUrl)
  const linkStyle = {
    color: "var(--color-jade)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  } as const

  return (
    <section aria-labelledby={headingId} data-video-id={short.videoId}>
      <p className="eyebrow">YouTube Short</p>
      <h2 id={headingId} className="h2-serif mt-2">
        Watch {restaurantName}
      </h2>
      <figure className="mt-5">
        <YoutubeShortPlayer
          title={short.title}
          thumbnailUrl={short.thumbnailUrl}
          fallbackThumbnailUrl={short.fallbackThumbnailUrl}
          embedUrl={`${short.embedUrl}?autoplay=1&rel=0&playsinline=1`}
        />
        <figcaption
          className="mt-4 space-y-2 text-sm leading-relaxed"
          style={{ color: "var(--color-text)", maxWidth: "62ch" }}
        >
          <p>{short.title}</p>
          <p>
            Official inspection date:{" "}
            {inspection.dateTime ? (
              <time dateTime={inspection.dateTime}>{inspection.text}</time>
            ) : (
              inspection.text
            )}
            .
          </p>
          <p>A grade is a sanitary score, not a taste score.</p>
          <p>
            <a href={`/restaurants/${slug}`} aria-current="page" style={linkStyle}>
              {restaurantName} listing
            </a>
            <span aria-hidden="true"> · </span>
            <a href={short.shortUrl} rel="noopener noreferrer" target="_blank" style={linkStyle}>
              Watch this Short on YouTube
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            if the player does not load.
          </p>
        </figcaption>
      </figure>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  )
}
