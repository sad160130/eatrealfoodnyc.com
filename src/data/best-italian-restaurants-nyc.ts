/**
 * Verified "best Italian restaurants in NYC" ranking.
 * Every grade, score, date, CAMIS, and violation count was checked against
 * NYC DOHMH Open Data dataset 43nn-pn8j and the live listing on 2026-11-24
 * (America/New_York). Those values are unchanged from the 2026-11-23 check.
 * Only restaurants whose latest city inspection matches the published listing
 * are included. Do not invent facts or add restaurants without a fresh match.
 */
export const BEST_ITALIAN_PATH = "/guides/best-italian-restaurants-nyc"
export const BEST_ITALIAN_TITLE = "Best Italian Restaurants in NYC: Top 10 Ranked"
export const BEST_ITALIAN_SHORT_TITLE = "Best Italian Restaurants NYC"
export const BEST_ITALIAN_DESCRIPTION =
  "The best Italian restaurants in NYC, ranked by current NYC Health Department Grade A scores and violation counts, verified against official DOHMH Open Data."
export const BEST_ITALIAN_PUBLISHED = "2026-11-23"
export const BEST_ITALIAN_MODIFIED = "2026-11-24"
export const BEST_ITALIAN_VERIFIED_ON = "November 24, 2026"
export const BEST_ITALIAN_FIRST_VERIFIED_ON = "November 23, 2026"
export const BEST_ITALIAN_KEYWORD = "best italian restaurants in nyc"
export const BEST_ITALIAN_KEYWORD_VOLUME = 27100
export const BEST_ITALIAN_KEYWORD_SOURCE =
  "DataForSEO Labs Google keyword_overview, location_code 2840 (United States), language en, pulled November 23, 2026"
export const DOHMH_DATASET_ID = "43nn-pn8j"
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"

export const BEST_ITALIAN_INTRO =
  "The best Italian restaurants in NYC, ranked by official health-inspection records rather than reviews, start with Morandi in Greenwich Village. Morandi holds a NYC Department of Health Grade A with a score of 2 points and 1 violation from its December 8, 2025 inspection. This list ranks 10 open Italian restaurants in our directory whose latest city inspection matches the grade, score, and date we publish. We ordered them by lowest score, then fewest violations, then most recent date, using NYC DOHMH Open Data dataset 43nn-pn8j. A Grade A is 0 to 13 points and measures food safety, not taste."

export type RankedViolation = {
  code: string
  critical: boolean
  summary: string
}

export type RankedItalianRestaurant = {
  rank: number
  name: string
  officialDba: string
  slug: string
  camis: string
  borough: string
  neighborhood: string
  address: string
  grade: "A"
  score: number
  violationCount: number
  inspectionDate: string
  inspectionDateLabel: string
  inspectionType: string
  honestLine: string
  body: string
  violations: RankedViolation[]
}

function abceats(camis: string): string {
  return `https://a816-health.nyc.gov/ABCEats/Restaurant/Detail/${camis}`
}

export function restaurantHref(slug: string): string {
  return `/restaurants/${slug}`
}

