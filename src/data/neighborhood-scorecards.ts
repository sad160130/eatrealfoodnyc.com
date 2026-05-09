import rawScorecards from "./neighborhood-scorecards.json"

export interface NeighborhoodScore {
  neighborhood: string
  borough: string
  total: number
  gradeA: number
  gradeARate: number
  hiddenGems: number
  avgRating: number | null
  topDietaryTag: string | null
  topDietaryLabel: string | null
  topDietaryCount: number
}

export type NeighborhoodScorecards = Record<string, NeighborhoodScore[]>

const scorecards = rawScorecards as NeighborhoodScorecards

export default scorecards
