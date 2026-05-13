---
name: eatrealfoodnyc
description: Use this skill whenever working on the eatrealfoodnyc.com codebase — adding or modifying restaurant pages, neighbourhood or borough hubs, guides, data reports, or any editorial asset; touching internal links, JSON-LD schemas, dietary tags, the publish pipeline, or audit scripts; routing internal link equity before publishing new pages. **Always triggers on the commands "do the weekly publish," "run the weekly push," "push this week's batch," "publish the next 100," or any equivalent natural-language publish request** — see §10 for the full workflow that command kicks off. Also triggers on any file under src/app/, src/components/, src/scripts/, src/data/, src/lib/, src/config/, prisma/, or next.config.ts, and when the user mentions ERFN, eatrealfoodnyc, restaurant directory work, dietary tags, NYC DOHMH grades, hidden gems, borough hubs, neighbourhood hubs, or the publish pipeline.
---

# Eat Real Food NYC — Project Skill

## 0. The First Rule

Before any other action: if the task involves publishing new pages (the weekly +100 batch, a new guide, a new data report), perform the pre-publish internal link routing step in §6. This is not optional. It is the single highest-leverage SEO action available on this site and the main reason this skill exists.

The publish cadence is ad-hoc, not scheduled. The user typically triggers it with a natural-language command like **"do the weekly publish,"** "run the weekly push," "push this week's batch," or equivalent. When that command fires, run the full §10 workflow end-to-end as a single invocation — do not require step-by-step instruction.

If the task is editorial without a publish, skip to the relevant section. If the task is infrastructural (build, deploy, schema, audit), the rules in §3 still apply.

---

## 1. What This Site Is

Eat Real Food NYC (eatrealfoodnyc.com) is NYC's healthy restaurant directory. 8,835 restaurants total, 1,300 currently published, +100 per week via a phased rollout. The moat is proprietary data: NYC DOHMH health inspection grades joined to dietary tagging across 12 canonical tags and 116 neighbourhoods, plus a hidden gem algorithm surfacing restaurants rated 4.5+ with under 200 reviews.

Two co-founders: Sanket Desai (Co-Founder & Editor-in-Chief), Rohan Kadam (Co-Founder & Marketing Lead).

This is a data-first directory, not a review site. We never invent reviews. We display real ratings from Google Maps and link out. Trust is the product.

---

## 2. The Stack (Don't Change This)

- Next.js 16 App Router, TypeScript strict, SSG + ISR
- Tailwind CSS with custom palette: forest `#1B3A2D`, jade `#2D6A4F`, sage `#52B788`, cream `#F8F6F1`, amber `#D4A853`
- Supabase PostgreSQL 15, Prisma 5 ORM, two-URL connection (`DATABASE_URL` pooled + `DIRECT_URL` for migrations)
- Anthropic Claude API for enrichment (Haiku for bulk, Sonnet for quality) — never invoke from the website runtime, only from `src/scripts/`
- Vercel auto-deploy from GitHub main branch
- DM Sans via `next/font/google`

Do not propose framework migrations (no Astro, no Remix, no plain React, no static-site rebuilds). Do not introduce a new ORM. Do not propose moving off Vercel. If asked to "improve performance," confirm pages are SSG/ISR first and look at runtime hydration before anything else.

---

## 3. The Hard Rules (Violations Break the Site)

