export interface DohmhRecord {
  camis: string
  name: string
  borough: string | null
  grade: "A" | "B" | "C"
  score: number | null
  gradeDate: string
  latitude: number | null
  longitude: number | null
}

export interface RestaurantMatchTarget {
  id: number
  name: string
  borough: string | null
  latitude: number | null
  longitude: number | null
}

export interface GradeUpdate {
  id: number
  grade: "A" | "B" | "C"
  score: number | null
  gradeDate: string
  camis: string
}

const BOROUGH_ALIASES: Record<string, string> = {
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
  return BOROUGH_ALIASES[value.trim().toLowerCase()] ?? null
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

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Keep the newest grade_date per CAMIS. Input order does not matter. */
export function latestGradePerCamis(records: DohmhRecord[]): DohmhRecord[] {
  const byCamis = new Map<string, DohmhRecord>()
  for (const record of records) {
    const current = byCamis.get(record.camis)
    if (!current || record.gradeDate > current.gradeDate) byCamis.set(record.camis, record)
  }
  return [...byCamis.values()]
}

const MATCH_RADIUS_METERS = 150

/**
 * Match a restaurant to one DOHMH establishment by normalized name + borough.
 * When several CAMIS rows share that key, pick the one within 150 meters.
 * Ambiguous or unmatched rows are skipped.
 */
export function matchInspections(
  restaurants: RestaurantMatchTarget[],
  records: DohmhRecord[]
): { updates: GradeUpdate[]; matched: number; ambiguous: number; unmatched: number } {
  const index = new Map<string, DohmhRecord[]>()
  for (const record of latestGradePerCamis(records)) {
    const borough = normalizeBorough(record.borough)
    if (!borough) continue
    const key = `${normalizePlaceName(record.name)}|${borough}`
    const list = index.get(key) ?? []
    list.push(record)
    index.set(key, list)
  }

  const updates: GradeUpdate[] = []
  let ambiguous = 0
  let unmatched = 0

  for (const restaurant of restaurants) {
    const borough = normalizeBorough(restaurant.borough)
    if (!borough) {
      unmatched += 1
      continue
    }
    const candidates = index.get(`${normalizePlaceName(restaurant.name)}|${borough}`) ?? []
    if (candidates.length === 0) {
      unmatched += 1
      continue
    }
    let chosen = candidates[0]
    if (candidates.length > 1) {
      if (restaurant.latitude == null || restaurant.longitude == null) {
        ambiguous += 1
        continue
      }
      const ranked = candidates
        .filter((candidate) => candidate.latitude != null && candidate.longitude != null)
        .map((candidate) => ({
          candidate,
          meters: haversineMeters(
            restaurant.latitude!,
            restaurant.longitude!,
            candidate.latitude!,
            candidate.longitude!
          ),
        }))
        .filter((item) => item.meters <= MATCH_RADIUS_METERS)
        .sort((a, b) => a.meters - b.meters)
      if (ranked.length === 0) {
        ambiguous += 1
        continue
      }
      chosen = ranked[0].candidate
    }
    updates.push({
      id: restaurant.id,
      grade: chosen.grade,
      score: chosen.score,
      gradeDate: chosen.gradeDate,
      camis: chosen.camis,
    })
  }

  return { updates, matched: updates.length, ambiguous, unmatched }
}
