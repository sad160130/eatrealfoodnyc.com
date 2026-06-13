# CLAUDE.md — Eat Real Food NYC

## Project
Name: Eat Real Food NYC
Domain: eatrealfoodnyc.com
Purpose: SEO-first directory for healthy restaurants in NYC, ranking on
         "healthy restaurants in NYC" + 200+ neighbourhood / diet-type
         long-tail variants. The moat is proprietary data — NYC DOHMH
         health inspection grades joined to conservative dietary tagging
         across 12 canonical tags and 116 neighbourhoods.
Target user: Health-conscious NYC diners filtering by diet type, borough,
             neighbourhood, and NYC health inspection grade.
Founder: Rohan Kadam — sole public founder (see /about + ORGANIZATION_SCHEMA
         in src/lib/schema.ts).

## Stack
- Next.js 16 (App Router, TypeScript strict, src/ layout — there IS a src/ wrapper)
- React 19
- Tailwind CSS 4 (custom @theme tokens in src/app/globals.css — NOT shadcn/ui)
- Supabase PostgreSQL 15 + Prisma 7 (two URLs: DATABASE_URL pooled, DIRECT_URL for migrations)
- Leaflet.js + OpenStreetMap (NO Mapbox; dynamic import with ssr:false)
- Vercel hosting (auto-deploys main; preview deploys on every branch push)
- next-sitemap, next-seo
- DM Sans via next/font/google + Georgia serif (system font, no FOUT)
- Claude API (claude-haiku-4-5 bulk, claude-sonnet-4-6 quality) — scripts only, NEVER runtime

## Dataset
- Source: data/NYC_Healthy_Restaurants_Final_v2.csv
- 8,835 unique NYC restaurants across 5 boroughs, 116 neighbourhoods
- ~1,500 currently published; weekly +100 cadence via src/scripts/weekly-publish.ts
- Key columns: name, slug, type, borough, neighborhood, address, latitude, longitude,
  rating, reviews, dietary_tags (pipe-delimited), inspection_grade (A/B/C), inspection_date,
  inspection_score, description, phone, website, working_hours, photo, is_hidden_gem,
  is_published, priority_rank.

## URL structure
```
/                                                       Homepage
/restaurants/[slug]                                     Restaurant listing
/nyc/[borough]/healthy-restaurants                      Borough hub
/nyc/[borough]/[neighborhood]/healthy-restaurants       Neighbourhood hub
/healthy-restaurants/[diet-type]                        Diet hub
/nyc/[borough]/[diet-type]-restaurants                  Diet+borough combo *
/data/[slug]                                            Original research (Dataset+Article JSON-LD)
/guides/[slug]                                          Editorial guide
/about, /about/*                                        E-E-A-T pages (Organization JSON-LD on /about)
/search, /near-me, /compare, /saved                     User UI — noindex, NOT in sitemap
```

*The diet+borough combo is gated by `COMBO_MIN_RESTAURANTS=5` (src/config/dietary-tags.ts)
and served by src/app/nyc/[borough]/[neighborhood]/page.tsx, suffix-detected — Next.js
can't have a folder named `[diet-type]-restaurants`, and the segment already owns
`[neighborhood]`, so a single page handles both shapes and `notFound()`s the rest.

Diet+neighborhood (`/nyc/[borough]/[neighborhood]/[diet-type]-restaurants`) is planned
but **not built**.

## Dietary tags (12 canonical, pipe-delimited)
`vegan | vegetarian | gluten-free | keto | paleo | halal | kosher | dairy-free | nut-free | raw-food | whole-foods | low-calorie`

Conservative tagging policy: only apply a tag when a restaurant explicitly identifies
as such or has substantial dedicated menu coverage. Better under-tagged than over-tagged
— a celiac trusts our gluten-free flag.

## File naming
- Files: kebab-case (`restaurant-card.tsx`)
- Components: PascalCase (`RestaurantCard`)
- DB columns: snake_case (`dietary_tags`)
- Scripts: `src/scripts/[name].ts`, run via `npx tsx src/scripts/[name].ts`

## Design system (DO NOT extend)
**Palette — five brand colours, no others:**
```
forest  #1B3A2D   primary dark surfaces, body-text dark
jade    #2D6A4F   links, headlines on cream
sage    #52B788   accents, hover, "live" indicators
cream   #F8F6F1   page background
amber   #D4A853   RESERVED for the hidden-gem ✦ mark only
```

**Typography — two faces, no others:**
```
display — Georgia, serif (tight + bold for headlines and the placard letter)
body    — DM Sans (next/font/google)
```

**Tokens + utility classes** live in src/app/globals.css:
```
.eyebrow .display-1 .display-2 .h2-serif .dek .tabular
.border-hairline .border-hairline-strong .plaque .gem-mark
.callout .callout-initial .callout-label .callout-pulse
```

**Signature element — the placard:** every restaurant card carries a small cream
square at top-left of its photo with the NYC DOHMH inspection grade letter set in
Georgia bold inside a hairline border — the actual NYC inspection-placard silhouette
in our palette. The same typographic gesture extends to the hero quick-filter
callouts (`O.` / `N.` / `A.` / `M.`) and Dispatches byline avatars. Colour stays
jade for every grade; the LETTER carries the meaning, not the colour.

## Search (NO Algolia)
PostgreSQL full-text via tsvector + GIN index in Supabase. /api/search handles
search + filter queries. /search is noindex — it's UI, not a destination.

## Principles
- **Trust is the product.** Real data only. No fake reviews. No fabricated bylines
  or editorial personas. The "Dispatches" section on the homepage (Elena Vance,
  Marcus Thorne) is a known outstanding violation; replace with real-data sections.
- **Deploy only via `git push origin main`.** Vercel auto-deploys main. NEVER use
  the `vercel` CLI.
- **No deploys on Fridays.**
- **No new colours or fonts.** The system above is the system.
- **Every user-facing Prisma query must filter `is_published: true`** (scripts in
  src/scripts/ are the exception).
- **SEO-critical content renders server-side.** H1s, restaurant names, ratings,
  grades, FAQ answers must live in the initial HTML, not behind client hydration.

## Current state
Live in production. ~1,500 of 8,835 restaurants published. Weekly +100 cadence
on Sundays. Recent infra: GSC→BigQuery bulk export (data accruing), built the
/nyc/[borough]/[diet-type]-restaurants combo pages, two design passes
(placard signature, type rhythm, callout cards) on `design/placard-elevate`.

## Deep workflows
See `.claude/skills/eatrealfoodnyc/SKILL.md` for the weekly publish workflow,
the six internal-linking rules, audit scripts, and the full hard-rules list.
CLAUDE.md is orientation; SKILL.md is the manual.
