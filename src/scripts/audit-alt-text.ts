import * as fs from "fs"
import * as path from "path"

const DIRS_TO_SCAN = ["src/components", "src/app"]
const issues: string[] = []

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8")

  // Check for Image components with empty alt=""
  if (/alt=""\s/.test(content)) {
    issues.push(`EMPTY ALT (review if decorative): ${filePath}`)
  }

  // Check for alt text that is just {restaurant.name} or {r.name} with nothing else
  if (/alt=\{restaurant\.name\}/.test(content)) {
    issues.push(`BARE NAME ALT (improve with location): ${filePath}`)
  }
  if (/alt=\{r\.name\}\s/.test(content)) {
    issues.push(`BARE NAME ALT (improve with location): ${filePath}`)
  }
  if (/alt=\{[a-zA-Z]+\.name\}\s/.test(content) && !/alt=\{`/.test(content) && !/getRestaurantImageAlt/.test(content)) {
    // Bare name alt without template literal or utility function
  }
}

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.includes("node_modules")) {
      scanDir(fullPath)
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      scanFile(fullPath)
    }
  }
}

DIRS_TO_SCAN.forEach(scanDir)

if (issues.length === 0) {
  console.log("✅ No alt text issues found")
} else {
  console.log(`⚠️  Found ${issues.length} alt text issues to review:`)
  issues.forEach((issue) => console.log(` - ${issue}`))
}
