import rawStats from "./guide-stats.json"

export interface BoroughGradeStats {
  total: number
  gradeA: number
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

export interface GuideStats {
  generatedAt: string
  global: {
    totalPublished: number
    totalWithGrade: number
    gradeACoverage: number
    totalUniqueNeighborhoods: number
    totalHiddenGems: number
    hiddenGemGradeA: number
    boroughs: Record<string, BoroughGradeStats>
    avgRatingByBorough: Record<string, number>
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
}

const stats = rawStats as GuideStats

export default stats
