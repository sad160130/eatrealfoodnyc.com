/**
 * Find published restaurants that fail the directory rules in
 * src/config/publishable-types.ts, print a report, and optionally unpublish them.
 *
 * Dry-run by default. Nothing is written unless --apply is passed.
 * Unpublished pages already 404 (the restaurant route calls notFound() when
 * is_published is false) and the sitemap only includes is_published rows.
 * After --apply, the next production deploy drops those URLs.
 *
 *   npx tsx src/scripts/unpublish-ineligible.ts
 *   npx tsx src/scripts/unpublish-ineligible.ts --apply
 *
 * Review the dry-run report before --apply. Chain patterns can match an
 * independent business that shares a name. Edit CHAIN_BLOCK_PATTERNS first
 * if a row should stay.
 */
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }
import { ineligibilityReasons } from "../config/publishable-types"

async function main() {
  const apply = process.argv.includes("--apply")
  const rows = await prisma.restaurant.findMany({
    where: { is_published: true },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      borough: true,
      neighborhood: true,
    },
    orderBy: [{ borough: "asc" }, { name: "asc" }],
  })

  const flagged = rows
    .map((row) => ({ row, reasons: ineligibilityReasons(row) }))
    .filter((entry) => entry.reasons.length > 0)

  const byCode = new Map<string, number>()
  for (const entry of flagged) {
    for (const reason of entry.reasons) {
      const key = `${reason.code}: ${reason.detail}`
      byCode.set(key, (byCode.get(key) ?? 0) + 1)
    }
  }

  console.log(`Published rows scanned: ${rows.length}`)
  console.log(`Ineligible: ${flagged.length}`)
  console.log(apply ? "Mode: APPLY — is_published will be set to false" : "Mode: dry run — no rows will be changed")
  console.log("\nReasons:")
  for (const [key, count] of [...byCode.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${key}`)
  }
  console.log("\nCandidates:")
  for (const entry of flagged) {
    const why = entry.reasons.map((reason) => `${reason.code}: ${reason.detail}`).join("; ")
    console.log(`  ${entry.row.slug} | ${entry.row.name} | ${entry.row.type ?? "—"} | ${why}`)
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to unpublish these rows.")
    await prisma.$disconnect()
    return
  }

  const ids = flagged.map((entry) => entry.row.id)
  if (ids.length === 0) {
    console.log("\nNothing to unpublish.")
    await prisma.$disconnect()
    return
  }

  const result = await prisma.restaurant.updateMany({
    where: { id: { in: ids }, is_published: true },
    data: { is_published: false },
  })
  console.log(`\nUnpublished ${result.count} rows.`)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
