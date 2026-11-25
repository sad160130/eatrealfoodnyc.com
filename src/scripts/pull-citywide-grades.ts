/**
 * Pull citywide NYC restaurant grades from DOHMH dataset 43nn-pn8j.
 * Writes src/data/citywide-restaurant-grades.ts. Exits without writing
 * if a request fails or the downloaded rows do not match distinct CAMIS counts.
 *
 *   npx tsx src/scripts/pull-citywide-grades.ts
 */
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { formatLongDate, parseInspectionDate } from "../lib/inspection-dates"
import { summarizeCitywideGrades, type AnyGradeRow, type LetterGradeRow } from "../lib/citywide-grades"

const SODA = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
const PAGE = 50_000
const OUT = resolve(process.cwd(), "src/data/citywide-restaurant-grades.ts")

async function soda(params: Record<string, string>): Promise<unknown[]> {
  const url = new URL(SODA)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  let lastError: unknown
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "eatrealfoodnyc-citywide-grades" },
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`SODA ${response.status}: ${body.slice(0, 400)}`)
      }
      const json = (await response.json()) as unknown
      if (!Array.isArray(json)) throw new Error("SODA response was not an array")
      return json
    } catch (error) {
      lastError = error
      const wait = 1500 * attempt
      console.error(`request failed (attempt ${attempt}): ${error instanceof Error ? error.message : error}`)
      await new Promise((resolveWait) => setTimeout(resolveWait, wait))
    }
  }
  throw lastError
}

async function sodaAll(params: Record<string, string>, order: string): Promise<unknown[]> {
  const rows: unknown[] = []
  for (let offset = 0; ; offset += PAGE) {
    const page = await soda({ ...params, $order: order, $limit: String(PAGE), $offset: String(offset) })
    rows.push(...page)
    console.log(`  ${params.$select} offset ${offset}: ${page.length}`)
    if (page.length < PAGE) break
  }
  return rows
}

function field(row: unknown, key: string): string | null {
  if (!row || typeof row !== "object") return null
  const value = (row as Record<string, unknown>)[key]
  if (typeof value === "string" && value.trim()) return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return null
}

function requireCamis(row: unknown): string {
  const camis = field(row, "camis")
  if (!camis) throw new Error("row missing camis")
  return camis
}

async function distinctCamis(where?: string): Promise<number> {
  const params: Record<string, string> = { $select: "count(distinct camis) as n" }
  if (where) params.$where = where
  const rows = await soda(params)
  const n = field(rows[0], "n")
  if (!n || !/^\d+$/.test(n)) throw new Error(`distinct camis count missing: ${JSON.stringify(rows[0])}`)
  return Number(n)
}

function label(iso: string): string {
  const date = parseInspectionDate(iso)
  if (!date) throw new Error(`could not label ${iso}`)
  return formatLongDate(date)
}

function nyToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

