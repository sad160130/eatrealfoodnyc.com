import * as fs from "fs"
import * as path from "path"

const PAGES_TO_CHECK = ["/map", "/near-me", "/nyc/compare", "/guides"]
const DIRS_TO_SCAN = ["src/components", "src/app"]
const allLinks: Set<string> = new Set()

function extractLinks(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8")
  const hrefPattern = /href=["'`]([^"'`]+)["'`]/g
  let match
  while ((match = hrefPattern.exec(content)) !== null) {
    allLinks.add(match[1])
  }
}

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !["node_modules", ".next", ".git"].includes(entry.name)) {
      scanDir(fullPath)
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      extractLinks(fullPath)
    }
  }
}

DIRS_TO_SCAN.forEach(scanDir)

console.log("\n=== INTERNAL LINKS AUDIT ===\n")

PAGES_TO_CHECK.forEach((page) => {
  const hasLink = Array.from(allLinks).some(
    (link) => link === page || link.startsWith(page + "?") || link.startsWith(page + "/")
  )
  console.log(
    `${hasLink ? "✅" : "❌"} ${page} — ${hasLink ? "has inbound links" : "ORPHAN — no inbound links found"}`
  )
})
