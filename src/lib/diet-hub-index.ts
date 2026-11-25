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
