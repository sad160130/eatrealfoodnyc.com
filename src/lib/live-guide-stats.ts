import { cache } from "react"
import { prisma } from "@/lib/db"
import { DIET_CONFIG } from "@/config/dietary-tags"
import {
  getPublishedDirectoryCounts,
  PUBLISHED_LISTING_WHERE,
} from "@/lib/directory-stats"

export const BOROUGH_NAMES = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
] as const

const LETTERS = new Set(["A", "B", "C"])
const MIN_NEIGHBORHOOD = 10

export interface BoroughGradeStats {
  total: number
  gradeA: number
  gradeB: number
  gradeC: number
  letterGrades: number
  /** Grade A as a share of published listings in the borough. */
  rate: number
}

export interface NeighborhoodGradeRow {
  neighborhood: string
  borough: string
  total: number
  gradeA: number
  rate: number
}

export interface NeighborhoodCountRow {
  neighborhood: string
  borough: string
  count: number
}

export interface LiveGuideStats {
  global: {
    totalPublished: number
    totalWithGrade: number
    /** Share of published listings that hold Grade A. Same ratio as the guide footer. */
    gradeAPercent: number
    /** @deprecated alias of gradeAPercent so older call sites stay on the Grade A share. */
    gradeACoverage: number
    letterGradePercent: number
    totalUniqueNeighborhoods: number
    totalHiddenGems: number
    hiddenGemGradeA: number
    boroughs: Record<string, BoroughGradeStats>
    unassignedBorough: number
  }
  neighborhoods: {
    topByGradeA: NeighborhoodGradeRow[]
    bottomByGradeA: NeighborhoodGradeRow[]
    topByHiddenGems: NeighborhoodCountRow[]
  }
  hiddenGems: {
    total: number
    byBorough: Record<string, number>
    topNeighborhoods: NeighborhoodCountRow[]
    percentWithGradeA: number
  }
  dietary: {
    counts: Record<string, number>
    byBorough: Record<string, Record<string, number>>
    topNeighborhoodsByTag: Record<string, NeighborhoodCountRow[]>
  }
  letters: { A: number; B: number; C: number }
}

function percent(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}

function emptyBorough(): BoroughGradeStats {
  return { total: 0, gradeA: 0, gradeB: 0, gradeC: 0, letterGrades: 0, rate: 0 }
}

/**
 * One published-listing query for every guide stat.
 * Headline totals are taken from getPublishedDirectoryCounts so a guide
 * cannot disagree with the homepage or the data footer.
 */
