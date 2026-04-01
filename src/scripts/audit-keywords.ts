import { BOROUGH_KEYWORDS, DIET_KEYWORDS, HOMEPAGE_KEYWORDS } from "../config/keywords"

const issues: Array<{ page: string; issue: string }> = []

function check(page: string, title: string, h1: string) {
  const tl = title.toLowerCase()
  const h1l = h1.toLowerCase()

  if (!tl.includes("nyc") && !tl.includes("new york")) {
    issues.push({ page, issue: `Title missing "NYC": "${title}"` })
  }
  if (!tl.includes("healthy") && !tl.includes("restaurant") && !tl.includes("vegan") && !tl.includes("halal") && !tl.includes("kosher") && !tl.includes("gluten")) {
    issues.push({ page, issue: `Title missing keyword: "${title}"` })
  }
  if (title.length > 60) {
    issues.push({ page, issue: `Title too long (${title.length}): "${title}"` })
  }
  if (!h1l.includes("healthy") && !h1l.includes("restaurant") && !h1l.includes("vegan") && !h1l.includes("halal") && !h1l.includes("kosher") && !h1l.includes("gluten")) {
    issues.push({ page, issue: `H1 missing keyword: "${h1}"` })
  }
}

console.log("\n=== KEYWORD OPTIMIZATION AUDIT ===\n")

check("/", HOMEPAGE_KEYWORDS.title, "Find Healthy Restaurants Across New York City")

Object.entries(BOROUGH_KEYWORDS).forEach(([slug, c]) => {
  check(`/nyc/${slug}/healthy-restaurants`, c.metaTitle, c.h1)
})

Object.entries(DIET_KEYWORDS).forEach(([slug, c]) => {
  check(`/healthy-restaurants/${slug}`, c.metaTitle, c.h1)
})

if (issues.length === 0) {
  console.log("✅ All page titles and H1s pass keyword optimization checks\n")
} else {
  console.log(`⚠️  Found ${issues.length} issues:\n`)
  issues.forEach((i) => console.log(`  ${i.page}: ${i.issue}`))
}
