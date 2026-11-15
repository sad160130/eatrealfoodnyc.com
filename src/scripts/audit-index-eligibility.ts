/**
 * Index-eligibility audit. Report only: this script does not change
 * robots, noindex, or the sitemap.
 *
 * Thresholds (published listings):
 * - Inspection record: at least one of inspection_grade, inspection_score, inspection_date.
 * - Filled fields: at least 5 of description (40+ characters), phone, website,
 *   dietary_tags, rating, type, photo, working_hours, address, neighborhood,
 *   borough, inspection_grade, inspection_score, inspection_date.
 * - Inbound HTML links, counted from the templates (not a crawl):
 *     1 if the neighborhood hub is built (3+ published restaurants there),
 *     1 for the HTML sitemap, which links every published restaurant,
 *     1 if the restaurant is in the first 24 published rows for one of its diet tags
 *       (that is what the diet hub renders).
 *   Fewer than 2 inbound links is "low".
 *
 * Propose noindex,follow when a listing is not a NYC food-service business,
 * or when it has no inspection record AND fewer than 5 filled fields AND low inlinks.
 * Propose merging chain kiosks (farmers-fridge-*, plantega-*, chopt-*, and any
 * other name stem with 4+ locations) onto one brand page. Do not apply either.
 *
 * Usage: npx tsx src/scripts/audit-index-eligibility.ts
 * Writes audit-reports/index-eligibility.md
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const { prisma } = require("../lib/db") as {
  prisma: {
    restaurant: {
      findMany: (args: unknown) => Promise<Row[]>
    }
  }
}
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "../lib/neighborhood-hubs"

const MIN_FILLED = 5
const MIN_INLINKS = 2
const DIET_HUB_TAKE = 24
const CHAIN_MIN = 4

const NON_RESTAURANT = [
  /walmart/i, /petco/i, /bloomingdale/i, /trader joe/i, /whole foods market/i,
  /marriott/i, /hilton/i, /hyatt/i, /st\.?\s*regis/i, /sheraton/i,
  /hotel/i, /motel/i, /inn at/i, /wedding venue/i,
  /university/i, /\bnyu\b/i,
  /queens center/i, /spa castle/i, /knockdown center/i,
  /supermarket/i, /pharmacy/i, /\bcvs\b/i, /walgreens/i, /\btarget\b/i, /costco/i,
  /shopping mall/i, /department store/i,
]

const NON_RESTAURANT_TYPE = /grocery|supermarket|hotel|lodging|university|department store|pet store|retail|shopping mall|\bspa\b|pharmacy/i

const OUTSIDE_NYC = /jersey city|new hyde park|hoboken|newark|yonkers|,\s*nj\b|\bnj\s+\d{5}/i

const CHAIN_PREFIXES = ["farmers-fridge", "plantega", "chopt"]

interface Row {
  id: number
  name: string
  slug: string
  type: string | null
  borough: string | null
  neighborhood: string | null
  address: string
  city: string | null
  state: string | null
  rating: number | null
  dietary_tags: string | null
  inspection_grade: string | null
  inspection_date: string | null
  inspection_score: number | null
  description: string | null
  phone: string | null
  website: string | null
  working_hours: string | null
  photo: string | null
  priorityRank: number
  is_published: boolean
}

function filledCount(row: Row) {
  const checks = [
    (row.description?.trim().length ?? 0) >= 40,
    Boolean(row.phone),
    Boolean(row.website),
    Boolean(row.dietary_tags?.trim()),
    row.rating != null,
    Boolean(row.type),
    Boolean(row.photo),
    Boolean(row.working_hours),
    Boolean(row.address?.trim()),
    Boolean(row.neighborhood),
    Boolean(row.borough),
    Boolean(row.inspection_grade),
    row.inspection_score != null,
    Boolean(row.inspection_date),
  ]
  return checks.filter(Boolean).length
}

function hasInspection(row: Row) {
  return Boolean(row.inspection_grade) || row.inspection_score != null || Boolean(row.inspection_date)
}

function nonRestaurantReason(row: Row): string | null {
  const haystack = `${row.name} ${row.type ?? ""}`
  if (NON_RESTAURANT.some((pattern) => pattern.test(haystack)) || (row.type && NON_RESTAURANT_TYPE.test(row.type))) {
    return "name or type matches a non-restaurant pattern"
  }
  return null
}

function outsideNycReason(row: Row): string | null {
  const state = (row.state ?? "").trim().toUpperCase()
  const place = `${row.city ?? ""} ${row.address} ${row.neighborhood ?? ""} ${row.borough ?? ""}`
  if (state && state !== "NY" && state !== "NEW YORK") return `state is ${row.state}`
  if (OUTSIDE_NYC.test(place)) return "address or city is outside the five boroughs"
  return null
}

function chainKey(row: Row): string | null {
  for (const prefix of CHAIN_PREFIXES) {
    if (row.slug === prefix || row.slug.startsWith(`${prefix}-`)) return prefix
  }
  const stem = row.name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(nyc|new york|manhattan|brooklyn|queens|bronx|staten island|midtown|downtown|uptown)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
  const words = stem.split(" ").filter(Boolean)
  if (words.length === 0) return null
  return words.slice(0, Math.min(2, words.length)).join(" ")
}

async function main() {
  const rows = await prisma.restaurant.findMany({
    where: {},
    select: {
      id: true, name: true, slug: true, type: true, borough: true, neighborhood: true,
      address: true, city: true, state: true, rating: true, dietary_tags: true,
      inspection_grade: true, inspection_date: true, inspection_score: true,
      description: true, phone: true, website: true, working_hours: true, photo: true,
      priorityRank: true, is_published: true,
    },
    orderBy: { slug: "asc" },
  })

  const publishedRows = rows.filter((row) => row.is_published)
  const hoodCounts = new Map<string, number>()
  for (const row of publishedRows) {
    if (!row.borough || !row.neighborhood) continue
    const key = `${row.borough}|||${row.neighborhood}`
    hoodCounts.set(key, (hoodCounts.get(key) ?? 0) + 1)
  }

  const dietRank = new Map<string, Row[]>()
  for (const row of publishedRows) {
    for (const tag of (row.dietary_tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean)) {
      const list = dietRank.get(tag) ?? []
      list.push(row)
      dietRank.set(tag, list)
    }
  }
  const dietLinked = new Set<number>()
  for (const list of dietRank.values()) {
    list.sort((a, b) => b.priorityRank - a.priorityRank || (b.rating ?? 0) - (a.rating ?? 0))
    for (const row of list.slice(0, DIET_HUB_TAKE)) dietLinked.add(row.id)
  }

  const chains = new Map<string, Row[]>()
  for (const row of publishedRows) {
    const key = chainKey(row)
    if (!key) continue
    const list = chains.get(key) ?? []
    list.push(row)
    chains.set(key, list)
  }

  type Finding = Row & { filled: number; inlinks: number; reasons: string[]; action: "noindex" | "merge" | "review" }
  const findings: Finding[] = []

  for (const row of rows) {
    const filled = filledCount(row)
    let inlinks = 1 // HTML sitemap links every published restaurant
    const hoodKey = row.borough && row.neighborhood ? `${row.borough}|||${row.neighborhood}` : ""
    if ((hoodCounts.get(hoodKey) ?? 0) >= NEIGHBORHOOD_HUB_MIN_RESTAURANTS) inlinks += 1
    if (dietLinked.has(row.id)) inlinks += 1

    const reasons: string[] = []
    const nonRestaurant = nonRestaurantReason(row)
    const outside = outsideNycReason(row)
    if (nonRestaurant) reasons.push(nonRestaurant)
    if (outside) reasons.push(outside)
    if (!hasInspection(row)) reasons.push("no inspection grade, score, or date")
    if (filled < MIN_FILLED) reasons.push(`${filled} filled fields (threshold ${MIN_FILLED})`)
    if (inlinks < MIN_INLINKS) reasons.push(`${inlinks} inbound template links (threshold ${MIN_INLINKS})`)

    const thin = !hasInspection(row) && filled < MIN_FILLED && inlinks < MIN_INLINKS
    if (!row.is_published) {
      if (nonRestaurant || outside) {
        findings.push({ ...row, filled, inlinks, reasons, action: "review" })
      }
      continue
    }
    if (nonRestaurant || outside || thin) {
      findings.push({ ...row, filled, inlinks, reasons, action: "noindex" })
    }
  }

  const mergeGroups = [...chains.entries()]
    .filter(([key, list]) => list.length >= CHAIN_MIN || CHAIN_PREFIXES.includes(key))
    .filter(([, list]) => list.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)

  const lines: string[] = []
  lines.push("# Index eligibility audit")
  lines.push("")
  lines.push("Report only. No page was set to noindex and no redirect was added.")
  lines.push("")
  const publishedFindings = findings.filter((row) => row.is_published)
  const unpublishedFindings = findings.filter((row) => !row.is_published)
  lines.push(`Rows reviewed: ${rows.length} (${publishedRows.length} published)`)
  const noInspection = publishedRows.filter((row) => !hasInspection(row)).length
  const lowFields = publishedRows.filter((row) => filledCount(row) < MIN_FILLED).length
  const lowLinks = publishedRows.filter((row) => {
    let inlinks = 1
    const hoodKey = row.borough && row.neighborhood ? `${row.borough}|||${row.neighborhood}` : ""
    if ((hoodCounts.get(hoodKey) ?? 0) >= NEIGHBORHOOD_HUB_MIN_RESTAURANTS) inlinks += 1
    if (dietLinked.has(row.id)) inlinks += 1
    return inlinks < MIN_INLINKS
  }).length
  lines.push(`Proposed noindex (published): ${publishedFindings.length}`)
  lines.push(`Do not publish: ${unpublishedFindings.length}`)
  lines.push(`Proposed chain merges: ${mergeGroups.length} groups`)
  lines.push(`Missing an inspection record: ${noInspection}`)
  lines.push(`Fewer than ${MIN_FILLED} filled fields: ${lowFields}`)
  lines.push(`Fewer than ${MIN_INLINKS} inbound template links: ${lowLinks}`)
  lines.push("A listing is proposed for noindex only when it is not a NYC food-service business, or when it fails the inspection, field, and link thresholds together. Thin pages that are still linked stay indexed.")
  lines.push("")
  lines.push("## Thresholds")
  lines.push("")
  lines.push(`- Inspection record: one of grade, score, or date.`)
  lines.push(`- Filled fields: at least ${MIN_FILLED} of the 14 fields listed in the script header.`)
  lines.push(`- Inbound links: at least ${MIN_INLINKS}, counted from the neighborhood hub, the HTML sitemap, and the diet hub's first ${DIET_HUB_TAKE} rows.`)
  lines.push(`- noindex proposal: non-restaurant, outside the five boroughs, or thin on all three thresholds at once.`)
  lines.push(`- Merge proposal: slug prefix farmers-fridge, plantega, or chopt, or any other two-word name stem with ${CHAIN_MIN}+ published locations.`)
  lines.push("")
  lines.push("## Proposed noindex (published)")
  lines.push("")
  lines.push("| Slug | Why | Filled | Inlinks |")
  lines.push("| --- | --- | ---: | ---: |")
  for (const row of publishedFindings) {
    lines.push(`| ${row.slug} | ${row.reasons.join("; ")} | ${row.filled} | ${row.inlinks} |`)
  }
  lines.push("")
  lines.push("## Do not publish")
  lines.push("")
  lines.push("These rows are unpublished. The proposal is to keep them that way.")
  lines.push("")
  lines.push("| Slug | Why |")
  lines.push("| --- | --- |")
  for (const row of unpublishedFindings) {
    lines.push(`| ${row.slug} | ${row.reasons.join("; ")} |`)
  }
  lines.push("")
  lines.push("## Proposed chain merges")
  lines.push("")
  lines.push("Keep one brand page and 301 the location URLs. This report does not create those pages.")
  lines.push("")
  for (const [key, list] of mergeGroups) {
    lines.push(`### ${key} (${list.length})`)
    lines.push("")
    for (const row of list) lines.push(`- /restaurants/${row.slug} — ${row.name}`)
    lines.push("")
  }

  const markdown = lines.join("\n")
  const outDir = path.join(process.cwd(), "audit-reports")
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, "index-eligibility.md")
  fs.writeFileSync(outFile, markdown)
  console.log(markdown)
  console.error(`\nWrote ${outFile}`)
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    const client = prisma as { $disconnect?: () => Promise<void> }
    if (client.$disconnect) await client.$disconnect()
  })
