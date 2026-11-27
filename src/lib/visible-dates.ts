/**
 * Dates for pages whose freshness is the copy, not a restaurant row.
 * Change one of these only when a reader can see new words on that page.
 * A JSON-LD or sitemap-only edit must leave the date alone.
 */

/**
 * /about/team opening was rewritten on this day: who runs the site, and the
 * DOHMH inspection dataset as the source of the grades.
 */
export const TEAM_PAGE_DATE = "2026-11-27"

export const TEAM_OPENING_LEAD =
  "Eat Real Food NYC is run by co-founders Snket Desai and Rohan Kadam. Snket Desai is a co-founder. Rohan Kadam is co-founder and marketing lead. He started the directory because finding a restaurant in New York City that you could trust for both food quality and food safety required stitching together five different apps. Inspection grades in the directory come from the"

export const TEAM_OPENING_SOURCE = "DOHMH New York City Restaurant Inspection Results"

export const TEAM_OPENING_TAIL =
  "published by the NYC Department of Health and Mental Hygiene."

/** Plain text of the team-page opening, used to keep the paragraph above 40 words. */
export function teamOpeningText(): string {
  return `${TEAM_OPENING_LEAD} ${TEAM_OPENING_SOURCE} ${TEAM_OPENING_TAIL}`
}

/**
 * Last reader-visible copy change on /about/our-data, from git.
 * 2026-11-26: the hero cites dataset 43nn-pn8j, and the data-source block
 * names the 2020 Neighborhood Tabulation Areas. The inspection-date stamp
 * that followed is not a content revision.
 */
export const OUR_DATA_PAGE_DATE = "2026-11-26"

/** The editorial standards page gained its DOHMH dataset sentence on this day. */
export const EDITORIAL_VISIBLE_DATE = "2026-11-26"
