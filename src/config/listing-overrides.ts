/**
 * Manual listing status. These overrides are the source of truth for
 * closures the inspection file has not caught. Do not add a row without
 * a dated public source. Do not edit generated restaurant data for these.
 */
export interface ClosedListing {
  slug: string
  /** ISO date the location closed. */
  closedOn: string
  /** Where the old listing URL should send people. */
  redirectTo: string
}

export interface PausedListing {
  slug: string
  /** Shown on the listing. Kept exact. */
  notice: string
}

export const CLOSED_LISTINGS: readonly ClosedListing[] = [
  {
    slug: "jajaja-mexicana-lower",
    closedOn: "2026-08-30",
    redirectTo: "/nyc/manhattan/lower-east-side/vegan-restaurants",
  },
]

export const PAUSED_LISTINGS: readonly PausedListing[] = [
  {
    slug: "divyas-kitchen",
    notice: "Temporarily paused per the owner (Oct 2026).",
  },
]

export function closedSlugs(): string[] {
  return CLOSED_LISTINGS.map((row) => row.slug)
}

export function pausedSlugs(): string[] {
  return PAUSED_LISTINGS.map((row) => row.slug)
}

export function isClosedSlug(slug: string): boolean {
  return closedSlugs().includes(slug)
}

export function pausedNotice(slug: string): string | null {
  return PAUSED_LISTINGS.find((row) => row.slug === slug)?.notice ?? null
}

/** Best-of cards and rating-ranked modules. The listing page stays live. */
export function isExcludedFromRankedLists(slug: string | null | undefined): boolean {
  if (!slug) return false
  return isClosedSlug(slug) || pausedSlugs().includes(slug)
}

export function closedListingRedirects(): Array<{ source: string; destination: string; statusCode: 301 }> {
  return CLOSED_LISTINGS.flatMap((row) => [
    { source: `/restaurants/${row.slug}`, destination: row.redirectTo, statusCode: 301 as const },
    { source: `/restaurants/${row.slug}/:path*`, destination: row.redirectTo, statusCode: 301 as const },
  ])
}
