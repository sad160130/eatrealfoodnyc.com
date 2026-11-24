import rawRows from "@/data/youtube-shorts.json"
import { PUBLISHER_REF } from "@/lib/schema"

/**
 * Slug → YouTube Short map, checked in from short-to-page-map-2026-11-23.
 * View, like, and comment snapshots stay in the JSON file and are never
 * copied onto a Short or into VideoObject. They go stale, and a grade
 * page must not present them as measurements.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const UPLOAD_DATE = /^(\d{4})(\d{2})(\d{2})$/

export interface YoutubeShortRow {
  video_id: string
  youtube_url: string
  title: string
  upload_date: string
  duration_sec: number
  series: string
  restaurant_slug: string
  restaurant_page: string
  embed_priority: number
  notes?: string
  view_count_snapshot?: number | null
  like_count_snapshot?: number | null
  comment_count_snapshot?: number | null
}

export interface YoutubeShort {
  videoId: string
  title: string
  /** Calendar day, YYYY-MM-DD. The map has no time of day. */
  uploadDate: string
  durationSec: number
  /** ISO 8601 duration, derived from duration_sec. */
  duration: string
  slug: string
  series: string
  embedPriority: number
  shortUrl: string
  embedUrl: string
  /** Original-aspect YouTube poster (9:16 for these Shorts). */
  thumbnailUrl: string
  /** Documented hqdefault poster, used if the vertical poster 404s. */
  fallbackThumbnailUrl: string
}

const rows = rawRows as YoutubeShortRow[]

export function isoDuration(seconds: number): string {
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

function calendarUploadDate(value: string): string {
  const match = UPLOAD_DATE.exec(value)
  if (!match) throw new Error(`Bad YouTube upload date: ${value}`)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Impossible YouTube upload date: ${value}`)
  }
  return `${match[1]}-${match[2]}-${match[3]}`
}

export function youtubeThumbnailUrl(videoId: string, kind: "oar" | "hq"): string {
  const file = kind === "oar" ? "oardefault.jpg" : "hqdefault.jpg"
  return `https://i.ytimg.com/vi/${videoId}/${file}`
}

export function normalizeYoutubeShort(row: YoutubeShortRow): YoutubeShort {
  const videoId = row.video_id?.trim() ?? ""
  if (!VIDEO_ID.test(videoId)) throw new Error(`Bad YouTube video id: ${videoId}`)
  const title = row.title?.trim() ?? ""
  if (!title) throw new Error(`Missing YouTube title for ${videoId}`)
  const slug = row.restaurant_slug?.trim() ?? ""
  if (!SLUG.test(slug)) throw new Error(`Bad restaurant slug for ${videoId}: ${slug}`)
  const shortUrl = `https://www.youtube.com/shorts/${videoId}`
  if (row.youtube_url !== shortUrl) throw new Error(`YouTube URL does not match ${videoId}`)
  const listingPage = `https://www.eatrealfoodnyc.com/restaurants/${slug}`
  if (row.restaurant_page !== listingPage) throw new Error(`Listing URL does not match ${slug}`)
  if (!Number.isInteger(row.embed_priority) || row.embed_priority < 0) {
    throw new Error(`Bad embed priority for ${videoId}`)
  }
  if (typeof row.series !== "string" || row.series.trim() === "") {
    throw new Error(`Missing series for ${videoId}`)
  }
  return {
    videoId,
    title,
    uploadDate: calendarUploadDate(row.upload_date),
    durationSec: row.duration_sec,
    duration: isoDuration(row.duration_sec),
    slug,
    series: row.series.trim(),
    embedPriority: row.embed_priority,
    shortUrl,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    thumbnailUrl: youtubeThumbnailUrl(videoId, "oar"),
    fallbackThumbnailUrl: youtubeThumbnailUrl(videoId, "hq"),
  }
}

/**
 * One Short per slug. Lower embed_priority wins. A tie keeps the later
 * upload date. View counts are not a tie-breaker.
 */
export function pickYoutubeShort(candidates: readonly YoutubeShortRow[], slug: string): YoutubeShort | null {
  const matches = candidates.filter((row) => row.restaurant_slug === slug)
  if (matches.length === 0) return null
  const ranked = matches.slice().sort((a, b) => {
    if (a.embed_priority !== b.embed_priority) return a.embed_priority - b.embed_priority
    return b.upload_date.localeCompare(a.upload_date)
  })
  return normalizeYoutubeShort(ranked[0])
}

function indexShorts(source: readonly YoutubeShortRow[]): Map<string, YoutubeShort> {
  const map = new Map<string, YoutubeShort>()
  for (const row of source) {
    const short = normalizeYoutubeShort(row)
    if (map.has(short.slug)) {
      throw new Error(`More than one YouTube Short is mapped to ${short.slug}`)
    }
    map.set(short.slug, short)
  }
  return map
}

const bySlug = indexShorts(rows)

export function getYoutubeShort(slug: string): YoutubeShort | null {
  return bySlug.get(slug) ?? null
}

export function listYoutubeShorts(): readonly YoutubeShort[] {
  return [...bySlug.values()]
}

export function youtubeShortRowCount(): number {
  return rows.length
}

/**
 * VideoObject for the one Short visible on a listing.
 * Fields are the video id, name, thumbnails, duration, and upload date,
 * plus the Short URL and the listing URL. No view counts, ratings, or transcripts.
 */
export function buildYoutubeShortVideoObject(short: YoutubeShort, listingUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${listingUrl}#youtube-short`,
    name: short.title,
    thumbnailUrl: [short.thumbnailUrl, short.fallbackThumbnailUrl],
    uploadDate: short.uploadDate,
    duration: short.duration,
    embedUrl: short.embedUrl,
    url: short.shortUrl,
    mainEntityOfPage: listingUrl,
    publisher: PUBLISHER_REF,
  }
}
