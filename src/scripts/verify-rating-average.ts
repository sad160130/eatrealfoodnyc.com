/**
 * Locks the whole-foods average bug: 22 unrated rows followed by two 5.0
 * ratings must average to 5.0, not 0.4.
 */
import { averageRating } from "../lib/ratings"

const sample: Array<number | null> = [...Array(22).fill(null), 5, 5]
const legacy = sample.reduce((sum, rating) => sum + (rating ?? 0), 0) / sample.length
const fixed = averageRating(sample)

if (Math.round(legacy * 10) / 10 !== 0.4) {
  console.error(`expected the old formula to reproduce 0.4, got ${legacy}`)
  process.exit(1)
}
if (fixed !== 5) {
  console.error(`expected averageRating to return 5, got ${fixed}`)
  process.exit(1)
}
if (averageRating([0, null, undefined]) !== null) {
  console.error("zeros and nulls should not produce an average")
  process.exit(1)
}

console.log("rating average checks passed")
