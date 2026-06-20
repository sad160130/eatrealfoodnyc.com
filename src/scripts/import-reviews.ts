/**
 * Idempotent CSV import for Google reviews.
 *
 * Reads data/reviews_flat_for_db.csv (7,425 rows × 495 restaurants) and
 * upserts into the `reviews` table keyed by google_review_id. Safe to
 * re-run — re-runs update mutable fields (text, owner_response, likes_count)
 * but never duplicate-insert.
 *
 * Run with: npx tsx src/scripts/import-reviews.ts
 *
 * Prereq: `reviews` table must already exist (via `prisma db push` or
 * `src/scripts/create-reviews-table.ts`).
 */
// MUST come before any import that touches process.env (i.e. ../lib/db).
// tsx doesn't auto-load .env, so without this the Prisma client picks up
// whatever DATABASE_URL the shell happens to have (often nothing).
import "dotenv/config"

import { prisma } from "../lib/db"
import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"

// Accept the CSV path as a CLI arg so the script can be pointed at any
// batch file. Falls back to the original batch-1 default when no arg is
// given. Idempotent upsert by google_review_id means batches can be
// re-run without duplicating rows.
const CSV_PATH = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(process.cwd(), "data", "reviews_flat_for_db.csv")

console.log(`Importing from: ${CSV_PATH}`)

interface CsvRow {
  slug: string
  restaurant: string
  place_id: string
  reviewId: string
  stars: string
  reviewer: string
  isLocalGuide: string
  publishedAtDate: string
  publishedAgo: string
  likesCount: string
  text: string
  ownerResponse: string
  reviewUrl: string
}

async function importReviews() {
  console.log(`Reading CSV from ${CSV_PATH}...`)
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(
      `CSV not found at ${CSV_PATH}. Drop reviews_flat_for_db.csv into data/ and re-run.`
    )
  }
  const raw = fs.readFileSync(CSV_PATH, "utf-8")

  const records: CsvRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: false,
  })

  console.log(`Parsed ${records.length} review rows from CSV`)

  let inserted = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  const BATCH = 100
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)

    await Promise.all(
      batch.map(async (row) => {
        try {
          // Skip rows missing the unique key or required body
          if (!row.reviewId?.trim() || !row.text?.trim()) {
            skipped++
            return
          }

          const stars = parseInt(row.stars, 10)
          if (isNaN(stars) || stars < 1 || stars > 5) {
            skipped++
            return
          }

          let publishedAt: Date | null = null
          if (row.publishedAtDate?.trim()) {
            const d = new Date(row.publishedAtDate)
            if (!isNaN(d.getTime())) publishedAt = d
          }

          const data = {
            restaurant_slug: row.slug?.trim() || "",
            place_id: row.place_id?.trim() || "",
            restaurant_name: row.restaurant?.trim() || null,
            stars,
            reviewer_name: row.reviewer?.trim() || null,
            is_local_guide: row.isLocalGuide?.trim().toLowerCase() === "true",
            published_at: publishedAt,
            published_ago: row.publishedAgo?.trim() || null,
            likes_count: parseInt(row.likesCount, 10) || 0,
            text: row.text.trim(),
            owner_response: row.ownerResponse?.trim() || null,
            review_url: row.reviewUrl?.trim() || null,
          }

          const existing = await prisma.review.findUnique({
            where: { google_review_id: row.reviewId.trim() },
          })

          if (existing) {
            await prisma.review.update({
              where: { google_review_id: row.reviewId.trim() },
              data,
            })
            updated++
          } else {
            await prisma.review.create({
              data: { ...data, google_review_id: row.reviewId.trim() },
            })
            inserted++
          }
        } catch (err) {
          errors++
          console.error(
            `Error on review ${row.reviewId}:`,
            err instanceof Error ? err.message : err
          )
        }
      })
    )

    if ((i + BATCH) % 1000 < BATCH) {
      console.log(`  Processed ${Math.min(i + BATCH, records.length)} / ${records.length}...`)
    }
  }

  console.log("\n=== IMPORT COMPLETE ===")
  console.log(`Inserted: ${inserted}`)
  console.log(`Updated:  ${updated}`)
  console.log(`Skipped:  ${skipped}`)
  console.log(`Errors:   ${errors}`)
  console.log(`Total in CSV: ${records.length}`)

  // Verify
  const totalInDb = await prisma.review.count()
  const uniqueRestaurants = await prisma.review.findMany({
    distinct: ["restaurant_slug"],
    select: { restaurant_slug: true },
  })
  console.log(`\nTotal reviews now in DB: ${totalInDb}`)
  console.log(`Unique restaurants with reviews: ${uniqueRestaurants.length}`)

  await prisma.$disconnect()
}

importReviews().catch((e) => {
  console.error(e)
  process.exit(1)
})
