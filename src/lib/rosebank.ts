/**
 * 10305 Bay Street is Rosebank, Staten Island. ZIP 10305 is Rosebank;
 * 10304 is Stapleton. A point-in-polygon pass filed the whole Bay Street
 * run as Stapleton, including Rosebank Pizza at 1372 Bay Street.
 * Slugs stay as published. Only the neighborhood label moves.
 */

const BAY_STREET = /\bbay\s+st(?:reet)?\b/i

export function isRosebankBayStreet(
  address: string | null | undefined,
  borough?: string | null
): boolean {
  if (!address || !address.includes("10305")) return false
  if (!BAY_STREET.test(address)) return false
  const boroughName = (borough ?? "").trim().toLowerCase()
  if (boroughName && boroughName !== "staten island") return false
  if (!boroughName && !/staten island/i.test(address)) return false
  return true
}

export function correctRosebankListing<
  T extends {
    address: string
    borough?: string | null
    neighborhood: string | null
    description?: string | null
  },
>(row: T): T {
  if (!isRosebankBayStreet(row.address, row.borough ?? null)) return row
  const description =
    row.description && row.description.includes("Stapleton")
      ? row.description.replaceAll("Stapleton", "Rosebank")
      : row.description
  if (row.neighborhood === "Rosebank" && description === row.description) return row
  return { ...row, neighborhood: "Rosebank", ...(description !== undefined ? { description } : {}) }
}