1. **Never deploy from terminal.** All deployments go through GitHub → Vercel. Use `git push origin main`. `vercel --prod` is forbidden.
2. **Every user-facing Prisma query must include `is_published: true`.** Scripts in `src/scripts/` are the exception — they work on the full dataset. Audit every new query for this filter.
3. **Slug generation: strip special characters BEFORE converting spaces to hyphens.** The hell-s-kitchen bug came from doing it backwards. See `boroughToSlug` / `neighborhoodToSlug` in `src/lib/utils.ts:20-38` for the correct order; `src/scripts/test-slugs.ts` exercises them.
4. **Page titles under 60 characters.** Always use `buildTitle()` from `src/lib/utils.ts`. Run `npx tsx src/scripts/audit-titles.ts` after any title template change.
5. **Every page that displays data must show source attribution.** Use `<AboutThisData>` with the right variant (`hub`, `guide`, or `full`). NYC DOHMH must be cited by name on any page showing inspection grades.
6. **Canonical URLs always use www + https.** `https://www.eatrealfoodnyc.com`. The 301 redirect from non-www lives in `next.config.ts`. Do not touch.
7. **No fake reviews. Ever.** `CommunityRating` shows real Google data and links out to Google Maps and Yelp. `ShareExperience` collects 280-char anonymous notes with manual review (status=pending in `user_submissions`). Do not propose review generation, ever.
8. **Conservative dietary tagging.** Better 21% coverage than over-tagging. A celiac trusts our gluten-free flag. Read `src/scripts/regenerate-descriptions.ts` and `src/scripts/diversify-descriptions.ts` (the Claude-API enrichment paths) before suggesting any tag logic change. A single consolidated `ai-enrich.ts` orchestrator has not been split out yet.
9. **HTML output, not client-side hydration, for SEO-critical content.** H1s, H2s, restaurant names, ratings, grades, dietary tags, FAQ answers, neighbourhood scorecards — all in the initial server-rendered HTML. If you add a Client Component (`"use client"`), the SEO-critical text must already be present in the parent Server Component. Run the view-source test (§10) before merging.
10. **noindex pages stay noindex.** `/search`, `/near-me`, `/compare`, `/saved` are user UI, not crawlable destinations. Do not add them to the sitemap. Do not remove the noindex meta.
11. **Never delete a 301 redirect from `next.config.ts`.** The 32 expired-domain redirects capture backlink equity from the prior owner. Removing one costs real link juice.
12. **No deploys on Fridays.** Real rule.

---

## 4. The 12 Dietary Tags (Canonical)

`vegan`, `vegetarian`, `gluten-free`, `halal`, `kosher`, `dairy-free`, `keto`, `paleo`, `whole-foods`, `low-calorie`, `raw-food`, `nut-free`.

Stored pipe-separated in the `dietary_tags` column. Each tag has a hub page at `/healthy-restaurants/[tag]`. Tagging standard is enforced by `src/scripts/regenerate-descriptions.ts` and `src/scripts/diversify-descriptions.ts` — primary or explicit only, never inferred. A vegan restaurant carries the `vegan` tag; a restaurant with one vegan option does not.

Note: `paleo` currently has 0 restaurants — the enrichment pass was too strict. A targeted re-enrichment of farm-to-table restaurants is on the technical-debt list. Do not invent a paleo restaurant by hand to fix this.

---

## 5. The Page Type Inventory

| URL pattern | Type | JSON-LD |
|---|---|---|
| `/` | Homepage | WebSite + SearchAction, Organization |
| `/restaurants/[slug]` | Restaurant detail | Restaurant, BreadcrumbList, AggregateRating |
| `/nyc/[borough]/healthy-restaurants` | Borough hub (pillar) | ItemList + Dataset, FAQPage, AggregateRating + BreadcrumbList |
| `/nyc/[borough]/[neighborhood]/healthy-restaurants` | Neighbourhood hub | ItemList, FAQPage, AggregateRating + BreadcrumbList |
| `/healthy-restaurants/[diet]` | Diet hub | ItemList + Dataset, FAQPage, AggregateRating + BreadcrumbList |
| `/data/nyc-restaurant-health-grade-report` | Original research | Dataset + Article @graph |
| `/data/best-rated-restaurants` | Original research | Dataset + Article @graph |
| `/guides/[slug]` | Guide article | Article, FAQPage, BreadcrumbList |
| `/about`, `/about/*` | E-E-A-T pages | Organization (full on `/about`) |

When in doubt about schema, copy from an existing page of the same type. Do not invent new shapes.

---

## 6. The Pre-Publish Internal Link Routing Step (THE NEW ONE)

This is the highest-leverage step in the workflow and the reason this skill exists. Run it as the FIRST action of any publish — whether triggered by "do the weekly publish," a new guide going live, or a new data report. The whole point: equity flows from existing high-authority pages to the new asset so it ranks faster with fewer external backlinks.

Never push new pages without it. The agent owns this step; the user shouldn't have to ask for it explicitly each time.

### The procedure

