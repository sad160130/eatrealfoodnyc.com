# On-page title and meta config

The root layout does not append a brand suffix. `fitTitle` and `fitDescription` in `src/lib/seo-titles.ts` own the length rules. They never insert an ellipsis.

`fitTitle(rungs, { allowBrand, max = 60, cap = 65 })` returns the first rung that fits in 60 characters. The brand ` | Eat Real Food NYC` is added only when `allowBrand` is true and the result still fits in 60. A rung that fits in 65 is used only after nothing fits in 60, and it is logged. A restaurant name is never cut.

`fitDescription(head, tails)` joins required sentences, drops whole sentences if the head exceeds 160 characters, then adds the longest tail that still fits.

## Restaurant listings

Graded, inspection within 18 months of the directory snapshot:

1. `{name}, {neighborhood} | Grade {g}, {Mon YYYY}`
2. `{name}, {neighborhood} | NYC Grade {g}`
3. `{name}, {neighborhood} | Grade {g}`
4. `{name} | NYC Grade {g}, {borough}`
5. `{name} | Grade {g}`
6. `{name}`

Ungraded titles never say “Not Yet Graded”. They use cuisine and place, then the name.

The meta includes the address, grade, and score only when those fields exist. The inspection month is included only when the inspection is within 18 months of the directory snapshot.

## Hubs

Home keeps the brand: `Healthy Restaurants NYC | {gradeA} Grade A | Eat Real Food NYC`.

Neighborhood, diet, and borough × diet titles drop the brand so the live count and year can fit.

## Counts

Every number in a title, meta, or FAQ comes from a published operational query. A question is omitted when its count is zero.
