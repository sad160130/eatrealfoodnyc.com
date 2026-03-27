import { BOROUGH_MAP } from "../config/boroughs"
import { DIET_CONFIG } from "../config/dietary-tags"
import { GUIDES } from "../config/guides"
import { buildTitle } from "../lib/utils"

const issues: Array<{ page: string; title: string; length: number }> = []

function checkTitle(page: string, title: string) {
  if (title.length > 60) {
    issues.push({ page, title, length: title.length })
  }
}

console.log("\n=== META TITLE LENGTH AUDIT ===\n")

// Homepage
checkTitle("/", "Eat Real Food NYC — All 5 Boroughs")

// Borough hub pages
Object.entries(BOROUGH_MAP).forEach(([slug, name]) => {
  checkTitle(`/nyc/${slug}/healthy-restaurants`, `Healthy Restaurants in ${name}, NYC (2026)`)
})

// Diet-type hub pages
Object.entries(DIET_CONFIG).forEach(([tag, config]) => {
  checkTitle(`/healthy-restaurants/${tag}`, `Best ${config.label} Restaurants in NYC (2026)`)
})

// Guide pages (metaTitle)
GUIDES.forEach((guide) => {
  checkTitle(`/guides/${guide.slug}`, guide.metaTitle)
})

// Simulate long restaurant names to test buildTitle
const testRestaurants = [
  { name: "Farmer's Fridge", neighborhood: "Chelsea" },
  { name: "Awesome Hibachi At Home Hibachi Catering", neighborhood: "Astoria" },
  { name: "The Very Long Restaurant Name That Goes On And On", neighborhood: "Williamsburg" },
  { name: "Short Name", neighborhood: "SoHo" },
]

testRestaurants.forEach((r) => {
  const title = buildTitle({ name: r.name, location: `${r.neighborhood}, NYC` })
  checkTitle(`/restaurants/sample`, title)
})

// Sample long neighborhood names
const testNeighborhoods = [
  { name: "Bedford-Stuyvesant", borough: "Brooklyn" },
  { name: "Long Island City", borough: "Queens" },
  { name: "Washington Heights", borough: "Manhattan" },
  { name: "Tottenville", borough: "Staten Island" },
]

testNeighborhoods.forEach((n) => {
  checkTitle(`/nyc/.../healthy-restaurants`, `Healthy Restaurants in ${n.name} — ${n.borough}`)
})

if (issues.length === 0) {
  console.log("✅ All titles are within 60 characters")
} else {
  console.log(`⚠️  Found ${issues.length} titles over 60 characters:\n`)
  issues.forEach((issue) => {
    console.log(`  [${issue.length} chars] ${issue.page}`)
    console.log(`  Title: "${issue.title}"`)
    console.log()
  })
}
