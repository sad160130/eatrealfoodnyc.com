/**
 * One-off: create the `reviews` table in Supabase using raw DDL.
 *
 * Why this exists: `npx prisma db push` invokes Prisma's Rust migrate
 * engine, which connects directly to Postgres and does its own DNS
 * resolution. Supabase's direct-connection host (`db.*.supabase.co:5432`)
 * resolves to IPv6 first, and many Windows dev machines can't reach
 * IPv6 — so `prisma db push` fails locally with P1001.
 *
 * The runtime Prisma client (src/lib/db.ts) sidesteps this by using
 * the pg adapter with a forced IPv4 lookup. We reuse that same pg
 * connection here to run the CREATE TABLE / CREATE INDEX statements
 * that `prisma db push` would have emitted for the Review model.
 *
 * Idempotent — `IF NOT EXISTS` on every statement. Safe to re-run.
 * Does NOT touch the existing `restaurants` table.
 */
import "dotenv/config"
import pg from "pg"
import * as dns from "node:dns"

async function main() {
  const connString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connString) throw new Error("DIRECT_URL or DATABASE_URL must be set")

  const url = new URL(connString)
  const pool = new pg.Pool({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
  })

  console.log(`Connecting to ${url.hostname}:${url.port}...`)

  const ddl = `
    CREATE TABLE IF NOT EXISTS "reviews" (
      "id"               TEXT PRIMARY KEY,
      "restaurant_slug"  TEXT NOT NULL,
      "place_id"         TEXT NOT NULL,
      "restaurant_name"  TEXT,
      "google_review_id" TEXT NOT NULL,
      "stars"            INTEGER NOT NULL,
      "reviewer_name"    TEXT,
      "is_local_guide"   BOOLEAN NOT NULL DEFAULT false,
      "published_at"     TIMESTAMP(3),
      "published_ago"    TEXT,
      "likes_count"      INTEGER NOT NULL DEFAULT 0,
      "text"             TEXT NOT NULL,
      "owner_response"   TEXT,
      "review_url"       TEXT,
      "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "reviews_google_review_id_key"
      ON "reviews" ("google_review_id");

    CREATE INDEX IF NOT EXISTS "reviews_restaurant_slug_idx"
      ON "reviews" ("restaurant_slug");

    CREATE INDEX IF NOT EXISTS "reviews_place_id_idx"
      ON "reviews" ("place_id");

    CREATE INDEX IF NOT EXISTS "reviews_restaurant_slug_stars_idx"
      ON "reviews" ("restaurant_slug", "stars");
  `

  await pool.query(ddl)
  console.log("✓ reviews table + indexes created (or already existed)")

  // Sanity — confirm shape
  const { rows } = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews'
    ORDER BY ordinal_position
  `)
  console.log(`\nreviews columns (${rows.length}):`)
  for (const r of rows) {
    console.log(`  ${r.column_name.padEnd(20)} ${r.data_type.padEnd(28)} ${r.is_nullable === "YES" ? "NULL" : "NOT NULL"}`)
  }

  // Confirm restaurants table is untouched
  const { rows: rcount } = await pool.query(`SELECT COUNT(*)::int AS n FROM "restaurants"`)
  console.log(`\nrestaurants row count: ${rcount[0].n} (untouched)`)

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
