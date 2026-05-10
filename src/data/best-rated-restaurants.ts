import rawData from "./best-rated-restaurants.json"

export interface RestaurantRow {
  name: string
  slug: string
  neighborhood: string | null
  borough: string | null
  type: string | null
  rating: number | null
  reviews: number | null
  inspection_grade: string | null
  dietary_tags: string | null
  photo?: string | null
  address?: string
}

export interface BoroughRow {
  borough: string
  count: number
  elite: number
  elitePct: number
  gradeA: number
  gradeAPct: number
  avgRating: number | null
  topRestaurant: {
    name: string
    slug: string
    neighborhood: string | null
    rating: number | null
    reviews: number | null
    inspection_grade: string | null
    type: string | null
    dietary_tags: string | null
  } | null
}

export interface NeighborhoodRow {
  neighborhood: string | null
  borough: string | null
  count: number
}

export interface TagRow {
  tag: string
  count: number
}

export interface BestRatedReport {
  generatedAt: string
  reportDate: string
  algorithm: {
    qualifyingRating: number
    eliteRating: number
    status: string
  }
  summary: {
    total: number
    eliteCount: number
    perfectScoreCount: number
    withGradeA: number
    withAnyGrade: number
    gradeAPct: number
    gradedPct: number
    avgRating: number | null
    avgReviews: number | null
  }
  byBorough: BoroughRow[]
  byNeighborhood: NeighborhoodRow[]
  byTag: TagRow[]
  featuredByBorough: Record<string, RestaurantRow[]>
  perfectScore: RestaurantRow[]
  eliteList: RestaurantRow[]
}

const report = rawData as BestRatedReport

export default report
