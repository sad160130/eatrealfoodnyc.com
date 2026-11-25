import { parseInspectionDate } from "./inspection-dates"

/**
 * NYC DOHMH dataset 43nn-pn8j stores every inspection, not one current grade.
 * Our `inspection_grade` column is a copy of whichever row was joined when the
 * CSV was ingested. It goes stale when a later inspection is graded.
 *
 * Which row we keep:
 * The newest inspection whose grade is A, B, C, Z, P, or N. A later visit
 * that has a score and a blank grade does not erase that letter. A first
 * visit of 14 or more points is often blank. So is a later non-grading visit
 * (for example score 0 and no grade). An older A/B/C does not come back while
 * a newer Z, P, or N is still the latest graded row.
 *
 * Da Gennaro shape: Z on 2026-07-01 stays the grade when a later row on
 * 2026-09-17 has score 0 and a blank grade, even though an A from 2024-06-13
 * is still in the file.
 *
 * Stored letter: A, B, and C are the letter grades. Z and P are Grade Pending
 * and are stored as those letters. N means Not Yet Graded and is stored as
 * null so the placard does not paint a fake letter.
 *
 * A grouped SODA row is one inspection date, with max(score) and max(grade).
 * max(grade) is lexicographic, so a date that mixed A and Z would surface Z.
 * A normal inspection date has one grade copied onto its violation rows.
 */

export const GRADED_CODES = ["A", "B", "C", "Z", "P", "N"] as const
export type GradedCode = (typeof GRADED_CODES)[number]

export interface DohmhInspection {
  camis: string
  name: string
  borough: string | null
  grade: string | null
  score: number | null
  inspectionDate: string | null
  building: string | null
  street: string | null
  zip: string | null
}

export interface GradeSnapshot {
  camis: string
  name: string
  borough: string | null
  grade: GradedCode
  score: number | null
  inspectionDate: string
  addressKey: string | null
}

export interface RestaurantGradeTarget {
  id: number
  name: string
  borough: string | null
  address: string | null
}

export type GradeMatchMethod = "address" | "zip-building" | "zip-name" | "name"
export type InspectionMatchMethod = Exclude<GradeMatchMethod, "name">

export interface GradeChange {
  id: number
  fromGrade: string | null
  toGrade: string | null
  score: number | null
  inspectionDate: string
  camis: string
  matchedBy: GradeMatchMethod
}

export interface InspectionTarget extends RestaurantGradeTarget {
  inspection_grade: string | null
  inspection_score: number | null
  inspection_date: string | null
}

/**
 * A write we will apply. Name-only matches are never included.
 * `zip-building` and `zip-name` are the guarded secondary keys.
 */
export interface InspectionWrite {
  id: number
  fromGrade: string | null
  toGrade: string | null
  fromScore: number | null
  toScore: number | null
  fromDate: string | null
  toDate: string
  inspectionIso: string
  camis: string
  matchedBy: InspectionMatchMethod
}

export interface NameMismatchSample {
  id: number
  listingName: string
  cityName: string
  camis: string
}

export interface InspectionPlan {
  writes: InspectionWrite[]
  matched: number
  unmatched: number
  skippedNameOnly: number
  skippedOlder: number
  skippedAmbiguous: number
  /** Location matched, but the listing name and the city DBA are different businesses. */
  skippedNameConflict: number
  nameConflictSample: NameMismatchSample[]
  unchanged: number
  /** Confident matches whose display name differs from the city DBA. Not renamed. */
  nameMismatches: number
  nameMismatchSample: NameMismatchSample[]
  nameOnlySample: Array<{
    id: number
    name: string
    fromGrade: string | null
    toGrade: string | null
    camis: string
  }>
}

const BOROUGHS: Record<string, string> = {
  "1": "manhattan",
  manhattan: "manhattan",
  "2": "bronx",
  bronx: "bronx",
  "the bronx": "bronx",
  "3": "brooklyn",
  brooklyn: "brooklyn",
  "4": "queens",
  queens: "queens",
  "5": "staten island",
  "staten island": "staten island",
}

