/**
 * Create the `user_submissions` table used by POST /api/submit-experience.
 *
 * Dry-run by default. This only reads information_schema and prints the DDL.
 * Pass --apply to create the table. The statements are idempotent
 * (IF NOT EXISTS). Does not modify `restaurants` or `reviews`.
 *
 *   npx tsx src/scripts/create-user-submissions-table.ts
 *   npx tsx src/scripts/create-user-submissions-table.ts --apply
 *
 * Uses DIRECT_URL (session / port 5432) when set, because pooled PgBouncer
 * connections reject some DDL. Falls back to DATABASE_URL.
 */
import "dotenv/config"
import pg from "pg"
import dns from "node:dns"
import { config } from "dotenv"
import { existsSync } from "node:fs"

if (existsSync(".env.local")) config({ path: ".env.local", override: true })

function ipv4Lookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
) {
  dns.lookup(hostname, { ...options, family: 4 }, callback)
}

/**
 * Supabase's direct host (db.*.supabase.co) is often IPv6-only. Prefer it
 * when it connects, otherwise use the pooler in session mode (port 5432),
 * which accepts DDL. Port 6543 is transaction mode and is a last resort.
 */
function connectionCandidates(): string[] {
  const direct = process.env.DIRECT_URL
  const pooled = process.env.DATABASE_URL
  const candidates: string[] = []
  if (direct) candidates.push(direct)
  if (pooled) {
    try {
      const session = new URL(pooled)
      session.port = "5432"
      candidates.push(session.toString())
    } catch {
      // ignore a malformed URL and fall through
    }
    candidates.push(pooled)
  }
  return candidates
}

async function connect(): Promise<pg.Pool> {
  const candidates = connectionCandidates()
  if (candidates.length === 0) {
    throw new Error("DIRECT_URL or DATABASE_URL must be set")
  }
  let lastError: unknown
  for (const connectionString of candidates) {
    const pool = new pg.Pool({
      connectionString,
      max: 1,
      ssl: { rejectUnauthorized: false },
      lookup: ipv4Lookup,
    })
    try {
      await pool.query("SELECT 1")
      return pool
    } catch (error) {
      lastError = error
      await pool.end().catch(() => undefined)
    }
  }
  throw lastError
}

const DDL = `
CREATE TABLE IF NOT EXISTS "user_submissions" (
    "id" SERIAL NOT NULL,
    "restaurant_slug" TEXT NOT NULL,
    "restaurant_name" TEXT NOT NULL DEFAULT '',
    "submission_type" TEXT NOT NULL DEFAULT 'experience',
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_submissions_restaurant_slug_idx"
  ON "user_submissions"("restaurant_slug");

CREATE INDEX IF NOT EXISTS "user_submissions_status_idx"
  ON "user_submissions"("status");
`

async function main() {
  const apply = process.argv.includes("--apply")
  const pool = await connect()

  const existing = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'user_submissions'
     ) AS exists`
  )
  const alreadyThere = existing.rows[0]?.exists === true
  console.log(alreadyThere ? "user_submissions already exists." : "user_submissions does not exist.")

  if (!apply) {
    console.log("\nDry run. No changes written. Re-run with --apply to create the table.\n")
    console.log(DDL.trim())
    await pool.end()
    return
  }

  await pool.query(DDL)
  const columns = await pool.query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_submissions'
     ORDER BY ordinal_position`
  )
  console.log("\nApplied. Columns:")
  for (const column of columns.rows) {
    console.log(`  ${column.column_name.padEnd(20)} ${column.data_type}`)
  }
  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
