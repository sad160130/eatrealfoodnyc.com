const CANONICAL = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "keto",
  "paleo",
  "halal",
  "kosher",
  "dairy-free",
  "nut-free",
  "raw-food",
  "whole-foods",
  "low-calorie",
] as const

export type CanonicalTag = (typeof CANONICAL)[number]

/**
 * A name or Google type that states the diet outright. "Senza Gluten" and
 * "Gluten-free restaurant" qualify. A menu that might have one gluten-free
 * item does not.
 */
const EXPLICIT: Array<{ tag: CanonicalTag; pattern: RegExp }> = [
  { tag: "gluten-free", pattern: /gluten[-\s]?free|\bsenza\s+gluten\b|\bceliac\b/i },
]

export function parseTags(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split("|").map((tag) => tag.trim()).filter(Boolean)
}

export function explicitTagsFor(name: string, type: string | null): CanonicalTag[] {
  const haystack = `${name} ${type ?? ""}`
  return EXPLICIT.filter((rule) => rule.pattern.test(haystack)).map((rule) => rule.tag)
}

export function withExplicitTags(current: string | null, name: string, type: string | null): string | null {
  const tags = new Set(parseTags(current))
  let changed = false
  for (const tag of explicitTagsFor(name, type)) {
    if (!tags.has(tag)) {
      tags.add(tag)
      changed = true
    }
  }
  if (!changed) return current
  return CANONICAL.filter((tag) => tags.has(tag)).join("|")
}
