/**
 * Google photo hosts that the Vercel image optimizer cannot fetch.
 * A direct request returns 403, and /_next/image turns that into
 * 502 OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED. The browser loads
 * these URLs itself when the image is unoptimized.
 */
const DIRECT_PHOTO_SUFFIXES = [".googleusercontent.com", ".googleapis.com"]

export function skipImageOptimizer(src: string | null | undefined): boolean {
  if (!src) return false
  let host: string
  try {
    host = new URL(src).hostname.toLowerCase()
  } catch {
    return false
  }
  return DIRECT_PHOTO_SUFFIXES.some((suffix) => host === suffix.slice(1) || host.endsWith(suffix))
}
