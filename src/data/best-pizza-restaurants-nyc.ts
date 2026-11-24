/**
 * Verified "best pizza restaurants in NYC" ranking.
 * Every grade, score, date, CAMIS, and violation count was checked on
 * 2026-11-24 (America/New_York) against the live published listing and
 * NYC DOHMH Open Data dataset 43nn-pn8j. The newest inspection_date in
 * that pull was 2026-11-22. Do not invent facts or add a kitchen without
 * a fresh match.
 */
export const BEST_PIZZA_PATH = "/guides/best-pizza-restaurants-nyc"
export const BEST_PIZZA_TITLE = "Best Pizza Restaurants in NYC (2026): Top 10 Ranked"
export const BEST_PIZZA_SHORT_TITLE = "Best Pizza Restaurants NYC"
export const BEST_PIZZA_DESCRIPTION =
  "The best pizza restaurants in NYC, ranked by current NYC Health Department Grade A scores and violation counts, verified against official DOHMH Open Data."
export const BEST_PIZZA_PUBLISHED = "2026-11-24"
export const BEST_PIZZA_VERIFIED_ON = "November 24, 2026"
export const BEST_PIZZA_KEYWORD = "best pizza restaurants in nyc"
export const DOHMH_DATASET_ID = "43nn-pn8j"
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
export const DOHMH_MAX_INSPECTION_DATE = "2026-11-22"
export const DOHMH_MAX_INSPECTION_DATE_LABEL = "November 22, 2026"
export const BEST_PIZZA_CANDIDATE_COUNT = 56
export const BEST_PIZZA_MATCH_COUNT = 19

export const BEST_PIZZA_INTRO =
  "The best pizza restaurants in NYC, ranked by official health-inspection records rather than taste, start with Juliana’s in DUMBO. Juliana’s holds a NYC Department of Health Grade A with a score of 2 points and 1 violation from its September 16, 2026 inspection. This list ranks the 10 open pizza restaurants in our directory whose latest city inspection matches the grade, score, and date we publish. We ordered them by lowest score, then fewest violations, then most recent date, using NYC DOHMH Open Data dataset 43nn-pn8j. A Grade A is 0 to 13 points and measures food safety, not taste."

export type RankedViolation = {
  code: string
  critical: boolean
  summary: string
}

