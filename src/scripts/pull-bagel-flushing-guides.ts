/**
 * Pull bagel shops, Flushing (NTA QN22) inspections, and latest A/B/C
 * shares by NTA from NYC Open Data 43nn-pn8j. Matches published listings
 * in our database. Writes JSON the guide pages import.
 *
 *   npx tsx src/scripts/pull-bagel-flushing-guides.ts
 */
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import dotenv from "dotenv"
import pg from "pg"
import { pickLatestInspection } from "../lib/latest-scored-inspection"
import { normalizeBorough, normalizePlaceName } from "../lib/dohmh-match"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })
dotenv.config()

const SODA = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
const DATA = resolve(process.cwd(), "src/data")
const PAGE = 50_000

const BAGEL_WHERE = "cuisine_description = 'Bagels/Pretzels' OR upper(dba) like '%BAGEL%'"
const FLUSHING_NTA = "QN22"
const LETTERS = ["A", "B", "C"] as const

interface SodaRow {
  camis?: string
  dba?: string
  boro?: string
  building?: string
  street?: string
  zipcode?: string
  phone?: string
  cuisine_description?: string
  inspection_date?: string
  grade?: string
  score?: string
  grade_date?: string
  nta?: string
  record_date?: string
}

interface ListingRow {
  slug: string
  name: string
  type: string | null
  borough: string | null
  neighborhood: string | null
  address: string
  phone: string | null
  rating: number | null
  reviews: number | null
  dietary_tags: string | null
}

interface ListingMatch {
  camis: string
  slug: string
  listingName: string
  type: string
  neighborhood: string
  borough: string
  rating: number | null
  reviews: number | null
  tags: string[]
}

async function soda(params: Record<string, string>): Promise<SodaRow[]> {
  const url = new URL(SODA)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  let lastError: unknown
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "eatrealfoodnyc-guide-pull" },
        signal: AbortSignal.timeout(120_000),
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`SODA ${response.status}: ${body.slice(0, 300)}`)
      }
      const json = (await response.json()) as unknown
      if (!Array.isArray(json)) throw new Error("SODA response was not an array")
      return json as SodaRow[]
    } catch (error) {
      lastError = error
      console.error(`request failed (attempt ${attempt}): ${error instanceof Error ? error.message : error}`)
      await new Promise((resolveWait) => setTimeout(resolveWait, 1500 * attempt))
    }
  }
  throw lastError
}

async function sodaAll(params: Record<string, string>, order: string): Promise<SodaRow[]> {
  const rows: SodaRow[] = []
  for (let offset = 0; ; offset += PAGE) {
    const page = await soda({ ...params, $order: order, $limit: String(PAGE), $offset: String(offset) })
    rows.push(...page)
    console.log(`  ${params.$where ?? params.$select} offset ${offset}: ${page.length}`)
    if (page.length < PAGE) break
  }
  return rows
}

function keepInspection(row: SodaRow): SodaRow {
  return {
    camis: row.camis,
    dba: row.dba,
    boro: row.boro,
    building: row.building,
    street: row.street,
    zipcode: row.zipcode,
    phone: row.phone,
    cuisine_description: row.cuisine_description,
    inspection_date: row.inspection_date,
    grade: row.grade,
    score: row.score,
    nta: row.nta,
  }
}

/** Leading building token. 141-28 and 141-26 stay different. 500 and 500 stay the same. */
function buildingKey(value: string | null | undefined): string {
  const match = (value ?? "").trim().toUpperCase().match(/^(\d+(?:-\d+)?[A-Z]?)/)
  return match ? match[1] : ""
}

