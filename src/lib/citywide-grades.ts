/**
 * Citywide NYC restaurant grades from DOHMH dataset 43nn-pn8j.
 * One CAMIS is one establishment. The letter is the grade on that CAMIS's
 * newest inspection whose grade is A, B, or C. Grade Pending is separate:
 * the newest inspection row of any kind is Z or P. A CAMIS can be in both.
 */

export const CITYWIDE_BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"] as const

export type CitywideBorough = (typeof CITYWIDE_BOROUGHS)[number]
export type LetterGrade = "A" | "B" | "C"

export interface LetterGradeRow {
  camis: string
  boro: string | null
  grade: string | null
  latest: string
}

export interface AnyGradeRow {
  camis: string
  grade: string | null
  latest: string
}

export interface BoroughGradeCount {
  borough: CitywideBorough
  a: number
  b: number
  c: number
  letterGraded: number
}

export interface CitywideGradeCounts {
  a: number
  b: number
  c: number
  letterGraded: number
  /** Letter is known. Borough was blank or disagreed on that inspection date. */
  boroughUnassigned: number
  /** Two different letters shared the newest graded inspection date. Left out of the letter counts. */
  letterTies: number
  boroughs: BoroughGradeCount[]
  pendingZ: number
  pendingP: number
  pending: number
  /** More than one grade code shared the newest inspection date, so it is not counted as Z or P. */
  pendingAmbiguous: number
}

const BOROUGH_NAMES: Record<string, CitywideBorough> = {
  manhattan: "Manhattan",
  brooklyn: "Brooklyn",
  queens: "Queens",
  bronx: "Bronx",
  "staten island": "Staten Island",
}

export function canonicalBorough(value: string | null | undefined): CitywideBorough | null {
  if (!value) return null
  return BOROUGH_NAMES[value.trim().toLowerCase()] ?? null
}

export function inspectionDay(value: string): string {
  const day = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error(`bad inspection date: ${value}`)
  return day
}

export function percentOneDecimal(part: number, total: number): string {
  if (!Number.isInteger(part) || !Number.isInteger(total) || part < 0 || total < 0) {
    throw new Error("share needs non-negative integers")
  }
  if (part > total) throw new Error("share part exceeds total")
  if (total === 0) return "0.0%"
  const tenths = Math.round((part / total) * 1000)
  return `${(tenths / 10).toFixed(1)}%`
}

function letterGrade(value: string | null): LetterGrade | null {
  if (value === "A" || value === "B" || value === "C") return value
  return null
}

interface LatestLetter {
  grade: LetterGrade
  borough: CitywideBorough | null
}

function latestLetter(rows: LetterGradeRow[]): LatestLetter | "tie" | null {
  let best = ""
  for (const row of rows) {
    const day = inspectionDay(row.latest)
    if (day > best) best = day
  }
  if (!best) return null
  const atBest = rows.filter((row) => inspectionDay(row.latest) === best)
  const grades = new Set<LetterGrade>()
  for (const row of atBest) {
    const grade = letterGrade(row.grade)
    if (!grade) return null
    grades.add(grade)
  }
  if (grades.size !== 1) return "tie"
  const grade = [...grades][0]
  const boroughs = new Set<CitywideBorough | null>()
  for (const row of atBest) boroughs.add(canonicalBorough(row.boro))
  const known = [...boroughs].filter((borough): borough is CitywideBorough => borough !== null)
  const borough = known.length === 1 && boroughs.size === 1 ? known[0] : null
  return { grade, borough }
}

function latestGradeCodes(rows: AnyGradeRow[]): Set<string | null> | null {
  let best = ""
  for (const row of rows) {
    const day = inspectionDay(row.latest)
    if (day > best) best = day
  }
  if (!best) return null
  const codes = new Set<string | null>()
  for (const row of rows) {
    if (inspectionDay(row.latest) !== best) continue
    const grade = row.grade?.trim().toUpperCase() || null
    codes.add(grade)
  }
  // Violation rows from one inspection often leave grade blank on some lines.
  // A blank beside a real code is not a second grade.
  if (codes.size > 1 && codes.has(null)) codes.delete(null)
  return codes
}

export function summarizeCitywideGrades(input: {
  letterRows: LetterGradeRow[]
  anyGradeRows: AnyGradeRow[]
}): CitywideGradeCounts {
  const lettersByCamis = new Map<string, LetterGradeRow[]>()
  for (const row of input.letterRows) {
    if (!row.camis) throw new Error("letter row missing camis")
    const list = lettersByCamis.get(row.camis) ?? []
    list.push(row)
    lettersByCamis.set(row.camis, list)
  }

  const counts = { A: 0, B: 0, C: 0 }
  let letterTies = 0
  let boroughUnassigned = 0
  const boroughCounts = new Map<CitywideBorough, { a: number; b: number; c: number }>()
  for (const borough of CITYWIDE_BOROUGHS) boroughCounts.set(borough, { a: 0, b: 0, c: 0 })

  for (const rows of lettersByCamis.values()) {
    const latest = latestLetter(rows)
    if (latest === "tie") {
      letterTies += 1
      continue
    }
    if (!latest) continue
    counts[latest.grade] += 1
    if (!latest.borough) {
      boroughUnassigned += 1
      continue
    }
    const bucket = boroughCounts.get(latest.borough)
    if (!bucket) continue
    if (latest.grade === "A") bucket.a += 1
    else if (latest.grade === "B") bucket.b += 1
    else bucket.c += 1
  }

  const anyByCamis = new Map<string, AnyGradeRow[]>()
  for (const row of input.anyGradeRows) {
    if (!row.camis) throw new Error("grade row missing camis")
    const list = anyByCamis.get(row.camis) ?? []
    list.push(row)
    anyByCamis.set(row.camis, list)
  }

  let pendingZ = 0
  let pendingP = 0
  let pendingAmbiguous = 0
  for (const rows of anyByCamis.values()) {
    const codes = latestGradeCodes(rows)
    if (!codes || codes.size === 0) continue
    if (codes.size > 1) {
      pendingAmbiguous += 1
      continue
    }
    const code = [...codes][0]
    if (code === "Z") pendingZ += 1
    else if (code === "P") pendingP += 1
  }

  const letterGraded = counts.A + counts.B + counts.C
  return {
    a: counts.A,
    b: counts.B,
    c: counts.C,
    letterGraded,
    boroughUnassigned,
    letterTies,
    boroughs: CITYWIDE_BOROUGHS.map((borough) => {
      const bucket = boroughCounts.get(borough)!
      return {
        borough,
        a: bucket.a,
        b: bucket.b,
        c: bucket.c,
        letterGraded: bucket.a + bucket.b + bucket.c,
      }
    }),
    pendingZ,
    pendingP,
    pending: pendingZ + pendingP,
    pendingAmbiguous,
  }
}

export function highestGradeABoroughs(
  boroughs: readonly BoroughGradeCount[],
): BoroughGradeCount[] {
  const ranked = boroughs.filter((borough) => borough.letterGraded > 0)
  if (ranked.length === 0) return []
  let best = ranked[0]
  const winners = [best]
  for (const borough of ranked.slice(1)) {
    const diff = borough.a * best.letterGraded - best.a * borough.letterGraded
    if (diff > 0) {
      best = borough
      winners.length = 0
      winners.push(borough)
    } else if (diff === 0) {
      winners.push(borough)
    }
  }
  return winners
}