1. **Identify the new assets.**
   - For weekly push: list the 100 restaurants going live in the next batch. If a list-batch script doesn't exist yet, build one: `src/scripts/list-next-publish-batch.ts` that queries Prisma for the top 100 unpublished by `priorityRank` (mapped to `priority_rank` in the DB) and outputs slugs, neighbourhoods, dietary tags, and hidden-gem status.
   - For a single new guide/research page: the URL slug and target keyword.

2. **For each new asset, identify 5–10 existing pages where a contextual link should be added.** Source priority order:
   - The relevant neighbourhood hub (`/nyc/[borough]/[neighborhood]/healthy-restaurants`) — strongest fit
   - The relevant borough hub (`/nyc/[borough]/healthy-restaurants`)
   - Every dietary hub the restaurant qualifies for (`/healthy-restaurants/[tag]`)
   - Both data reports if the restaurant is a hidden gem OR has a notable grade
   - Topically relevant guides (a new vegan restaurant → vegan guide and budget guide if cheap)
   - The homepage only for featured launches (new research pages, not individual restaurants)

3. **Propose specific anchor text** for each insertion. Use `ANCHOR_TEXT` constants from `src/lib/internal-links.ts` where they exist. Never use "click here," "read more," "this page," "learn more." Anchor text must contain the destination keyword — "best vegan restaurants in Williamsburg" linking to the Williamsburg vegan-tagged hub, not "the Williamsburg page."

4. **Generate the contextual paragraph.** One to two sentences, naturally written, containing the anchor text. The link must make sense to a reader, not just exist for the bot. If the surrounding section already mentions the topic, weave it in. If not, propose a new sentence that fits the paragraph's flow.

5. **Output the proposed edits as a structured diff** — file path, line number, before/after, anchor text, brief rationale. Group by source file so the user can review efficiently. Do not apply edits without explicit confirmation when the change touches more than 5 files.

6. **After application, run `npx tsx src/scripts/audit-internal-links-v2.ts`** to confirm no generic anchor text was introduced and no broken links were added.

### What "high-authority" means here

Pages with the most inbound internal links, the most external backlinks (the 32 expired-domain redirects funnel into specific guides — `seafood-healthy-restaurants-nyc` and `healthy-breakfast-nyc` are the highest), or the highest publish priority score. `src/scripts/audit-link-equity.ts` produces this ranking — run it first if uncertain.

### What this step is not

Not a license to spray internal links everywhere. Five to ten contextual links per new asset, placed where they belong, beats 50 forced ones. Quality over volume.

---

## 7. Adding a New X — Quick Recipes

### A new restaurant page
Already automated via the pipeline. Don't add manually. If a restaurant is missing, check `is_published`, then run `npx tsx src/scripts/publish-status.ts`. Never create restaurant pages by hand — the schema, slug, and enrichment have to flow through the pipeline to stay consistent.

### A new guide article
1. Add the slug to `src/config/keywords.ts` with target query.
2. Create `src/app/guides/[slug]/page.tsx` modelled on an existing guide (`src/app/guides/vegan-nyc-borough-guide/page.tsx` is a good template).
3. Required components: `<TopicalBreadcrumb>`, `<DataCallout>` with proprietary stat, `<FAQSection>` with FAQ JSON-LD, `<AboutThisData variant="guide">` at bottom, `<ContextualLinks>` to relevant hubs.
4. Required JSON-LD: Article, FAQPage, BreadcrumbList.
5. If the DataCallout needs fresh stats: `npx tsx src/scripts/pull-guide-stats.ts`.
6. **Run §6 routing before pushing.**
7. After deploy: submit URL via GSC's URL Inspection tool for faster indexation.

### A new diet-type hub
Almost certainly not needed — there are 12, matching the 12 canonical tags. If the request comes in, check the taxonomy first. New taxonomy entries require a database migration AND a full enrichment re-pass on the affected restaurants. Don't do this lightly.

