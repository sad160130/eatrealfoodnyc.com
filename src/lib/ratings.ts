/**
 * A listing is rated only when a review platform recorded a score above zero.
 * Null and 0 both mean "no rating" in this dataset. SQL AVG ignores null and
 * still counts 0, and several pages used to coerce null to 0 in JavaScript,
 * which pulled hub averages toward zero (the whole-foods hub showed 0.4).
 */
export function isRated(rating: number | null | undefined): rating is number {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0
}

/** Mean of the rated values, rounded to one decimal. Null when none are rated. */
export function averageRating(values: Array<number | null | undefined>): number | null {
  let sum = 0
  let count = 0
  for (const value of values) {
    if (!isRated(value)) continue
    sum += value
    count += 1
  }
  if (count === 0) return null
  return Math.round((sum / count) * 10) / 10
}

/** Round a SQL AVG that already excluded unrated rows. */
export function roundAverage(value: number | null | undefined): number | null {
  if (!isRated(value)) return null
  return Math.round(value * 10) / 10
}

export function formatAverageRating(value: number | null | undefined): string {
  const rounded = roundAverage(value)
  if (rounded == null) return "—"
  return `${rounded.toFixed(1)} ★`
}
