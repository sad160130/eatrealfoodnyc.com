# CLAUDE.md — Eat Real Food NYC

## Project
Name: Eat Real Food NYC
Domain: eatrealfoodnyc.com
Purpose: SEO-first directory website targeting 'healthy restaurants in NYC'
         and 200+ neighborhood/diet-type long-tail keyword variants.
Target user: Health-conscious NYC diners filtering by diet type, borough,
             neighborhood, and NYC health inspection grade.

## Stack
- Next.js 14 (App Router, TypeScript strict mode, no src/ wrapper)
- Tailwind CSS 3 + shadcn/ui
- Supabase (PostgreSQL 15) — database + full-text search
- Prisma 5 ORM (connects to Supabase)
- Leaflet.js + OpenStreetMap — maps (no API key needed)
- Vercel — hosting
- Claude API (claude-haiku-4-5 for bulk, claude-sonnet-4-20250514 for quality)
- next-sitemap, next-seo

## Dataset
- File: data/NYC_Healthy_Restaurants_Final_v2.csv
- 8,835 unique NYC restaurants across 5 boroughs
- 31 columns including: name, slug, type, borough, neighborhood, address,
  latitude, longitude, rating, reviews, dietary_tags, inspection_grade,
  inspection_date, inspection_score, description, phone, website,
  working_hours, photo, is_hidden_gem

## File naming conventions
- Files: kebab-case (restaurant-card.tsx)
- Components: PascalCase (RestaurantCard)
- DB columns: snake_case (dietary_tags)
- Scripts: src/scripts/ — run with: npx tsx src/scripts/[name].ts

## URL structure
/                                                     Homepage
/restaurants/[slug]                                   Restaurant listing (8,835 pages)
/nyc/[borough]/healthy-restaurants                    Borough hub
/nyc/[borough]/[neighborhood]/healthy-restaurants     Neighborhood hub
/healthy-restaurants/[diet-type]                      Diet-type hub
/nyc/[borough]/[diet-type]-restaurants                Diet + borough
/nyc/[borough]/[neighborhood]/[diet-type]-restaurants Diet + neighborhood

## Dietary tag canonical values (12 total)
vegan | vegetarian | gluten-free | keto | paleo | halal | kosher
dairy-free | nut-free | raw-food | whole-foods | low-calorie

## Search (NO Algolia)
- PostgreSQL full-text search via tsvector + GIN index in Supabase
- API route: /api/search handles all search + filter queries

## Maps (NO Mapbox)
- Leaflet.js + OpenStreetMap tiles — zero cost, no API key
- Dynamic import with ssr:false to avoid window errors

## Current sprint
Phase: 1 — Data pipeline (loading CSV into Supabase)
Next: CC-02 Prisma schema, CC-03 ingest script
In scope: CC-01 through CC-09
Out of scope: UI, pages, SEO layer