export const getLiveGuideStats = cache(async (): Promise<LiveGuideStats> => {
  const [counts, rows] = await Promise.all([
    getPublishedDirectoryCounts(),
    prisma.restaurant.findMany({
      where: PUBLISHED_LISTING_WHERE,
      select: {
        borough: true,
        neighborhood: true,
        inspection_grade: true,
        is_hidden_gem: true,
        dietary_tags: true,
      },
    }),
  ])

  const boroughs: Record<string, BoroughGradeStats> = {}
  for (const name of BOROUGH_NAMES) boroughs[name] = emptyBorough()

  const hoods = new Map<string, NeighborhoodGradeRow & { gems: number }>()
  const dietCounts: Record<string, number> = {}
  const dietByBorough: Record<string, Record<string, number>> = {}
  const dietHoods = new Map<string, Map<string, NeighborhoodCountRow>>()
  for (const tag of Object.keys(DIET_CONFIG)) {
    dietCounts[tag] = 0
    dietByBorough[tag] = {}
    dietHoods.set(tag, new Map())
  }

  const letters = { A: 0, B: 0, C: 0 }
  let letterGrades = 0
  let unassignedBorough = 0
  let hiddenGemGradeA = 0
  const gemsByBorough: Record<string, number> = {}

  for (const row of rows) {
    const grade = (row.inspection_grade ?? "").trim().toUpperCase()
    const isLetter = LETTERS.has(grade)
    if (grade === "A" || grade === "B" || grade === "C") letters[grade] += 1
    if (isLetter) letterGrades += 1

    const borough = row.borough && boroughs[row.borough] ? row.borough : null
    if (!borough) unassignedBorough += 1
    else {
      const bucket = boroughs[borough]
      bucket.total += 1
      if (grade === "A") bucket.gradeA += 1
      if (grade === "B") bucket.gradeB += 1
      if (grade === "C") bucket.gradeC += 1
      if (isLetter) bucket.letterGrades += 1
    }

    if (row.neighborhood && borough) {
      const key = `${borough}|||${row.neighborhood}`
      const hood = hoods.get(key) ?? {
        neighborhood: row.neighborhood,
        borough,
        total: 0,
        gradeA: 0,
        rate: 0,
        gems: 0,
      }
      hood.total += 1
      if (grade === "A") hood.gradeA += 1
      if (row.is_hidden_gem) hood.gems += 1
      hoods.set(key, hood)
    }

    if (row.is_hidden_gem) {
      if (borough) gemsByBorough[borough] = (gemsByBorough[borough] ?? 0) + 1
      if (grade === "A") hiddenGemGradeA += 1
    }

    const tags = (row.dietary_tags ?? "").split("|").map((tag) => tag.trim()).filter((tag) => tag in dietCounts)
    for (const tag of tags) {
      dietCounts[tag] += 1
      if (borough) dietByBorough[tag][borough] = (dietByBorough[tag][borough] ?? 0) + 1
      if (row.neighborhood && borough) {
        const map = dietHoods.get(tag)!
        const key = `${borough}|||${row.neighborhood}`
        const existing = map.get(key) ?? { neighborhood: row.neighborhood, borough, count: 0 }
        existing.count += 1
        map.set(key, existing)
      }
    }
  }

  for (const borough of BOROUGH_NAMES) {
    boroughs[borough].rate = percent(boroughs[borough].gradeA, boroughs[borough].total)
  }

  const ranked = [...hoods.values()]
    .filter((hood) => hood.total >= MIN_NEIGHBORHOOD)
    .map((hood) => ({ ...hood, rate: percent(hood.gradeA, hood.total) }))
  const byRate = [...ranked].sort((a, b) => b.rate - a.rate || b.total - a.total)
  const byGems = [...hoods.values()].sort((a, b) => b.gems - a.gems || b.total - a.total)

  const topNeighborhoodsByTag: Record<string, NeighborhoodCountRow[]> = {}
  for (const [tag, map] of dietHoods) {
    topNeighborhoodsByTag[tag] = [...map.values()].sort((a, b) => b.count - a.count).slice(0, 8)
  }

  const gradeAPercent = percent(counts.gradeA, counts.restaurants)
  const gemNeighborhoods = byGems
    .filter((hood) => hood.gems > 0)
    .slice(0, 8)
    .map((hood) => ({ neighborhood: hood.neighborhood, borough: hood.borough, count: hood.gems }))

  return {
    global: {
      totalPublished: counts.restaurants,
      totalWithGrade: letterGrades,
      gradeAPercent,
      gradeACoverage: gradeAPercent,
      letterGradePercent: percent(letterGrades, counts.restaurants),
      totalUniqueNeighborhoods: counts.neighborhoods,
      totalHiddenGems: counts.hiddenGems,
      hiddenGemGradeA,
      boroughs,
      unassignedBorough,
    },
    neighborhoods: {
      topByGradeA: byRate.slice(0, 10).map(({ gems: _gems, ...hood }) => hood),
      bottomByGradeA: [...byRate].reverse().slice(0, 10).map(({ gems: _gems, ...hood }) => hood),
      topByHiddenGems: gemNeighborhoods,
    },
    hiddenGems: {
      total: counts.hiddenGems,
      byBorough: gemsByBorough,
      topNeighborhoods: gemNeighborhoods,
      percentWithGradeA: percent(hiddenGemGradeA, counts.hiddenGems),
    },
    dietary: {
      counts: dietCounts,
      byBorough: Object.fromEntries(
        BOROUGH_NAMES.map((borough) => [
          borough,
          Object.fromEntries(Object.keys(DIET_CONFIG).map((tag) => [tag, dietByBorough[tag][borough] ?? 0])),
        ])
      ),
      topNeighborhoodsByTag,
    },
    letters,
  }
})
