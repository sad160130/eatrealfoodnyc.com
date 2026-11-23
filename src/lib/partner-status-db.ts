import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { isPartnerStatus, type PartnerStatus } from "@/lib/partner-status"
import { isTransientConnectionError } from "@/lib/connection-retry"
import { restSelect, shortenRevalidate } from "@/lib/db-fallback"

const REST_SLUG_CHUNK = 80

/** PostgREST in-list literal: in.("a","b") with quotes and backslashes escaped. */
export function restInList(values: string[]): string {
  return `in.(${values.map((value) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")})`
}

/** Partner labels through the Supabase HTTP API when Postgres is out of connections. */
async function restPartnerStatuses(slugs: string[]): Promise<Map<string, PartnerStatus>> {
  const statuses = new Map<string, PartnerStatus>()
  try {
    for (let i = 0; i < slugs.length; i += REST_SLUG_CHUNK) {
      const chunk = slugs.slice(i, i + REST_SLUG_CHUNK)
      const rows = await restSelect<{ slug: string; partner_status: string | null }>(
        `restaurants?select=slug,partner_status&slug=${encodeURIComponent(restInList(chunk))}`
      )
      for (const row of rows) {
        if (isPartnerStatus(row.partner_status)) statuses.set(row.slug, row.partner_status)
      }
    }
  } catch (error) {
    // Missing column or HTTP failure: render without partner labels.
    const name = error instanceof Error ? error.name : "Error"
    console.error(`[db-degraded] partner status REST fallback failed (${name})`)
  }
  await shortenRevalidate()
  return statuses
}

/**
 * Process-local. A build that runs before the partner_status migration
 * checks information_schema once, then skips the column. After the column
 * exists, a new process sees it.
 */
let partnerColumn: "unknown" | "present" | "missing" = "unknown"

async function partnerColumnExists(): Promise<boolean> {
  if (partnerColumn === "present") return true
  if (partnerColumn === "missing") return false
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'restaurants'
        AND column_name = 'partner_status'
    ) AS exists
  `
  partnerColumn = rows[0]?.exists ? "present" : "missing"
  return partnerColumn === "present"
}

/** Slugs whose partner_status is partner or sponsored. Missing column yields an empty map. */
export async function loadPartnerStatuses(slugs: string[]): Promise<Map<string, PartnerStatus>> {
  const unique = [...new Set(slugs.filter(Boolean))]
  const statuses = new Map<string, PartnerStatus>()
  if (unique.length === 0) return statuses
  try {
    if (!(await partnerColumnExists())) return statuses
    return await queryPartnerStatuses(unique)
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error
    return restPartnerStatuses(unique)
  }
}

async function queryPartnerStatuses(unique: string[]): Promise<Map<string, PartnerStatus>> {
  const statuses = new Map<string, PartnerStatus>()
  const rows = await prisma.$queryRaw<Array<{ slug: string; partner_status: string | null }>>(
    Prisma.sql`
      SELECT slug, partner_status::text AS partner_status
      FROM restaurants
      WHERE slug IN (${Prisma.join(unique)})
    `
  )
  for (const row of rows) {
    if (isPartnerStatus(row.partner_status)) statuses.set(row.slug, row.partner_status)
  }
  return statuses
}

export async function withPartnerStatus<T extends { slug: string }>(rows: T[]) {
  const statuses = await loadPartnerStatuses(rows.map((row) => row.slug))
  return rows.map((row) => ({
    ...row,
    partner_status: statuses.get(row.slug) ?? null,
  }))
}
