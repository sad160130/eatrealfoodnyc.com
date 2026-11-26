/**
 * Bare /catering is indexable. A `restaurant` query is a prefilled form
 * variant and stays noindex, with the canonical still on /catering.
 * Other query keys (utm, share tokens) do not change robots.
 */
export function cateringPageIsIndexable(
  params: Record<string, string | string[] | undefined>
): boolean {
  return params.restaurant === undefined
}
