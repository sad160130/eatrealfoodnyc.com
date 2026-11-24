/**
 * Load external photos directly. Google hosts 403 the Vercel optimizer
 * (`OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED`). Every other external
 * host is outside `images.remotePatterns`, and `next/image` throws while
 * rendering the page. A relative path stays on the optimizer.
 */
export function skipImageOptimizer(src: string | null | undefined): boolean {
  if (!src) return false
  try {
    return new URL(src).hostname.length > 0
  } catch {
    return false
  }
}
