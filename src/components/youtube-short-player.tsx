"use client"

import { useState } from "react"

function preconnect(origin: string) {
  if (typeof document === "undefined") return
  if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return
  const link = document.createElement("link")
  link.rel = "preconnect"
  link.href = origin
  document.head.appendChild(link)
}

type FacadePlayerProps = {
  title: string
  thumbnailUrl: string
  fallbackThumbnailUrl: string
  embedUrl: string
  frameClassName: string
  posterWidth: number
  posterHeight: number
}

/**
 * Facade player. The iframe is created on click, so the page does not
 * download a YouTube player on first paint. The poster is one image.
 * Shorts stay 9:16. Long-form stays 16:9. Neither frame is reused for the other shape.
 */
function YoutubeFacadePlayer({
  title,
  thumbnailUrl,
  fallbackThumbnailUrl,
  embedUrl,
  frameClassName,
  posterWidth,
  posterHeight,
}: FacadePlayerProps) {
  const [playing, setPlaying] = useState(false)
  const warm = () => preconnect("https://www.youtube-nocookie.com")

  return (
    <div className={frameClassName}>
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="absolute inset-0 block h-full w-full cursor-pointer bg-cream text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
          aria-label={`Play video: ${title}`}
          onClick={() => setPlaying(true)}
          onPointerEnter={warm}
          onFocus={warm}
        >
          <img
            src={thumbnailUrl}
            alt=""
            width={posterWidth}
            height={posterHeight}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={(event) => {
              const image = event.currentTarget
              if (image.src.endsWith("hqdefault.jpg")) return
              image.src = fallbackThumbnailUrl
            }}
          />
          <span
            className="plaque"
            aria-hidden="true"
            style={{ position: "absolute", left: "0.75rem", top: "0.75rem", width: "2.75rem", height: "2.75rem" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}

export type YoutubePlayerProps = {
  title: string
  thumbnailUrl: string
  fallbackThumbnailUrl: string
  embedUrl: string
}

/** 9:16 Short. Do not pass a landscape video here. */
export function YoutubeShortPlayer(props: YoutubePlayerProps) {
  return (
    <YoutubeFacadePlayer
      {...props}
      frameClassName="relative aspect-[9/16] w-full max-w-[17.5rem] overflow-hidden rounded-[4px] border border-hairline-strong bg-cream"
      posterWidth={1080}
      posterHeight={1920}
    />
  )
}

/** 16:9 long-form. Do not pass a Short here. */
export function YoutubeLongformPlayer(props: YoutubePlayerProps) {
  return (
    <YoutubeFacadePlayer
      {...props}
      frameClassName="relative aspect-[16/9] w-full overflow-hidden rounded-[4px] border border-hairline-strong bg-cream"
      posterWidth={1280}
      posterHeight={720}
    />
  )
}
