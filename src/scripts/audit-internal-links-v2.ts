import * as fs from "fs"
import * as path from "path"

const GENERIC_ANCHORS = ["click here", "read more", "learn more", "view listing", "see more", "here", "this page", "find out", "more info", "details"]
const issues: Array<{ file: string; anchor: string }> = []

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8")
  const linkPattern = /<Link[^>]*>([^<]{1,50})<\/Link>/g
  let match
  while ((match = linkPattern.exec(content)) !== null) {
    const anchor = match[1].replace(/\{[^}]+\}/g, "").trim().toLowerCase()
    if (GENERIC_ANCHORS.some((g) => anchor === g || anchor === g + " →")) {
      issues.push({ file: filePath, anchor })
    }
  }
}

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && !["node_modules", ".next", ".git"].includes(entry.name)) scanDir(full)
    else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) scanFile(full)
  }
}

;["src/components", "src/app"].forEach(scanDir)

if (issues.length === 0) {
  console.log("✅ No generic anchor text found — all links use descriptive anchors")
} else {
  console.log(`⚠️  Found ${issues.length} links with generic anchor text:`)
  issues.forEach((i) => console.log(`  "${i.anchor}" in ${i.file}`))
}
