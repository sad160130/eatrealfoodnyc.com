/**
 * Newest inspection per establishment on NYC Open Data dataset 43nn-pn8j.
 *
 * January 1, 1900 is the city's not-yet-inspected placeholder. Those rows
 * are skipped. The row we keep is the newest remaining inspection date that
 * has a grade code or a score. An administrative row with neither does not
 * replace an earlier grade. A later visit that has a score and a blank
 * letter is the row we show. It does not fall back to an older letter.
 * Violation lines that share a date are one inspection. A blank grade beside
 * a real code is not a second grade.
 */

export const GRADED_CODES = ["A", "B", "C", "Z", "P", "N"] as const

export interface InspectionInput {
  inspectionDate?: string | null
  grade?: string | null
  score?: string | number | null
}

export interface ScoredInspection {
  inspectionDate: string
  grade: string
  score: number | null
}

export interface PickedInspection {
  kind: "not-yet-inspected" | "inspection"
  inspectionDate: string | null
  grade: string | null
  score: number | null
  /** Newest older day that has a grade code, when the picked day has none. */
  olderGrade: ScoredInspection | null
  /** Newest calendar day had neither a grade nor a score. */
  skippedBlankDate: string | null
}

const GRADED = new Set<string>(GRADED_CODES)
const NOT_YET_INSPECTED: PickedInspection = {
  kind: "not-yet-inspected",
  inspectionDate: null,
  grade: null,
  score: null,
  olderGrade: null,
  skippedBlankDate: null,
}

function dayOf(value: string | null | undefined): string | null {
  if (!value) return null
  const day = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
}

function parseScore(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export function pickLatestInspection(rows: InspectionInput[]): PickedInspection {
  const real: Array<{ day: string; grade: string | null; score: number | null }> = []
  for (const row of rows) {
    const day = dayOf(row.inspectionDate)
    if (!day || day < "1901-01-01") continue
    const grade = (row.grade ?? "").trim().toUpperCase() || null
    real.push({ day, grade, score: parseScore(row.score) })
  }
  if (real.length === 0) return NOT_YET_INSPECTED

  const days = new Map<string, { grades: Set<string>; scores: Set<number> }>()
  for (const row of real) {
    const bucket = days.get(row.day) ?? { grades: new Set<string>(), scores: new Set<number>() }
    if (row.grade) bucket.grades.add(row.grade)
    if (row.score != null) bucket.scores.add(row.score)
    days.set(row.day, bucket)
  }

  const ordered = [...days.keys()].sort()
  const newest = ordered[ordered.length - 1]
  let picked: string | null = null
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const bucket = days.get(ordered[i])!
    if (bucket.grades.size === 0 && bucket.scores.size === 0) continue
    picked = ordered[i]
    break
  }
  if (!picked) {
    return { ...NOT_YET_INSPECTED, skippedBlankDate: newest }
  }

  const bucket = days.get(picked)!
  if (bucket.grades.size > 1) {
    throw new Error(`more than one grade on ${picked}: ${[...bucket.grades].join(",")}`)
  }
  if (bucket.scores.size > 1) {
    throw new Error(`more than one score on ${picked}: ${[...bucket.scores].join(",")}`)
  }
  const grade = bucket.grades.size === 1 ? [...bucket.grades][0] : null
  const score = bucket.scores.size === 1 ? [...bucket.scores][0] : null

  let olderGrade: ScoredInspection | null = null
  if (!grade || !GRADED.has(grade)) {
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      const day = ordered[i]
      if (day >= picked) continue
      const codes = [...days.get(day)!.grades].filter((code) => GRADED.has(code))
      if (codes.length !== 1) continue
      const scores = days.get(day)!.scores
      olderGrade = {
        inspectionDate: day,
        grade: codes[0],
        score: scores.size === 1 ? [...scores][0] : null,
      }
      break
    }
  }

  const newestBucket = days.get(newest)!
  const skippedBlankDate =
    newest !== picked && newestBucket.grades.size === 0 && newestBucket.scores.size === 0 ? newest : null

  return { kind: "inspection", inspectionDate: picked, grade, score, olderGrade, skippedBlankDate }
}

export function gradeRank(kind: PickedInspection["kind"], grade: string | null): number {
  if (kind === "not-yet-inspected") return 5
  if (grade === "A") return 0
  if (grade === "B") return 1
  if (grade === "C") return 2
  if (grade === "Z" || grade === "P") return 3
  return 4
}

export function inspectionGradeLabel(kind: PickedInspection["kind"], grade: string | null): string {
  if (kind === "not-yet-inspected") return "Not yet inspected"
  if (grade === "A" || grade === "B" || grade === "C") return `Grade ${grade}`
  if (grade === "Z" || grade === "P") return "Grade Pending"
  return "Not Yet Graded"
}
