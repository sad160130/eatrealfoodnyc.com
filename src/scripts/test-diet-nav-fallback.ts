import assert from "node:assert/strict"
import { FALLBACK_INDEXABLE_DIETS, loadNavDietTags, type DietLink } from "../lib/diet-hub-index"

async function main() {
  const live: DietLink[] = [{ tag: "vegan", label: "Vegan" }]
  const loaded = await loadNavDietTags(async () => live)
  assert.deepEqual(loaded, live)

  const logs: string[] = []
  const original = console.error
  console.error = (...args: unknown[]) => {
    logs.push(args.map((part) => String(part)).join(" "))
  }
  try {
    const fallback = await loadNavDietTags(async () => {
      throw new Error("EMAXCONN postgres://user:secret@db.example:6543/postgres")
    })
    assert.deepEqual(
      fallback.map((diet) => diet.tag),
      ["vegan", "vegetarian", "gluten-free", "halal", "kosher", "dairy-free", "whole-foods", "low-calorie"]
    )
    assert.deepEqual(fallback, FALLBACK_INDEXABLE_DIETS)
    assert.equal(logs.length, 1)
    assert.match(logs[0], /Diet hub nav unavailable/)
    assert.match(logs[0], /EMAXCONN/)
    assert.doesNotMatch(logs[0], /postgres:\/\//)
    assert.doesNotMatch(logs[0], /secret/)
  } finally {
    console.error = original
  }

  const redirect = Object.assign(new Error("redirect"), {
    digest: "NEXT_REDIRECT;replace;/somewhere;307;",
  })
  await assert.rejects(
    () => loadNavDietTags(async () => {
      throw redirect
    }),
    (error: unknown) => error === redirect
  )

  console.log("diet nav fallback tests passed")
}

main()