export type RankedPizzaRestaurant = {
  rank: number
  name: string
  officialDba: string
  slug: string
  camis: string
  borough: string
  neighborhood: string
  address: string
  cityCuisine: string
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

export const BEST_PIZZA_RESTAURANTS: RankedPizzaRestaurant[] = [
  {
    rank: 1,
    name: "Juliana’s",
    officialDba: "JULIANA'S PIZZA",
    slug: "julianas",
    camis: "41700297",
    borough: "Brooklyn",
    neighborhood: "DUMBO",
    address: "19 Old Fulton St, Brooklyn, NY 11201",
    cityCuisine: "Pizza",
    grade: "A",
    score: 2,
    violationCount: 1,
    inspectionDate: "2026-09-16",
    inspectionDateLabel: "September 16, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A DUMBO pizza restaurant at 19 Old Fulton Street whose latest inspection is the cleanest on this list: Grade A, 2 points, 1 violation.",
    body: "Juliana’s is listed in our directory as a pizza restaurant at 19 Old Fulton Street in DUMBO, Brooklyn. It sits at the top of this ranking only because of its official inspection record. On September 16, 2026, a NYC Department of Health cycle inspection (an initial inspection) scored the kitchen at 2 points and recorded 1 violation, a non-critical 10F finding about a non-food contact surface or piece of equipment. The posted grade is A. The city's DBA is Juliana's Pizza and its cuisine description is Pizza. That grade, score, and date match the published listing, and the CAMIS history pulled on November 24, 2026 showed no later inspection. Two points is well inside the Grade A range of 0 to 13. This is a food-safety ranking, not a review of the pizza.",
    violations: [
      {
        code: "10F",
        critical: false,
        summary:
          "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
    ],
  },
  {
    rank: 2,
    name: "Marko's Pizzeria",
    officialDba: "MARKO'S PIZZERIA",
    slug: "markos-pizzeria",
    camis: "50137285",
    borough: "Manhattan",
    neighborhood: "Kips Bay",
    address: "25 Waterside Plaza, New York, NY 10010",
    cityCuisine: "Pizza",
    grade: "A",
    score: 2,
    violationCount: 1,
    inspectionDate: "2025-07-14",
    inspectionDateLabel: "July 14, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Kips Bay pizzeria at 25 Waterside Plaza with a Grade A, 2 points, and 1 violation from July 14, 2025.",
    body: "Marko's Pizzeria is listed at 25 Waterside Plaza in Kips Bay, Manhattan. The directory type is Pizza restaurant. On July 14, 2025, an initial cycle inspection scored 2 points and recorded 1 violation, a non-critical 10F finding. The posted grade is A. The official DBA is Marko's Pizzeria and the city's cuisine description is Pizza. The listing's grade, score, and date match that inspection, and no later inspection was on the CAMIS when we checked on November 24, 2026. It ties Juliana’s at 2 points and 1 violation and ranks second because the inspection is older.",
    violations: [
      {
        code: "10F",
        critical: false,
        summary:
          "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
    ],
  },
  {
    rank: 3,
    name: "Bario's",
    officialDba: "BARIOS PIZZA & RESTAURANT",
    slug: "barios",
    camis: "40609705",
    borough: "Staten Island",
    neighborhood: "Willowbrook",
    address: "446 Nome Ave, Staten Island, NY 10314",
    cityCuisine: "Pizza",
    grade: "A",
    score: 5,
    violationCount: 2,
    inspectionDate: "2025-12-02",
    inspectionDateLabel: "December 2, 2025",
    inspectionType: "Cycle Inspection / Re-inspection",
    honestLine:
      "A Willowbrook, Staten Island pizzeria at 446 Nome Avenue with a Grade A, 5 points, and 2 non-critical violations from December 2, 2025.",
    body: "Bario's is listed at 446 Nome Avenue in Willowbrook, Staten Island. The directory type is Pizza restaurant. The official DBA on CAMIS 40609705 is Barios Pizza & Restaurant, at the same address, and the phone on the listing matches that record. The city's cuisine description is Pizza. On December 2, 2025, a cycle re-inspection scored 5 points and recorded 2 violations, both non-critical: 10F and 10H. The posted grade is A. Five points is inside the Grade A range. The listing matches that grade, score, and date, and the CAMIS history pulled on November 24, 2026 showed no later inspection. It ranks third because 5 points is the next score after the two kitchens at 2.",
    violations: [
      {
        code: "10F",
        critical: false,
        summary:
          "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
      {
        code: "10H",
        critical: false,
        summary:
          "Single service article not provided, reused, or not protected from contamination when transported, stored, or dispensed.",
      },
    ],
  },
  {
    rank: 4,
    name: "Mano's Pizzeria",
    officialDba: "MANO'S PIZZERIA",
    slug: "manos-pizzeria",
    camis: "50113418",
    borough: "Queens",
    neighborhood: "Ridgewood",
    address: "62-98 Forest Ave, Ridgewood, NY 11385",
    cityCuisine: "Pizza",
    grade: "A",
    score: 7,
    violationCount: 2,
    inspectionDate: "2025-07-23",
    inspectionDateLabel: "July 23, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Ridgewood, Queens pizzeria at 62-98 Forest Avenue with a Grade A, 7 points, and 2 violations from July 23, 2025.",
    body: "Mano's Pizzeria is listed at 62-98 Forest Avenue in Ridgewood, Queens. The directory type is Pizza restaurant. On July 23, 2025, an initial cycle inspection scored 7 points and recorded 2 violations: a critical 06C finding about food, supplies, or equipment not protected from contamination, and a non-critical 10H finding. The posted grade is A. The official DBA is Mano's Pizzeria and the city's cuisine description is Pizza. The listing matches that grade, score, and date. Seven points remains a Grade A. A Grade A can still include a critical violation when the point total stays under 14.",
    violations: [
      {
        code: "06C",
        critical: true,
        summary:
          "Food, supplies, or equipment not protected from a potential source of contamination during storage, preparation, transportation, display, or service.",
      },
      {
        code: "10H",
        critical: false,
        summary:
          "Single service article not provided, reused, or not protected from contamination when transported, stored, or dispensed.",
      },
    ],
  },
  {
    rank: 5,
    name: "Joe’s Pizza",
    officialDba: "JOE'S PIZZA",
    slug: "joes-pizza-financial",
    camis: "50087744",
    borough: "Manhattan",
    neighborhood: "Financial District",
    address: "124 Fulton St, New York, NY 10038",
    cityCuisine: "Pizza",
    grade: "A",
    score: 9,
    violationCount: 2,
    inspectionDate: "2026-06-25",
    inspectionDateLabel: "June 25, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "The Financial District Joe’s Pizza at 124 Fulton Street holds a Grade A with 9 points and 2 violations from June 25, 2026.",
    body: "This is the Joe’s Pizza listing at 124 Fulton Street in the Financial District, not the Midtown Broadway location. The directory type is Pizza restaurant. On June 25, 2026, an initial cycle inspection scored 9 points and recorded 2 violations: a critical 02G cold-holding finding and a non-critical 10A finding about the toilet facility. The posted grade is A. The official DBA is Joe's Pizza and the city's cuisine description is Pizza. The listing's grade, score, and date match that inspection. Nine points is still a Grade A. A different Joe's Pizza listing, at 1435 Broadway, also matched a Grade A and is outside this top 10 because it has more violations.",
    violations: [
      {
        code: "02G",
        critical: true,
        summary: "Cold TCS food held above the required cold-holding temperature.",
      },
      {
        code: "10A",
        critical: false,
        summary:
          "Toilet facility not maintained or provided with toilet paper, waste receptacle, or self-closing door.",
      },
    ],
  },
  {
    rank: 6,
    name: "Rubirosa",
    officialDba: "RUBIROSA",
    slug: "rubirosa",
    camis: "41532069",
    borough: "Manhattan",
    neighborhood: "SoHo",
    address: "235 Mulberry St, New York, NY 10012",
    cityCuisine: "Pizza",
    grade: "A",
    score: 9,
    violationCount: 2,
    inspectionDate: "2026-04-08",
    inspectionDateLabel: "April 8, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A SoHo pizza restaurant at 235 Mulberry Street with a Grade A, 9 points, and 2 violations on its April 8, 2026 cycle inspection.",
    body: "Rubirosa is listed at 235 Mulberry Street in SoHo. The directory type is Pizza restaurant. On April 8, 2026, an initial cycle inspection scored 9 points and recorded 2 violations: a critical 02H finding about cooling hot food, and a non-critical 09C finding about a food-contact surface. The posted grade is A. The official DBA is Rubirosa and the city's cuisine description is Pizza. The same calendar day also has an Administrative Miscellaneous initial inspection with no score and code 20-06, current letter grade or Grade Pending card not posted. That administrative row does not change the cycle score, so the rank uses the 2 cycle violations and we still report 20-06. The listing's Grade A, score of 9, and date match the cycle inspection. It ties the Fulton Street Joe’s Pizza at 9 points and 2 violations and ranks sixth because its inspection is older.",
    violations: [
      {
        code: "02H",
        critical: true,
        summary:
          "Hot TCS food not cooled by an approved method within the required time and temperature steps.",
      },
      {
        code: "09C",
        critical: false,
        summary:
          "Food contact surface design, construction, materials, or maintenance improper. Surface not easily cleanable, sanitized, and maintained.",
      },
    ],
  },
  {
    rank: 7,
    name: "John's of Bleecker Street",
    officialDba: "JOHN'S PIZZERIA",
    slug: "johns-of-bleecker-street",
    camis: "40674475",
    borough: "Manhattan",
    neighborhood: "Greenwich Village",
    address: "278 Bleecker St, New York, NY 10014",
    cityCuisine: "Pizza",
    grade: "A",
    score: 9,
    violationCount: 2,
    inspectionDate: "2026-02-25",
    inspectionDateLabel: "February 25, 2026",
    inspectionType: "Cycle Inspection / Re-inspection",
    honestLine:
      "A Greenwich Village pizza restaurant at 278 Bleecker Street with a Grade A, 9 points, and 2 violations from a February 25, 2026 re-inspection.",
    body: "John's of Bleecker Street is listed at 278 Bleecker Street in Greenwich Village. The directory type is Pizza restaurant. The official DBA on CAMIS 40674475 is John's Pizzeria, at the same address, and the city's cuisine description is Pizza. On February 25, 2026, a cycle re-inspection scored 9 points and recorded 2 violations: a critical 04L finding for evidence of mice or live mice, and a non-critical 08A finding about harborage or conditions conducive to pests. The posted grade is A. The listing matches that grade, score, and date. A Grade A at 9 points can still include a critical pest finding. It ties the other 9-point, 2-violation kitchens and ranks seventh because the inspection is the oldest of that group.",
    violations: [
      {
        code: "04L",
        critical: true,
        summary: "Evidence of mice or live mice in the establishment's food or non-food areas.",
      },
      {
        code: "08A",
        critical: false,
        summary:
          "Establishment is not free of harborage or conditions conducive to rodents, insects, or other pests.",
      },
    ],
  },
  {
    rank: 8,
    name: "Adrienne's Pizzabar",
    officialDba: "ADRIENNE'S PIZZA BAR",
    slug: "adriennes-pizzabar",
    camis: "41112524",
    borough: "Manhattan",
    neighborhood: "Financial District",
    address: "54 Stone St, New York, NY 10004",
    cityCuisine: "Italian",
    grade: "A",
    score: 10,
    violationCount: 2,
    inspectionDate: "2026-07-21",
    inspectionDateLabel: "July 21, 2026",
    inspectionType: "Cycle Inspection / Re-inspection",
    honestLine:
      "A Financial District pizza bar at 54 Stone Street with a Grade A, 10 points, and 2 violations from July 21, 2026. The city cuisine field says Italian.",
    body: "Adrienne's Pizzabar is listed at 54 Stone Street in the Financial District. The directory type is Pizza restaurant. The official DBA is Adrienne's Pizza Bar, and the phone on the listing matches CAMIS 41112524. The city's cuisine description is Italian, which is not the same word as the directory type. We report both and do not treat the city label as a menu claim. On July 21, 2026, a cycle re-inspection scored 10 points and recorded 2 violations: a critical 06E finding about sanitized equipment or a utensil improperly used or stored, and a non-critical 10G ware-washing finding. The posted grade is A. The listing matches that grade, score, and date. Ten points is still a Grade A.",
    violations: [
      {
        code: "06E",
        critical: true,
        summary:
          "Sanitized equipment or utensil, including an in-use food dispensing utensil, improperly used or stored.",
      },
      {
        code: "10G",
        critical: false,
        summary:
          "Dishwashing and ware washing of tableware, including dishes, utensils, and equipment, was deficient.",
      },
    ],
  },
  {
    rank: 9,
    name: "Dani's House of Pizza",
    officialDba: "DANI PIZZA AND RESTAURANT",
    slug: "danis-house-of-pizza",
    camis: "40367789",
    borough: "Queens",
    neighborhood: "Kew Gardens",
    address: "81-28 Lefferts Blvd, Kew Gardens, NY 11415",
    cityCuisine: "Pizza",
    grade: "A",
    score: 10,
    violationCount: 2,
    inspectionDate: "2026-05-28",
    inspectionDateLabel: "May 28, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Kew Gardens pizza restaurant at 81-28 Lefferts Boulevard with a Grade A, 10 points, and 2 violations from May 28, 2026.",
    body: "Dani's House of Pizza is listed at 81-28 Lefferts Boulevard in Kew Gardens, Queens. The directory type is Pizza restaurant. The official DBA on CAMIS 40367789 is Dani Pizza and Restaurant, at the same address, and the phone on the listing matches that record. The city's cuisine description is Pizza. On May 28, 2026, an initial cycle inspection scored 10 points and recorded 2 violations: a critical 06D finding about a food-contact surface not properly washed, rinsed, and sanitized, and a non-critical 10F finding. The posted grade is A. The listing matches that grade, score, and date. It ties Adrienne's Pizzabar at 10 points and 2 violations and ranks ninth because the inspection is older.",
    violations: [
      {
        code: "06D",
        critical: true,
        summary:
          "Food contact surface not properly washed, rinsed, and sanitized after each use and following any activity when contamination may have occurred.",
      },
      {
        code: "10F",
        critical: false,
        summary:
          "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced, or movable.",
      },
    ],
  },
  {
    rank: 10,
    name: "Emily",
    officialDba: "EMMY",
    slug: "emily-clinton",
    camis: "50005678",
    borough: "Brooklyn",
    neighborhood: "Clinton Hill",
    address: "919 Fulton St, Brooklyn, NY 11238",
    cityCuisine: "American",
    grade: "A",
    score: 10,
    violationCount: 2,
    inspectionDate: "2026-03-21",
    inspectionDateLabel: "March 21, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    honestLine:
      "A Clinton Hill listing at 919 Fulton Street with a Grade A, 10 points, and 2 violations from March 21, 2026. The directory type is Pizza restaurant. The city files it as Emmy, cuisine American.",
    body: "Emily is listed at 919 Fulton Street in Clinton Hill, Brooklyn. The directory type is Pizza restaurant. CAMIS 50005678 is the establishment at that address, the phone on the listing matches the city phone, and the official DBA is Emmy. The city's cuisine description is American, not Pizza. We keep the kitchen on this list because the published type is Pizza restaurant, and we state the city fields rather than overwrite them. On March 21, 2026, an initial cycle inspection scored 10 points and recorded 2 violations: a critical 04N finding for flies or other nuisance pests, and a non-critical 08A finding about harborage or conditions conducive to pests. The posted grade is A. The listing matches that grade, score, and date. It ties the other 10-point, 2-violation kitchens and ranks tenth because the inspection is the oldest of that group.",
    violations: [
      {
        code: "04N",
        critical: true,
        summary:
          "Filth flies or food/refuse/sewage-associated flies or other nuisance pests in food or non-food areas.",
      },
      {
        code: "08A",
        critical: false,
        summary:
          "Establishment is not free of harborage or conditions conducive to rodents, insects, or other pests.",
      },
    ],
  },
]

export function camisUrl(camis: string): string {
  return abceats(camis)
}

export const BEST_PIZZA_HOW_WE_PICKED = [
  "This is not a taste poll, a paid placement, or a popularity list. Eat Real Food NYC is a directory of healthy restaurants whose published listings are tied to official NYC Department of Health inspection records. For this page we used one question: among currently open pizza restaurants in our directory, which kitchens have the strongest current inspection records that still match what the site shows?",
  `We started with the live directory map on ${BEST_PIZZA_VERIFIED_ON}: published, operational listings that have latitude and longitude and whose type contains Pizza. That set was ${BEST_PIZZA_CANDIDATE_COUNT} listings, 54 typed Pizza restaurant, 1 Pizza Takeout, and 1 Pizza delivery. For each listing we looked up the CAMIS at the same address in NYC Open Data dataset ${DOHMH_DATASET_ID}. A kitchen stayed in only when the latest grading inspection matched the listing's grade, score, and date. The grading inspection is the cycle or pre-permit row that carries the letter and the score. If a newer calendar date exists and does not match the listing, including an inter-agency visit, the kitchen is off. ${BEST_PIZZA_MATCH_COUNT} listings passed and currently hold a Grade A.`,
  "From those 19 we ranked the 10 with the lowest inspection scores. The tie-break is fewest violation rows on that grading inspection, then the most recent inspection date. A same-day Administrative Miscellaneous row that has no score is not added to the rank count, because it does not change the letter or the points. We still name that code when it is on the file. Rubirosa has one, code 20-06. A Grade A means 0 to 13 points. A B starts at 14 points. A C starts at 28. The letter is based on the point total, so a Grade A can still include critical violations. Payment does not change a grade, a score, or this ranking.",
  `The newest inspection_date in dataset ${DOHMH_DATASET_ID}, when we pulled the file on ${BEST_PIZZA_VERIFIED_ON}, was ${DOHMH_MAX_INSPECTION_DATE_LABEL}. The records above were checked the same day against that file and the live listings. Inspection results change when the city inspects again. If a later inspection is posted, a kitchen on this list may no longer belong here.`,
]

export type ExcludedKitchen = {
  slug: string
  name: string
  why: string
}

export const BEST_PIZZA_EXCLUDED: ExcludedKitchen[] = [
  {
    slug: "prince-street-pizza",
    name: "Prince Street Pizza",
    why: "The listing is Grade A, score 8, inspected December 3, 2025, at 27 Prince Street. The latest row on CAMIS 41636395 is an Inter-Agency Task Force initial inspection on September 17, 2026, score 0, with no letter. That newer inspection does not match the listing.",
  },
  {
    slug: "lindustrie-pizzeria",
    name: "L'industrie Pizzeria",
    why: "The Williamsburg listing at 254 S 2nd St, Brooklyn, NY 11211 is Grade A, score 9, inspected January 15, 2025. The latest row on CAMIS 50060943 is a cycle initial inspection on October 7, 2026, score 26, with no letter.",
  },
  {
    slug: "lindustrie-pizzeria-west-village",
    name: "L’industrie Pizzeria West Village",
    why: "The listing at 104 Christopher Street is Grade A, score 13, inspected January 21, 2025. The latest row on CAMIS 50141803 is a cycle initial inspection on July 21, 2026, score 37, with no letter.",
  },
  {
    slug: "lucali",
    name: "Lucali",
    why: "The listing at 575 Henry Street in Carroll Gardens is Grade A, score 12, inspected May 24, 2023. The latest row on CAMIS 50125951 is an Inter-Agency Task Force re-inspection on September 13, 2025, score 0, with no letter.",
  },
  {
    slug: "lombardis",
    name: "Lombardi's",
    why: "The listing at 32 Spring Street is Grade A, score 12, inspected November 12, 2024. A later cycle initial inspection on CAMIS 40402172, April 2, 2026, is also Grade A with score 12, so the date on the listing is not the latest inspection.",
  },
]

export const BEST_PIZZA_OUTSIDE_TOP_10 = {
  slug: "joes-pizza-broadway",
  name: "Joe's Pizza Broadway",
  why: "Joe's Pizza Broadway at 1435 Broadway in Midtown also matched: Grade A, score 10, 3 violations, on a cycle initial inspection dated August 12, 2025, CAMIS 50066715. It is outside this top 10 because those 3 violations put it behind the 10-point kitchens with 2.",
}

export type FitGroup = {
  heading: string
  body: string
  slugs: string[]
}

export const BEST_PIZZA_FITS: FitGroup[] = [
  {
    heading: "If you want the lowest current inspection score",
    body: "Juliana’s in DUMBO is first: Grade A, 2 points, and 1 non-critical violation on September 16, 2026. Marko's Pizzeria in Kips Bay ties that score and violation count. Its inspection is July 14, 2025, so it ranks second.",
    slugs: ["julianas", "markos-pizzeria"],
  },
  {
    heading: "If you are in Staten Island",
    body: "Bario's at 446 Nome Avenue in Willowbrook is the Staten Island entry. The latest matching inspection is a Grade A at 5 points with 2 non-critical violations on December 2, 2025. The official DBA is Barios Pizza & Restaurant.",
    slugs: ["barios"],
  },
  {
    heading: "If you are in Queens",
    body: "Mano's Pizzeria is at 62-98 Forest Avenue in Ridgewood, Grade A, 7 points, July 23, 2025, including a critical 06C finding. Dani's House of Pizza is at 81-28 Lefferts Boulevard in Kew Gardens, Grade A, 10 points, May 28, 2026. The official DBA there is Dani Pizza and Restaurant.",
    slugs: ["manos-pizzeria", "danis-house-of-pizza"],
  },
  {
    heading: "If you are in the Financial District, SoHo, or Greenwich Village",
    body: "Joe’s Pizza at 124 Fulton Street is Grade A, 9 points, June 25, 2026. Rubirosa at 235 Mulberry Street is Grade A, 9 points, April 8, 2026, and the same day has an unscored administrative citation, code 20-06. John's of Bleecker Street, filed as John's Pizzeria, is Grade A, 9 points, February 25, 2026, including a critical mouse finding. Adrienne's Pizzabar at 54 Stone Street is Grade A, 10 points, July 21, 2026. The city cuisine field for Adrienne's says Italian.",
    slugs: ["joes-pizza-financial", "rubirosa", "johns-of-bleecker-street", "adriennes-pizzabar"],
  },
  {
    heading: "If you are in Clinton Hill",
    body: "Emily at 919 Fulton Street is the other Brooklyn kitchen in this top 10, with Juliana’s. The directory type is Pizza restaurant. The city record at the same address and phone uses the DBA Emmy and the cuisine American. The matching inspection is Grade A, 10 points, March 21, 2026, including a critical fly finding.",
    slugs: ["emily-clinton"],
  },
  {
    heading: "If you want the newest inspection on this list",
    body: "Juliana’s on September 16, 2026 is the newest date in the top 10. Adrienne's Pizzabar on July 21, 2026 is next. The oldest date in the top 10 is Marko's Pizzeria on July 14, 2025. The newest inspection_date in the city file we checked was November 22, 2026, so a kitchen can be current in that file and still have an inspection from 2025.",
    slugs: ["julianas", "adriennes-pizzabar", "markos-pizzeria"],
  },
]

export const BEST_PIZZA_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What are the best pizza restaurants in NYC right now?",
    answer:
      "If you mean current official health-inspection records, the top of this list is Juliana’s in DUMBO, with a NYC Health Department Grade A, a score of 2 points, and 1 violation from September 16, 2026. The rest of the top 10, in order, are Marko's Pizzeria, Bario's, Mano's Pizzeria, Joe’s Pizza at 124 Fulton Street, Rubirosa, John's of Bleecker Street, Adrienne's Pizzabar, Dani's House of Pizza, and Emily in Clinton Hill. Each one is a published, currently open pizza listing whose latest grading inspection matches the site. This ranking measures food safety records, not taste.",
  },
  {
    question: "How do you rank the best pizza restaurants in NYC?",
    answer:
      "We only rank published, operational pizza listings, and only when the latest grading inspection in NYC Open Data dataset 43nn-pn8j matches the grade, score, and date on the listing. We then sort Grade A kitchens by lowest inspection score, then fewest violation rows on that grading inspection, then most recent inspection date. We do not use star ratings, paid placements, or editorial taste scores. A newer city inspection that does not match the site, including a newer inspection with no letter, keeps the kitchen off the list.",
  },
  {
    question: "Does a Grade A mean the pizza is better?",
    answer:
      "No. A NYC Grade A means the latest grading inspection totaled 0 to 13 violation points. It is a sanitation and food-safety result from the Department of Health, not a rating of flavor, price, or ingredients. A Grade A kitchen can still have critical violations if the point total stays under 14. This page reports those official codes when they are on the record.",
  },
  {
    question: "Which pizza restaurants in NYC have the fewest health-inspection violations?",
    answer:
      "On this verified top 10, Juliana’s and Marko's Pizzeria each have 1 recorded violation on their latest matching inspection. Both also have the lowest score, at 2 points. The other eight kitchens on the list have 2 violations on the grading inspection. Rubirosa has an additional same-day administrative citation, code 20-06, that carries no score and is not in that count of 2. Violation counts here are rows on that latest grading inspection, not a lifetime total.",
  },
  {
    question: "Are there Grade A pizza restaurants in every NYC borough?",
    answer:
      "This top 10 includes Brooklyn, Manhattan, Queens, and Staten Island. The Bronx is not in the top 10. Louie & Ernie's Pizza at 1300 Crosby Avenue in Pelham Bay passed the same match test with a Grade A, 13 points, and 3 violations on November 24, 2025, CAMIS 50070312, which is outside this cut. Nineteen pizza listings passed the match test. This page shows the 10 with the lowest scores.",
  },
  {
    question: "How current is this best pizza restaurants in NYC list?",
    answer:
      "We verified each kitchen against the live listing and the NYC DOHMH Open Data file on November 24, 2026. The newest inspection_date in dataset 43nn-pn8j in that pull was November 22, 2026. The newest inspection on this top 10 is Juliana’s on September 16, 2026. The oldest on this top 10 is Marko's Pizzeria on July 14, 2025, which was still the latest inspection on that CAMIS when we checked. A new inspection can change a grade or score. Recheck the listing and the official record before you rely on an older date.",
  },
]

export const BEST_PIZZA_RELATED_HREFS = [
  "/guides/best-italian-restaurants-nyc",
  "/guides/nyc-health-grades-explained",
  "/guides/nyc-restaurant-inspection-process",
  "/guides/best-healthy-neighborhoods-nyc",
  "/guides/hidden-gem-restaurants-nyc",
  "/healthy-restaurants/grade-a",
  "/nyc/manhattan/healthy-restaurants",
  "/nyc/brooklyn/healthy-restaurants",
  "/nyc/queens/healthy-restaurants",
  "/nyc/bronx/healthy-restaurants",
  "/nyc/staten-island/healthy-restaurants",
  "/nyc/compare",
  "/map",
  "/data/nyc-restaurant-health-grade-report",
  "/about/our-data",
] as const

export function introWordCount(): number {
  return BEST_PIZZA_INTRO.trim().split(/\s+/).filter(Boolean).length
}

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>()
  for (const restaurant of BEST_PIZZA_RESTAURANTS) {
    hrefs.add(restaurantHref(restaurant.slug))
    hrefs.add(neighborhoodHref(restaurant.borough, restaurant.neighborhood))
  }
  for (const row of BEST_PIZZA_EXCLUDED) hrefs.add(restaurantHref(row.slug))
  hrefs.add(restaurantHref(BEST_PIZZA_OUTSIDE_TOP_10.slug))
  for (const href of BEST_PIZZA_RELATED_HREFS) hrefs.add(href)
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
  const url = `${siteUrl}${BEST_PIZZA_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: BEST_PIZZA_TITLE,
    description: BEST_PIZZA_DESCRIPTION,
    datePublished: BEST_PIZZA_PUBLISHED,
    dateModified: BEST_PIZZA_PUBLISHED,
    author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BEST_PIZZA_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