export function normalizeBorough(value: string | null | undefined): string | null {
  if (!value) return null
  return BOROUGHS[value.trim().toLowerCase()] ?? null
}

export function normalizePlaceName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inc|llc|ltd|corp|co|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const NAME_OVERLAP_MIN = 0.6
const FIRST_TOKEN_MIN = 2
const NAME_MISMATCH_SAMPLE = 15

/**
 * One street spelling for both the listing and the city file.
 * "4415 4th Ave" and "4 AVENUE" both become "4 ave". "62 W 22nd St" and
 * "WEST 22 STREET" both become "w 22 st". Suite, unit, floor, apt, and
 * storefront tails are dropped before the suffix map.
 */
export function normalizeStreet(value: string): string {
  let street = value.toLowerCase().replace(/\./g, " ")
  street = street.replace(/#.*$/g, " ")
  street = street.replace(/\b(?:suite|ste|unit|floor|fl|apt|apartment|storefront)\b.*$/g, " ")
  street = street.replace(/\b(\d+)(?:st|nd|rd|th)\b/g, "$1")
  street = street
    .replace(/\bsaint\b/g, "st")
    .replace(/\b(?:west|w)\b/g, "w")
    .replace(/\b(?:east|e)\b/g, "e")
    .replace(/\b(?:north|n)\b/g, "n")
    .replace(/\b(?:south|s)\b/g, "s")
    .replace(/\b(?:parkway|pkwy)\b/g, "pkwy")
    .replace(/\b(?:lane|ln)\b/g, "ln")
    .replace(/\b(?:terrace|ter)\b/g, "ter")
    .replace(/\b(?:plaza|plz)\b/g, "plz")
    .replace(/\b(?:court|ct)\b/g, "ct")
    .replace(/\b(?:highway|hwy)\b/g, "hwy")
    .replace(/\b(?:turnpike|tpke)\b/g, "tpke")
    .replace(/\b(?:boulevard|blvd)\b/g, "blvd")
    .replace(/\b(?:avenue|ave)\b/g, "ave")
    .replace(/\b(?:street|st)\b/g, "st")
    .replace(/\b(?:road|rd)\b/g, "rd")
    .replace(/\b(?:place|pl)\b/g, "pl")
    .replace(/\b(?:drive|dr)\b/g, "dr")
  return street.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()
}

export interface ListingLocation {
  building: string
  zip: string
  street: string | null
}

/** Building number, ZIP, and normalized street from a directory address. */
export function listingLocation(address: string | null | undefined): ListingLocation | null {
  if (!address) return null
  const zips = [...address.matchAll(/\b(\d{5})(?:-\d{4})?\b/g)]
  const zip = zips[zips.length - 1]?.[1]
  const building = address.trim().match(/^(\d+[\w-]*)/)?.[1]?.toLowerCase().replace(/\s+/g, "")
  if (!building || !zip) return null
  const streetRaw = address.split(",")[0]?.replace(/^(\d+[\w-]*)\s*/, "") ?? ""
  const street = normalizeStreet(streetRaw)
  return { building, zip, street: street || null }
}

/** "33-07 Ditmars Blvd, Queens, NY 11105" → "33-07|ditmars blvd|11105" */
export function addressKeyFromListing(address: string | null | undefined): string | null {
  const parts = listingLocation(address)
  if (!parts?.street) return null
  return `${parts.building}|${parts.street}|${parts.zip}`
}

export function addressKeyFromDohmh(row: Pick<DohmhInspection, "building" | "street" | "zip">): string | null {
  if (!row.building || !row.street || !row.zip) return null
  const building = row.building.trim().toLowerCase().replace(/\s+/g, "")
  const street = normalizeStreet(row.street)
  const zip = row.zip.match(/\d{5}/)?.[0]
  if (!building || !street || !zip) return null
  return `${building}|${street}|${zip}`
}

export function placeNameTokens(value: string): string[] {
  const normalized = normalizePlaceName(value)
  return normalized ? normalized.split(" ") : []
}

/** Share of unique tokens in common, divided by the longer name. */
export function nameTokenOverlap(a: string, b: string): number {
  const left = new Set(placeNameTokens(a))
  const right = new Set(placeNameTokens(b))
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const token of left) if (right.has(token)) shared += 1
  return shared / Math.max(left.size, right.size)
}

