import assert from "node:assert/strict"
import { latestInspectionDate } from "../lib/inspection-dates"
import { hasTopPickRating, selectTopPicks, TOP_PICKS_EXPLAINER } from "../lib/top-picks"

function assertEqual<T>(actual: T, expected: T, message: string) {
  assert.deepEqual(actual, expected, message)
  console.log("ok: " + message)
}

interface Row {
  name: string
  inspection_grade: string | null
  rating: number | null
  reviews: number | null
  partner_status?: string | null
}

function row(partial: Partial<Row> & Pick<Row, "name">): Row {
  return {
    inspection_grade: "A",
    rating: 4.5,
    reviews: 12,
    partner_status: null,
    ...partial,
  }
}

const names = (rows: Row[]) => rows.map((row) => row.name)

const organic: Row[] = [
  row({ name: "sponsored-c", inspection_grade: "C", rating: 5, reviews: 900, partner_status: "sponsored" }),
  row({ name: "grade-a-lower-rating", inspection_grade: "A", rating: 4.1, reviews: 40 }),
  row({ name: "ungraded-rated", inspection_grade: null, rating: 4.9, reviews: 80 }),
  row({ name: "pending-rated", inspection_grade: "Z", rating: 4.8, reviews: 15 }),
  row({ name: "grade-b-rated", inspection_grade: "B", rating: 4.9, reviews: 500, partner_status: "partner" }),
  row({ name: "grade-a-unrated", inspection_grade: "A", rating: null, reviews: 0 }),
  row({ name: "grade-a-no-reviews", inspection_grade: "A", rating: 5, reviews: 0 }),
  row({ name: "blank-unrated", inspection_grade: " ", rating: null, reviews: 4 }),
  row({ name: "lowercase-c", inspection_grade: " c ", rating: 5, reviews: 100 }),
]

assertEqual(
  names(selectTopPicks(organic, 4)),
  ["grade-a-lower-rating", "ungraded-rated", "pending-rated", "grade-b-rated"],
  "preferred Grade A and ungraded-but-rated stay in input order, then Grade B fills"
)

assertEqual(
  names(selectTopPicks(organic, 3)),
  ["grade-a-lower-rating", "ungraded-rated", "pending-rated"],
  "Grade B and unrated listings are left out when preferred listings fill the module"
)

assertEqual(
  names(selectTopPicks(organic, 8)),
  [
    "grade-a-lower-rating",
    "ungraded-rated",
    "pending-rated",
    "grade-b-rated",
    "grade-a-unrated",
    "grade-a-no-reviews",
    "blank-unrated",
  ],
  "Grade C is excluded, and unrated listings follow Grade B only to fill"
)

assert.equal(organic[0].name, "sponsored-c", "source list still starts with the Grade C row")
assert.equal(organic.length, 9, "selectTopPicks does not remove rows from the full list")
console.log("ok: full list is unchanged")

const paidFirst = [
  row({ name: "partner-a", partner_status: "partner", rating: 4.2, reviews: 9 }),
  row({ name: "unpaid-a", partner_status: null, rating: 4.9, reviews: 400 }),
]
assertEqual(
  names(selectTopPicks(paidFirst, 2)),
  ["partner-a", "unpaid-a"],
  "partner status does not move a listing ahead of the organic order"
)

assert.equal(hasTopPickRating(row({ name: "zero-reviews", reviews: 0 })), false, "review count 0 is not a rating")
assert.equal(hasTopPickRating(row({ name: "null-rating", rating: null, reviews: 20 })), false, "null rating is not a rating")
assert.equal(hasTopPickRating(row({ name: "rated", rating: 4, reviews: 1 })), true, "a score with reviews counts")

assert.deepEqual(selectTopPicks(organic, 0), [], "a zero limit returns no picks")
console.log("ok: a zero limit returns no picks")

assert.ok(TOP_PICKS_EXPLAINER.includes("Grade C"), "explainer says Grade C is left out")
assert.equal(TOP_PICKS_EXPLAINER.toLowerCase().includes("partner"), false, "explainer does not mention paid placement")
console.log("ok: explainer copy")

const stored = ["9/30/2026", "11/10/2026", "10/2/2026"]
const parsed = latestInspectionDate(stored)
assert.equal(parsed?.toISOString().slice(0, 10), "2026-11-10", "newest inspection date is parsed, not string-sorted")
assert.notEqual([...stored].sort().reverse()[0], "11/10/2026", "M/D/YYYY string sort still hides November behind September")
console.log("ok: inspection dates are not ordered as strings")

console.log("\nTop-picks tests passed")
