/**
 * The sitemap is generated from the database at request time. This check
 * only locks the editorial URLs that were missing from the hardcoded list.
 */
import { GUIDES } from "../config/guides"
import { editorialPaths } from "../app/sitemap"

const paths = editorialPaths()
const required = [
  "/guides/healthy-breakfast-nyc",
  "/guides/seafood-healthy-restaurants-nyc",
  "/data/nyc-restaurant-health-grade-report",
  "/data/best-rated-restaurants",
]

for (const path of required) {
  if (!paths.includes(path)) {
    console.error(`missing sitemap path ${path}`)
    process.exit(1)
  }
}

for (const guide of GUIDES) {
  const path = `/guides/${guide.slug}`
  if (!paths.includes(path)) {
    console.error(`guide ${guide.slug} is not in the sitemap path list`)
    process.exit(1)
  }
}

console.log(`editorial sitemap paths ok (${paths.length})`)
