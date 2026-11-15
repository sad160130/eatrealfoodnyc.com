/**
 * A row is inside the directory only when the state is New York, the
 * borough is one of the five, and the ZIP on the address is a New York
 * City ZIP. Borough labels alone are not enough: Nassau and Westchester
 * rows are often stored as Queens or the Bronx.
 *
 * ZIP ranges follow USPS / NYC Department of City Planning. 11004 and
 * 11005 are Queens (Glen Oaks and the Queens side of Floral Park).
 * 11001, 11003, 11010, 11020–11050, and 11096 are Nassau. 105xx and
 * 108xx are Westchester. 115xx is Nassau.
 */

export const NYC_BOROUGHS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
] as const

export type NycBorough = (typeof NYC_BOROUGHS)[number]

export interface NycLocation {
  state: string | null
  borough: string | null
  address: string
}

export function parseAddressZip(address: string): string | null {
  const matches = address.match(/\b(\d{5})(?:-\d{4})?\b/g)
  if (!matches || matches.length === 0) return null
  return matches[matches.length - 1].slice(0, 5)
}

export function isNewYorkState(state: string | null | undefined): boolean {
  const value = (state ?? "").trim().toLowerCase()
  return value === "ny" || value === "new york"
}

export function isNycBorough(borough: string | null | undefined): borough is string {
  const value = (borough ?? "").trim().toLowerCase()
  return NYC_BOROUGHS.some((name) => name.toLowerCase() === value)
}

/** True when the ZIP is inside one of the five boroughs. */
export function isNycZip(zip: string): boolean {
  const n = Number(zip)
  if (!Number.isInteger(n)) return false
  if (n >= 10001 && n <= 10282) return true
  if (n >= 10301 && n <= 10314) return true
  if (n >= 10451 && n <= 10475) return true
  if (n >= 11004 && n <= 11005) return true
  if (n >= 11101 && n <= 11109) return true
  if (n >= 11201 && n <= 11256) return true
  if (n >= 11351 && n <= 11436) return true
  if (n >= 11691 && n <= 11697) return true
  return false
}

/**
 * Returns a short reason when the row is outside the five boroughs.
 * Returns null when it passes the allowlist.
 */
export function outsideFiveBoroughs(row: NycLocation): string | null {
  const state = (row.state ?? "").trim()
  const borough = (row.borough ?? "").trim()
  if (!isNewYorkState(state)) {
    return `state is ${state || "blank"}`
  }
  if (!isNycBorough(borough)) {
    return `borough is ${borough || "blank"}`
  }
  const zip = parseAddressZip(row.address)
  if (!zip) return "address has no ZIP code"
  if (!isNycZip(zip)) return `ZIP ${zip} is outside the five boroughs`
  return null
}
