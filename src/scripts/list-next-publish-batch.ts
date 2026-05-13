import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }
import { isPublishableType, isNameBlocked } from "../config/publishable-types"

interface BatchRow {
  slug: string
  name: string
  borough: string | null
  neighborhood: string | null
  dietary_tags: string[]
  is_hidden_gem: boolean
}

function parseDietaryTags(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split("|")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

async function main() {
  // Over-fetch and filter in JS because both filters are regex/set based
  // and don't translate to Prisma where clauses. 500 candidates is enough
  // headroom even when the unpublished pool is heavily contaminated with
  // non-restaurant entities. The two filters cascade:
  //   1. Type allowlist  — gates by Google Maps `type` (restaurant-shaped)
  //   2. Name blocklist  — strips Herbalife/MLM, wellness clinics, NJ rows
  //                        that slipped through with type="Restaurant"
  const candidates = await prisma.restaurant.findMany({
    where: {
      is_published: false,
      business_status: "OPERATIONAL",
    },
    orderBy: [
      { priorityRank: "desc" },
      { rating: "desc" },
    ],
    take: 500,
    select: {
      slug: true,
      name: true,
      borough: true,
      neighborhood: true,
      dietary_tags: true,
      rating: true,
      reviews: true,
      type: true,
    },
  })

  const filtered = candidates
    .filter((r) => isPublishableType(r.type))
    .filter((r) => !isNameBlocked(r.name))
    .slice(0, 100)

  // is_hidden_gem computed per the canonical algorithm (rating ≥ 4.5,
  // reviews < 200, operational). The query already restricts to operational,
  // so the runtime check is only on rating and reviews. Independent of the
  // is_hidden_gem DB column, which isn't backfilled yet.
  const batch: BatchRow[] = filtered.map((r) => ({
    slug: r.slug,
    name: r.name,
    borough: r.borough,
    neighborhood: r.neighborhood,
    dietary_tags: parseDietaryTags(r.dietary_tags),
    is_hidden_gem: (r.rating ?? 0) >= 4.5 && (r.reviews ?? 0) < 200,
  }))

  // JSON array to stdout for the §6 routing step to consume.
  process.stdout.write(JSON.stringify(batch, null, 2) + "\n")

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
