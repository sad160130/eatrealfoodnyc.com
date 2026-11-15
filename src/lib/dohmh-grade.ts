/**
 * NYC DOHMH dataset 43nn-pn8j stores every inspection, not one current grade.
 * Our `inspection_grade` column is a copy of whichever row was joined when the
 * CSV was ingested. It goes stale when a later inspection is graded.
 *
 * The latest inspection row is often ungraded: a first visit scoring 14 or
 * more does not receive a letter yet, so `grade` is blank while `score` is
 * set. The grade to display is the newest row that actually has a grade code.
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

export interface GradeChange {
  id: number
  fromGrade: string | null
  toGrade: string | null
  score: number | null
  inspectionDate: string
  camis: string
  matchedBy: "address" | "name"
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

function streetToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\b(boulevard|blvd)\b/g, "blvd")
    .replace(/\b(avenue|ave)\b/g, "ave")
    .replace(/\b(street|st)\b/g, "st")
    .replace(/\b(road|rd)\b/g, "rd")
    .replace(/\b(place|pl)\b/g, "pl")
    .replace(/\b(drive|dr)\b/g, "dr")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** "33-07 Ditmars Blvd, Queens, NY 11105" → "33-07|ditmars blvd|11105" */
export function addressKeyFromListing(address: string | null | undefined): string | null {
  if (!address) return null
  const zip = address.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1]
  const building = address.trim().match(/^(\d+[\w-]*)/)?.[1]?.toLowerCase()
  const street = address.split(",")[0]?.replace(/^(\d+[\w-]*)\s*/, "")
  if (!building || !street || !zip) return null
  const normalized = streetToken(street)
  if (!normalized) return null
  return `${building}|${normalized}|${zip}`
}

export function addressKeyFromDohmh(row: Pick<DohmhInspection, "building" | "street" | "zip">): string | null {
  if (!row.building || !row.street || !row.zip) return null
  const building = row.building.trim().toLowerCase().replace(/\s+/g, "")
  const street = streetToken(row.street)
  const zip = row.zip.match(/\d{5}/)?.[0]
  if (!building || !street || !zip) return null
  return `${building}|${street}|${zip}`
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

export function matchLatestGrades(
  restaurants: Array<RestaurantGradeTarget & { inspection_grade: string | null }>,
  snapshots: GradeSnapshot[]
): { changes: GradeChange[]; matched: number; unmatched: number } {
  const byAddress = new Map<string, GradeSnapshot[]>()
  const byName = new Map<string, GradeSnapshot[]>()
  for (const snapshot of snapshots) {
    if (snapshot.addressKey) {
      const list = byAddress.get(snapshot.addressKey) ?? []
      list.push(snapshot)
      byAddress.set(snapshot.addressKey, list)
    }
    const borough = snapshot.borough
    if (borough) {
      const key = `${normalizePlaceName(snapshot.name)}|${borough}`
      const list = byName.get(key) ?? []
      list.push(snapshot)
      byName.set(key, list)
    }
  }

  const changes: GradeChange[] = []
  let matched = 0
  let unmatched = 0

  for (const restaurant of restaurants) {
    const addressKey = addressKeyFromListing(restaurant.address)
    const addressHits = addressKey ? byAddress.get(addressKey) ?? [] : []
    const borough = normalizeBorough(restaurant.borough)
    const nameHits = borough
      ? byName.get(`${normalizePlaceName(restaurant.name)}|${borough}`) ?? []
      : []

    let chosen: GradeSnapshot | undefined
    let matchedBy: "address" | "name" | undefined
    if (addressHits.length === 1) {
      chosen = addressHits[0]
      matchedBy = "address"
    } else if (nameHits.length === 1) {
      chosen = nameHits[0]
      matchedBy = "name"
    } else if (addressHits.length > 1 && nameHits.length === 1) {
      chosen = nameHits[0]
      matchedBy = "name"
    }

    if (!chosen || !matchedBy) {
      unmatched += 1
      continue
    }
    matched += 1
    const toGrade = toStoredGrade(chosen.grade)
    if ((restaurant.inspection_grade ?? null) === toGrade) continue
    changes.push({
      id: restaurant.id,
      fromGrade: restaurant.inspection_grade,
      toGrade,
      score: chosen.score,
      inspectionDate: toStoredDate(chosen.inspectionDate),
      camis: chosen.camis,
      matchedBy,
    })
  }

  return { changes, matched, unmatched }
}
