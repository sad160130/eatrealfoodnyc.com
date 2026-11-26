import { prisma } from "../lib/db"
import {
  TITLE_CAP,
  TITLE_MAX,
  dietBoroughHubTitle,
  dietHubTitle,
  homeTitle,
  neighborhoodHubTitle,
  restaurantListingTitle,
} from "../lib/seo-titles"

const issues: string[] = []

function check(page: string, title: string) {
  if (title.includes("…") || title.includes("...")) issues.push(`${page} contains an ellipsis: ${title}`)
  if (/not yet graded/i.test(title)) issues.push(`${page} says Not Yet Graded: ${title}`)
  if (title.length > TITLE_CAP) issues.push(`${page} is ${title.length} chars: ${title}`)
  else if (title.length > TITLE_MAX) console.warn(`over 60: [${title.length}] ${page} — ${title}`)
}

const snapshot = new Date("2026-11-15T00:00:00Z")
check("home", homeTitle(1216, 2026))
check("williamsburg", neighborhoodHubTitle("Williamsburg", "Brooklyn", 32, 2026))
check("vegan", dietHubTitle("Vegan", 106, 73, 2026))
check("vegan brooklyn", dietBoroughHubTitle("Vegan", "Brooklyn", 37, 28, 2026))
check(
  "fatboys",
  restaurantListingTitle({
    name: "Fatboy's Vegan Burgers",
    neighborhood: "Bedford-Stuyvesant",
    borough: "Brooklyn",
    grade: "A",
    inspectionDate: "2024-12-01",
    type: "Vegan restaurant",
    snapshot,
  })
)
check(
  "maison",
  restaurantListingTitle({
    name: "Maison Provence Restaurant",
    neighborhood: "Williamsburg",
    borough: "Brooklyn",
    grade: null,
    inspectionDate: null,
    type: "French restaurant",
    snapshot,
  })
)

const longest = await prisma.restaurant.findMany({
  where: { is_published: true },
  select: { name: true, neighborhood: true, borough: true, inspection_grade: true, inspection_date: true, type: true, rating: true, reviews: true },
  orderBy: { name: "asc" },
})
const top = [...longest].sort((a, b) => b.name.length - a.name.length).slice(0, 20)
for (const row of top) {
  check(
    row.name,
    restaurantListingTitle({
      name: row.name,
      neighborhood: row.neighborhood,
      borough: row.borough,
      grade: row.inspection_grade,
      inspectionDate: row.inspection_date,
      type: row.type,
      snapshot,
      rating: row.rating,
      reviews: row.reviews,
    })
  )
}

console.log("Sample titles:")
console.log(" home:", homeTitle(1216, 2026))
console.log(" williamsburg:", neighborhoodHubTitle("Williamsburg", "Brooklyn", 32, 2026))
console.log(" vegan:", dietHubTitle("Vegan", 106, 73, 2026))
console.log(
  " fatboys:",
  restaurantListingTitle({
    name: "Fatboy's Vegan Burgers",
    neighborhood: "Bedford-Stuyvesant",
    borough: "Brooklyn",
    grade: "A",
    inspectionDate: "2024-12-01",
    type: "Vegan restaurant",
    snapshot,
  })
)
if (issues.length) {
  console.error(issues.join("\n"))
  process.exit(1)
}
console.log(`Checked ${6 + top.length} titles. None exceed ${TITLE_CAP} or use an ellipsis.`)
