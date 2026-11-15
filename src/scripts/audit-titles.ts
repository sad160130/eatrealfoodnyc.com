import { GUIDES } from "../config/guides"
import {
  TITLE_MAX,
  boroughTitle,
  dietTitle,
  neighborhoodTitle,
  renderedTitleLength,
  restaurantTitle,
  withBrand,
} from "../lib/seo-titles"

const issues: Array<{ page: string; title: string; length: number }> = []

function checkTitle(page: string, inner: string) {
  const title = withBrand(inner)
  if (title.length > TITLE_MAX) {
    issues.push({ page, title, length: title.length })
  }
}

console.log("\n=== META TITLE LENGTH AUDIT (rendered title, including brand) ===\n")

const boroughs = ["Manhattan", "Brooklyn", "Queens", "the Bronx", "Staten Island"]
for (const name of boroughs) {
  checkTitle(`/nyc/${name}`, boroughTitle(name, 120))
  checkTitle(`/nyc/${name} (no grade)`, boroughTitle(name, 0))
}

const diets = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Kosher", "Dairy-Free", "Keto", "Paleo", "Whole Foods", "Low-Calorie", "Raw Food", "Nut-Free"]
for (const label of diets) {
  checkTitle(`/healthy-restaurants/${label}`, dietTitle(label, 80))
  checkTitle(`/healthy-restaurants/${label} (no grade)`, dietTitle(label, 0))
}

for (const guide of GUIDES) {
  checkTitle(`/guides/${guide.slug}`, guide.metaTitle)
}

const neighborhoods = ["SoHo", "Williamsburg", "Bedford-Stuyvesant", "Washington Heights", "Financial District", "Long Island City"]
for (const name of neighborhoods) {
  checkTitle(name, neighborhoodTitle(name, 42))
  checkTitle(`${name} no grade`, neighborhoodTitle(name, 0))
}

const restaurants = [
  { name: "Joe's Pizza", inspectionGrade: "A", inspectionDate: "2026-03-02", neighborhood: "SoHo" },
  { name: "Farmer's Fridge", inspectionGrade: null, inspectionDate: null, neighborhood: "Chelsea" },
  { name: "Awesome Hibachi At Home Hibachi Catering", inspectionGrade: "B", inspectionDate: "2024-01-15", neighborhood: "Astoria" },
  { name: "The Very Long Restaurant Name That Goes On And On", inspectionGrade: null, inspectionDate: null, neighborhood: "Williamsburg" },
]
for (const restaurant of restaurants) {
  checkTitle(restaurant.name, restaurantTitle(restaurant))
}

if (issues.length === 0) {
  console.log(`All sampled rendered titles are within ${TITLE_MAX} characters.`)
  console.log("Example:", withBrand(neighborhoodTitle("SoHo", 12)), `(${renderedTitleLength(neighborhoodTitle("SoHo", 12))})`)
} else {
  console.log(`Found ${issues.length} titles over ${TITLE_MAX} characters:\n`)
  for (const issue of issues) {
    console.log(`  [${issue.length} chars] ${issue.page}`)
    console.log(`  Title: "${issue.title}"`)
    console.log()
  }
  process.exitCode = 1
}
