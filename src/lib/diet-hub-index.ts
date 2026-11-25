import { unstable_rethrow } from "next/navigation"
import { COMBO_MIN_RESTAURANTS } from "@/config/dietary-tags"

export interface DietLink {
  tag: string
  label: string
}

/** Header, footer, and homepage order. A tag is omitted when it is not indexable. */
export const DIET_NAV: DietLink[] = [
  { tag: "vegan", label: "Vegan" },
  { tag: "vegetarian", label: "Vegetarian" },
  { tag: "gluten-free", label: "Gluten-Free" },
  { tag: "halal", label: "Halal" },
  { tag: "kosher", label: "Kosher" },
  { tag: "dairy-free", label: "Dairy-Free" },
  { tag: "keto", label: "Keto" },
  { tag: "paleo", label: "Paleo" },
  { tag: "whole-foods", label: "Whole Foods" },
  { tag: "low-calorie", label: "Low Calorie" },
  { tag: "raw-food", label: "Raw Food" },
  { tag: "nut-free", label: "Nut-Free" },
]

/** Same floor as diet+borough combo pages. Below it, the diet hub is noindex. */
export function dietHubIsIndexable(count: number): boolean {
  return count >= COMBO_MIN_RESTAURANTS
}

export function indexableDietLinks(counts: Record<string, number>): DietLink[] {
  return DIET_NAV.filter((diet) => dietHubIsIndexable(counts[diet.tag] ?? 0))
}

/**
 * Hubs that were indexable on the Nov 25 preview. Used only when the live
 * count query fails, so the header and footer still render.
 */
export const FALLBACK_INDEXABLE_DIET_TAGS = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "halal",
  "kosher",
  "dairy-free",
  "whole-foods",
  "low-calorie",
] as const

export const FALLBACK_INDEXABLE_DIETS: DietLink[] = DIET_NAV.filter((diet) =>
  (FALLBACK_INDEXABLE_DIET_TAGS as readonly string[]).includes(diet.tag)
)

async function defaultDietLoader(): Promise<DietLink[]> {
  const { getIndexableDietTags } = await import("@/lib/diet-hubs")
  return getIndexableDietTags()
}

/** Nav diets. A database error falls back instead of failing the layout. */
export async function loadNavDietTags(
  load: () => Promise<DietLink[]> = defaultDietLoader
): Promise<DietLink[]> {
  try {
    return await load()
  } catch (error) {
    unstable_rethrow(error)
    const name = error instanceof Error ? error.name : "Error"
    const raw = error instanceof Error ? error.message : ""
    const message = raw.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[redacted]").slice(0, 160)
    console.error(`Diet hub nav unavailable (${name}${message ? `: ${message}` : ""})`)
    return FALLBACK_INDEXABLE_DIETS
  }
}
