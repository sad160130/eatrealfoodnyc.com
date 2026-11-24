import { getCanonicalUrl } from "@/config/seo"
import { YoutubeShortPlayer } from "@/components/youtube-short-player"
import { buildYoutubeShortVideoObject, getYoutubeShort } from "@/lib/youtube-shorts"

/**
 * One Short on a guide. The player is the click-to-play facade.
 * One VideoObject per video. View counts are never copied onto the schema.
 */
export default function GuideYoutubeShort({
  slug,
  restaurantName,
  inspectionDateIso,
  inspectionDateLabel,
  publicTitle,
}: {
  slug: string
  restaurantName: string
  inspectionDateIso: string
  inspectionDateLabel: string
  /** Replaces the Short title in the caption and VideoObject name on this page. */
  publicTitle?: string
}) {
  const short = getYoutubeShort(slug)
  if (!short) return null

  const listingUrl = getCanonicalUrl(`/restaurants/${slug}`)
  const visibleTitle = publicTitle ?? short.title
  const schema = buildYoutubeShortVideoObject(
    publicTitle ? { ...short, title: publicTitle } : short,
    listingUrl
  )
  const linkStyle = {
    color: "var(--color-jade)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  } as const

  return (
    <figure className="mt-6" data-video-id={short.videoId}>
      <YoutubeShortPlayer
        title={visibleTitle}
        thumbnailUrl={short.thumbnailUrl}
        fallbackThumbnailUrl={short.fallbackThumbnailUrl}
        embedUrl={`${short.embedUrl}?autoplay=1&rel=0&playsinline=1`}
      />
      <figcaption className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700">
        <p>{visibleTitle}</p>
        <p>
          Latest NYC DOHMH inspection date on this record:{" "}
          <time dateTime={inspectionDateIso}>{inspectionDateLabel}</time>.
        </p>
        <p>A grade is a sanitary score, not a taste score.</p>
        <p>
          <a href={`/restaurants/${slug}`} style={linkStyle}>
            {restaurantName} listing
          </a>
          <span aria-hidden="true"> · </span>
          <a href={short.shortUrl} rel="noopener noreferrer" target="_blank" style={linkStyle}>
            Watch this Short on YouTube
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </figcaption>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </figure>
  )
}