### A new data report (e.g., Dietary Diversity Index — Phase 2 Week 6)
1. Build the data pull script: `src/scripts/pull-[name].ts` → outputs JSON to `src/data/[name].json`.
2. Create `src/app/data/[slug]/page.tsx` modelled on `/data/nyc-restaurant-health-grade-report`.
3. JSON-LD: Dataset + Article in `@graph` format. License `CC BY 4.0`. `isBasedOn` NYC DOHMH (or Google Maps as appropriate). Populate `variableMeasured` array.
4. Cross-link from both existing data reports — each links to the others in a Related Reports section.
5. Add to primary header nav, mobile menu, global footer.
6. **Run §6 routing before pushing.** Research pages get linked from the homepage feature banner; individual restaurants do not.

### A new borough or neighbourhood hub
Boroughs are fixed at 5. Neighbourhoods are derived from the NYC NTA GeoJSON — adding one means a new NTA boundary exists. Don't fabricate.

---

## 8. The Audit Scripts (Run These)

Run after meaningful changes. Never push without the relevant audit clean.

| Script | When to run |
|---|---|
| `audit-titles.ts` | After any change to a title template or page metadata |
| `audit-alt-text.ts` | After adding images or image components |
| `audit-internal-links-v2.ts` | After any change to copy that contains links; always after §6 |
| `audit-crawl-depth.ts` | After adding new page types, removing nav links, or restructuring URL patterns |
| `audit-link-equity.ts` | Before the §6 routing step, to rank source pages |
| `audit-keywords.ts` | After changing keyword targeting or `src/config/keywords.ts` |
| `audit-min-links.ts` *(not yet built)* | After publishing to verify every published page has its minimum inbound link threshold — needs to be written |
| `verify-canonical.ts` | After any change to canonical logic or `next.config.ts` redirects |
| `generate-audit-report.ts` *(not yet built)* | Weekly, before the Monday push, to produce `AUDIT_REPORT.md` — needs to be written |

If a script flags an issue, fix it before moving on. Don't push with warnings outstanding.

---

## 9. The View-Source Test (Nathan's Rule)

After any change to a page template — especially anything touching Server vs. Client Components — load the deployed preview URL, view page source (Cmd-U / Ctrl-U), and search for:
- The H1 text
- The primary target keyword
- A restaurant name (for listing pages)
- An FAQ question and its answer (for guide and hub pages)

If any of these is not in the raw HTML, the change introduced client-side rendering on SEO-critical content. Fix before merge. AI crawlers and traditional crawlers both prefer the source HTML; some won't execute JS at all. This is the single most important infrastructure-level check.

---

## 10. The "Do the Weekly Publish" Command

The publish cadence is ad-hoc. When the user says **"do the weekly publish"** — or any natural-language equivalent ("run the weekly push," "push this week's batch," "publish the next 100," etc.) — execute this workflow end-to-end as a single agent invocation. Do not stop between steps unless something fails or the user must approve.

### The workflow

