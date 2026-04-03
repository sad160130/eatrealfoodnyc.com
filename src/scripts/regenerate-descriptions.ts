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
  price_range: string | null
}

async function generateDescription(r: Restaurant): Promise<string> {
  const location = [r.neighborhood, r.borough].filter(Boolean).join(", ")
  const tags = r.dietary_tags ? r.dietary_tags.split(",").map((t: string) => t.trim()).join(", ") : "none listed"
  const grade = r.inspection_grade ? `Grade ${r.inspection_grade}` : "pending inspection"
  const rating = r.rating ? `${r.rating}/5 from ${(r.reviews ?? 0).toLocaleString()} reviews` : "no rating yet"

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Write a unique 1-sentence description (80-120 characters) for this NYC restaurant listing. Be specific to the location and features. No quotes, no hype words like "best" or "amazing". Factual and concise.

Name: ${r.name}
Type: ${r.type || "Restaurant"}
Location: ${location || "NYC"}
Rating: ${rating}
Health Grade: ${grade}
Dietary options: ${tags}
Original (duplicate) description: ${r.description}

Return ONLY the description text, nothing else.`,
      },
    ],
  })

  const text = response.content[0]
  if (text.type === "text") return text.text.trim()
  throw new Error("Unexpected response type")
}

async function main() {
  const data: Restaurant[] = JSON.parse(
    fs.readFileSync("data/duplicate-desc-restaurants.json", "utf-8")
  )

  console.log(`\nRegenerating descriptions for ${data.length} restaurants...\n`)

  const results: { id: number; slug: string; oldDesc: string; newDesc: string }[] = []
  const errors: { id: number; slug: string; error: string }[] = []

  // Process in batches of 5 to respect rate limits
  const BATCH_SIZE = 5
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map(async (r) => {
        const newDesc = await generateDescription(r)
        return { id: r.id, slug: r.slug, oldDesc: r.description, newDesc }
      })
    )

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value)
        process.stdout.write(".")
      } else {
        const r = batch[batchResults.indexOf(result)]
        errors.push({ id: r.id, slug: r.slug, error: result.reason?.message || "Unknown" })
        process.stdout.write("x")
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < data.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log(`\n\nGenerated: ${results.length} | Errors: ${errors.length}\n`)

  // Save results for review before applying
  fs.writeFileSync(
    "data/new-descriptions.json",
    JSON.stringify(results, null, 2)
  )
  console.log("Saved to data/new-descriptions.json for review.\n")

  if (errors.length > 0) {
    console.log("Errors:")
    errors.forEach((e) => console.log(`  ${e.slug}: ${e.error}`))
  }

  // Apply to database
  console.log("\nApplying to database...")
  let applied = 0
  for (const r of results) {
    try {
      await pool.query("UPDATE restaurants SET description = $1 WHERE id = $2", [
        r.newDesc,
        r.id,
      ])
      applied++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      console.error(`  Failed to update ${r.slug}: ${msg}`)
    }
  }

  console.log(`\nDone! Updated ${applied}/${results.length} restaurant descriptions.`)
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