function tagsOf(value: string | null): string[] {
  if (!value) return []
  return value.split("|").map((tag) => tag.trim()).filter(Boolean)
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function rowScore(row: SodaRow): number {
  return (row.building ? 4 : 0) + (row.street ? 2 : 0) + (row.phone ? 1 : 0) + (row.dba ? 1 : 0)
}

/** One identity row per CAMIS, preferring the row that has a building number. */
function identityRows(rows: SodaRow[]): SodaRow[] {
  const byCamis = new Map<string, SodaRow>()
  for (const row of rows) {
    if (!row.camis || !row.dba) continue
    const current = byCamis.get(row.camis)
    if (!current || rowScore(row) > rowScore(current)) byCamis.set(row.camis, row)
  }
  return [...byCamis.values()]
}

function matchName(dba: string, listing: string): boolean {
  const city = normalizePlaceName(dba.replace(/&/g, " "))
  const ours = normalizePlaceName(listing.replace(/&/g, " "))
  if (!city || !ours) return false
  if (city === ours) return true
  // The directory name often adds a neighborhood or a street after the city DBA.
  return ours.startsWith(`${city} `)
}

/**
 * Link a published listing only when the name agrees and the street number
 * agrees in the same borough. A shared phone is not enough, and a directory
 * name that merely contains the city name is not enough.
 */
function matchListings(rows: SodaRow[], listings: ListingRow[]): { matches: ListingMatch[]; ambiguous: number } {
  const identities = identityRows(rows)
  const chosen = new Map<string, ListingMatch>()
  let ambiguous = 0

  for (const listing of listings) {
    const borough = normalizeBorough(listing.borough)
    const number = buildingKey(listing.address)
    if (!borough || !listing.neighborhood || !number) continue
    const candidates = identities.filter(
      (row) =>
        normalizeBorough(row.boro) === borough &&
        buildingKey(row.building) === number &&
        matchName(row.dba ?? "", listing.name)
    )
    if (candidates.length !== 1) {
      if (candidates.length > 1) ambiguous += 1
      continue
    }
    const row = candidates[0]
    if (!row.camis) continue
    if (chosen.has(row.camis)) {
      ambiguous += 1
      chosen.delete(row.camis)
      continue
    }
    chosen.set(row.camis, {
      camis: row.camis,
      slug: listing.slug,
      listingName: listing.name,
      type: listing.type?.trim() || "Restaurant",
      neighborhood: listing.neighborhood,
      borough: listing.borough?.trim() || "",
      rating: listing.rating,
      reviews: listing.reviews,
      tags: tagsOf(listing.dietary_tags),
    })
  }

  return { matches: [...chosen.values()].sort((a, b) => a.slug.localeCompare(b.slug)), ambiguous }
}

function shareLabel(part: number, whole: number): string {
  if (whole <= 0) return "0.0%"
  return `${(Math.round((part / whole) * 1000) / 10).toFixed(1)}%`
}

function latestLetters(rows: SodaRow[]) {
  const best = new Map<string, { day: string; grade: string; nta: string; tie: boolean }>()
  for (const row of rows) {
    const camis = row.camis?.trim()
    const grade = row.grade?.trim().toUpperCase()
    if (!camis || !grade || !LETTERS.includes(grade as (typeof LETTERS)[number])) continue
    const day = (row.grade_date || row.inspection_date || "").slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < "1901-01-01") continue
    const current = best.get(camis)
    if (!current || day > current.day) {
      best.set(camis, { day, grade, nta: row.nta?.trim() || "Missing", tie: false })
    } else if (day === current.day && grade !== current.grade) {
      current.tie = true
    }
  }
  let ties = 0
  const kept: Array<{ nta: string; grade: string }> = []
  for (const row of best.values()) {
    if (row.tie) {
      ties += 1
      continue
    }
    kept.push({ nta: row.nta, grade: row.grade })
  }
  return { kept, ties }
}

async function ntaNames(): Promise<Map<string, string>> {
  const local = new Map<string, string>()
  const file = (await import("../data/fall-2026-neighborhoods.json")).default as Array<{ code: string; name: string }>
  for (const row of file) local.set(row.code, row.name)
  const endpoint =
    "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Neighborhood_Tabulation_Areas_2010/FeatureServer/0/query?where=1%3D1&outFields=NTACode,NTAName&returnGeometry=false&f=json&resultRecordCount=500"
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json", "User-Agent": "eatrealfoodnyc-guide-pull" },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`NTA names HTTP ${response.status}`)
  const json = (await response.json()) as {
    features?: Array<{ attributes?: { NTACode?: string; NTAName?: string } }>
  }
  const features = json.features ?? []
  if (features.length < 150) throw new Error(`NTA name list too short: ${features.length}`)
  for (const feature of features) {
    const code = feature.attributes?.NTACode?.trim()
    const name = feature.attributes?.NTAName?.trim()
    if (code && name) local.set(code, name)
  }
  console.log(`NTA names: ${local.size}`)
  return local
}