1. **Confirm clean state.** Run `git status`. If there are uncommitted changes unrelated to the publish, stop and surface them to the user before proceeding.
2. **Sync main.** `git pull origin main`.
3. **List the batch.** Run `npx tsx src/scripts/list-next-publish-batch.ts` to get the next 100 restaurants queued for publish. Capture slugs, neighbourhoods, dietary tags, and hidden-gem status.
4. **Rank source pages.** Run `npx tsx src/scripts/audit-link-equity.ts` to get the current authority ranking of existing pages — needed for the routing step.
5. **Execute §6 routing.** For each of the 100 new restaurants, propose 3–5 internal link insertions from existing high-authority pages following the source priority order. Output as a structured diff grouped by source file: path, target URL, anchor text, surrounding paragraph, rationale.
6. **Pause for approval.** Surface the full set of proposed edits. Wait for the user's explicit OK before applying. This is the only mandatory stop in the workflow.
7. **Apply and commit routing.** After approval, apply all edits, then `git commit -m "internal links: route equity to batch <N>"`.
8. **Audit.** Run `npx tsx src/scripts/audit-internal-links-v2.ts`. If clean, continue. If flagged, fix the flagged items (or surface for review if the fix isn't obvious) before moving on.
9. **Run the publish script.** `npx tsx src/scripts/weekly-publish.ts` to mark the next 100 as `is_published=true`. Then `git commit --allow-empty -m "publish: batch <N>" && git push origin main` to trigger Vercel. (A consolidated `weekly-push.sh` wrapper has not been written yet — keeping the steps separate avoids hiding errors mid-flight.)
10. **Surface deploy info.** Output: the Vercel dashboard URL, the count of new URLs going live, the list of slugs (or a sample if too long), a reminder that the user should submit the updated sitemap to GSC once deploy completes.
11. **Post-deploy spot check.** Once Vercel reports the build is live, fetch 3 random new restaurant URLs and confirm the H1 text and primary keyword appear in the raw HTML response. Report results.

### What can go wrong, and what to do

- **Git dirty at step 1** → don't proceed. Show the user the unstaged changes.
- **`list-next-publish-batch.ts` doesn't exist** → build it (see Prompt #1 setup), don't fake the batch from memory.
- **Audit fails at step 8** → surface the specific flagged links. Don't bypass.
- **`weekly-publish.ts` fails mid-execution** → don't retry blindly. Read the error, check `is_published` state in Supabase, surface to the user.
- **View-source spot check at step 11 misses the H1** → critical signal. Pause subsequent publishes until the rendering issue is diagnosed. This is the test that protects the entire SEO strategy.

### What this command is not

Not a free-form "make changes and ship." The §6 routing step is mandatory. Skipping it forfeits the entire reason the agentic workflow exists. If the user ever asks the agent to "just run weekly-publish.ts without the routing," remind them that the routing step is what makes the cadence compound — then defer to their decision if they insist.

---

## 11. What Not to Do

- Don't propose A/B tests on SEO-critical pages without a GSC baseline of ≥4 weeks.
- Don't write content that doesn't add information gain over what's already indexed. One proprietary-data page beats 100 regurgitated pages. Every guide and report must contain stats not available elsewhere online.
- Don't hide critical data behind tabs or accordions without preserving HTML presence (accordions are fine — they're CSS-toggled; client-side conditional rendering is not).
- Don't add bullet-point lists to user-facing copy where prose serves better. The proprietary data blocks and comparison tables are the intentional exceptions.
- Don't introduce new fonts. DM Sans is the system font for FOUT reasons.
- Don't introduce new colour values. The palette in §2 is the system.
- Don't `console.log` in production code. Remove before commit.
- Don't suggest "let me also fix this unrelated thing while I'm here" — scope creep breaks the audit cycle.

---

## 12. Useful Commands Cheat Sheet

```bash
# Database
npx prisma migrate dev --name <name>
npx prisma studio

# Pipeline (when needed)
npx tsx src/scripts/ingest.ts
npx tsx src/scripts/regenerate-descriptions.ts    # Claude API description rewrites
npx tsx src/scripts/diversify-descriptions.ts     # Anti-template-pattern pass
# (dohmh-join.ts and a consolidated ai-enrich.ts have not been split out yet)

# Weekly publishing
npx tsx src/scripts/publish-status.ts      # check progress
npx tsx src/scripts/weekly-publish.ts      # mark next 100 as published
# weekly-push.sh wrapper not built; run weekly-publish.ts then git commit/push manually

# Information Gain data refresh
npx tsx src/scripts/pull-guide-stats.ts
npx tsx src/scripts/pull-neighborhood-scorecards.ts
npx tsx src/scripts/pull-health-grade-report.ts
npx tsx src/scripts/pull-best-rated-restaurants.ts

# Audits
npx tsx src/scripts/audit-titles.ts
npx tsx src/scripts/audit-internal-links-v2.ts
npx tsx src/scripts/audit-link-equity.ts
# generate-audit-report.ts: not yet built

# Build & deploy
npm run build                              # local validation only
git push origin main                       # the only deploy mechanism
```

---

## 13. When in Doubt

- Schema question → copy from an existing page of the same type.
- Internal linking question → check `src/lib/internal-links.ts` for the canonical anchor constant.
- Keyword question → `src/config/keywords.ts` is the single source of truth.
- Data attribution question → use `<AboutThisData>`, pick the right variant.
- "Can I deploy this?" → only via `git push origin main`. Never any other way.
- "Is this Server or Client?" → Server unless it needs interactivity. Even then, lift SEO-critical text to the Server parent.

---

*End of skill. Reread before every editorial or infrastructural change.*
