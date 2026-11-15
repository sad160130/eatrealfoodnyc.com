export interface JsonLdIssue {
  level: "error" | "warn"
  message: string
}

type Node = Record<string, unknown>

function asNodes(value: unknown): Node[] {
  if (!value || typeof value !== "object") return []
  if (Array.isArray(value)) return value.flatMap(asNodes)
  const record = value as Node
  if (Array.isArray(record["@graph"])) return asNodes(record["@graph"])
  return [record]
}

export function extractJsonLd(html: string): Node[] {
  const nodes: Node[] = []
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  for (const match of html.matchAll(pattern)) {
    try {
      nodes.push(...asNodes(JSON.parse(match[1])))
    } catch {
      nodes.push({ "@type": "INVALID_JSON" })
    }
  }
  return nodes
}

function typesOf(node: Node): string[] {
  const value = node["@type"]
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  return []
}

export function validateJsonLd(
  nodes: Node[],
  requiredTypes: string[]
): JsonLdIssue[] {
  const issues: JsonLdIssue[] = []
  const present = new Set(nodes.flatMap(typesOf))

  for (const type of requiredTypes) {
    if (!present.has(type)) issues.push({ level: "error", message: `Missing ${type}` })
  }
  if (present.has("INVALID_JSON")) {
    issues.push({ level: "error", message: "A JSON-LD script did not parse" })
  }

  for (const node of nodes) {
    const types = typesOf(node)
    if (types.includes("Restaurant")) {
      if (typeof node.name !== "string" || node.name.length === 0) {
        issues.push({ level: "error", message: "Restaurant is missing name" })
      }
      // Full restaurant entities (detail pages) carry @id. List excerpts only need name and url.
      if (typeof node["@id"] === "string") {
        const address = node.address
        if (!address || typeof address !== "object") {
          issues.push({ level: "error", message: `Restaurant ${String(node.name)} is missing address` })
        }
        if (typeof node.url !== "string") {
          issues.push({ level: "error", message: `Restaurant ${String(node.name)} is missing url` })
        }
      }
    }
    if (types.includes("AggregateRating")) {
      const count = node.reviewCount
      if (typeof count !== "number" || count < 1) {
        issues.push({ level: "error", message: "AggregateRating reviewCount must be a positive number" })
      }
      if (typeof node.ratingValue !== "number") {
        issues.push({ level: "error", message: "AggregateRating is missing ratingValue" })
      }
    }
    if (types.includes("ItemList")) {
      const elements = Array.isArray(node.itemListElement) ? node.itemListElement : []
      if (elements.length === 0) issues.push({ level: "error", message: "ItemList has no elements" })
      if (node.numberOfItems !== elements.length) {
        issues.push({
          level: "error",
          message: `ItemList numberOfItems (${String(node.numberOfItems)}) does not match ${elements.length} elements`,
        })
      }
    }
    if (types.includes("BreadcrumbList")) {
      const elements = Array.isArray(node.itemListElement) ? node.itemListElement : []
      if (elements.length === 0) issues.push({ level: "error", message: "BreadcrumbList is empty" })
      elements.forEach((element, index) => {
        const item = element as Node
        if (item.position !== index + 1) {
          issues.push({ level: "error", message: "BreadcrumbList positions are not sequential" })
        }
        if (typeof item.name !== "string") {
          issues.push({ level: "error", message: "BreadcrumbList item is missing name" })
        }
      })
    }
    const nested = node.aggregateRating
    if (nested && typeof nested === "object") {
      issues.push(...validateJsonLd([nested as Node], []))
    }
    const elements = node.itemListElement
    if (Array.isArray(elements)) {
      for (const element of elements) {
        if (element && typeof element === "object") {
          const item = (element as Node).item
          if (item && typeof item === "object") issues.push(...validateJsonLd([item as Node], []))
        }
      }
    }
  }

  return issues
}

/** Visible SEO text that must already be in the server HTML, not only in JSON-LD. */
export function validateVisibleHtml(
  html: string,
  needles: string[]
): JsonLdIssue[] {
  return needles
    .filter((needle) => !html.includes(needle))
    .map((needle) => ({ level: "error" as const, message: `Not in server HTML: ${needle}` }))
}
