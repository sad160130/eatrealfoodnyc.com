/**
 * Long-form YouTube videos embedded on guides.
 * One record, one page. View and like counts are not stored.
 * Posters are YouTube's maxresdefault image, with hqdefault as the fallback.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const UPLOAD_DATE = /^\d{4}-\d{2}-\d{2}$/

export const LONGFORM_WALKTHROUGH_HEADING = "Watch the video walkthrough below"
export const LONGFORM_VERIFIED_CAPTION =
  "The ranking was verified November 24, 2026 against NYC DOHMH dataset 43nn-pn8j."
export const LONGFORM_GRADE_CAVEAT = "A Grade A is a sanitary score, not a taste score."

export interface YoutubeLongformSource {
  videoId?: string
  title: string
  description: string
  uploadDate: string
  durationSec: number
  watchUrl: string
  embedUrl: string
}

export interface YoutubeLongform {
  videoId: string
  title: string
  description: string
  uploadDate: string
  durationSec: number
  /** ISO 8601 duration, derived from durationSec. */
  duration: string
  watchUrl: string
  embedUrl: string
  /** maxresdefault poster. */
  thumbnailUrl: string
  /** hqdefault poster, used when maxresdefault 404s. */
  fallbackThumbnailUrl: string
}

export const BEST_ITALIAN_LONGFORM_SOURCE: YoutubeLongformSource = {
  videoId: "NNkuZAOiVCU",
  title: "10 NYC Italian Kitchens, Ranked by Inspection Score",
  description: `${LONGFORM_VERIFIED_CAPTION} ${LONGFORM_GRADE_CAVEAT}`,
  uploadDate: "2026-11-24",
  durationSec: 601,
  watchUrl: "https://www.youtube.com/watch?v=NNkuZAOiVCU",
  embedUrl: "https://www.youtube-nocookie.com/embed/NNkuZAOiVCU",
}

function isoDuration(seconds: number): string {
  if (!Number.isInteger(seconds) || seconds <= 0 || seconds > 60 * 60) {
    throw new Error(`Bad YouTube duration: ${seconds}`)
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  let value = "PT"
  if (hours > 0) value += `${hours}H`
  if (minutes > 0) value += `${minutes}M`
  if (secs > 0 || value === "PT") value += `${secs}S`
  return value
}

export function youtubeLongformPosters(videoId: string): {
  thumbnailUrl: string
  fallbackThumbnailUrl: string
} {
  return {
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    fallbackThumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  }
}

/** Returns null when videoId is missing. A present id must match the watch and embed URLs. */
export function buildYoutubeLongform(source: YoutubeLongformSource): YoutubeLongform | null {
  const videoId = source.videoId?.trim() ?? ""
  if (!videoId) return null
  if (!VIDEO_ID.test(videoId)) throw new Error(`Bad YouTube video id: ${videoId}`)
  const title = source.title?.trim() ?? ""
  if (!title) throw new Error(`Missing YouTube title for ${videoId}`)
  const description = source.description?.trim() ?? ""
  if (!description) throw new Error(`Missing YouTube description for ${videoId}`)
  if (!UPLOAD_DATE.test(source.uploadDate)) throw new Error(`Bad YouTube upload date: ${source.uploadDate}`)
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  if (source.watchUrl !== watchUrl) throw new Error(`Watch URL does not match ${videoId}`)
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  if (source.embedUrl !== embedUrl) throw new Error(`Embed URL does not match ${videoId}`)
  return {
    videoId,
    title,
    description,
    uploadDate: source.uploadDate,
    durationSec: source.durationSec,
    duration: isoDuration(source.durationSec),
    watchUrl,
    embedUrl,
    ...youtubeLongformPosters(videoId),
  }
}

export const bestItalianLongformVideo = buildYoutubeLongform(BEST_ITALIAN_LONGFORM_SOURCE)

/**
 * VideoObject for the one long-form video on a guide.
 * Fields are the verified name, description, posters, upload date, duration,
 * embed URL, and watch URL. No view counts, ratings, or transcripts.
 */
export function buildYoutubeLongformVideoObject(video: {
  title: string
  description: string
  thumbnailUrl: string
  fallbackThumbnailUrl: string
  uploadDate: string
  duration: string
  embedUrl: string
  watchUrl: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnailUrl, video.fallbackThumbnailUrl],
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: video.embedUrl,
    contentUrl: video.watchUrl,
  }
}
