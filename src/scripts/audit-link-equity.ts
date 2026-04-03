import * as fs from "fs"
import * as path from "path"

const linkCounts: Record<string, number> = {}

function extractLinks(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8")
  const hrefPattern = /href=["'`]([^"'`]+)["'`]/g
  let match
  while ((match = hrefPattern.exec(content)) !== null) {
    const href = match[1]
    // Only count static internal links (not template literals with variables)
    if (href.startsWith("/") && !href.startsWith("//") && !href.includes("${")) {
      linkCounts[href] = (linkCounts[href] || 0) + 1
    }
  }
}

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !["node_modules", ".next", ".git"].includes(entry.name)) {
      scanDir(fullPath)
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) && !entry.name.includes(".test.")) {
      extractLinks(fullPath)
    }
  }
}

scanDir("src")

const sorted = Object.entries(linkCounts).sort((a, b) => b[1] - a[1])

console.log("\n=== INTERNAL LINK EQUITY DISTRIBUTION ===\n")
console.log("Top 30 most internally linked pages:")
sorted.slice(0, 30).forEach(([url, count], i) => {
  console.log(`  ${String(i + 1).padStart(2)}. [${String(count).padStart(3)} links] ${url}`)
})

// Key pages check
const keyPages = [
  "/search", "/map", "/nyc/compare",
  "/guides/nyc-health-grades-explained",
  "/healthy-restaurants/vegan", "/healthy-restaurants/halal",
  "/healthy-restaurants/gluten-free", "/healthy-restaurants/kosher",
  "/about", "/about/our-data", "/about/editorial-standards",
  "/guides", "/contact", "/press", "/privacy", "/terms",
]

console.log("\n=== KEY PAGES — INBOUND LINK COUNT ===\n")
keyPages.forEach(url => {
  const count = linkCounts[url] || 0
  const status = count >= 3 ? "✅" : count >= 1 ? "⚠️ " : "❌"
  console.log(`  ${status} [${String(count).padStart(2)} links] ${url}`)
})

// Orphan detection — pages with 0 inbound
const allPages = [
  "/map", "/nyc/compare", "/guides", "/about", "/contact", "/press",
  "/privacy", "/terms", "/about/our-data", "/about/editorial-standards",
  "/about/team", "/near-me",
  "/guides/nyc-health-grades-explained", "/guides/vegan-nyc-borough-guide",
  "/guides/best-healthy-neighborhoods-nyc", "/guides/hidden-gem-restaurants-nyc",
  "/guides/halal-food-guide-nyc", "/guides/gluten-free-dining-nyc",
  "/guides/how-eat-healthy-nyc-15-dollars", "/guides/kosher-dining-nyc-guide",
  "/guides/late-night-healthy-eating-nyc", "/guides/nyc-restaurant-inspection-process",
]

console.log("\n=== ORPHAN PAGE DETECTION ===\n")
const orphans = allPages.filter(url => (linkCounts[url] || 0) === 0)
if (orphans.length > 0) {
  console.log("❌ Pages with ZERO inbound internal links:")
  orphans.forEach(url => console.log(`   ${url}`))
} else {
  console.log("✅ All known pages have at least 1 inbound internal link")
}

// Low-link pages
const lowLink = allPages.filter(url => {
  const c = linkCounts[url] || 0
  return c > 0 && c < 3
})
if (lowLink.length > 0) {
  console.log("\n⚠️  Pages with only 1-2 inbound links (weak equity):")
  lowLink.forEach(url => console.log(`   [${linkCounts[url]}] ${url}`))
}
