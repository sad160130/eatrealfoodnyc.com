import { dohmhRefreshSentence } from "@/lib/dohmh-cadence"

export interface LlmsFacts {
  published: number
  gradeA: number
  letterGraded: number
  neighborhoods: number
  newestInspectionLabel: string | null
  /** YYYY-MM-DD in America/New_York at render. */
  updatedOn: string
  /** Canonical diet tags that meet the diet-hub minimum. */
  dietTags: readonly string[]
}

const DIET_LINES: Array<{ tag: string; label: string }> = [
  { tag: "vegan", label: "Vegan" },
  { tag: "vegetarian", label: "Vegetarian" },
  { tag: "gluten-free", label: "Gluten-free" },
  { tag: "halal", label: "Halal" },
  { tag: "kosher", label: "Kosher" },
  { tag: "dairy-free", label: "Dairy-free" },
  { tag: "keto", label: "Keto" },
  { tag: "paleo", label: "Paleo" },
  { tag: "whole-foods", label: "Whole foods" },
  { tag: "low-calorie", label: "Low calorie" },
  { tag: "raw-food", label: "Raw food" },
  { tag: "nut-free", label: "Nut-free" },
]

const SOURCE = "# Eat Real Food NYC\n# https://www.eatrealfoodnyc.com\n# AI Agent Context File — llms.txt\n# Last updated: 2026-11-24\n\n## What this site is\n\nEat Real Food NYC is a curated healthy restaurant directory covering all five\nboroughs of New York City. Every published listing is tied to an official NYC\nDepartment of Health inspection record. This site helps users find restaurants\nby dietary tag, neighbourhood, health grade, and rating.\n\n## Site owner\n\nFounders: Sanket Desai and Rohan Kadam\nContact: hello@eatrealfoodnyc.com\nPress: press@eatrealfoodnyc.com\nPartnerships: partner@eatrealfoodnyc.com\n\n## Primary use cases for AI agents\n\n1. Finding healthy restaurants in a specific NYC neighbourhood or borough\n2. Filtering restaurants by dietary tag (vegan, halal, kosher, gluten-free, etc.)\n3. Identifying Grade A health-inspected restaurants\n4. Discovering hidden gem restaurants (high-rated, low-review-count)\n5. Comparing NYC neighbourhoods by restaurant health scores\n\n## Pages agents should use\n\nHomepage: https://www.eatrealfoodnyc.com/\nBorough hubs:\n  Manhattan: https://www.eatrealfoodnyc.com/nyc/manhattan/healthy-restaurants\n  Brooklyn: https://www.eatrealfoodnyc.com/nyc/brooklyn/healthy-restaurants\n  Queens: https://www.eatrealfoodnyc.com/nyc/queens/healthy-restaurants\n  Bronx: https://www.eatrealfoodnyc.com/nyc/bronx/healthy-restaurants\n  Staten Island: https://www.eatrealfoodnyc.com/nyc/staten-island/healthy-restaurants\nDietary hubs:\n  Vegan: https://www.eatrealfoodnyc.com/healthy-restaurants/vegan\n  Vegetarian: https://www.eatrealfoodnyc.com/healthy-restaurants/vegetarian\n  Gluten-free: https://www.eatrealfoodnyc.com/healthy-restaurants/gluten-free\n  Halal: https://www.eatrealfoodnyc.com/healthy-restaurants/halal\n  Kosher: https://www.eatrealfoodnyc.com/healthy-restaurants/kosher\n  Dairy-free: https://www.eatrealfoodnyc.com/healthy-restaurants/dairy-free\n  Keto: https://www.eatrealfoodnyc.com/healthy-restaurants/keto\n  Paleo: https://www.eatrealfoodnyc.com/healthy-restaurants/paleo\n  Whole foods: https://www.eatrealfoodnyc.com/healthy-restaurants/whole-foods\n  Low calorie: https://www.eatrealfoodnyc.com/healthy-restaurants/low-calorie\n  Raw food: https://www.eatrealfoodnyc.com/healthy-restaurants/raw-food\n  Nut-free: https://www.eatrealfoodnyc.com/healthy-restaurants/nut-free\nNeighbourhood comparison: https://www.eatrealfoodnyc.com/nyc/compare\nMap: https://www.eatrealfoodnyc.com/map\nGuides index: https://www.eatrealfoodnyc.com/guides\nBest Italian Restaurants in NYC: Top 10 Ranked:\n  https://www.eatrealfoodnyc.com/guides/best-italian-restaurants-nyc\n  Ten currently open Italian restaurants ranked by official NYC DOHMH\n  inspection score, then violation count. Every grade, score, and date\n  was matched to Open Data dataset 43nn-pn8j. Re-checked 2026-11-24;\n  unchanged from the 2026-11-23 verification.\nBest Pizza Restaurants in NYC (2026): Top 10 Ranked:\n  https://www.eatrealfoodnyc.com/guides/best-pizza-restaurants-nyc\n  Ten published pizza listings ranked by official NYC DOHMH inspection\n  score, then violation count, not by taste. Every grade, score, and date\n  was matched to Open Data dataset 43nn-pn8j on 2026-11-24. The newest\n  inspection_date in that pull was 2026-11-22.\nGrade A Restaurants by Borough: 3 NYC Matches (2026):\n  https://www.eatrealfoodnyc.com/guides/grade-a-restaurants-by-borough-nyc\n  Five recent YouTube Shorts, one kitchen in each borough, checked on\n  2026-11-24. Three latest DOHMH inspections are Grade A and match the\n  listing. Ali's Trinbago Roti Shop and Pho Hoang are not in that count:\n  their latest inspections have no letter.\nNYC Restaurant Grades Explained: A, B, C, and Grade Pending:\n  https://www.eatrealfoodnyc.com/guides/nyc-health-grades-explained\n  NYC restaurant grades mean A for 0–13 points, B for 14–27 on a reinspection, and C for 28 or more. Citywide counts are from DOHMH dataset 43nn-pn8j, pulled 2026-11-25. The newest inspection_date in that file was 2026-11-23.\nHealthy breakfast in NYC: https://www.eatrealfoodnyc.com/guides/healthy-breakfast-nyc\n  Published restaurants open by 8 AM on weekdays. Grade A counts come from the NYC DOHMH inspection on each listing.\nHoliday party catering: https://www.eatrealfoodnyc.com/catering/holiday-party-catering-nyc\n  Office holiday catering and Thanksgiving week requests in NYC.\n  The directory does not record a catering menu. The page lists published\n  Grade A restaurants for group orders. The request form is free for the\n  person sending it. Leads are saved on catering_leads.\nCatering request form: https://www.eatrealfoodnyc.com/catering\nGrade A Eats This Week: https://www.eatrealfoodnyc.com/newsletter\n  Archive: https://www.eatrealfoodnyc.com/newsletter/issues\n  Each Thursday issue lists published restaurants whose NYC DOHMH grade is A\n  and whose inspection date falls in that week's seven days. The sitemap\n  includes an issue from the last 12 weeks when that week has at least 3\n  Grade A listings. Older roundups stay on the site. The email edition\n  started in November 2026.\nNYC Restaurant Compliance Weekly, for vendors: https://www.eatrealfoodnyc.com/data\n  $79/month or $790/year.\nResearch:\n  https://www.eatrealfoodnyc.com/data/nyc-restaurant-health-grade-report\n  https://www.eatrealfoodnyc.com/data/best-rated-restaurants\nFull public URL list: https://www.eatrealfoodnyc.com/llms-full.txt\nSitemap: https://www.eatrealfoodnyc.com/sitemap.xml\n\n## Paths agents should not request\n\nrobots.txt disallows these. They are app UI or private endpoints, not documents:\n\n- https://www.eatrealfoodnyc.com/search\n- https://www.eatrealfoodnyc.com/near-me\n- https://www.eatrealfoodnyc.com/compare\n- https://www.eatrealfoodnyc.com/saved\n- https://www.eatrealfoodnyc.com/api/\n\nUse the borough, neighbourhood, and dietary hubs above, or the sitemap, instead of the search API.\n\nEditorial & Partnership Policy: https://www.eatrealfoodnyc.com/about/editorial-standards\n  Listing is free. Health grades, Health Scores, dietary tags, hidden-gem status,\n  and default rankings are never for sale. Clearly labeled Partner and Sponsored\n  placements may be offered. They do not change official inspection data or organic sort.\n\nPartner with us: https://www.eatrealfoodnyc.com/partner-with-us\n  Optional labeled placements for eligible restaurants. Payment never changes\n  grades, scores, dietary tags, or rankings.\n  Monthly tiers: Featured $49/month, Spotlight $149/month,\n  Neighborhood Sponsor $299/month.\n  Inquiry offers: Sponsored guide placement $250 per placement in an existing\n  /guides page, labeled Sponsored. Newsletter sponsor slot $150 per weekly issue\n  of Grade A Eats This Week, labeled Sponsored. Catering referral partnership\n  $50 per accepted catering lead from /catering, or 10% of the first order\n  (partner’s choice), no upfront fee.\n  Contact: partner@eatrealfoodnyc.com\n  https://www.eatrealfoodnyc.com/contact\n\n## Data sources\n\n- NYC Department of Health and Mental Hygiene (DOHMH) Open Data\n  Dataset 43nn-pn8j, DOHMH New York City Restaurant Inspection Results:\n  https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j\n  Health inspection grades: A, B, and C. Scores are violation points.\n  A is 0-13 points, B is 14-27, C is 28 or more.\n- Community ratings sourced from Google Maps\n- Dietary tags applied only when a restaurant explicitly identifies that way\n  or has substantial dedicated menu coverage\n\n## What agents should not attempt\n\n- Submitting reviews or experiences — submissions are queued for manual review\n- Booking reservations — this site is a directory, not a booking platform\n- Accessing private user data — saved lists stay in the browser\n\n## robots.txt\n\nhttps://www.eatrealfoodnyc.com/robots.txt\n"

