# Eat Real Food NYC

NYC's most trusted healthy restaurant directory. Built on verified NYC Department of Health inspection data.

**Live site:** https://eatrealfoodnyc.com

## Stack
- Next.js 14 (App Router, TypeScript, SSG)
- Supabase (PostgreSQL)
- Prisma ORM
- Tailwind CSS
- Vercel (hosting)

## Development
```bash
npm install
npm run dev
```

## Deployment

Deployments are automatic via GitHub.
- Push to `main` → triggers Vercel production deployment
- All environment variables are configured in Vercel dashboard

## Weekly publish workflow

See `WEEKLY_PUBLISH.md` for the weekly process of publishing new restaurant pages.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values.
Never commit `.env.local` to version control.

## Scripts
```bash
# Check publish status
npx tsx src/scripts/publish-status.ts

# Publish next 100 restaurants (run weekly)
npx tsx src/scripts/weekly-publish.ts

# Full data pipeline (run after major data updates)
npx tsx src/scripts/ingest.ts
npx tsx src/scripts/build-search-index.ts
```