/**
 * Guarded name check for a same-building candidate.
 * Exact normalized name, the same first token (at least two characters),
 * or token overlap of 0.6 or more.
 */
export function namesLooselyMatch(a: string, b: string): boolean {
  const left = placeNameTokens(a)
  const right = placeNameTokens(b)
  if (left.length === 0 || right.length === 0) return false
  if (left.join(" ") === right.join(" ")) return true
  if (left[0].length >= FIRST_TOKEN_MIN && left[0] === right[0]) return true
  return nameTokenOverlap(a, b) >= NAME_OVERLAP_MIN
}

const GENERIC_NAME_TOKENS = new Set([
  "restaurant",
  "restaurants",
  "cafe",
  "cafes",
  "bar",
  "bars",
  "grill",
  "grills",
  "kitchen",
  "kitchens",
  "pizza",
  "pizzeria",
  "deli",
  "delis",
  "the",
  "and",
  "nyc",
  "ny",
  "inc",
  "llc",
  "ltd",
  "corp",
  "co",
])

const NUMBER_WORDS: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  thirty: "30",
  forty: "40",
  fifty: "50",
  sixty: "60",
  seventy: "70",
  eighty: "80",
  ninety: "90",
}

const NAME_AGREE_MIN = 0.5

/**
 * Tokens used to decide that a shared address is the same restaurant.
 * Accents are folded, punctuation is dropped, generic words are ignored,
 * and number words become digits.
 */
export function inspectionNameTokens(value: string): string[] {
  const seen = new Set<string>()
  const tokens: string[] = []
  for (const raw of placeNameTokens(value)) {
    const token = NUMBER_WORDS[raw] ?? raw
    if (token.length < 2 || GENERIC_NAME_TOKENS.has(token) || seen.has(token)) continue
    seen.add(token)
    tokens.push(token)
  }
  return tokens
}

/**
 * Same venue, not merely the same building. Passes when one significant
 * name contains the other, or the share of shared tokens over the shorter
 * name is at least 0.5. "Kesté Pizza e Vino" agrees with "KESTE".
 * "Chelsea Juice" does not agree with "LA BIANCA PIZZERIA".
 */
export function inspectionNamesAgree(a: string, b: string): boolean {
  const left = inspectionNameTokens(a)
  const right = inspectionNameTokens(b)
  if (left.length === 0 || right.length === 0) return false
  const leftSquash = left.join("")
  const rightSquash = right.join("")
  if (leftSquash.includes(rightSquash) || rightSquash.includes(leftSquash)) return true
  const rightSet = new Set(right)
  let shared = 0
  for (const token of left) if (rightSet.has(token)) shared += 1
  return shared / Math.min(left.length, right.length) >= NAME_AGREE_MIN
}

export function isGradedCode(value: string | null | undefined): value is GradedCode {
  return !!value && (GRADED_CODES as readonly string[]).includes(value)
}

/**
 * Newest inspection that has a grade code. Later ungraded visits (blank
 * grade, score present) do not erase the last real grade.
 */
export function latestGradedInspection(rows: DohmhInspection[]): GradeSnapshot | null {
  const graded = rows
    .filter((row) => isGradedCode(row.grade) && row.inspectionDate)
    .sort((a, b) => (a.inspectionDate! < b.inspectionDate! ? 1 : a.inspectionDate! > b.inspectionDate! ? -1 : 0))
  const row = graded[0]
  if (!row || !isGradedCode(row.grade) || !row.inspectionDate) return null
  return {
    camis: row.camis,
    name: row.name,
    borough: normalizeBorough(row.borough),
    grade: row.grade,
    score: row.score,
    inspectionDate: row.inspectionDate.slice(0, 10),
    addressKey: addressKeyFromDohmh(row),
  }
}

export function toStoredGrade(grade: GradedCode): string | null {
  // N means not yet graded. Storing it as a letter would paint a fake badge.
  if (grade === "N") return null
  return grade
}

