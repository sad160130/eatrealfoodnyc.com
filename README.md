# Eat Real Food NYC

NYC healthy restaurant directory. Live at https://www.eatrealfoodnyc.com.

## Stack

- Next.js 16 (App Router, TypeScript, `src/` layout)
- React 19
- Tailwind CSS 4
- Supabase PostgreSQL and Prisma 7 (`DATABASE_URL` pooled, `DIRECT_URL` for migrations)
- Leaflet and OpenStreetMap
- Vercel (production deploys from `main` only — do not use the Vercel CLI to deploy)

## Development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Checks

```bash
npx tsc --noEmit
npm run build
```

There is no ESLint config in this repo. `tsc` is the typecheck.

## Weekly publish

See [WEEKLY_PUBLISH.md](WEEKLY_PUBLISH.md). Publishing is a reviewed batch, not an automatic Sunday job.

## Scripts

```bash
# How many restaurants are published
npx tsx src/scripts/publish-status.ts

# Newest parsed inspection date and publish timestamp
npx tsx src/scripts/check-data-freshness.ts

# Preview the next 100 eligible unpublished restaurants
npx tsx src/scripts/list-next-publish-batch.ts

# Publish that batch (writes is_published)
npx tsx src/scripts/weekly-publish.ts

# Report published rows that fail the directory rules. Dry-run.
npx tsx src/scripts/unpublish-ineligible.ts
# Write the unpublish after reviewing the report
npx tsx src/scripts/unpublish-ineligible.ts --apply

# Create the experience-form table. Dry-run, then apply.
npx tsx src/scripts/create-user-submissions-table.ts
npx tsx src/scripts/create-user-submissions-table.ts --apply

# Refresh DOHMH grades. Dry-run, then apply. Do not point this at production
# until the dry-run sample looks right.
npx tsx src/scripts/refresh-dohmh-inspections.ts
npx tsx src/scripts/refresh-dohmh-inspections.ts --apply
```

Environment variables live in `.env.local` (gitignored) and in the Vercel project. Never commit them.
