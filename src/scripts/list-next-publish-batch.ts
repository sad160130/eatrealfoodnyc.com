import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }
import { getNextPublishBatch } from "../lib/next-publish-batch"

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
  // Selection logic lives in src/lib/next-publish-batch.ts so this script
  // and weekly-publish.ts share a single source of truth. See that file
  // for the type allowlist + name blocklist + ordering contract.
  const rows = await getNextPublishBatch(prisma)

  // is_hidden_gem computed per the canonical algorithm (rating ≥ 4.5,
  // reviews < 200, operational). The query already restricts to operational,
  // so the runtime check is only on rating and reviews. Independent of the
  // is_hidden_gem DB column, which isn't backfilled yet.
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