export function toStoredDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-")
  if (!year || !month || !day) return isoDate
  return `${Number(month)}/${Number(day)}/${year}`
}

function storedScore(score: number | null): number | null {
  if (score == null || !Number.isFinite(score)) return null
  return Math.trunc(score)
}

interface GradeIndexes {
  byAddress: Map<string, GradeSnapshot[]>
  byName: Map<string, GradeSnapshot[]>
  byZipBuilding: Map<string, GradeSnapshot[]>
  byZipName: Map<string, GradeSnapshot[]>
}

type SnapshotChoice =
  | { kind: "match"; snapshot: GradeSnapshot; matchedBy: GradeMatchMethod }
  | { kind: "ambiguous" }
  | { kind: "name-conflict"; snapshot: GradeSnapshot }
  | { kind: "none" }

function pushIndex(map: Map<string, GradeSnapshot[]>, key: string, snapshot: GradeSnapshot) {
  const list = map.get(key) ?? []
  list.push(snapshot)
  map.set(key, list)
}

function addressParts(addressKey: string | null): { building: string; zip: string } | null {
  if (!addressKey) return null
  const parts = addressKey.split("|")
  if (parts.length !== 3) return null
  const [building, street, zip] = parts
  if (!building || !street || !zip) return null
  return { building, zip }
}

function uniqueByCamis(rows: GradeSnapshot[]): GradeSnapshot[] {
  const map = new Map<string, GradeSnapshot>()
  for (const row of rows) {
    if (!map.has(row.camis)) map.set(row.camis, row)
  }
  return [...map.values()]
}

function indexGradeSnapshots(snapshots: GradeSnapshot[]): GradeIndexes {
  const byAddress = new Map<string, GradeSnapshot[]>()
  const byName = new Map<string, GradeSnapshot[]>()
  const byZipBuilding = new Map<string, GradeSnapshot[]>()
  const byZipName = new Map<string, GradeSnapshot[]>()
  for (const snapshot of snapshots) {
    const parts = addressParts(snapshot.addressKey)
    if (snapshot.addressKey && parts) {
      pushIndex(byAddress, snapshot.addressKey, snapshot)
      pushIndex(byZipBuilding, `${parts.building}|${parts.zip}`, snapshot)
      const name = normalizePlaceName(snapshot.name)
      if (name) pushIndex(byZipName, `${name}|${parts.zip}`, snapshot)
    }
    const borough = snapshot.borough
    if (borough) {
      pushIndex(byName, `${normalizePlaceName(snapshot.name)}|${borough}`, snapshot)
    }
  }
  return { byAddress, byName, byZipBuilding, byZipName }
}

function sameBorough(snapshot: GradeSnapshot, borough: string | null): boolean {
  if (!snapshot.borough || !borough) return true
  return snapshot.borough === borough
}

/**
 * Address key first. A shared building is not enough: the listing name and
 * the city DBA have to agree, or the row is a name conflict and is not written.
 * Several CAMIS that agree are ambiguous.
 *
 * Otherwise same ZIP and building number, plus that same name check, or same
 * ZIP and the exact normalized name. A borough has to agree when both sides
 * have one. Name plus borough, with no ZIP agreement, is name-only and is
 * not written.
 */
