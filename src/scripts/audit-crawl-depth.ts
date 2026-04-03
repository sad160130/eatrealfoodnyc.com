import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

async function auditCrawlDepth() {
  console.log("\n=== CRAWL DEPTH ANALYSIS ===\n")

  console.log("Expected click depth from homepage:\n")
  const architecture = [
    { depth: 0, type: "Homepage", url: "/" },
    { depth: 1, type: "Borough hub", url: "/nyc/[borough]/healthy-restaurants (x5)" },
    { depth: 1, type: "Diet hub", url: "/healthy-restaurants/[diet] (x12)" },
    { depth: 1, type: "Guides hub", url: "/guides" },
    { depth: 1, type: "Map", url: "/map" },
    { depth: 1, type: "Compare", url: "/nyc/compare" },
    { depth: 1, type: "About/Contact", url: "/about, /contact, /press" },
    { depth: 2, type: "Neighbourhood hub", url: "/nyc/[borough]/[hood]/healthy-restaurants" },
    { depth: 2, type: "Guide article", url: "/guides/[slug] (x10)" },
    { depth: 3, type: "Restaurant listing", url: "/restaurants/[slug] (x1100)" },
  ]
  architecture.forEach(p => {
    const label = p.depth === 0 ? "🏠 0" : p.depth === 1 ? "1️⃣  1" : p.depth === 2 ? "2️⃣  2" : "3️⃣  3"
    console.log(`${label} | ${p.type.padEnd(22)} | ${p.url}`)
  })

  // Check restaurant reachability
  console.log("\n=== RESTAURANT PAGE REACHABILITY ===\n")

  const sample = await pool.query(`
    SELECT slug, name, borough, neighborhood
    FROM restaurants
    WHERE is_published = true
    ORDER BY rating DESC NULLS LAST, reviews DESC NULLS LAST
    LIMIT 10
  `)

  console.log("Top 10 restaurants — hub linkage:")
  for (const r of sample.rows) {
    const boroughSlug = r.borough ? r.borough.toLowerCase().replace(/ /g, "-") : null
    const hoodSlug = r.neighborhood ? r.neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, "-") : null
    const hub = boroughSlug && hoodSlug
      ? `/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`
      : boroughSlug
      ? `/nyc/${boroughSlug}/healthy-restaurants`
      : null
    const status = hub ? "✅" : "❌ ORPHAN"
    console.log(`  ${status} ${r.name} → /restaurants/${r.slug}`)
    console.log(`       Hub: ${hub ?? "NONE — no borough/neighborhood"}`)
  }

  // Orphan risk
  console.log("\n=== ORPHAN RISK ASSESSMENT ===\n")
  const orphanBoth = await pool.query(`SELECT COUNT(*) as c FROM restaurants WHERE is_published = true AND borough IS NULL AND neighborhood IS NULL`)
  const orphanHood = await pool.query(`SELECT COUNT(*) as c FROM restaurants WHERE is_published = true AND neighborhood IS NULL AND borough IS NOT NULL`)
  const orphanBorough = await pool.query(`SELECT COUNT(*) as c FROM restaurants WHERE is_published = true AND borough IS NULL AND neighborhood IS NOT NULL`)
  const total = await pool.query(`SELECT COUNT(*) as c FROM restaurants WHERE is_published = true`)

  console.log(`Total published: ${total.rows[0].c}`)
  console.log(`Missing both borough + neighborhood: ${orphanBoth.rows[0].c}`)
  console.log(`Missing neighborhood only: ${orphanHood.rows[0].c}`)
  console.log(`Missing borough only: ${orphanBorough.rows[0].c}`)

  const orphanTotal = parseInt(orphanBoth.rows[0].c) + parseInt(orphanHood.rows[0].c)
  if (orphanTotal > 0) {
    console.log(`\n❌ ${orphanTotal} restaurants may be orphaned (no neighborhood hub to link from)`)
    // Show some examples
    const examples = await pool.query(`
      SELECT slug, name, borough, neighborhood FROM restaurants 
      WHERE is_published = true AND neighborhood IS NULL
      LIMIT 5
    `)
    examples.rows.forEach(r => console.log(`   - ${r.name} (${r.borough ?? "no borough"}) → /restaurants/${r.slug}`))
  } else {
    console.log("\n✅ All published restaurants have borough + neighborhood for hub linkage")
  }

  await pool.end()
}

auditCrawlDepth().catch(e => { console.error(e); process.exit(1) })
