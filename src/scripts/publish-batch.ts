/**
 * Publish a quality-gated batch of unpublished restaurants.
 *
 * A row is selected only when every condition holds:
 *   - inside the five boroughs (src/config/nyc-location.ts)
 *   - isDirectoryEligible()
 *   - business_status OPERATIONAL (the directory and sitemap ignore the rest)
 *   - address, description, and photo are non-empty
 *   - at least one of the 12 canonical dietary tags
 *   - DOHMH inspection grade A or B
 *   - not another location of a name that already has a published location
 *
 * Order: review count, then neighborhoods that already have published
 * listings, then dietary tags that already have published listings.
 *
 *   npx tsx src/scripts/publish-batch.ts                 # dry run, limit 400
 *   npx tsx src/scripts/publish-batch.ts --limit 400
 *   npx tsx src/scripts/publish-batch.ts --apply         # write rollback, publish, IndexNow
 *
 * Rollback: data/published-batch-YYYY-MM-DD-N.json
 * Set is_published false for those slugs to undo the batch. Nothing is deleted.
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"
import { DIET_CONFIG } from "../config/dietary-tags"
import { outsideFiveBoroughs } from "../config/nyc-location"
import { isDirectoryEligible } from "../config/publishable-types"
import { parseDietaryTags } from "../lib/utils"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const CANONICAL_TAGS = new Set(Object.keys(DIET_CONFIG))
const SITE = "https://www.eatrealfoodnyc.com"
const HOST = "www.eatrealfoodnyc.com"
const KEY_PATTERN = /^[a-f0-9]{16,128}\.txt$/

const { prisma } = require("../lib/db") as {
  prisma: {
    restaurant: {
      findMany: (args: unknown) => Promise<Candidate[]>
      updateMany: (args: unknown) => Promise<{ count: number }>
    }
    $disconnect: () => Promise<void>
  }
}

interface Candidate {
  id: number
  slug: string
  name: string
  type: string | null
  borough: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  address: string
  description: string | null
  photo: string | null
  dietary_tags: string | null
  inspection_grade: string | null
  reviews: number | null
  is_published: boolean
  business_status: string | null
}

function flag(name: string) {
  return process.argv.includes(name)
}

function limit() {
  const index = process.argv.indexOf("--limit")
  if (index === -1) return 400
  const value = Number(process.argv[index + 1])
  if (!Number.isInteger(value) || value < 1) throw new Error("--limit must be a positive integer")
  return value
}

function filled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim())
}

function canonicalTags(value: string | null): string[] {
  return parseDietaryTags(value).filter((tag) => CANONICAL_TAGS.has(tag))
}

function gradeLetter(value: string | null): string {
  return (value ?? "").trim().toUpperCase()
}

/** Shared name of a multi-location brand, without a trailing place suffix. */
export const HELD_FOR_CONSOLIDATION = /\b(shake shack|chopt|farmers?\s*'?\s*fridge|plantega|sweetgreen|chipotle|panera)\b/i

function locationNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+[-–—|].*$/, "")
    .replace(/\s+\((?:[^)]*)\)\s*$/, "")
    .replace(
      /\s+(nyc|new york|manhattan|brooklyn|queens|bronx|staten island|midtown|downtown|uptown|soho|tribeca|harlem|williamsburg|bushwick|astoria|flushing|bayside|park slope)$/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim()
}

function rollbackPath(batchNumber: number) {
  const day = new Date().toISOString().slice(0, 10)
  return path.join(process.cwd(), "data", `published-batch-${day}-${batchNumber}.json`)
}

function nextBatchNumber() {
  const dir = path.join(process.cwd(), "data")
  const day = new Date().toISOString().slice(0, 10)
  const prefix = `published-batch-${day}-`
  const existing = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
    : []
  const numbers = existing.map((name) => Number(name.slice(prefix.length, -".json".length)))
  const max = numbers.filter((n) => Number.isInteger(n)).reduce((a, b) => Math.max(a, b), 0)
  return max + 1
}

function loadIndexNowKey() {
  const dir = path.join(process.cwd(), "public")
  const names = fs.readdirSync(dir).filter((name) => KEY_PATTERN.test(name))
  if (names.length !== 1) throw new Error(`Expected one public IndexNow key file, found ${names.length}`)
  const key = names[0].replace(/\.txt$/, "")
  const body = fs.readFileSync(path.join(dir, names[0]), "utf8").trim()
  if (body !== key) throw new Error("IndexNow key file contents must equal the file name")
  return key
}

async function pingIndexNow(urls: string[]) {
  const key = loadIndexNowKey()
  const body = JSON.stringify({
    host: HOST,
    key,
    keyLocation: `${SITE}/${key}.txt`,
    urlList: urls,
  })
  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body,
    })
    const text = await response.text()
    console.log(`IndexNow responded ${response.status}${text ? `: ${text.slice(0, 300)}` : ""}`)
    if (response.ok) return
    if (attempt === 1 && response.status === 403) continue
    process.exitCode = 1
  }
}