function chooseSnapshot(restaurant: RestaurantGradeTarget, indexes: GradeIndexes): SnapshotChoice {
  const addressKey = addressKeyFromListing(restaurant.address)
  const borough = normalizeBorough(restaurant.borough)
  const location = listingLocation(restaurant.address)
  const addressHits = uniqueByCamis(
    (addressKey ? indexes.byAddress.get(addressKey) ?? [] : []).filter((snapshot) => sameBorough(snapshot, borough))
  )

  if (addressHits.length > 0) {
    const named = addressHits.filter((snapshot) => inspectionNamesAgree(restaurant.name, snapshot.name))
    if (named.length === 1) return { kind: "match", snapshot: named[0], matchedBy: "address" }
    if (named.length > 1) return { kind: "ambiguous" }
    return { kind: "name-conflict", snapshot: addressHits[0] }
  }

  const secondary = new Map<string, { snapshot: GradeSnapshot; matchedBy: InspectionMatchMethod }>()
  const add = (snapshot: GradeSnapshot, matchedBy: InspectionMatchMethod) => {
    const current = secondary.get(snapshot.camis)
    if (!current || matchedBy === "zip-building") secondary.set(snapshot.camis, { snapshot, matchedBy })
  }

  let rejectedBuilding: GradeSnapshot | null = null
  if (location) {
    const buildingHits = uniqueByCamis(
      (indexes.byZipBuilding.get(`${location.building}|${location.zip}`) ?? []).filter((snapshot) =>
        sameBorough(snapshot, borough)
      )
    )
    for (const snapshot of buildingHits) {
      if (inspectionNamesAgree(restaurant.name, snapshot.name)) add(snapshot, "zip-building")
      else rejectedBuilding ??= snapshot
    }
    const exactName = normalizePlaceName(restaurant.name)
    if (exactName) {
      const nameHits = uniqueByCamis(
        (indexes.byZipName.get(`${exactName}|${location.zip}`) ?? []).filter((snapshot) => sameBorough(snapshot, borough))
      )
      for (const snapshot of nameHits) {
        if (inspectionNamesAgree(restaurant.name, snapshot.name)) add(snapshot, "zip-name")
      }
    }
  }

  if (secondary.size === 1) {
    const only = [...secondary.values()][0]
    return { kind: "match", snapshot: only.snapshot, matchedBy: only.matchedBy }
  }
  if (secondary.size > 1) return { kind: "ambiguous" }
  if (rejectedBuilding) return { kind: "name-conflict", snapshot: rejectedBuilding }

  const nameHits = borough
    ? uniqueByCamis(indexes.byName.get(`${normalizePlaceName(restaurant.name)}|${borough}`) ?? [])
    : []
  if (nameHits.length === 1) return { kind: "match", snapshot: nameHits[0], matchedBy: "name" }
  return { kind: "none" }
}

export function matchLatestGrades(
  restaurants: Array<RestaurantGradeTarget & { inspection_grade: string | null }>,
  snapshots: GradeSnapshot[]
): { changes: GradeChange[]; matched: number; unmatched: number } {
  const indexes = indexGradeSnapshots(snapshots)
  const changes: GradeChange[] = []
  let matched = 0
  let unmatched = 0

  for (const restaurant of restaurants) {
    const chosen = chooseSnapshot(restaurant, indexes)
    if (chosen.kind !== "match") {
      unmatched += 1
      continue
    }
    matched += 1
    const toGrade = toStoredGrade(chosen.snapshot.grade)
    if ((restaurant.inspection_grade ?? null) === toGrade) continue
    changes.push({
      id: restaurant.id,
      fromGrade: restaurant.inspection_grade,
      toGrade,
      score: chosen.snapshot.score,
      inspectionDate: toStoredDate(chosen.snapshot.inspectionDate),
      camis: chosen.snapshot.camis,
      matchedBy: chosen.matchedBy,
    })
  }

  return { changes, matched, unmatched }
}

function canonicalStoredDate(isoDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null
  const parsed = parseInspectionDate(isoDate)
  if (!parsed || parsed.toISOString().slice(0, 10) !== isoDate) return null
  return toStoredDate(isoDate)
}

/**
 * Rows to write onto existing restaurants.
 *
 * Address is the primary write key. A same-ZIP building, or a same-ZIP exact
 * name, may also write. The listing name and the city DBA have to agree
 * before any of those are written. A shared address with a different business
 * is `skippedNameConflict`. More than one agreeing CAMIS is skipped. Name
 * plus borough alone never writes.
 *
 * A fetched inspection older than the stored calendar day is written only
 * when `replaceOlder` is set and the name check passed. The daily full
 * lookback sets `replaceOlder`, because the fetched row is the city's latest
 * graded inspection for that venue. Same values write nothing, so a second
 * run is a no-op. Dates are compared as calendar days, not as M/D/YYYY text.
 * Display names are never changed here.
 */
