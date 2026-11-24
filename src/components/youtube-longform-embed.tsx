import { YoutubeLongformPlayer } from "@/components/youtube-short-player"
import {
  LONGFORM_GRADE_CAVEAT,
  LONGFORM_VERIFIED_CAPTION,
  LONGFORM_WALKTHROUGH_HEADING,
  buildYoutubeLongformVideoObject,
  type YoutubeLongform,
} from "@/data/youtube-longform"

export type YoutubeLongformEmbedVideo = Omit<YoutubeLongform, "videoId" | "durationSec"> & {
  videoId?: string | null
}

/**
 * One 16:9 walkthrough. Renders nothing when the video id is missing.
 * Caption text is server HTML. The player is a facade until click.
 */
export default function YoutubeLongformEmbed({ video }: { video: YoutubeLongformEmbedVideo | null }) {
  const videoId = video?.videoId?.trim() ?? ""
  if (!videoId || !video) return null

  const headingId = "video-walkthrough-heading"
  const schema = buildYoutubeLongformVideoObject(video)
  const linkClass = "font-semibold text-jade hover:text-forest"

  return (
    <section
      id="video-walkthrough"
      className="mb-16 scroll-mt-24"
      aria-labelledby={headingId}
      data-video-id={videoId}
    >
      <h2
        id={headingId}
        className="mb-8 text-3xl font-bold text-forest"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {LONGFORM_WALKTHROUGH_HEADING}
      </h2>
      <figure>
        <YoutubeLongformPlayer
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          fallbackThumbnailUrl={video.fallbackThumbnailUrl}
          embedUrl={`${video.embedUrl}?autoplay=1&rel=0&playsinline=1`}
        />
        <figcaption className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700">
          <p>{video.title}</p>
          <p>{LONGFORM_VERIFIED_CAPTION}</p>
          <p>{LONGFORM_GRADE_CAVEAT}</p>
          <p>
            <a href={video.watchUrl} rel="noopener noreferrer" target="_blank" className={linkClass}>
              Watch on YouTube
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
