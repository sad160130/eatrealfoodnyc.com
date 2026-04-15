import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import pg from "pg"
import fs from "fs"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
})

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
const FETCH_TIMEOUT = 8000
const CONCURRENCY = 10

interface Restaurant {
  id: number
  slug: string
  name: string
  website: string
}

function absoluteUrl(raw: string, base: string): string | null {
  try {
    return new URL(raw, base).href
  } catch {
    return null
  }
}

function isLikelyUsableImage(url: string): boolean {
  // Filter out tiny icons, tracking pixels, data URIs
  if (url.startsWith("data:")) return false
  const low = url.toLowerCase()
  if (low.endsWith(".svg")) return false
  if (low.includes("pixel") || low.includes("tracking") || low.includes("/1x1")) return false
  if (low.includes("favicon") || low.includes("apple-touch")) return false
  if (low.endsWith(".ico")) return false
  return true
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      signal: controller.signal,
      redirect: "follow",
    })
    return res
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function verifyImageUrl(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      signal: controller.signal,
      redirect: "follow",
    })
    if (!res.ok) return false
    const ct = res.headers.get("content-type") || ""
    return ct.startsWith("image/")
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

function extractCandidates(html: string, baseUrl: string): string[] {
  const candidates: string[] = []

  // og:image (highest priority)
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  if (ogMatch) candidates.push(ogMatch[1])

  // og:image:secure_url
  const ogSecure = html.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i)
  if (ogSecure) candidates.push(ogSecure[1])

  // twitter:image
  const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
  if (twMatch) candidates.push(twMatch[1])

  // Link rel="image_src"
  const linkMatch = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i)
  if (linkMatch) candidates.push(linkMatch[1])

  // Regular img tags — look for larger images (often in hero sections)
  const imgRegex = /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["'][^>]*>/gi
  let match
  const imgs: string[] = []
  while ((match = imgRegex.exec(html)) !== null) {
    imgs.push(match[1])
    if (imgs.length > 10) break
  }
  candidates.push(...imgs)

  // Convert to absolute URLs and filter
  const seen = new Set<string>()
  const abs = candidates
    .map((c) => absoluteUrl(c, baseUrl))
    .filter((u): u is string => u !== null)
    .filter((u) => isLikelyUsableImage(u))
    .filter((u) => {
      if (seen.has(u)) return false
      seen.add(u)
      return true
    })

  return abs
}

async function findPhotoForRestaurant(r: Restaurant): Promise<string | null> {
  const res = await fetchWithTimeout(r.website, FETCH_TIMEOUT)
  if (!res || !res.ok) return null

  const html = await res.text()
  const finalUrl = res.url || r.website
  const candidates = extractCandidates(html, finalUrl)

  // Try candidates in order until one verifies as a real image
  for (const url of candidates.slice(0, 5)) {
    const ok = await verifyImageUrl(url)
    if (ok) return url
  }

  return null
}

async function processBatch(restaurants: Restaurant[]): Promise<Array<{ id: number; slug: string; photo: string | null }>> {
  return Promise.all(
    restaurants.map(async (r) => {
      try {
        const photo = await findPhotoForRestaurant(r)
        return { id: r.id, slug: r.slug, photo }
      } catch {
        return { id: r.id, slug: r.slug, photo: null }
      }
    })
  )
}

async function main() {
  console.log("\n=== REFRESH RESTAURANT PHOTOS FROM WEBSITES ===\n")

  const result = await pool.query<Restaurant>(`
    SELECT id, slug, name, website
    FROM restaurants
    WHERE is_published = true
      AND website IS NOT NULL
      AND website != ''
    ORDER BY reviews DESC NULLS LAST
  `)
  const all = result.rows
  console.log(`Processing ${all.length} published restaurants...\n`)

  const results: Array<{ id: number; slug: string; photo: string | null }> = []
  let success = 0
  let failed = 0

  for (let i = 0; i < all.length; i += CONCURRENCY) {
    const batch = all.slice(i, i + CONCURRENCY)
    const batchResults = await processBatch(batch)

    for (const r of batchResults) {
      results.push(r)
      if (r.photo) {
        success++
        process.stdout.write(".")
      } else {
        failed++
        process.stdout.write("x")
      }
    }

    if ((i + CONCURRENCY) % 100 === 0 || i + CONCURRENCY >= all.length) {
      process.stdout.write(` ${Math.min(i + CONCURRENCY, all.length)}/${all.length}\n`)
    }
  }

  console.log(`\nFetched: ${success} | Failed: ${failed}\n`)

  // Save results for inspection
  fs.writeFileSync("data/refreshed-photos.json", JSON.stringify(results, null, 2))
  console.log("Saved to data/refreshed-photos.json\n")

  // Update database — only set photo where we got a new valid URL
  console.log("Updating database...")
  let updated = 0
  for (const r of results) {
    if (!r.photo) continue
    try {
      await pool.query("UPDATE restaurants SET photo = $1 WHERE id = $2", [r.photo, r.id])
      updated++
    } catch (e) {
      console.error(`  Failed to update ${r.slug}:`, e instanceof Error ? e.message : e)
    }
  }

  console.log(`\nUpdated ${updated} restaurants with new photo URLs.`)
  console.log(`${failed} restaurants kept their existing photo (will use fallback UI).`)

  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