async function main() {
  console.log("Pulling citywide grades from 43nn-pn8j")
  const maxRows = await soda({ $select: "max(inspection_date) as max_date" })
  const newest = field(maxRows[0], "max_date")
  if (!newest) throw new Error("max inspection_date missing")
  const newestDay = newest.slice(0, 10)

  const [letterRaw, codedRaw, blankRaw, letterCamis, codedCamis, blankCamis, allCamis] = await Promise.all([
    sodaAll(
      {
        $select: "camis,boro,grade,max(inspection_date) as latest",
        $where: "grade in('A','B','C')",
        $group: "camis,boro,grade",
      },
      "camis,grade,boro",
    ),
    sodaAll(
      {
        $select: "camis,grade,max(inspection_date) as latest",
        $where: "grade is not null",
        $group: "camis,grade",
      },
      "camis,grade",
    ),
    sodaAll(
      {
        $select: "camis,max(inspection_date) as latest",
        $where: "grade is null",
        $group: "camis",
      },
      "camis",
    ),
    distinctCamis("grade in('A','B','C')"),
    distinctCamis("grade is not null"),
    distinctCamis("grade is null"),
    distinctCamis(),
  ])

  const letterRows: LetterGradeRow[] = letterRaw.map((row) => ({
    camis: requireCamis(row),
    boro: field(row, "boro"),
    grade: field(row, "grade"),
    latest: field(row, "latest") ?? "",
  }))
  const anyGradeRows: AnyGradeRow[] = [
    ...codedRaw.map((row) => ({
      camis: requireCamis(row),
      grade: field(row, "grade"),
      latest: field(row, "latest") ?? "",
    })),
    ...blankRaw.map((row) => ({
      camis: requireCamis(row),
      grade: null,
      latest: field(row, "latest") ?? "",
    })),
  ]

  const seenLetter = new Set(letterRows.map((row) => row.camis))
  const seenCoded = new Set(codedRaw.map((row) => requireCamis(row)))
  const seenBlank = new Set(blankRaw.map((row) => requireCamis(row)))
  const seenAny = new Set<string>([...seenCoded, ...seenBlank])
  if (seenLetter.size !== letterCamis) {
    throw new Error(`letter CAMIS ${seenLetter.size} != distinct ${letterCamis}`)
  }
  if (seenCoded.size !== codedCamis) {
    throw new Error(`coded CAMIS ${seenCoded.size} != distinct ${codedCamis}`)
  }
  if (seenBlank.size !== blankCamis) {
    throw new Error(`blank CAMIS ${seenBlank.size} != distinct ${blankCamis}`)
  }
  if (seenAny.size !== allCamis) {
    throw new Error(`any CAMIS ${seenAny.size} != distinct ${allCamis}`)
  }
  for (const camis of seenLetter) {
    if (!seenAny.has(camis)) throw new Error(`letter CAMIS ${camis} missing from the full file`)
  }

  const counts = summarizeCitywideGrades({ letterRows, anyGradeRows })
  const boroughSum = counts.boroughs.reduce((sum, borough) => sum + borough.letterGraded, 0)
  if (boroughSum + counts.boroughUnassigned !== counts.letterGraded) {
    throw new Error("borough rows do not add up to the citywide letter count")
  }
  if (counts.a + counts.b + counts.c !== counts.letterGraded) {
    throw new Error("A, B, and C do not add up to letter-graded establishments")
  }
  if (counts.pending !== counts.pendingZ + counts.pendingP) {
    throw new Error("pending split does not add up")
  }
  if (counts.letterGraded + counts.letterTies !== letterCamis) {
    throw new Error(
      `letter counts ${counts.letterGraded} plus ties ${counts.letterTies} != distinct letter CAMIS ${letterCamis}`,
    )
  }

  const pulledOn = nyToday()
  const snapshot = {
    datasetId: "43nn-pn8j",
    datasetUrl: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
    pulledOn,
    pulledOnLabel: label(pulledOn),
    timezone: "America/New_York",
    newestInspectionDate: newestDay,
    newestInspectionLabel: label(newestDay),
    sourceRows: {
      letterGroups: letterRows.length,
      codedGroups: codedRaw.length,
      blankGroups: blankRaw.length,
      distinctCamis: allCamis,
      distinctLetterCamis: letterCamis,
    },
    ...counts,
  }

  const file = `/**
 * Citywide NYC restaurant grades from DOHMH Open Data dataset 43nn-pn8j.
 * Generated by src/scripts/pull-citywide-grades.ts. Do not edit by hand.
 * Pulled ${snapshot.pulledOnLabel} (${snapshot.timezone}).
 * Newest inspection_date in the file: ${snapshot.newestInspectionLabel}.
 * Each CAMIS is one establishment. The letter is that CAMIS's newest
 * inspection with grade A, B, or C. Grade Pending counts CAMIS whose
 * newest row of any kind is Z or P. Establishments can be in both.
 */
export const CITYWIDE_RESTAURANT_GRADES = ${JSON.stringify(snapshot, null, 2)} as const
`
  writeFileSync(OUT, file)
  console.log(JSON.stringify({
    pulledOn,
    newestInspectionDate: newestDay,
    letterGraded: counts.letterGraded,
    a: counts.a,
    b: counts.b,
    c: counts.c,
    pending: counts.pending,
    pendingZ: counts.pendingZ,
    pendingP: counts.pendingP,
    letterTies: counts.letterTies,
    pendingAmbiguous: counts.pendingAmbiguous,
    boroughUnassigned: counts.boroughUnassigned,
    boroughs: counts.boroughs,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
