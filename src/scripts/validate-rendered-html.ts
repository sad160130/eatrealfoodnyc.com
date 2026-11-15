/**
 * Check server HTML for the tags crawlers need.
 *
 * Usage:
 *   npx tsx src/scripts/validate-rendered-html.ts ./page.html restaurant
 *   npx tsx src/scripts/validate-rendered-html.ts https://www.eatrealfoodnyc.com/restaurants/example restaurant
 *
 * page kind: restaurant | hub | guide
 */
import { readFile } from "node:fs/promises"
import { extractJsonLd, validateJsonLd, validateVisibleHtml } from "../lib/validate-jsonld"

const REQUIRED = {
  restaurant: ["Restaurant", "BreadcrumbList", "Organization", "WebSite"],
  hub: ["ItemList", "BreadcrumbList", "Organization", "WebSite"],
  guide: ["BreadcrumbList", "Organization", "WebSite"],
} as const

type Kind = keyof typeof REQUIRED

async function load(target: string): Promise<string> {
  if (target.startsWith("http://") || target.startsWith("https://")) {
    const response = await fetch(target)
    if (!response.ok) throw new Error(`${target} returned ${response.status}`)
    return response.text()
  }
  return readFile(target, "utf8")
}

async function main() {
  const target = process.argv[2]
  const kind = process.argv[3] as Kind
  if (!target || !(kind in REQUIRED)) {
    console.error("Usage: validate-rendered-html.ts <file-or-url> <restaurant|hub|guide>")
    process.exit(1)
  }
  const html = await load(target)
  const issues = [
    ...validateJsonLd(extractJsonLd(html), [...REQUIRED[kind]]),
    ...validateVisibleHtml(html, ["<h1", "rel=\"canonical\"", "name=\"description\"", "<title"]),
  ]
  const linkCount = (html.match(/<a\s[^>]*href=/gi) ?? []).length
  console.log(`${kind} ${target}`)
  console.log(`html bytes: ${html.length}, anchor tags: ${linkCount}, json-ld nodes: ${extractJsonLd(html).length}`)
  if (issues.length === 0) {
    console.log("ok")
    return
  }
  for (const issue of issues) console.log(`${issue.level}: ${issue.message}`)
  process.exit(1)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
