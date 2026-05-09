import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

async function main() {
  const [total, graded, gems, latestInspection, taggedCount, lastUpdated] = await Promise.all([
    prisma.restaurant.count({
      where: { is_published: true, business_status: "OPERATIONAL" },
    }),
    prisma.restaurant.count({
      where: { is_published: true, inspection_grade: { not: null } },
    }),
    prisma.restaurant.count({
      where: { is_published: true, is_hidden_gem: true },
    }),
    prisma.restaurant.findFirst({
      where: { inspection_date: { not: null } },
      orderBy: { inspection_date: "desc" },
      select: { inspection_date: true },
    }),
    prisma.restaurant.count({
      where: { is_published: true, dietary_tags: { not: null } },
    }),
    prisma.restaurant.findFirst({
      orderBy: { updated_at: "desc" },
      select: { updated_at: true },
    }),
  ])

  console.log("Total published:", total)
  console.log(
    "With inspection grade:",
    graded,
    "(" + Math.round((graded / total) * 100) + "%)"
  )
  console.log("Hidden gems:", gems)
  console.log(
    "With dietary tags:",
    taggedCount,
    "(" + Math.round((taggedCount / total) * 100) + "%)"
  )
  console.log("Latest inspection date in DB:", latestInspection?.inspection_date)
  console.log("Last DB update:", lastUpdated?.updated_at)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