async function main() {
  const apply = flag("--apply")
  const take = limit()
  const rows = await prisma.restaurant.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      borough: true,
      neighborhood: true,
      city: true,
      state: true,
      address: true,
      description: true,
      photo: true,
      dietary_tags: true,
      inspection_grade: true,
      reviews: true,
      is_published: true,
      business_status: true,
    },
  })

  const neighborhoodPublished = new Map<string, number>()
  const dietPublished = new Map<string, number>()
  const nameCounts = new Map<string, { total: number; published: number }>()
  for (const row of rows) {
    const key = locationNameKey(row.name)
    const bucket = nameCounts.get(key) ?? { total: 0, published: 0 }
    bucket.total += 1
    if (row.is_published) bucket.published += 1
    nameCounts.set(key, bucket)
    if (!row.is_published) continue
    if (row.neighborhood) {
      const hood = row.neighborhood.trim().toLowerCase()
      neighborhoodPublished.set(hood, (neighborhoodPublished.get(hood) ?? 0) + 1)
    }
    for (const tag of canonicalTags(row.dietary_tags)) {
      dietPublished.set(tag, (dietPublished.get(tag) ?? 0) + 1)
    }
  }

  const skipped = {
    published: 0,
    notOperational: 0,
    outside: 0,
    ineligible: 0,
    missingAddress: 0,
    missingDescription: 0,
    missingPhoto: 0,
    missingTag: 0,
    grade: 0,
    chain: 0,
  }
  const chainSkipped = new Map<string, number>()
  const eligible: Candidate[] = []

  for (const row of rows) {
    if (row.is_published) {
      skipped.published += 1
      continue
    }
    if (row.business_status !== "OPERATIONAL") {
      skipped.notOperational += 1
      continue
    }
    if (outsideFiveBoroughs(row)) {
      skipped.outside += 1
      continue
    }
    if (!isDirectoryEligible(row)) {
      skipped.ineligible += 1
      continue
    }
    if (!filled(row.address)) {
      skipped.missingAddress += 1
      continue
    }
    if (!filled(row.description)) {
      skipped.missingDescription += 1
      continue
    }
    if (!filled(row.photo)) {
      skipped.missingPhoto += 1
      continue
    }
    const tags = canonicalTags(row.dietary_tags)
    if (tags.length === 0) {
      skipped.missingTag += 1
      continue
    }
    const grade = gradeLetter(row.inspection_grade)
    if (grade !== "A" && grade !== "B") {
      skipped.grade += 1
      continue
    }
    const key = locationNameKey(row.name)
    const brand = nameCounts.get(key)
    if (HELD_FOR_CONSOLIDATION.test(row.name) || (brand && brand.total > 1 && brand.published > 0)) {
      skipped.chain += 1
      chainSkipped.set(key, (chainSkipped.get(key) ?? 0) + 1)
      continue
    }
    eligible.push(row)
  }

  eligible.sort((a, b) => {
    const reviewDelta = (b.reviews ?? 0) - (a.reviews ?? 0)
    if (reviewDelta !== 0) return reviewDelta
    const hoodA = neighborhoodPublished.get((a.neighborhood ?? "").trim().toLowerCase()) ?? 0
    const hoodB = neighborhoodPublished.get((b.neighborhood ?? "").trim().toLowerCase()) ?? 0
    if (hoodB !== hoodA) return hoodB - hoodA
    const dietA = Math.max(0, ...canonicalTags(a.dietary_tags).map((tag) => dietPublished.get(tag) ?? 0))
    const dietB = Math.max(0, ...canonicalTags(b.dietary_tags).map((tag) => dietPublished.get(tag) ?? 0))
    if (dietB !== dietA) return dietB - dietA
    return a.slug.localeCompare(b.slug)
  })

  const batch = eligible.slice(0, take)
  const byBorough = new Map<string, number>()
  for (const row of batch) {
    const borough = (row.borough ?? "unknown").trim()
    byBorough.set(borough, (byBorough.get(borough) ?? 0) + 1)
  }

  console.log(`Unpublished scanned: ${rows.length - skipped.published}`)
  console.log(`Eligible: ${eligible.length}`)
  console.log(`Batch: ${batch.length} (limit ${take})`)
  console.log("Skipped unpublished:", skipped)
  console.log("By borough:")
  for (const [borough, count] of [...byBorough.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}\t${borough}`)
  }
  const chains = [...chainSkipped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)
  console.log("Chain names left unpublished (top):")
  for (const [name, count] of chains) console.log(`  ${count}\t${name}`)
  const leaked = batch.filter((row) => HELD_FOR_CONSOLIDATION.test(row.name))
  if (leaked.length > 0) {
    for (const row of leaked) console.log(`Named chain in batch: ${row.slug}`)
    throw new Error("Named chains were selected. Refusing to continue.")
  }
  console.log("Named chains in the batch: 0")

  if (!apply) {
    console.log("\nDry run. Pass --apply to publish, write the rollback file, and ping IndexNow.")
    await prisma.$disconnect()
    return
  }

  const batchNumber = nextBatchNumber()
  const out = rollbackPath(batchNumber)
  const payload = {
    date: new Date().toISOString().slice(0, 10),
    batch: batchNumber,
    action: "is_published set to true",
    note: "Quality-gated batch. Revert by setting is_published false for these slugs. Rows were not deleted and no fields other than is_published were changed.",
    count: batch.length,
    byBorough: Object.fromEntries(byBorough),
    slugs: batch.map((row) => row.slug),
  }
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n")
  if (batch.length === 0) {
    console.log(`Wrote ${out} with an empty list.`)
    await prisma.$disconnect()
    return
  }
  const result = await prisma.restaurant.updateMany({
    where: { id: { in: batch.map((row) => row.id) }, is_published: false },
    data: { is_published: true },
  })
  console.log(`Published ${result.count}. Wrote ${out}`)
  const urls = batch.map((row) => `${SITE}/restaurants/${row.slug}`)
  await pingIndexNow(urls)
  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
