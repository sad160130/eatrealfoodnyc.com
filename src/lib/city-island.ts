/**
 * ZIP 10464 is City Island, Bronx. A point-in-polygon pass filed those
 * addresses as Throgs Neck, the neighboring NTA. 10465 stays Throgs Neck.
 * Slugs stay as published. Only the neighborhood label moves.
 */

const CITY_ISLAND_ZIP = /\b10464\b/

export function isCityIslandAddress(
  address: string | null | undefined,
  borough?: string | null
): boolean {
  if (!address || !CITY_ISLAND_ZIP.test(address)) return false
  const boroughName = (borough ?? "").trim().toLowerCase()
  if (boroughName && boroughName !== "bronx") return false
  return true
}

export function correctCityIslandListing<
  T extends {
    address: string
    borough?: string | null
    neighborhood: string | null
    description?: string | null
  },
>(row: T): T {
  if (!isCityIslandAddress(row.address, row.borough ?? null)) return row
  const description = row.description
    ?.replaceAll("Throgs Neck", "City Island")
    .replaceAll("Throggs Neck", "City Island")
  if (row.neighborhood === "City Island" && description === row.description) return row
  return { ...row, neighborhood: "City Island", ...(description !== undefined ? { description } : {}) }
}