export function neighborhoodHref(borough: string, neighborhood: string): string {
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/['\u2018\u2019\u201C\u201D".,]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
  return `/nyc/${slugify(borough)}/${slugify(neighborhood)}/healthy-restaurants`
}

export const BEST_ITALIAN_RESTAURANTS: RankedItalianRestaurant[] = [
  {
    rank: 1,
    name: "Morandi",
    officialDba: "MORANDI",
    slug: "morandi",
    camis: "50076526",
    borough: "Manhattan",
    neighborhood: "Greenwich Village",
    address: "211 Waverly Pl, New York, NY 10014",
    grade: "A",
    score: 2,
    violationCount: 1,
    inspectionDate: "2025-12-08",
    inspectionDateLabel: "December 8, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Greenwich Village trattoria at 211 Waverly Place whose latest inspection is the cleanest on this list: Grade A, 2 points, 1 violation.",
    body: "Morandi is listed in our directory as an Italian restaurant at 211 Waverly Place in Greenwich Village. The site description calls it a rustic trattoria with sidewalk seating. It sits at the top of this ranking only because of its official inspection record. On December 8, 2025, a NYC Department of Health cycle inspection (an initial inspection) scored the kitchen at 2 points and recorded 1 violation, a non-critical 10F finding about a non-food contact surface or piece of equipment. The posted grade is A. That grade, score, and date match the published listing, and a full CAMIS history pulled on November 24, 2026 showed no later inspection. Two points is well inside the Grade A range of 0 to 13. This is a food-safety ranking, not a review of the menu or the room.",
    violations: [
      {
        code: "10F",
        critical: false,
        summary: "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
    ],
  },
  {
    rank: 2,
    name: "Carmine's - Upper West Side",
    officialDba: "CARMINE'S / VIRGIL'S",
    slug: "carmines-upper-west-side",
    camis: "50166715",
    borough: "Manhattan",
    neighborhood: "Upper West Side",
    address: "2450 Broadway, New York, NY 10024",
    grade: "A",
    score: 9,
    violationCount: 2,
    inspectionDate: "2026-10-22",
    inspectionDateLabel: "October 22, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "The Upper West Side Carmine's at 2450 Broadway holds a current Grade A with 9 points and 2 violations from an October 22, 2026 inspection.",
    body: "Our listing names this kitchen Carmine's - Upper West Side, at 2450 Broadway. The official DOHMH record for CAMIS 50166715 files the same address as Carmine's / Virgil's. The directory describes family-style Southern Italian dishes. It ranks second here because of a recent, matching Grade A: on October 22, 2026, an initial cycle inspection scored 9 points and recorded 2 violations, one critical (06D, a food-contact surface not properly washed, rinsed, and sanitized) and one non-critical (10F). Nine points is still a Grade A. The grade, score, and date on the listing match the latest city row. This is the most recent inspection on the list.",
    violations: [
      {
        code: "06D",
        critical: true,
        summary: "Food contact surface not properly washed, rinsed and sanitized after each use and following any activity when contamination may have occurred.",
      },
      {
        code: "10F",
        critical: false,
        summary: "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
    ],
  },
  {
    rank: 3,
    name: "Isabelle's Osteria",
    officialDba: "ISABELLE'S OSTERIA",
    slug: "isabelles-osteria",
    camis: "50141111",
    borough: "Manhattan",
    neighborhood: "Flatiron District",
    address: "245 Park Ave S, New York, NY 10003",
    grade: "A",
    score: 9,
    violationCount: 3,
    inspectionDate: "2026-02-04",
    inspectionDateLabel: "February 4, 2026",
    inspectionType: "Cycle Inspection / Re-inspection",
    honestLine:
      "A Flatiron Italian restaurant at 245 Park Avenue South with a Grade A, 9 points, and 3 violations on its February 4, 2026 re-inspection.",
    body: "Isabelle's Osteria is listed at 245 Park Avenue South in the Flatiron District. The site description mentions an enclosed patio, Italian dishes, wine, and cocktails. It ties Carmine's at 9 inspection points but recorded 3 violations instead of 2, so it ranks third. The February 4, 2026 visit was a cycle re-inspection. The official record includes two critical findings, 04K (evidence of rats or live rats) and 04N (flies or other nuisance pests), plus a non-critical 10H finding about single-service articles. A Grade A still applies because the total was 9 points, under the 14-point threshold for a B. The listing's grade, score, and date match that re-inspection. A Grade A is not a claim that a kitchen had no critical violations.",
    violations: [
      {
        code: "04K",
        critical: true,
        summary: "Evidence of rats or live rats in establishment's food or non-food areas.",
      },
      {
        code: "10H",
        critical: false,
        summary: "Single service article not provided, reused, or not protected from contamination when transported, stored, or dispensed.",
      },
      {
        code: "04N",
        critical: true,
        summary: "Filth flies or food/refuse/sewage associated flies or other nuisance pests in food or non-food areas.",
      },
    ],
  },
  {
    rank: 4,
    name: "Panzerotti Bites",
    officialDba: "PANZEROTTI BITES",
    slug: "panzerotti-bites",
    camis: "50070867",
    borough: "Brooklyn",
    neighborhood: "Cobble Hill",
    address: "235 Smith St, Brooklyn, NY 11231",
    grade: "A",
    score: 9,
    violationCount: 3,
    inspectionDate: "2025-12-15",
    inspectionDateLabel: "December 15, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Cobble Hill counter-serve shop on Smith Street with a Grade A, 9 points, and 3 violations from December 15, 2025.",
    body: "Panzerotti Bites is listed at 235 Smith Street in Cobble Hill, Brooklyn. The site description calls it a counter-serve shop making Italian dough pockets with sweet and savory fillings, plus beer, wine, and coffee. It matches Isabelle's on score (9) and violation count (3) and ranks fourth because its inspection is older (December 15, 2025, an initial cycle inspection). The official record lists one critical 06C finding (food, supplies, or equipment not protected from contamination) and two non-critical findings, 10H and 10F. The published Grade A, score of 9, and date match the city data. Like every kitchen here, it is open in our directory as an Italian restaurant and passed the same match test.",
    violations: [
      {
        code: "06C",
        critical: true,
        summary: "Food, supplies, or equipment not protected from a potential source of contamination during storage, preparation, transportation, display, or service.",
      },
      {
        code: "10H",
        critical: false,
        summary: "Single service article not provided, reused, or not protected from contamination when transported, stored, or dispensed.",
      },
      {
        code: "10F",
        critical: false,
        summary: "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
    ],
  },
  {
    rank: 5,
    name: "Forma Pasta Factory",
    officialDba: "FORMA PASTA FACTORY",
    slug: "forma-pasta-factory-greenpoint",
    camis: "50086823",
    borough: "Brooklyn",
    neighborhood: "Greenpoint",
    address: "14 Bedford Ave, Brooklyn, NY 11222",
    grade: "A",
    score: 10,
    violationCount: 1,
    inspectionDate: "2025-11-06",
    inspectionDateLabel: "November 6, 2025",
    inspectionType: "Cycle Inspection / Re-inspection",
    honestLine:
      "A Greenpoint pasta kitchen at 14 Bedford Avenue with a Grade A, 10 points, and only 1 recorded violation on November 6, 2025.",
    body: "Forma Pasta Factory is listed at 14 Bedford Avenue in Greenpoint. The site description says pasta is made behind the counter and flash-boiled to order. It has a higher score than the 9-point kitchens above (10 points) but only 1 violation on its November 6, 2025 cycle re-inspection, a critical 05D finding about a missing or inaccessible hand-washing facility in or near a toilet room or food-preparation area. The posted grade is A. The listing matches that grade, score, and date. Ten points remains inside the Grade A range. Among the 10-point restaurants that passed the match test, this one recorded the fewest violations.",
    violations: [
      {
        code: "05D",
        critical: true,
        summary: "No hand washing facility in or adjacent to the toilet room or within 25 feet of a food preparation, food service, or ware washing area, or the facility was not accessible.",
      },
    ],
  },
  {
    rank: 6,
    name: "Evelina",
    officialDba: "EVELINA'S",
    slug: "evelina",
    camis: "50062832",
    borough: "Brooklyn",
    neighborhood: "Clinton Hill",
    address: "211 Dekalb Ave, Brooklyn, NY 11205",
    grade: "A",
    score: 10,
    violationCount: 2,
    inspectionDate: "2026-09-16",
    inspectionDateLabel: "September 16, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Clinton Hill Italian restaurant at 211 Dekalb Avenue with a Grade A, 10 points, and 2 violations from September 16, 2026.",
    body: "Evelina is listed at 211 Dekalb Avenue in Clinton Hill, Brooklyn. The official DBA on CAMIS 50062832 is Evelina's, at the same address. The site description mentions Mediterranean and Italian pastas, small plates, and wood-fired dishes. On September 16, 2026, an initial cycle inspection scored 10 points and recorded 2 violations: a critical 04N finding for flies or other nuisance pests, and a non-critical 08A finding that the establishment was not free of harborage or conditions conducive to pests. The published Grade A, score, and date match that inspection. It ranks after Forma Pasta Factory because both scored 10, but Evelina had 2 violations rather than 1.",
    violations: [
      {
        code: "08A",
        critical: false,
        summary: "Establishment is not free of harborage or conditions conducive to rodents, insects, or other pests.",
      },
      {
        code: "04N",
        critical: true,
        summary: "Filth flies or food/refuse/sewage associated flies or other nuisance pests in food or non-food areas.",
      },
    ],
  },
  {
    rank: 7,
    name: "Olive Garden Italian Restaurant",
    officialDba: "OLIVE GARDEN",
    slug: "olive-garden-italian-restaurant-east",
    camis: "40930657",
    borough: "Brooklyn",
    neighborhood: "East New York",
    address: "505 Gateway Dr, Brooklyn, NY 11239",
    grade: "A",
    score: 10,
    violationCount: 2,
    inspectionDate: "2026-01-05",
    inspectionDateLabel: "January 5, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "The East New York Olive Garden at 505 Gateway Drive holds a current Grade A with 10 points and 2 violations from January 5, 2026.",
    body: "This is the Olive Garden at 505 Gateway Drive in East New York, Brooklyn, CAMIS 40930657. It is a chain location. It appears here because the latest official inspection matches the listing and the score-and-violation ranking put it in the top 10, not because we give chains special treatment or because we ranked popularity. On January 5, 2026, an initial cycle inspection scored 10 points and recorded 2 violations: a critical 02G finding about cold time/temperature control for safety food held too warm, and a non-critical 10F finding. The published Grade A, score of 10, and date match that inspection. It ties Evelina at 10 points and 2 violations and ranks seventh because its inspection is older.",
    violations: [
      {
        code: "10F",
        critical: false,
        summary: "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
      {
        code: "02G",
        critical: true,
        summary: "Cold TCS food held above the required cold-holding temperature.",
      },
    ],
  },
  {
    rank: 8,
    name: "San Marzano",
    officialDba: "SAN MARZANO",
    slug: "san-marzano",
    camis: "41699229",
    borough: "Manhattan",
    neighborhood: "East Village",
    address: "117 2nd Ave, New York, NY 10003",
    grade: "A",
    score: 11,
    violationCount: 2,
    inspectionDate: "2025-12-01",
    inspectionDateLabel: "December 1, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "An East Village pasta restaurant at 117 Second Avenue with a Grade A, 11 points, and 2 violations from December 1, 2025.",
    body: "San Marzano is listed at 117 Second Avenue in the East Village. The site description says it offers many pasta shapes to pair with many sauces, plus appetizers, panini, and wine. On December 1, 2025, an initial cycle inspection scored 11 points and recorded 2 violations: a critical 06C finding (food, supplies, or equipment not protected from contamination) and a non-critical 10G finding about deficient dishwashing or ware washing. The published Grade A, score, and date match the city record. Eleven points is still a Grade A, two points short of the top of that range. It is the lowest-scoring 11-point kitchen that also has only 2 violations and the most recent inspection in that group.",
    violations: [
      {
        code: "10G",
        critical: false,
        summary: "Dishwashing and ware washing: cleaning and sanitizing of tableware, including dishes, utensils, and equipment, was deficient.",
      },
      {
        code: "06C",
        critical: true,
        summary: "Food, supplies, or equipment not protected from a potential source of contamination during storage, preparation, transportation, display, or service.",
      },
    ],
  },
  {
    rank: 9,
    name: "Don Cheech",
    officialDba: "DON CHEECH",
    slug: "don-cheech",
    camis: "50122723",
    borough: "Staten Island",
    neighborhood: "Stapleton",
    address: "1271 Bay St, Staten Island, NY 10305",
    grade: "A",
    score: 11,
    violationCount: 2,
    inspectionDate: "2025-11-21",
    inspectionDateLabel: "November 21, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Stapleton, Staten Island Italian restaurant at 1271 Bay Street with a Grade A, 11 points, and 2 violations from November 21, 2025.",
    body: "Don Cheech is listed at 1271 Bay Street in Stapleton, Staten Island, the only Staten Island kitchen in this top 10. On November 21, 2025, an initial cycle inspection scored 11 points and recorded 2 violations: a critical 04L finding for evidence of mice or live mice, and a non-critical 08A finding about harborage or conditions conducive to pests. The published Grade A, score, and date match that inspection. It ties San Marzano at 11 points and 2 violations and ranks ninth because the inspection is slightly older. A Grade A at 11 points can still include a critical pest finding. Readers who want the official detail can open the CAMIS record.",
    violations: [
      {
        code: "08A",
        critical: false,
        summary: "Establishment is not free of harborage or conditions conducive to rodents, insects, or other pests.",
      },
      {
        code: "04L",
        critical: true,
        summary: "Evidence of mice or live mice in establishment's food or non-food areas.",
      },
    ],
  },
  {
    rank: 10,
    name: "Scalini Fedeli",
    officialDba: "SCALINI FEDELI",
    slug: "scalini-fedeli",
    camis: "40700724",
    borough: "Manhattan",
    neighborhood: "Tribeca",
    address: "165 Duane St, New York, NY 10013",
    grade: "A",
    score: 11,
    violationCount: 2,
    inspectionDate: "2024-12-18",
    inspectionDateLabel: "December 18, 2024",
    inspectionType: "Cycle Inspection / Re-inspection",
    honestLine:
      "A Tribeca Italian restaurant at 165 Duane Street with a Grade A, 11 points, and 2 violations from its latest inspection on December 18, 2024.",
    body: "Scalini Fedeli is listed at 165 Duane Street in Tribeca. The site description mentions French-influenced Italian fixed-price menus in a vaulted interior. On December 18, 2024, a cycle re-inspection scored 11 points and recorded 2 violations: a critical 02G cold-holding finding and a non-critical 10F finding. The published Grade A, score, and date match that inspection. A full CAMIS history pulled on November 24, 2026 found no later inspection, so this remains the current official record even though December 18, 2024 is the oldest date on the list. It ties the other 11-point, 2-violation kitchens and ranks tenth because of that older date. If a newer inspection is posted, this rank should be rechecked before it is trusted as current.",
    violations: [
      {
        code: "10F",
        critical: false,
        summary: "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
      {
        code: "02G",
        critical: true,
        summary: "Cold TCS food held above the required cold-holding temperature.",
      },
    ],
  },
]

export function camisUrl(camis: string): string {
  return abceats(camis)
}

export const BEST_ITALIAN_HOW_WE_PICKED = [
  "This is not a taste poll, a paid placement, or a popularity list. Eat Real Food NYC is a directory of healthy restaurants whose published listings are tied to official NYC Department of Health inspection records. For this page we used one question: among currently open Italian restaurants in our directory, which kitchens have the strongest current inspection records that still match what the site shows?",
  "We started with published, operational listings whose type is Italian restaurant. We then looked up the latest inspection for each kitchen in the NYC DOHMH Restaurant Inspection Results dataset (Open Data 43nn-pn8j). A restaurant made the candidate pool only when the latest city grade, inspection score, and inspection date matched the listing. If the city had a newer inspection that did not match the listing, we left the kitchen off, including cases where the newer inspection was worse than the grade still shown on the site. That is the same rule we use when a listing has gone stale against the city file.",
  "From the kitchens that passed that match test and currently hold a Grade A, we ranked by lowest inspection score (violation points), then fewest recorded violation rows on that latest inspection, then most recent inspection date. A Grade A means 0 to 13 points. A B starts at 14 points. A C starts at 28. The letter is based on the point total, so a Grade A can still include critical violations. We report those codes when they appear on the official record. Payment does not change a grade, a score, a tag, or this ranking.",
  `The records above were checked against the live Open Data file and the published listings on ${BEST_ITALIAN_VERIFIED_ON}, America/New_York. That re-check found the same grades, scores, dates, and violation counts as the ${BEST_ITALIAN_FIRST_VERIFIED_ON} verification spoken in the video "10 NYC Italian Kitchens, Ranked by Inspection Score." This order is a sanitary-score ranking, not a taste ranking. Inspection results change when the city inspects again. If a later inspection is posted, a kitchen on this list may no longer belong here.`,
]

/**
 * Chapter titles and timestamps copied from the YouTube description of
 * NNkuZAOiVCU on November 24, 2026. hrefs are anchors on this guide.
 */
export const BEST_ITALIAN_VIDEO_CHAPTERS: Array<{
  timestamp: string
  label: string
  href: string | null
}> = [
  { timestamp: "0:00", label: "What this list is, and what it is not", href: "#what-this-list-is" },
  { timestamp: "1:29", label: "How the ranking works", href: "#how-we-picked-them" },
  { timestamp: "2:17", label: "#1 Morandi, Greenwich Village", href: "#morandi" },
  { timestamp: "3:01", label: "#2 Carmine's - Upper West Side", href: "#carmines-upper-west-side" },
  { timestamp: "3:46", label: "#3 Isabelle's Osteria, Flatiron District", href: "#isabelles-osteria" },
  { timestamp: "4:35", label: "#4 Panzerotti Bites, Cobble Hill", href: "#panzerotti-bites" },
  { timestamp: "5:17", label: "#5 Forma Pasta Factory, Greenpoint", href: "#forma-pasta-factory-greenpoint" },
  { timestamp: "6:02", label: "#6 Evelina, Clinton Hill", href: "#evelina" },
  { timestamp: "6:44", label: "#7 Olive Garden, East New York", href: "#olive-garden-italian-restaurant-east" },
  { timestamp: "7:27", label: "#8 San Marzano, East Village", href: "#san-marzano" },
  { timestamp: "7:59", label: "#9 Don Cheech, Stapleton", href: "#don-cheech" },
  { timestamp: "8:36", label: "#10 Scalini Fedeli, Tribeca", href: "#scalini-fedeli" },
  { timestamp: "9:15", label: "How to use this list", href: "#which-one-fits-whom" },
]

export type FitGroup = {
  heading: string
  body: string
  slugs: string[]
}

export const BEST_ITALIAN_FITS: FitGroup[] = [
  {
    heading: "If you want the lowest current inspection score",
    body: "Morandi in Greenwich Village is first by a wide margin: Grade A, 2 points, and 1 non-critical violation on December 8, 2025. No other kitchen that passed the match test came close to that score.",
    slugs: ["morandi"],
  },
  {
    heading: "If you are eating on the Upper West Side or want a family-style room",
    body: "Carmine's - Upper West Side at 2450 Broadway has the most recent inspection on the list (October 22, 2026) and a Grade A with 9 points and 2 violations. The directory describes family-style Southern Italian dishes. The official record uses the DBA Carmine's / Virgil's at the same address.",
    slugs: ["carmines-upper-west-side"],
  },
  {
    heading: "If you are in the Flatiron District or the East Village",
    body: "Isabelle's Osteria is at 245 Park Avenue South in the Flatiron District, with a Grade A at 9 points from a February 4, 2026 re-inspection that also recorded pest-related critical violations. San Marzano is at 117 Second Avenue in the East Village, with a Grade A at 11 points from December 1, 2025.",
    slugs: ["isabelles-osteria", "san-marzano"],
  },
  {
    heading: "If you are in Brooklyn and want an independent kitchen",
    body: "Panzerotti Bites is a Cobble Hill counter-serve shop on Smith Street (Grade A, 9 points). Forma Pasta Factory is in Greenpoint at 14 Bedford Avenue (Grade A, 10 points, 1 violation). Evelina is in Clinton Hill at 211 Dekalb Avenue (Grade A, 10 points, September 16, 2026).",
    slugs: ["panzerotti-bites", "forma-pasta-factory-greenpoint", "evelina"],
  },
  {
    heading: "If you want a familiar chain location with a verified Grade A",
    body: "The Olive Garden at 505 Gateway Drive in East New York is on this list only because its January 5, 2026 inspection is a matching Grade A with 10 points and 2 violations. We did not treat it differently from the independent kitchens.",
    slugs: ["olive-garden-italian-restaurant-east"],
  },
  {
    heading: "If you are in Staten Island or Tribeca",
    body: "Don Cheech in Stapleton is the Staten Island entry, with a Grade A at 11 points from November 21, 2025. Scalini Fedeli at 165 Duane Street in Tribeca also has a Grade A at 11 points; its latest matching inspection is December 18, 2024, the oldest date on this list.",
    slugs: ["don-cheech", "scalini-fedeli"],
  },
]

export const BEST_ITALIAN_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What are the best Italian restaurants in NYC right now?",
    answer:
      "If you mean current official health-inspection records, the top of this list is Morandi in Greenwich Village, with a NYC Health Department Grade A, a score of 2 points, and 1 violation from December 8, 2025. The rest of the top 10, in order, are Carmine's - Upper West Side, Isabelle's Osteria, Panzerotti Bites, Forma Pasta Factory, Evelina, the East New York Olive Garden, San Marzano, Don Cheech, and Scalini Fedeli. Each one is a published, currently open Italian restaurant in our directory whose latest DOHMH inspection matches the listing. This ranking measures food safety records, not taste.",
  },
  {
    question: "How do you rank the best Italian restaurants in NYC?",
    answer:
      "We only rank Italian restaurants that are published and open in the Eat Real Food NYC directory, and only when the latest inspection in NYC Open Data dataset 43nn-pn8j matches the grade, score, and date on the listing. We then sort Grade A kitchens by lowest inspection score, then fewest violation rows, then most recent inspection date. We do not use star ratings, paid placements, or editorial taste scores for this order. Kitchens with a newer city inspection that does not match the site, including a newer worse inspection, are left off.",
  },
  {
    question: "Does a Grade A mean the Italian food is better?",
    answer:
      "No. A NYC Grade A means the latest grading inspection totaled 0 to 13 violation points. It is a sanitation and food-safety result from the Department of Health, not a rating of flavor, price, or ingredients. A Grade A kitchen can still have critical violations if the point total stays under 14. This page reports those official codes when they are on the record.",
  },
  {
    question: "Which Italian restaurants in NYC have the fewest health-inspection violations?",
    answer:
      "On this verified list, Morandi and Forma Pasta Factory each have 1 recorded violation on their latest matching inspection. Morandi also has the lowest score, at 2 points. Several others have 2 violations. Violation counts here are the number of official violation rows on that latest inspection, not a lifetime total.",
  },
  {
    question: "Are there Grade A Italian restaurants in Brooklyn and Staten Island?",
    answer:
      "Yes. This top 10 includes Panzerotti Bites in Cobble Hill, Forma Pasta Factory in Greenpoint, Evelina in Clinton Hill, and the Olive Garden at 505 Gateway Drive in East New York, all in Brooklyn, plus Don Cheech in Stapleton, Staten Island. Each holds a current Grade A that matches the latest city inspection. Our directory also has Italian listings in Queens and the Bronx, but none of those passed both the match test and this top-10 cut.",
  },
  {
    question: "How current is this Best Italian restaurants in NYC list?",
    answer:
      "We re-checked each kitchen against the live NYC DOHMH Open Data file and the published listing on November 24, 2026. Grades, scores, dates, and violation counts are unchanged from the November 23, 2026 verification spoken in the video. The newest inspection on the list is Carmine's - Upper West Side on October 22, 2026. The oldest is Scalini Fedeli on December 18, 2024, which was still the latest inspection on that CAMIS when we checked. NYC inspects restaurants at least once a year in ordinary cases, and a new inspection can change a grade or score. Recheck the listing and the official record before you rely on an older date.",
  },
]

export const BEST_ITALIAN_RELATED_HREFS = [
  "/guides/nyc-health-grades-explained",
  "/guides/nyc-restaurant-inspection-process",
  "/guides/best-healthy-neighborhoods-nyc",
  "/guides/best-pizza-restaurants-nyc",
  "/guides/hidden-gem-restaurants-nyc",
  "/healthy-restaurants/grade-a",
  "/nyc/manhattan/healthy-restaurants",
  "/nyc/brooklyn/healthy-restaurants",
  "/nyc/staten-island/healthy-restaurants",
  "/nyc/compare",
  "/map",
  "/data/nyc-restaurant-health-grade-report",
  "/about/our-data",
  "/catering",
  "/data",
] as const

export function introWordCount(): number {
  return BEST_ITALIAN_INTRO.trim().split(/\s+/).filter(Boolean).length
}

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>()
  for (const restaurant of BEST_ITALIAN_RESTAURANTS) {
    hrefs.add(restaurantHref(restaurant.slug))
    hrefs.add(neighborhoodHref(restaurant.borough, restaurant.neighborhood))
  }
  for (const href of BEST_ITALIAN_RELATED_HREFS) hrefs.add(href)
  return [...hrefs]
}

export function organizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eat Real Food NYC",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
  }
}

export function articleSchema(siteUrl: string) {
  const url = `${siteUrl}${BEST_ITALIAN_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: BEST_ITALIAN_TITLE,
    description: BEST_ITALIAN_DESCRIPTION,
    datePublished: BEST_ITALIAN_PUBLISHED,
    dateModified: BEST_ITALIAN_MODIFIED,
    author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BEST_ITALIAN_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
