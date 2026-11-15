import assert from "node:assert/strict"
import { dohmhSourceUrl } from "../components/official-grade-link"

const byName = dohmhSourceUrl({ name: "Joe's Pizza" })
assert.ok(byName.includes("43nn-pn8j"))
assert.ok(decodeURIComponent(byName).includes("upper(dba)=upper('Joe''s Pizza')"))
assert.ok(!byName.includes("camis="))

const byCamis = dohmhSourceUrl({ name: "Joe's Pizza", camis: "40365952" })
assert.ok(decodeURIComponent(byCamis).includes("camis='40365952'"))

const ignored = dohmhSourceUrl({ name: "Joe's Pizza", camis: "not-a-camis" })
assert.ok(!ignored.includes("camis="))

console.log("dohmh source url tests passed")
