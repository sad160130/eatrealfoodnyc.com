import rawReport from "./health-grade-report.json"

export interface BoroughRow {
  borough: string
  total: number
  graded: number
  gradedPct: number
  gradeA: number
  gradeB: number
  gradeC: number
  gradeAPct: number
  gradeBPct: number
  gradeCPct: number
  gradeAOfTotal: number
  avgInspectionScore: number | null
  hiddenGems: number
}

export interface NeighborhoodRow {
  neighborhood: string
  borough: string
  total: number
  gradeA: number
  gradeB: number
  gradeC: number
  graded: number
  gradeAPct: number
  gradeBPct: number
  gradeCPct: number
  gradeAOfTotal: number
}

export interface TypeRow {
  type: string
  total: number
  gradeA: number
  graded: number
  gradeAPct: number
}

export interface HealthGradeReport {
  generatedAt: string
  reportDate: string
  summary: {
    totalRestaurants: number
    totalGraded: number
    gradedPct: number
    totalGradeA: number
    totalGradeB: number
    totalGradeC: number
    gradeACoverage: number
    overallGradeAPct: number
    overallGradeBPct: number
    overallGradeCPct: number
  }
  byBorough: BoroughRow[]
  neighborhoods: {
    topByGradeA: NeighborhoodRow[]
    bottomByGradeA: NeighborhoodRow[]
    totalAnalyzed: number
  }
  byType: TypeRow[]
  keyFindings: {
    topBorough: string
    topBoroughGradeAPct: number
    bottomBorough: string
    bottomBoroughGradeAPct: number
    topNeighborhood: string | null
    topNeighborhoodBorough: string | null
    topNeighborhoodGradeAPct: number
    bottomNeighborhood: string | null
    bottomNeighborhoodGradeAPct: number
  }
}

const report = rawReport as HealthGradeReport

export default report