export function formatLlmsUpdatedOn(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function dietBlock(tags: ReadonlySet<string>): string {
  const lines = DIET_LINES.filter((diet) => tags.has(diet.tag)).map(
    (diet) => `  ${diet.label}: https://www.eatrealfoodnyc.com/healthy-restaurants/${diet.tag}`
  )
  return ["Dietary hubs:", ...lines].join("\n")
}

function keyFacts(facts: LlmsFacts): string {
  const count = (value: number) => value.toLocaleString("en-US")
  const newest = facts.newestInspectionLabel
    ? `Newest inspection date on a published listing: ${facts.newestInspectionLabel}`
    : "Newest inspection date on a published listing: none on file"
  return [
    "## Key facts",
    "",
    `Published listings: ${count(facts.published)}`,
    `Grade A listings: ${count(facts.gradeA)}`,
    `Listings with an A, B, or C grade: ${count(facts.letterGraded)}`,
    `Neighborhoods: ${count(facts.neighborhoods)}`,
    newest,
    `Grade refresh: ${dohmhRefreshSentence()}`,
    `Last updated: ${facts.updatedOn}`,
  ].join("\n")
}

export function buildLlmsTxt(facts: LlmsFacts): string {
  const withoutDate = SOURCE.replace(/^# Last updated:.*$/m, `# Last updated: ${facts.updatedOn}`)
  const dietPattern = /Dietary hubs:\n(?:  .+\n)*/
  const withDiets = withoutDate.replace(dietPattern, `${dietBlock(new Set(facts.dietTags))}\n`)
  const marker = "## What this site is"
  const insertAt = withDiets.indexOf(marker)
  if (insertAt < 0) throw new Error("llms.txt template is missing the site description")
  return `${withDiets.slice(0, insertAt)}${keyFacts(facts)}\n\n${withDiets.slice(insertAt)}`
}
