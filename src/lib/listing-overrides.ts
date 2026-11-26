import { closedSlugs } from "@/config/listing-overrides"

const PUBLIC_READS = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "count",
  "aggregate",
  "groupBy",
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Public listing queries already ask for published or operational rows. */
export function isPublicListingWhere(where: unknown): boolean {
  if (!isRecord(where)) return false
  if (where.is_published === true) return true
  if (where.business_status === "OPERATIONAL") return true
  return false
}

/**
 * Keep permanently closed overrides out of published/operational reads.
 * Unique lookups (the listing page) are unchanged; those URLs 301.
 * A full-dataset script query with no published filter still sees the row.
 */
export function withClosedListingsExcluded<T>(operation: string, args: T): T {
  const slugs = closedSlugs()
  if (slugs.length === 0 || !PUBLIC_READS.has(operation) || !isRecord(args)) return args
  const where = args.where
  if (!isPublicListingWhere(where)) return args
  const current = isRecord(where) ? where : {}
  const and = current.AND
  const parts = Array.isArray(and) ? and : and ? [and] : []
  return {
    ...args,
    where: {
      ...current,
      AND: [...parts, { slug: { notIn: slugs } }],
    },
  }
}
