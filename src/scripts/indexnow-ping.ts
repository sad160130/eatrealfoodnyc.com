/**
 * Ping IndexNow for URLs whose stored row changed.
 *
 * The key is public: IndexNow verifies it by fetching https://<host>/<key>.txt.
 * Do not put a database URL or any other secret in this file. DATABASE_URL
 * stays in the environment.
 *
 *   npx tsx src/scripts/indexnow-ping.ts            # dry run
 *   npx tsx src/scripts/indexnow-ping.ts --send     # POST to IndexNow
 *   npx tsx src/scripts/indexnow-ping.ts --days 14
 */
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const HOST = "www.eatrealfoodnyc.com"
const SITE = `https://${HOST}`
const KEY_PATTERN = /^[a-f0-9]{16,128}\.txt$/

function loadKey() {
  const dir = path.join(process.cwd(), "public")
  const names = fs.readdirSync(dir).filter((name) => KEY_PATTERN.test(name))
  if (names.length !== 1) {
    throw new Error(`Expected one public IndexNow key file, found ${names.length}`)
  }
  const key = names[0].replace(/\.txt$/, "")
  const body = fs.readFileSync(path.join(dir, names[0]), "utf8").trim()
  if (body !== key) throw new Error("IndexNow key file contents must equal the file name")
  return key
}

function flag(name: string) {
  return process.argv.includes(name)
}

function days() {
  const index = process.argv.indexOf("--days")
  if (index === -1) return 7
  const value = Number(process.argv[index + 1])
  if (!Number.isFinite(value) || value < 1) throw new Error("--days must be a positive number")
  return value
}

async function changedUrls(since: Date) {
  const { prisma } = require("../lib/db") as {
    prisma: {
      restaurant: { findMany: (args: unknown) => Promise<Array<{ slug: string; borough: string | null; neighborhood: string | null }>> }
      $disconnect: () => Promise<void>
    }
  }
  try {
    const rows = await prisma.restaurant.findMany({
      where: { is_published: true, updated_at: { gte: since } },
      select: { slug: true, borough: true, neighborhood: true },
    })
    const urls = new Set<string>([SITE])
    for (const row of rows) {
      urls.add(`${SITE}/restaurants/${row.slug}`)
    }
    return [...urls]
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const key = loadKey()
  const since = new Date(Date.now() - days() * 24 * 60 * 60 * 1000)
  const urlList = await changedUrls(since)
  console.log(`IndexNow key file: /${key}.txt`)
  console.log(`Host: ${HOST}`)
  console.log(`URLs updated since ${since.toISOString().slice(0, 10)}: ${urlList.length}`)
  for (const url of urlList.slice(0, 20)) console.log(url)
  if (urlList.length > 20) console.log(`… ${urlList.length - 20} more`)
  if (!flag("--send")) {
    console.log("Dry run. Pass --send to POST these URLs.")
    return
  }
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${SITE}/${key}.txt`,
      urlList,
    }),
  })
  console.log(`IndexNow responded ${response.status}`)
  if (!response.ok) {
    console.error(await response.text())
    process.exit(1)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
