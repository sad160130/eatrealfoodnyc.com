import Anthropic from "@anthropic-ai/sdk"
import pg from "pg"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
})

interface Restaurant {
  id: number
  slug: string
  name: string
  description: string
  neighborhood: string | null
  borough: string | null
  rating: number | null
  reviews: number | null
  dietary_tags: string | null
  inspection_grade: string | null
  type: string | null
}

// Vary the prompt style for each batch to break patterns
const PROMPT_STYLES = [
  // Style 1: Lead with vibe/atmosphere
  (r: Restaurant) => `Write a short restaurant description (1 sentence, 70-100 chars) that leads with the VIBE or ATMOSPHERE of the place. Example style: "Cozy Astoria bakery with warm lighting, traditional pastries, and strong espresso." Do not use the word "offering" or "featuring". No hype words.

${restaurantContext(r)}

Return ONLY the description.`,

  // Style 2: Lead with what makes it distinctive
  (r: Restaurant) => `Write a punchy restaurant blurb (1 sentence, 80-110 chars). Start with what makes this place DIFFERENT from other ${r.type || "restaurant"}s. Use a specific detail, not a generic list. Avoid "offering", "featuring", "serving". Keep it factual.

${restaurantContext(r)}

Return ONLY the description.`,

  // Style 3: Lead with location context
  (r: Restaurant) => `Write a terse restaurant description (1 sentence, 60-90 chars). Start with a neighborhood-specific detail. Think local newspaper listing, not marketing copy. Example: "No-frills Flushing spot with hand-pulled noodles and long weekend lines."

${restaurantContext(r)}

Return ONLY the description.`,

  // Style 4: Fragment style — more human
  (r: Restaurant) => `Write a restaurant description in a slightly casual, fragmented style (70-100 chars). Can use dashes or semicolons. Example: "Old-school Brooklyn diner — pancakes, eggs, counter seats since 1972." Keep it real, no corporate voice.

${restaurantContext(r)}

Return ONLY the description.`,

  // Style 5: Data-forward
  (r: Restaurant) => `Write a fact-focused restaurant description (80-120 chars). Lead with a concrete number or data point (rating, review count, grade, year). Example: "4.7-star Crown Heights comfort food spot with 6,900+ reviews and a clean Grade A." Avoid "offering" and "featuring".

${restaurantContext(r)}

Return ONLY the description.`,
]

function restaurantContext(r: Restaurant): string {
  const location = [r.neighborhood, r.borough].filter(Boolean).join(", ")
  const tags = r.dietary_tags ? r.dietary_tags.split(",").map((t: string) => t.trim()).join(", ") : "none"
  const grade = r.inspection_grade ? `Grade ${r.inspection_grade}` : "pending"
  const rating = r.rating ? `${r.rating}/5 (${(r.reviews ?? 0).toLocaleString()} reviews)` : "unrated"

  return `Name: ${r.name}
Type: ${r.type || "Restaurant"}
Location: ${location || "NYC"}
Rating: ${rating}
Health grade: ${grade}
Diet tags: ${tags}
Current description: ${r.description}`
}

async function generateDescription(r: Restaurant, styleIndex: number): Promise<string> {
  const promptFn = PROMPT_STYLES[styleIndex % PROMPT_STYLES.length]
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{ role: "user", content: promptFn(r) }],
  })
  const text = response.content[0]
  if (text.type === "text") return text.text.trim().replace(/^["']|["']$/g, "")
  throw new Error("Unexpected response")
}

async function main() {
  // Get the 187 restaurants that were previously regenerated (they have the pattern)
  const data = JSON.parse(fs.readFileSync("data/duplicate-desc-restaurants.json", "utf-8"))
  const ids = data.map((r: Restaurant) => r.id)

  // Fetch current descriptions from DB
  const result = await pool.query(
    `SELECT id, slug, name, description, neighborhood, borough, rating, reviews, dietary_tags, inspection_grade, type
     FROM restaurants WHERE id = ANY($1)`,
    [ids]
  )

  const restaurants: Restaurant[] = result.rows
  console.log(`\nDiversifying ${restaurants.length} descriptions with 5 rotating styles...\n`)

  const results: { id: number; slug: string; oldDesc: string; newDesc: string }[] = []
  let errors = 0

  const BATCH_SIZE = 5
  for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
    const batch = restaurants.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map((r, j) => generateDescription(r, i + j).then(newDesc => ({
        id: r.id, slug: r.slug, oldDesc: r.description, newDesc,
      })))
    )

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value)
        process.stdout.write(".")
      } else {
        errors++
        process.stdout.write("x")
      }
    }

    if (i + BATCH_SIZE < restaurants.length) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  console.log(`\n\nGenerated: ${results.length} | Errors: ${errors}\n`)

  // Save for review
  fs.writeFileSync("data/diversified-descriptions.json", JSON.stringify(results, null, 2))

  // Verify diversity — check opening word distribution
  const openers: Record<string, number> = {}
  results.forEach(r => {
    const firstWord = r.newDesc.split(/\s/)[0].toLowerCase()
    openers[firstWord] = (openers[firstWord] || 0) + 1
  })
  const sorted = Object.entries(openers).sort((a, b) => b[1] - a[1])
  console.log("Opening word distribution (top 10):")
  sorted.slice(0, 10).forEach(([word, count]) => {
    console.log(`  ${word}: ${count} (${Math.round(count / results.length * 100)}%)`)
  })

  // Check length distribution
  const lengths = results.map(r => r.newDesc.length)
  const avgLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
  const minLen = Math.min(...lengths)
  const maxLen = Math.max(...lengths)
  console.log(`\nLength: avg=${avgLen}, min=${minLen}, max=${maxLen}`)

  // Apply to database
  console.log("\nApplying to database...")
  let applied = 0
  for (const r of results) {
    try {
      await pool.query("UPDATE restaurants SET description = $1 WHERE id = $2", [r.newDesc, r.id])
      applied++
    } catch {
      console.error(`  Failed: ${r.slug}`)
    }
  }

  console.log(`Done! Updated ${applied}/${results.length} descriptions.`)
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
