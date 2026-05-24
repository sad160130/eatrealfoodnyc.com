import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }
import { getListingHubLinks, MIN_LISTING_HUB_LINKS } from "../lib/internal-links"

// PRD CC-23: every published listing page must expose >= MIN_LISTING_HUB_LINKS
// outbound money-page links (neighbourhood hub, borough hub, matching diet hubs).
// getListingHubLinks() guarantees the floor via fallback padding, so a FAIL here
// means a regression in that helper. The actionable signal is the data-quality
// breakdown: how many listings lean on fallbacks because they're missing a
// borough, neighbourhood, or tags — those are enrichment targets, not bugs.

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    where: { is_published: true },
    select: { slug: true, borough: true, neighborhood: true, dietary_tags: true },
  })

  let failures = 0
  let missingNeighborhood = 0
  let missingBorough = 0
  let missingTags = 0
  let reliedOnFallback = 0

  for (const r of restaurants) {
    const links = getListingHubLinks(r)
    if (links.length < MIN_LISTING_HUB_LINKS) {
      failures++
      console.log(`  ❌ [${links.length}] /restaurants/${r.slug}`)
    }
    if (!r.neighborhood) missingNeighborhood++
    if (!r.borough) missingBorough++
    if (!r.dietary_tags || r.dietary_tags.trim() === "") missingTags++

    const tagCount = r.dietary_tags ? r.dietary_tags.split("|").filter((t) => t.trim()).length : 0
    const coreLinks =
      (r.neighborhood && r.borough ? 1 : 0) + (r.borough ? 1 : 0) + Math.min(tagCount, 3)
    if (coreLinks < MIN_LISTING_HUB_LINKS) reliedOnFallback++
  }

  console.log("\n=== CC-23 LISTING INTERNAL-LINK AUDIT ===\n")
  console.log(`  Published listings:        ${restaurants.length}`)
  console.log(`  Below the ${MIN_LISTING_HUB_LINKS}-link floor:      ${failures}`)
  console.log(`  Relied on fallback links:  ${reliedOnFallback}`)
  console.log(`  Missing neighbourhood:     ${missingNeighborhood}`)
  console.log(`  Missing borough:           ${missingBorough}`)
  console.log(`  Missing dietary tags:      ${missingTags}`)
  console.log(
    failures === 0
      ? `\n✅ All ${restaurants.length} published listings meet the CC-23 minimum.\n`
      : `\n❌ ${failures} listing(s) fell below the minimum — getListingHubLinks regressed.\n`
  )

  await prisma.$disconnect()
  if (failures > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
