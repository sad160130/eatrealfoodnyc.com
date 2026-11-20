# Weekly publish

Eat Real Food NYC publishes restaurants in reviewed batches of about 100. The cadence is manual. The last batch committed on main was 6 October 2026 (`publish: batch 2026-10-06`). The site must not claim a new batch went out unless this process actually ran.

Deploys happen only by pushing `main`. Vercel builds that branch. Do not run `vercel --prod`. Do not deploy on Fridays.

## 1. Clean tree

```bash
git status
git pull origin main
```

Stop if the working tree has unrelated changes.

## 2. See the next batch

```bash
npx tsx src/scripts/list-next-publish-batch.ts
```

The script and `weekly-publish.ts` share `src/lib/next-publish-batch.ts`. A row is eligible only when `isDirectoryEligible()` in `src/config/publishable-types.ts` says so: Google Maps type is on the food-service allowlist (or clearly a restaurant, steakhouse, or similar), the name is not a catering-only business, a known national chain, or a non-food business (cinema, tour company), and it is not on the nutrition-club / out-of-NYC name block list.

## 3. Add internal links, then publish

Before flipping `is_published`, add a few contextual links from the neighbourhood hub, borough hub, and relevant diet hubs. Anchor text should name the destination.

Then:

```bash
npx tsx src/scripts/weekly-publish.ts
git commit --allow-empty -m "publish: batch YYYY-MM-DD"
git push origin main
```

`weekly-publish.ts` sets `is_published` on the same rows the list script printed. That bumps `updated_at`. The homepage "Last publish" label reads the newest `updated_at` among published rows.

After the deploy, submit the sitemap in Google Search Console.

## 4. Unpublish rows that should not be live

Catering businesses, cinemas, tour companies, grocery stores, and known chains that were published before the filter existed stay live until this script runs.

```bash
npx tsx src/scripts/unpublish-ineligible.ts
npx tsx src/scripts/unpublish-ineligible.ts --apply
```

The first command only prints a report. `--apply` sets `is_published` to false. Read the report before applying. A chain pattern can match an independent business that shares the name; edit `CHAIN_BLOCK_PATTERNS` and rerun the dry-run if a row should stay.

Unpublished restaurant URLs call `notFound()` (HTTP 404). The sitemap queries `is_published: true`, so the next deploy drops them. No extra sitemap edit is required.

## 5. Refresh inspection grades

Inspection dates in the database are `M/D/YYYY` strings. Ordering that column is not chronological (`9/30/2026` sorts ahead of `11/10/2026`). The newest parsed date is what hub pages call "Newest inspection date on file."

Production runs `GET /api/cron/refresh-dohmh` every day at 12:00 UTC (`0 12 * * *`), before the Thursday newsletter at 14:00 UTC. That expression runs once a day, which is the Hobby cron limit and is also valid on Pro. The route reads NYC Open Data dataset 43nn-pn8j for rows whose `inspection_date` is in the last 14 days. `record_date` is part of the same filter, and `inspection_date` is floored at that day: the city restamps `record_date` on historical rows, so an unbounded `record_date` check would download the whole graded file. It then updates grade, score, and inspection date on address-matched restaurants already in the table. It does not insert restaurants. A second run with the same city data writes nothing. `?dry=1` returns the plan and does not write. The route requires `Authorization: Bearer ${CRON_SECRET}`. `DOHMH_APP_TOKEN` is optional. The cron will not replace a newer stored inspection with an older row from its 14-day window.

The manual script below is the full lookback. It trusts the fetched latest grade even when that calendar day is older than the stored date:

```bash
npx tsx src/scripts/refresh-dohmh-inspections.ts
npx tsx src/scripts/refresh-dohmh-inspections.ts --since=2024-01-01
npx tsx src/scripts/refresh-dohmh-inspections.ts --apply
```

Dry-run fetches the NYC DOHMH open dataset and prints match counts plus a sample of grade changes. `--apply` updates `inspection_grade`, `inspection_score`, and `inspection_date` on matched rows. It does not insert restaurants and does not change `is_published`. Set `DOHMH_APP_TOKEN` in the environment if the open-data API rate-limits you. Do not run `--apply` until the dry-run sample looks right.

```bash
npx tsx src/scripts/check-data-freshness.ts
```

## 6. Experience form

`POST /api/submit-experience` writes to `user_submissions`. If that table is missing, the route returns 503 instead of a stack trace.

```bash
npx tsx src/scripts/create-user-submissions-table.ts
npx tsx src/scripts/create-user-submissions-table.ts --apply
```

The same DDL is in `prisma/migrations/20261115180000_user_submissions`. Prefer the script if `prisma migrate` cannot reach the direct Supabase host over IPv6. The script tries the direct URL, then the pooler on port 5432.

## 7. Research snapshots

`/data/nyc-restaurant-health-grade-report` and `/data/best-rated-restaurants` render committed JSON. Their pages label that JSON with `generatedAt` and show live published / Grade A counts beside it. Regenerate the JSON only when you intend to publish a new snapshot:

```bash
npx tsx src/scripts/pull-health-grade-report.ts
npx tsx src/scripts/pull-best-rated-restaurants.ts
```

Those scripts read the database and write `src/data/*.json`. Commit the JSON with the snapshot.
