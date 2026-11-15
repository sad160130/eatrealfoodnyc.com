/**
 * Gluten-free hub membership is `is_published` AND dietary_tags contains
 * gluten-free. Senza Gluten's three locations already have the tag. They are
 * missing from the hub because is_published is false, not because the tagger
 * dropped them.
 *
 * This script:
 *   1. Adds gluten-free when the name or Google type says so and the tag is absent.
 *   2. Lists unpublished rows that already carry that explicit tag.
 *
 * Dry-run by default.
 *   npx tsx src/scripts/sync-explicit-diet-tags.ts
 *   npx tsx src/scripts/sync-explicit-diet-tags.ts --apply-tags
 *   npx tsx src/scripts/sync-explicit-diet-tags.ts --publish
 *
 * --publish sets is_published on unpublished rows that already have an
 * explicit gluten-free name or type and pass the publish type/name rules.
 * It does not publish a restaurant that merely might offer one gluten-free dish.
 */
import * as path from "path"
import dotenv from "dotenv"
import { withExplicitTags, explicitTagsFor } from "../lib/explicit-diet-tags"
import { isNameBlocked, isPublishableType } from "../config/publishable-types"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

async function main() {
  const applyTags = process.argv.includes("--apply-tags")
  const publish = process.argv.includes("--publish")
  const rows = await prisma.restaurant.findMany({
    select: { id: true, slug: true, name: true, type: true, dietary_tags: true, is_published: true },
  })

  const tagUpdates = rows
    .map((row) => ({ row, next: withExplicitTags(row.dietary_tags, row.name, row.type) }))
    .filter((item) => item.next !== item.row.dietary_tags)

  const unpublishedExplicit = rows.filter(
    (row) => !row.is_published && explicitTagsFor(row.name, row.type).length > 0
  )
  const publishable = unpublishedExplicit.filter(
    (row) => isPublishableType(row.type) && !isNameBlocked(row.name)
  )

  console.log(applyTags || publish ? "Mode: WRITE" : "Mode: dry run — no rows will be changed")
  console.log(`Tag gaps (name or type says gluten-free, tag missing): ${tagUpdates.length}`)
  for (const item of tagUpdates) {
    console.log(`  tag ${item.row.slug}: ${item.row.dietary_tags ?? "—"} -> ${item.next}`)
  }
  console.log(`Unpublished explicit gluten-free rows: ${unpublishedExplicit.length}`)
  console.log(`Of those, eligible to publish: ${publishable.length}`)
  for (const row of publishable) {
    console.log(`  ${row.is_published ? "live" : "unpublished"} ${row.slug} | ${row.name} | ${row.type ?? "—"} | ${row.dietary_tags ?? "—"}`)
  }

  if (!applyTags && !publish) {
    console.log("\nDry run only. --apply-tags writes missing tags. --publish also sets is_published on the eligible rows above.")
    await prisma.$disconnect()
    return
  }

  if (applyTags) {
    for (const item of tagUpdates) {
      await prisma.restaurant.update({ where: { id: item.row.id }, data: { dietary_tags: item.next } })
    }
    console.log(`Updated tags on ${tagUpdates.length} rows.`)
  }
  if (publish) {
    const result = await prisma.restaurant.updateMany({
      where: { id: { in: publishable.map((row) => row.id) }, is_published: false },
      data: { is_published: true },
    })
    console.log(`Published ${result.count} explicit gluten-free rows.`)
  }
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