function assertPickable(rows: SodaRow[], label: string) {
  const byCamis = new Map<string, SodaRow[]>()
  for (const row of rows) {
    if (!row.camis) throw new Error(`${label} row missing camis`)
    const list = byCamis.get(row.camis) ?? []
    list.push(row)
    byCamis.set(row.camis, list)
  }
  let failures = 0
  for (const [camis, group] of byCamis) {
    try {
      pickLatestInspection(group.map((row) => ({
        inspectionDate: row.inspection_date,
        grade: row.grade,
        score: row.score,
      })))
    } catch (error) {
      failures += 1
      if (failures <= 8) {
        console.error(`${label} ${camis}: ${error instanceof Error ? error.message : error}`)
      }
    }
  }
  if (failures > 0) throw new Error(`${label}: ${failures} CAMIS values have conflicting grades or scores`)
  console.log(`${label}: ${byCamis.size} establishments, pickLatestInspection ok`)
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL is not set")

  console.log("Pulling dataset meta, bagels, Flushing, and letter grades")
  const [metaRows, bagelRows, flushingRows, letterRows, names] = await Promise.all([
    soda({ $select: "max(record_date) as record_date, max(inspection_date) as inspection_date, count(*) as rows" }),
    sodaAll(
      {
        $select: "camis,dba,boro,building,street,zipcode,phone,cuisine_description,inspection_date,grade,score,nta",
        $where: BAGEL_WHERE,
      },
      "camis,inspection_date"
    ),
    sodaAll(
      {
        $select: "camis,dba,boro,building,street,zipcode,phone,cuisine_description,inspection_date,grade,score,nta",
        $where: `nta = '${FLUSHING_NTA}'`,
      },
      "camis,inspection_date"
    ),
    sodaAll(
      {
        $select: "camis,nta,grade,grade_date,inspection_date",
        $where: "grade in('A','B','C')",
      },
      "camis,grade_date"
    ),
    ntaNames(),
  ])

  const meta = metaRows[0] ?? {}
  const recordDate = meta.record_date ?? ""
  const newestInspection = (meta.inspection_date ?? "").slice(0, 10)
  const fileRows = Number(meta.rows ?? "")
  if (!recordDate || !newestInspection || !Number.isFinite(fileRows)) {
    throw new Error(`meta missing: ${JSON.stringify(meta)}`)
  }

  const bagels = bagelRows.map(keepInspection)
  const flushing = flushingRows.map(keepInspection)
  for (const row of flushing) {
    if (row.nta !== FLUSHING_NTA) throw new Error(`flushing row nta ${row.nta}`)
  }
  assertPickable(bagels, "bagels")
  assertPickable(flushing, "flushing")

  const pool = new pg.Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 })
  let listings: ListingRow[]
  try {
    const result = await pool.query<ListingRow>(
      `select slug, name, type, borough, neighborhood, address, phone, rating, reviews, dietary_tags
       from restaurants
       where is_published = true and business_status = 'OPERATIONAL'`
    )
    listings = result.rows.map((row) => ({
      ...row,
      rating: asNumber(row.rating),
      reviews: asNumber(row.reviews),
    }))
  } finally {
    await pool.end()
  }
  console.log(`published operational listings: ${listings.length}`)

  const bagelMatch = matchListings(bagels, listings)
  const flushingMatch = matchListings(flushing, listings)
  const matchedBagelSlugs = new Set(bagelMatch.matches.map((row) => row.slug))
  const unmatchedBagelListings = listings
    .filter((listing) => !matchedBagelSlugs.has(listing.slug))
    .filter((listing) => /bagel/i.test(listing.name) || /bagel|pretzel/i.test(listing.type ?? ""))
    .map((listing) => ({
      slug: listing.slug,
      name: listing.name,
      type: listing.type,
      neighborhood: listing.neighborhood,
      borough: listing.borough,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  console.log(`bagel matches ${bagelMatch.matches.length}, ambiguous ${bagelMatch.ambiguous}, unmatched bagel listings ${unmatchedBagelListings.length}`)
  console.log(`flushing matches ${flushingMatch.matches.length}, ambiguous ${flushingMatch.ambiguous}`)

  const letters = latestLetters(letterRows)
  const byNta = new Map<string, { a: number; b: number; c: number }>()
  for (const row of letters.kept) {
    const bucket = byNta.get(row.nta) ?? { a: 0, b: 0, c: 0 }
    if (row.grade === "A") bucket.a += 1
    else if (row.grade === "B") bucket.b += 1
    else bucket.c += 1
    byNta.set(row.nta, bucket)
  }
  const unnamed = [...byNta.entries()].filter(([code, counts]) => {
    const letterGraded = counts.a + counts.b + counts.c
    return code !== "Missing" && letterGraded >= 80 && !names.get(code)
  })
  if (unnamed.length > 0) {
    throw new Error(`NTA codes missing a name: ${unnamed.map(([code]) => code).join(", ")}`)
  }
  const neighborhoods = [...byNta.entries()]
    .map(([code, counts]) => {
      const letterGraded = counts.a + counts.b + counts.c
      return {
        code,
        name: names.get(code) ?? null,
        a: counts.a,
        b: counts.b,
        c: counts.c,
        letterGraded,
        share: shareLabel(counts.a, letterGraded),
      }
    })
    .filter((row) => row.code !== "Missing" && row.letterGraded >= 80)
    .sort((a, b) => {
      const shareA = Number(a.share.replace("%", ""))
      const shareB = Number(b.share.replace("%", ""))
      if (shareA !== shareB) return shareA - shareB
      return a.name!.localeCompare(b.name!)
    })

  const cityA = letters.kept.filter((row) => row.grade === "A").length
  const cityB = letters.kept.filter((row) => row.grade === "B").length
  const cityC = letters.kept.filter((row) => row.grade === "C").length
  const cityN = cityA + cityB + cityC
  const flushingNta = neighborhoods.find((row) => row.code === FLUSHING_NTA)
  if (!flushingNta) throw new Error("Flushing QN22 missing from the NTA table")
  const lowestShare = neighborhoods[0]?.share
  const tiedLowest = neighborhoods.filter((row) => row.share === lowestShare)

  const pulledOn = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

  const metaBlock = {
    datasetId: "43nn-pn8j",
    recordDate,
    newestInspectionDate: newestInspection,
    fileRows,
    pulledOn,
    bagelWhere: BAGEL_WHERE,
    flushingNta: FLUSHING_NTA,
  }

  writeFileSync(resolve(DATA, "bagel-inspections-43nn-pn8j.json"), JSON.stringify(bagels))
  writeFileSync(resolve(DATA, "bagel-listing-matches.json"), JSON.stringify(bagelMatch.matches, null, 2))
  writeFileSync(resolve(DATA, "bagel-unmatched-listings.json"), JSON.stringify(unmatchedBagelListings, null, 2))
  writeFileSync(resolve(DATA, "flushing-inspections-43nn-pn8j.json"), JSON.stringify(flushing))
  writeFileSync(resolve(DATA, "flushing-listing-matches.json"), JSON.stringify(flushingMatch.matches, null, 2))
  writeFileSync(
    resolve(DATA, "nta-letter-grades-2026-11-25.json"),
    JSON.stringify(
      {
        ...metaBlock,
        method:
          "One latest A, B, or C per CAMIS. The date is grade_date. A CAMIS with two different letters on that date is excluded. NTAs need at least 80 letter-graded restaurants and a name from the 2010 neighborhood file or the NYC NTA name list.",
        letterTiesExcluded: letters.ties,
        citywide: {
          letterGraded: cityN,
          a: cityA,
          b: cityB,
          c: cityC,
          share: shareLabel(cityA, cityN),
        },
        flushing: {
          ...flushingNta,
          rank: neighborhoods.findIndex((row) => row.code === FLUSHING_NTA) + 1,
          ntaCount: neighborhoods.length,
          tiedForLowest: tiedLowest.some((row) => row.code === FLUSHING_NTA),
          uniqueLowest: tiedLowest.length === 1 && tiedLowest[0]?.code === FLUSHING_NTA,
          lowest: tiedLowest.map((row) => ({ code: row.code, name: row.name, share: row.share, a: row.a, letterGraded: row.letterGraded })),
        },
        neighborhoods,
      },
      null,
      2
    )
  )

  const summary = {
    meta: metaBlock,
    bagelRows: bagels.length,
    bagelCamis: new Set(bagels.map((row) => row.camis)).size,
    bagelMatches: bagelMatch.matches.length,
    bagelAmbiguous: bagelMatch.ambiguous,
    bagelMatchSlugs: bagelMatch.matches.map((row) => row.slug),
    unmatchedBagelListings,
    flushingRows: flushing.length,
    flushingCamis: new Set(flushing.map((row) => row.camis)).size,
    flushingMatches: flushingMatch.matches.length,
    flushingAmbiguous: flushingMatch.ambiguous,
    flushingMatchSlugs: flushingMatch.matches.map((row) => row.slug),
    citywide: { letterGraded: cityN, a: cityA, share: shareLabel(cityA, cityN), ties: letters.ties },
    flushingNta: flushingNta,
    uniqueLowest: tiedLowest.length === 1 && tiedLowest[0]?.code === FLUSHING_NTA,
    lowest: tiedLowest.map((row) => `${row.name} ${row.share}`),
    ntaCount: neighborhoods.length,
    lowestFive: neighborhoods.slice(0, 5).map((row) => `${row.name} ${row.code} ${row.a}/${row.letterGraded} ${row.share}`),
  }
  writeFileSync(resolve("/tmp", "guide-pull-summary.json"), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
