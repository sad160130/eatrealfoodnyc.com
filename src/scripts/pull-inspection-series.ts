/**
 * Fresh pull from NYC Open Data 43nn-pn8j for the three research pages.
 * Writes JSON under src/data and CC BY CSVs under public/data.
 *
 *   npx tsx src/scripts/pull-inspection-series.ts
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { formatLongDate, parseInspectionDate } from "../lib/inspection-dates"

const SODA = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
const VIEW = "https://data.cityofnewyork.us/api/views/43nn-pn8j.json"
const INITIAL = "Cycle Inspection / Initial Inspection"
const CLOSED = "Establishment Closed by DOHMH. Violations were cited in the following area(s) and those requiring immediate action were addressed."
const RECLOSED = "Establishment re-closed by DOHMH."
const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

async function soda(params: Record<string, string>): Promise<Record<string, string>[]> {
  const url = new URL(SODA)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  let last = ""
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "eatrealfoodnyc-research" } })
    if (response.ok) return (await response.json()) as Record<string, string>[]
    last = `${response.status} ${await response.text()}`
    console.error(`SODA ${response.status} attempt ${attempt}`)
    await new Promise((r) => setTimeout(r, 1000 * attempt))
  }
  throw new Error(last.slice(0, 500))
}

async function sodaAll(params: Record<string, string>): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = []
  const pageSize = 50000
  for (let offset = 0; ; offset += pageSize) {
    const page = await soda({ ...params, $limit: String(pageSize), $offset: String(offset) })
    rows.push(...page)
    console.log(`  ${params.$select} offset ${offset}: ${page.length}`)
    if (page.length < pageSize) break
  }
  return rows
}

function label(iso: string): string {
  const date = parseInspectionDate(iso.slice(0, 10))
  if (!date) throw new Error(`bad date ${iso}`)
  return formatLongDate(date)
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

async function main() {
  const view = (await (await fetch(VIEW, { headers: { "User-Agent": "eatrealfoodnyc-research" } })).json()) as {
    rowsUpdatedAt: number
  }
  const rowsUpdatedAt = new Date(view.rowsUpdatedAt * 1000).toISOString()
  const meta = await soda({ $select: "max(record_date) as record_date, max(inspection_date) as inspection_date, count(*) as rows" })
  const recordDate = meta[0].record_date
  const inspectionMax = meta[0].inspection_date
  const fileRows = Number(meta[0].rows)
  console.log("record_date", recordDate, "rowsUpdatedAt", rowsUpdatedAt, "rows", fileRows)

  console.log("scores")
  const scoreRows = await sodaAll({
    $select: "camis,inspection_date,score",
    $where: `inspection_type='${INITIAL}' AND inspection_date >= '2026-01-01T00:00:00.000' AND inspection_date < '2027-01-01T00:00:00.000' AND score IS NOT NULL`,
    $group: "camis,inspection_date,score",
  })
  const byInspection = new Map<string, number>()
  let splitScores = 0
  for (const row of scoreRows) {
    const key = `${row.camis}|${row.inspection_date}`
    const score = Number(row.score)
    const prior = byInspection.get(key)
    if (prior === undefined) byInspection.set(key, score)
    else if (prior !== score) {
      splitScores += 1
      byInspection.set(key, Math.max(prior, score))
    }
  }
  const histogram: Array<{ score: number; n: number }> = []
  const counts = new Map<number, number>()
  for (const score of byInspection.values()) counts.set(score, (counts.get(score) ?? 0) + 1)
  let above30 = 0
  for (let score = 0; score <= 30; score += 1) histogram.push({ score, n: counts.get(score) ?? 0 })
  for (const [score, n] of counts) if (score > 30) above30 += n
  const n = byInspection.size
  console.log("unique initial inspections", n, "split score keys", splitScores, "above 30", above30)
  console.log("12", counts.get(12) ?? 0, "13", counts.get(13) ?? 0, "14", counts.get(14) ?? 0, "15", counts.get(15) ?? 0)

  console.log("uninspected")
  const placeholder = await sodaAll({
    $select: "camis,boro",
    $group: "camis,boro",
    $where: "inspection_date < '1901-01-01T00:00:00.000'",
  })
  const inspected = await sodaAll({
    $select: "camis",
    $group: "camis",
    $where: "inspection_date >= '1901-01-01T00:00:00.000'",
  })
  const inspectedIds = new Set(inspected.map((row) => row.camis))
  const uninspectedByBorough = new Map<string, number>()
  const seenUninspected = new Set<string>()
  for (const row of placeholder) {
    if (inspectedIds.has(row.camis) || seenUninspected.has(row.camis)) continue
    seenUninspected.add(row.camis)
    const borough = BOROUGHS.includes(row.boro) ? row.boro : "Missing borough code"
    uninspectedByBorough.set(borough, (uninspectedByBorough.get(borough) ?? 0) + 1)
  }
  const establishments = new Set<string>([...inspectedIds, ...seenUninspected, ...placeholder.map((row) => row.camis)])
  console.log("uninspected", seenUninspected.size, "establishments", establishments.size)

  console.log("closures")
  const closureRows = await sodaAll({
    $select: "camis,inspection_date,action,boro",
    $group: "camis,inspection_date,action,boro",
    $where: `action='${CLOSED}' OR action='${RECLOSED}'`,
  })
  type Bucket = { events: Set<string>; restaurants: Set<string>; byBorough: Map<string, { events: Set<string>; restaurants: Set<string> }> }
  const months = new Map<string, Bucket>()
  let before2025Events = 0
  let before2025Restaurants = new Set<string>()
  for (const row of closureRows) {
    const month = monthKey(row.inspection_date)
    const event = `${row.camis}|${row.inspection_date}|${row.action}`
    const borough = BOROUGHS.includes(row.boro) ? row.boro : "Missing borough code"
    if (month < "2025-01") {
      before2025Events += 1
      before2025Restaurants.add(row.camis)
      continue
    }
    let bucket = months.get(month)
    if (!bucket) {
      bucket = { events: new Set(), restaurants: new Set(), byBorough: new Map() }
      months.set(month, bucket)
    }
    bucket.events.add(event)
    bucket.restaurants.add(row.camis)
    let boro = bucket.byBorough.get(borough)
    if (!boro) {
      boro = { events: new Set(), restaurants: new Set() }
      bucket.byBorough.set(borough, boro)
    }
    boro.events.add(event)
    boro.restaurants.add(row.camis)
  }

  const source = {
    datasetId: "43nn-pn8j",
    datasetUrl: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
    recordDate,
    recordDateLabel: label(recordDate),
    rowsUpdatedAt,
    inspectionMax,
    inspectionMaxLabel: label(inspectionMax),
    fileRows,
    computedOn: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
  }

  const score = {
    ...source,
    inspectionType: INITIAL,
    year: 2026,
    n,
    splitScores,
    above30,
    histogram,
  }
  const uninspected = {
    ...source,
    establishments: establishments.size,
    uninspected: seenUninspected.size,
    byBorough: [...uninspectedByBorough.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  }
  const closureMonths = [...months.keys()].sort()
  const latestMonth = closureMonths[closureMonths.length - 1]
  const closures = {
    ...source,
    seriesStart: "2025-01",
    latestMonth,
    before2025Events,
    before2025Restaurants: before2025Restaurants.size,
    actions: [CLOSED, RECLOSED],
    months: closureMonths.map((month) => {
      const bucket = months.get(month)!
      return {
        month,
        events: bucket.events.size,
        restaurants: bucket.restaurants.size,
        byBorough: BOROUGHS.map((name) => ({
          name,
          events: bucket.byBorough.get(name)?.events.size ?? 0,
          restaurants: bucket.byBorough.get(name)?.restaurants.size ?? 0,
        })),
      }
    }),
  }

  const dataDir = resolve(process.cwd(), "src/data")
  const publicDir = resolve(process.cwd(), "public/data")
  mkdirSync(publicDir, { recursive: true })
  writeFileSync(resolve(dataDir, "score-13-cliff.json"), JSON.stringify(score))
  writeFileSync(resolve(dataDir, "not-yet-inspected.json"), JSON.stringify(uninspected))
  writeFileSync(resolve(dataDir, "restaurant-closures.json"), JSON.stringify(closures))

  const scoreCsv = ["score,inspections", ...histogram.map((row) => `${row.score},${row.n}`), `above_30,${above30}`].join("\n") + "\n"
  const uninspectedCsv = ["borough,establishments_with_placeholder_date_only", ...uninspected.byBorough.map((row) => `${csv(row.name)},${row.count}`)].join("\n") + "\n"
  const closureCsv = ["month,borough,closure_events,unique_restaurants"]
  for (const month of closures.months) {
    closureCsv.push(`${month.month},New York City,${month.events},${month.restaurants}`)
    for (const row of month.byBorough) closureCsv.push(`${month.month},${csv(row.name)},${row.events},${row.restaurants}`)
  }
  writeFileSync(resolve(publicDir, "nyc-restaurant-score-13-cliff.csv"), scoreCsv)
  writeFileSync(resolve(publicDir, "not-yet-inspected-restaurants-nyc.csv"), uninspectedCsv)
  writeFileSync(resolve(publicDir, `nyc-restaurant-closures-${latestMonth}.csv`), closureCsv.join("\n") + "\n")
  console.log("wrote", latestMonth)
}

function csv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
