import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { isPartnerStatus, type PartnerStatus } from "@/lib/partner-status"

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
  if (unique.length === 0 || !(await partnerColumnExists())) return statuses

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
