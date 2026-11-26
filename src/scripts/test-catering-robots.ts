import assert from "node:assert/strict"
import { cateringPageIsIndexable } from "../lib/catering-robots"

assert.equal(cateringPageIsIndexable({}), true)
assert.equal(cateringPageIsIndexable({ utm_source: "audit" }), true)
assert.equal(cateringPageIsIndexable({ restaurant: "tziki" }), false)
assert.equal(cateringPageIsIndexable({ restaurant: "" }), false)
assert.equal(cateringPageIsIndexable({ restaurant: ["tziki"] }), false)
assert.equal(cateringPageIsIndexable({ restaurant: "tziki", utm_source: "audit" }), false)

console.log("catering robots tests passed")
