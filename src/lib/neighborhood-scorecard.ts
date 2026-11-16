import { DIET_CONFIG } from "@/config/dietary-tags"
import { parseDietaryTags } from "@/lib/utils"

/**
 * A neighborhood must have at least this many A/B/C listings before it can
 * win "highest Grade A rate". A 100% rate on one graded listing is not a
 * borough leader.
 */
export const MIN_GRADED_LISTINGS_FOR_RATE_LEADER = 5

/** Same fallback the borough hub uses when a listing has no neighborhood. */
export const UNASSIGNED_NEIGHBORHOOD = "Other"

const CANONICAL_TAGS = Object.keys(DIET_CONFIG)
const CANONICAL_TAG_SET = new Set(CANONICAL_TAGS)

export interface ScorecardListing {
  neighborhood: string | null
  inspection_grade: string | null
  is_hidden_gem: boolean
  dietary_tags: string | null
}

export interface NeighborhoodScore {
  neighborhood: string
  total: number
  gradeA: number
  /** Listings whose inspection grade is exactly A, B, or C. */
  graded: number
  /**
   * Grade A ÷ graded, rounded to the nearest percent.
   * Null when the neighborhood has no graded listings.
   */
  gradeARate: number | null
  hiddenGems: number
  topDietaryTag: string | null
  topDietaryLabel: string | null
  topDietaryCount: number
}

export interface GradeALeader {
  neighborhood: string
  gradeARate: number
  graded: number
  gradeA: number
}

export interface GemLeader {
  neighborhood: string
  hiddenGems: number
}

export interface BoroughScorecard {
  neighborhoods: NeighborhoodScore[]
  totalRestaurants: number
  gradeA: number
  gradeB: number
  gradeC: number
  graded: number
  /** Same ratio as the hub introduction: Grade A ÷ listings with an A, B, or C. */
  gradeARate: number | null
  gradeALeader: GradeALeader | null
  gemLeader: GemLeader | null
}

export function scorecardNeighborhoodName(neighborhood: string | null | undefined): string {
  return neighborhood || UNASSIGNED_NEIGHBORHOOD
}

/** Grade A as a share of letter-graded listings. Null when the denominator is 0. */
export function gradeARateOfGraded(gradeA: number, graded: number): number | null {
  if (graded <= 0) return null
  return Math.round((gradeA / graded) * 100)
}

function topDiet(counts: Map<string, number>): { tag: string; count: number } | null {
  let top: { tag: string; count: number } | null = null
  for (const tag of CANONICAL_TAGS) {
    const count = counts.get(tag) ?? 0
    if (count <= 0) continue
    if (!top || count > top.count) top = { tag, count }
  }
  return top
}

/**
 * Scorecard rows for one borough, from the published operational listings
 * the hub already loaded. Totals are sums of those rows, so they match the
 * introduction and the neighborhood sections on the same page.
 */
export function buildNeighborhoodScorecard(rows: readonly ScorecardListing[]): BoroughScorecard {
  type Acc = {
    neighborhood: string
    total: number
    gradeA: number
    gradeB: number
    gradeC: number
    hiddenGems: number
    diets: Map<string, number>
  }

  const byName = new Map<string, Acc>()
  let gradeA = 0
  let gradeB = 0
  let gradeC = 0

  for (const row of rows) {
    const name = scorecardNeighborhoodName(row.neighborhood)
    let acc = byName.get(name)
    if (!acc) {
      acc = {
        neighborhood: name,
        total: 0,
        gradeA: 0,
        gradeB: 0,
        gradeC: 0,
        hiddenGems: 0,
        diets: new Map(),
      }
      byName.set(name, acc)
    }
    acc.total += 1
    if (row.inspection_grade === "A") {
      acc.gradeA += 1
      gradeA += 1
    } else if (row.inspection_grade === "B") {
      acc.gradeB += 1
      gradeB += 1
    } else if (row.inspection_grade === "C") {
      acc.gradeC += 1
      gradeC += 1
    }
    if (row.is_hidden_gem) acc.hiddenGems += 1

    const seen = new Set<string>()
    for (const tag of parseDietaryTags(row.dietary_tags)) {
      if (!CANONICAL_TAG_SET.has(tag) || seen.has(tag)) continue
      seen.add(tag)
      acc.diets.set(tag, (acc.diets.get(tag) ?? 0) + 1)
    }
  }

  const neighborhoods = [...byName.values()]
    .map((acc): NeighborhoodScore => {
      const graded = acc.gradeA + acc.gradeB + acc.gradeC
      const diet = topDiet(acc.diets)
      return {
        neighborhood: acc.neighborhood,
        total: acc.total,
        gradeA: acc.gradeA,
        graded,
        gradeARate: gradeARateOfGraded(acc.gradeA, graded),
        hiddenGems: acc.hiddenGems,
        topDietaryTag: diet?.tag ?? null,
        topDietaryLabel: diet ? DIET_CONFIG[diet.tag].label : null,
        topDietaryCount: diet?.count ?? 0,
      }
    })
    .sort((a, b) => b.total - a.total || a.neighborhood.localeCompare(b.neighborhood))

  const graded = gradeA + gradeB + gradeC
  const eligible = neighborhoods
    .filter(
      (row) =>
        row.neighborhood !== UNASSIGNED_NEIGHBORHOOD &&
        row.graded >= MIN_GRADED_LISTINGS_FOR_RATE_LEADER &&
        row.gradeARate != null
    )
    .sort(
      (a, b) =>
        b.gradeARate! - a.gradeARate! ||
        b.graded - a.graded ||
        b.total - a.total ||
        a.neighborhood.localeCompare(b.neighborhood)
    )
  const leader = eligible[0]
  const gem = [...neighborhoods]
    .filter((row) => row.neighborhood !== UNASSIGNED_NEIGHBORHOOD && row.hiddenGems > 0)
    .sort(
      (a, b) =>
        b.hiddenGems - a.hiddenGems || b.total - a.total || a.neighborhood.localeCompare(b.neighborhood)
    )[0]

  return {
    neighborhoods,
    totalRestaurants: rows.length,
    gradeA,
    gradeB,
    gradeC,
    graded,
    gradeARate: gradeARateOfGraded(gradeA, graded),
    gradeALeader: leader
      ? {
          neighborhood: leader.neighborhood,
          gradeARate: leader.gradeARate!,
          graded: leader.graded,
          gradeA: leader.gradeA,
        }
      : null,
    gemLeader: gem ? { neighborhood: gem.neighborhood, hiddenGems: gem.hiddenGems } : null,
  }
}