export function planInspectionUpdates(
  restaurants: InspectionTarget[],
  snapshots: GradeSnapshot[],
  options?: { replaceOlder?: boolean }
): InspectionPlan {
  const indexes = indexGradeSnapshots(snapshots)
  const replaceOlder = options?.replaceOlder === true
  const writes: InspectionWrite[] = []
  const nameOnlySample: InspectionPlan["nameOnlySample"] = []
  const nameMismatchSample: NameMismatchSample[] = []
  const nameConflictSample: NameMismatchSample[] = []
  let matched = 0
  let unmatched = 0
  let skippedNameOnly = 0
  let skippedOlder = 0
  let skippedAmbiguous = 0
  let skippedNameConflict = 0
  let unchanged = 0
  let nameMismatches = 0

  const recordNameConflict = (restaurant: InspectionTarget, snapshot: GradeSnapshot) => {
    skippedNameConflict += 1
    if (nameConflictSample.length < NAME_MISMATCH_SAMPLE) {
      nameConflictSample.push({
        id: restaurant.id,
        listingName: restaurant.name,
        cityName: snapshot.name,
        camis: snapshot.camis,
      })
    }
  }

  for (const restaurant of restaurants) {
    const chosen = chooseSnapshot(restaurant, indexes)
    if (chosen.kind === "ambiguous") {
      skippedAmbiguous += 1
      continue
    }
    if (chosen.kind === "name-conflict") {
      recordNameConflict(restaurant, chosen.snapshot)
      continue
    }
    if (chosen.kind !== "match") {
      unmatched += 1
      continue
    }
    const nameOk = inspectionNamesAgree(restaurant.name, chosen.snapshot.name)
    if (chosen.matchedBy !== "name" && !nameOk) {
      recordNameConflict(restaurant, chosen.snapshot)
      continue
    }
    matched += 1
    const toGrade = toStoredGrade(chosen.snapshot.grade)
    if (chosen.matchedBy === "name") {
      skippedNameOnly += 1
      if (nameOnlySample.length < 10) {
        nameOnlySample.push({
          id: restaurant.id,
          name: restaurant.name,
          fromGrade: restaurant.inspection_grade,
          toGrade,
          camis: chosen.snapshot.camis,
        })
      }
      continue
    }

    if (normalizePlaceName(restaurant.name) !== normalizePlaceName(chosen.snapshot.name)) {
      nameMismatches += 1
      if (nameMismatchSample.length < NAME_MISMATCH_SAMPLE) {
        nameMismatchSample.push({
          id: restaurant.id,
          listingName: restaurant.name,
          cityName: chosen.snapshot.name,
          camis: chosen.snapshot.camis,
        })
      }
    }

    const inspectionIso = chosen.snapshot.inspectionDate.slice(0, 10)
    const toDate = canonicalStoredDate(inspectionIso)
    const incoming = parseInspectionDate(inspectionIso)
    if (!toDate || !incoming) {
      unchanged += 1
      continue
    }
    const stored = parseInspectionDate(restaurant.inspection_date)
    if (stored && incoming.getTime() < stored.getTime() && !nameOk) {
      recordNameConflict(restaurant, chosen.snapshot)
      continue
    }
    if (!replaceOlder && stored && incoming.getTime() < stored.getTime()) {
      skippedOlder += 1
      continue
    }

    const toScore = storedScore(chosen.snapshot.score)
    const fromScore = storedScore(restaurant.inspection_score)
    const fromGrade = restaurant.inspection_grade ?? null
    const fromDate = restaurant.inspection_date ?? null
    if (fromGrade === toGrade && fromScore === toScore && fromDate === toDate) {
      unchanged += 1
      continue
    }
    writes.push({
      id: restaurant.id,
      fromGrade,
      toGrade,
      fromScore,
      toScore,
      fromDate,
      toDate,
      inspectionIso,
      camis: chosen.snapshot.camis,
      matchedBy: chosen.matchedBy,
    })
  }

  return {
    writes,
    matched,
    unmatched,
    skippedNameOnly,
    skippedOlder,
    skippedAmbiguous,
    skippedNameConflict,
    nameConflictSample,
    unchanged,
    nameMismatches,
    nameMismatchSample,
    nameOnlySample,
  }
}
