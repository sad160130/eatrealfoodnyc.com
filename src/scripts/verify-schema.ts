/** One-off: verify reviews table was created and restaurants is intact. */
import "dotenv/config"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  const reviews = await pool.query(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    ["public", "reviews"]
  )
  console.log(`=== reviews columns (${reviews.rows.length}) ===`)
  for (const r of reviews.rows) {
    console.log(
      `  ${r.column_name.padEnd(20)} ${r.data_type.padEnd(28)} ${r.is_nullable === "YES" ? "NULL" : "NOT NULL"}`
    )
  }

  const reviewsIdx = await pool.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname = $1 AND tablename = $2`,
    ["public", "reviews"]
  )
  console.log(`\n=== reviews indexes (${reviewsIdx.rows.length}) ===`)
  for (const r of reviewsIdx.rows) console.log(`  ${r.indexname}`)

  const rCount = await pool.query(`SELECT COUNT(*)::int AS n FROM restaurants`)
  const sv = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
    ["public", "restaurants", "search_vector"]
  )
  console.log(`\nrestaurants row count: ${rCount.rows[0].n} (must be 8835)`)
  console.log(`restaurants.search_vector preserved: ${sv.rows.length === 1}`)

  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
