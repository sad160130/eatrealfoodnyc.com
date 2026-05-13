import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

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
  // Top 100 unpublished operational restaurants by priorityRank (priority_rank in DB).
  // rating desc is a deterministic tiebreaker — the priorityRank column has many
  // ties at the @default(0), so a single sort would give nondeterministic results.
  // Matches the ordering used by the borough hub findMany.
  const rows = await prisma.restaurant.findMany({
    where: {
      is_published: false,
      business_status: "OPERATIONAL",
    },
    orderBy: [
      { priorityRank: "desc" },
      { rating: "desc" },
    ],
    take: 100,
    select: {
      slug: true,
      name: true,
      borough: true,
      neighborhood: true,
      dietary_tags: true,
      rating: true,
      reviews: true,
    },
  })

  // is_hidden_gem computed per the canonical algorithm (rating ≥ 4.5, reviews < 200,
  // operational). The query already restricts to operational, so the runtime check
  // is only on rating and reviews. Independent of the is_hidden_gem column on the
  // model — that flag isn't backfilled yet.
  const batch: BatchRow[] = rows.map((r) => ({
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
