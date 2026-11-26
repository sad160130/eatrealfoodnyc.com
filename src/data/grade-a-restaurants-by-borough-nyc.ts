import { guideAuthors } from "@/lib/founders"
/**
 * Grade A restaurants by borough, checked on 2026-11-24 (America/New_York).
 * Listing fields came from the live restaurants table. Latest inspections came
 * from NYC DOHMH Open Data dataset 43nn-pn8j. A kitchen is a current Grade A
 * match only when the latest city inspection is a Grade A and that grade,
 * score, and date match the published listing. Do not invent facts.
 */
import { GUIDE_KEYWORDS } from "../config/keywords"
import { boroughToSlug, neighborhoodToSlug } from "../lib/utils"

export const GRADE_A_BOROUGH_PATH = "/guides/grade-a-restaurants-by-borough-nyc"
export const GRADE_A_BOROUGH_TITLE = "Grade A Restaurants by Borough: 3 NYC Matches (2026)"
export const GRADE_A_BOROUGH_SHORT_TITLE = "Grade A by Borough"
export const GRADE_A_BOROUGH_DESCRIPTION =
  "Grade A restaurants by borough in NYC, verified November 24, 2026. Three latest DOHMH inspections are Grade A and match the listing."
export const GRADE_A_BOROUGH_PUBLISHED = "2026-11-24"
export const GRADE_A_BOROUGH_VERIFIED_ON = "November 24, 2026"
export const GRADE_A_BOROUGH_KEYWORD = GUIDE_KEYWORDS["grade-a-restaurants-by-borough-nyc"]
export const DOHMH_DATASET_ID = "43nn-pn8j"
export const DOHMH_DATASET_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"

export const GRADE_A_BOROUGH_INTRO =
  "Grade A restaurants by borough in NYC are counted on this page only when the latest city inspection is a Grade A and it matches the published listing. A Grade A is 0 to 13 points. The B band is 14 to 27 points on a reinspection. The C band is 28 or more points on a reinspection. A first visit scoring 14 or more does not itself issue a new letter. We checked the five restaurants in our most recent YouTube Shorts against the live database and NYC Open Data dataset 43nn-pn8j on November 24, 2026. Dirt Candy in the Lower East Side, Manhattan, City Island Lobster House in City Island, Bronx, and Lakruwana Restaurant in Stapleton, Staten Island match. Ali's Trinbago Roti Shop in Bedford-Stuyvesant, Brooklyn, and Pho Hoang in Flushing, Queens, are listed under latest inspection not yet graded because their latest rows have no letter."

export type CheckedViolation = {
  code: string
  critical: boolean
  summary: string
}

export type CheckedRestaurant = {
  name: string
  officialDba: string
  slug: string
  camis: string
  borough: string
  /** Place shown on this guide. City Island is labeled here even though the listing field differs. */
  placeLabel: string
  neighborhood: string
  address: string
  directoryType: string
  dietaryTags: string[]
  cityCuisine: string
  /** True only when the latest city row is Grade A and matches the listing. */
  currentGradeA: boolean
  listingGrade: "A"
  listingScore: number
  listingDate: string
  listingDateLabel: string
  latestGrade: "A" | null
  latestScore: number
  latestDate: string
  latestDateLabel: string
  inspectionType: string
  violationCount: number
  violations: CheckedViolation[]
  honestLine: string
  body: string
}

export function restaurantHref(slug: string): string {
  return `/restaurants/${slug}`
}

export function boroughHref(borough: string): string {
  return `/nyc/${boroughToSlug(borough)}/healthy-restaurants`
}

export function neighborhoodHref(borough: string, neighborhood: string): string {
  return `/nyc/${boroughToSlug(borough)}/${neighborhoodToSlug(neighborhood)}/healthy-restaurants`
}

export function camisUrl(camis: string): string {
  return `https://a816-health.nyc.gov/ABCEats/Restaurant/Detail/${camis}`
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

const FOOD_CONTACT =
  "Food contact surface not properly washed, rinsed and sanitized after each use and following any activity when contamination may have occurred."
const NON_FOOD_SURFACE =
  "Non-food contact surface or equipment made of unacceptable material, not kept clean, or not properly sealed, raised, spaced or movable to allow accessibility for cleaning on all sides, above and underneath the unit."
const NOT_PROTECTED =
  "Food, supplies, or equipment not protected from potential source of contamination during storage, preparation, transportation, display, service or from customer’s refillable, reusable container. Condiments not in single-service containers or dispensed directly by the vendor."
const BACKFLOW =
  "Anti-siphonage or back-flow prevention device not provided where required; equipment or floor not properly drained; sewage disposal system in disrepair or not functioning properly. Condensation or liquid waste improperly disposed of."

export const GRADE_A_BOROUGH_RESTAURANTS: CheckedRestaurant[] = [
  {
    name: "Dirt Candy",
    officialDba: "DIRT CANDY",
    slug: "dirt-candy",
    camis: "50016891",
    borough: "Manhattan",
    placeLabel: "Lower East Side, Manhattan",
    neighborhood: "Lower East Side",
    address: "86 Allen St, New York, NY 10002",
    directoryType: "Vegetarian restaurant",
    dietaryTags: ["vegan"],
    cityCuisine: "Vegetarian",
    currentGradeA: true,
    listingGrade: "A",
    listingScore: 7,
    listingDate: "2025-11-12",
    listingDateLabel: "November 12, 2025",
    latestGrade: "A",
    latestScore: 7,
    latestDate: "2025-11-12",
    latestDateLabel: "November 12, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    violationCount: 2,
    violations: [
      { code: "06D", critical: true, summary: FOOD_CONTACT },
      { code: "10F", critical: false, summary: NON_FOOD_SURFACE },
    ],
    honestLine:
      "A Lower East Side vegetarian restaurant at 86 Allen Street whose latest inspection matches the listing: Grade A, 7 points, 2 violations.",
    body: "Dirt Candy is a published, operational restaurant at 86 Allen Street, New York, NY 10002, in the Lower East Side, Manhattan. The directory lists the type as a vegetarian restaurant and applies the vegan dietary tag. NYC DOHMH CAMIS 50016891 files the same address as DIRT CANDY, and the city's cuisine description is Vegetarian. On November 12, 2025, an initial cycle inspection scored 7 points and recorded 2 violations. One is critical code 06D, a food-contact surface not properly washed, rinsed, and sanitized after use. The other is non-critical code 10F, a non-food contact surface or piece of equipment that was not kept clean or properly movable for cleaning. The grade on that inspection is A. A score of 7 is inside the Grade A band of 0 to 13 points. A score of 14 to 27 is the B band, and 28 or more is the C band. Those letters are issued on a reinspection, not from a 7-point initial visit. The Grade A, the score of 7, and the date on our listing match this row. A CAMIS history checked on November 24, 2026 showed no later inspection. This is a sanitary record, not a menu.",
  },
  {
    name: "Ali's Trinbago Roti Shop",
    officialDba: "ALI'S ROTI SHOP",
    slug: "alis-trinbago-roti-shop",
    camis: "50118947",
    borough: "Brooklyn",
    placeLabel: "Bedford-Stuyvesant, Brooklyn",
    neighborhood: "Bedford-Stuyvesant",
    address: "1267 Fulton St, Brooklyn, NY 11216",
    directoryType: "Caribbean restaurant",
    dietaryTags: [],
    cityCuisine: "Caribbean",
    currentGradeA: false,
    listingGrade: "A",
    listingScore: 8,
    listingDate: "2024-12-24",
    listingDateLabel: "December 24, 2024",
    latestGrade: null,
    latestScore: 24,
    latestDate: "2026-05-20",
    latestDateLabel: "May 20, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    violationCount: 4,
    violations: [
      {
        code: "06E",
        critical: true,
        summary: "Sanitized equipment or utensil, including in-use food dispensing utensil, improperly used or stored.",
      },
      { code: "02B", critical: true, summary: "Hot TCS food item not held at or above 140 °F." },
      {
        code: "04A",
        critical: true,
        summary: "Food Protection Certificate (FPC) not held by manager or supervisor of food operations.",
      },
      { code: "09E", critical: false, summary: "Wash hands sign not posted near or above hand washing sink." },
    ],
    honestLine:
      "Latest NYC Open Data inspection on May 20, 2026: no letter, score 24, 4 violations. Dataset 43nn-pn8j.",
    body: "Ali's Trinbago Roti Shop is a published, operational Caribbean restaurant at 1267 Fulton Street, Brooklyn, NY 11216, in Bedford-Stuyvesant. The listing has no dietary tags. NYC DOHMH CAMIS 50118947 files that address as ALI'S ROTI SHOP, and the city's cuisine description is Caribbean. Our database still stores Grade A, 8 points, and December 24, 2024. That city row is a cycle reinspection with 1 violation and grade A. It is not the latest inspection. On May 20, 2026, an initial cycle inspection scored 24 points, recorded 4 violations, and left the grade blank. The codes are critical 06E, 02B, and 04A, plus non-critical 09E. A score of 24 is outside the Grade A band of 0 to 13 and inside the 14 to 27 band used for a B. A B is issued on a reinspection, not on this first visit. The latest inspection does not match a Grade A, so this page does not count the kitchen as one. The YouTube Short title still says Grade A. That title is not this latest inspection. This check uses only the Fulton Street CAMIS.",
  },
  {
    name: "Pho Hoang",
    officialDba: "PHO HOANG",
    slug: "pho-hoang",
    camis: "50121427",
    borough: "Queens",
    placeLabel: "Flushing, Queens",
    neighborhood: "Flushing",
    address: "41-01 Kissena Blvd, Flushing, NY 11355",
    directoryType: "Vietnamese restaurant",
    dietaryTags: [],
    cityCuisine: "Asian/Asian Fusion",
    currentGradeA: false,
    listingGrade: "A",
    listingScore: 12,
    listingDate: "2024-05-20",
    listingDateLabel: "May 20, 2024",
    latestGrade: null,
    latestScore: 40,
    latestDate: "2026-09-14",
    latestDateLabel: "September 14, 2026",
    inspectionType: "Cycle Inspection / Initial Inspection",
    violationCount: 6,
    violations: [
      {
        code: "04H",
        critical: true,
        summary:
          "Raw, cooked or prepared food is adulterated, contaminated, cross-contaminated, or not discarded in accordance with HACCP plan.",
      },
      {
        code: "04N",
        critical: true,
        summary:
          "Filth flies or food/refuse/sewage associated with (FRSA) flies or other nuisance pests in establishment’s food and/or non-food areas. FRSA flies include house flies, blow flies, bottle flies, flesh flies, drain flies, Phorid flies and fruit flies.",
      },
      { code: "06C", critical: true, summary: NOT_PROTECTED },
      {
        code: "05D",
        critical: true,
        summary:
          "No hand washing facility in or adjacent to toilet room or within 25 feet of a food preparation, food service or ware washing area. Hand washing facility not accessible, obstructed or used for non-hand washing purposes. No hot and cold running water or water at inadequate pressure. No soap or acceptable hand-drying device.",
      },
      { code: "06D", critical: true, summary: FOOD_CONTACT },
      {
        code: "08A",
        critical: false,
        summary: "Establishment is not free of harborage or conditions conducive to rodents, insects or other pests.",
      },
    ],
    honestLine:
      "Latest NYC Open Data inspection on September 14, 2026: no letter, score 40, 6 violations. Dataset 43nn-pn8j.",
    body: "Pho Hoang is a published, operational Vietnamese restaurant at 41-01 Kissena Boulevard, Flushing, NY 11355. The listing has no dietary tags. NYC DOHMH CAMIS 50121427 files that address as PHO HOANG, and the city's cuisine description is Asian/Asian Fusion. Our database still stores Grade A, 12 points, and May 20, 2024. That initial inspection is in the city file, with grade A, 12 points, and 3 violations. It is not the latest row. The latest inspection is September 14, 2026: an initial cycle inspection with no letter, a score of 40, and 6 violations. Forty points is in the 28-or-more band used for a C. A C is issued on a reinspection, so this row is not a Grade C and it is not a Grade A. The file also records a DOHMH closure on September 23, 2025, a September 26, 2025 reopening with grade P and a score of 9, and a December 13, 2025 reinspection with grade A and a score of 11. P means Grade Pending on reopening after a closure. The YouTube Short title still says Grade A. The September 14, 2026 row is the latest, and it does not match a Grade A.",
  },
  {
    name: "City Island Lobster House",
    officialDba: "CITY ISLAND LOBSTER HOUSE",
    slug: "city-island-lobster-house",
    camis: "41412907",
    borough: "Bronx",
    placeLabel: "City Island, Bronx",
    neighborhood: "Throgs Neck",
    address: "691 Bridge St, Bronx, NY 10464",
    directoryType: "Seafood restaurant",
    dietaryTags: [],
    cityCuisine: "Seafood",
    currentGradeA: true,
    listingGrade: "A",
    listingScore: 9,
    listingDate: "2025-12-04",
    listingDateLabel: "December 4, 2025",
    latestGrade: "A",
    latestScore: 9,
    latestDate: "2025-12-04",
    latestDateLabel: "December 4, 2025",
    inspectionType: "Cycle Inspection / Initial Inspection",
    violationCount: 3,
    violations: [
      { code: "06D", critical: true, summary: FOOD_CONTACT },
      { code: "10B", critical: false, summary: BACKFLOW },
      { code: "10F", critical: false, summary: NON_FOOD_SURFACE },
    ],
    honestLine:
      "A seafood restaurant at 691 Bridge Street. This guide labels the location City Island, Bronx. The latest inspection matches the listing: Grade A, 9 points, 3 violations. The neighborhood field on the listing is Throgs Neck.",
    body: "City Island Lobster House is a published, operational seafood restaurant at 691 Bridge Street, Bronx, NY 10464. This guide labels the location City Island, Bronx. The neighborhood field on our listing is Throgs Neck. NYC DOHMH CAMIS 41412907 files that address as CITY ISLAND LOBSTER HOUSE, and the city's cuisine description is Seafood. On December 4, 2025, an initial cycle inspection scored 9 points and recorded 3 violations. The critical code is 06D, a food-contact surface not properly washed, rinsed, and sanitized. The two non-critical codes are 10B, covering backflow prevention, drainage, or liquid waste, and 10F, a non-food contact surface or piece of equipment. The grade is A. Nine points sits in the Grade A band of 0 to 13. The B band starts at 14 points and the C band at 28, and those letters are assigned on a reinspection. The Grade A, the score of 9, and the date December 4, 2025 on our listing match this latest inspection. A history for this CAMIS checked on November 24, 2026 had no later row. We do not add a menu claim from the name.",
  },
  {
    name: "Lakruwana Restaurant",
    officialDba: "NEW LAKRUWANA RESTAURANT",
    slug: "lakruwana-restaurant",
    camis: "50187828",
    borough: "Staten Island",
    placeLabel: "Stapleton, Staten Island",
    neighborhood: "Stapleton",
    address: "668 Bay St, Staten Island, NY 10304",
    directoryType: "Sri Lankan restaurant",
    dietaryTags: ["vegetarian"],
    cityCuisine: "Indian",
    currentGradeA: true,
    listingGrade: "A",
    listingScore: 12,
    listingDate: "2026-08-15",
    listingDateLabel: "August 15, 2026",
    latestGrade: "A",
    latestScore: 12,
    latestDate: "2026-08-15",
    latestDateLabel: "August 15, 2026",
    inspectionType: "Pre-permit (Operational) / Initial Inspection",
    violationCount: 3,
    violations: [
      { code: "06C", critical: true, summary: NOT_PROTECTED },
      { code: "10B", critical: false, summary: BACKFLOW },
      { code: "10F", critical: false, summary: NON_FOOD_SURFACE },
    ],
    honestLine:
      "A Stapleton Sri Lankan restaurant at 668 Bay Street whose latest inspection matches the listing: Grade A, 12 points, 3 violations. The city cuisine field says Indian.",
    body: "Lakruwana Restaurant is a published, operational listing at 668 Bay Street, Staten Island, NY 10304, in Stapleton. The directory type is Sri Lankan restaurant, and the dietary tag on the listing is vegetarian. NYC DOHMH CAMIS 50187828 files that address as NEW LAKRUWANA RESTAURANT. The city's cuisine description is Indian, which is not the same phrase as the directory type. On August 15, 2026, a pre-permit operational initial inspection scored 12 points and recorded 3 violations. The critical code is 06C, food, supplies, or equipment not protected from a potential source of contamination. The non-critical codes are 10B, covering backflow prevention, drainage, or liquid waste, and 10F, a non-food contact surface or piece of equipment. The grade on that row is A. Twelve points is still inside the Grade A band of 0 to 13. Fourteen points is where the B band begins. The Grade A, the score of 12, and the date on our listing match this inspection. It is the only inspection on this CAMIS in the file we checked on November 24, 2026. We report the city's Indian cuisine label and the directory's Sri Lankan type as two different fields, and we do not invent dishes.",
  },
]

export const GRADE_A_BOROUGH_HOW = [
  "This page is not a taste ranking and it is not a paid placement. It checks five published, operational restaurants, one in each borough, because those five are the subjects of our most recent YouTube Shorts. The question for each kitchen is narrow: does the latest inspection in NYC Open Data dataset 43nn-pn8j carry a Grade A, and do that grade, score, and date match the row in our database?",
  "We read each listing from the live restaurants table on November 24, 2026: name, type, dietary tags, borough, neighborhood, address, inspection grade, inspection score, and inspection date, plus published and operational status. We then pulled the CAMIS history for the address on the listing. The latest inspection is the newest inspection date on that CAMIS. The violation count is the number of violation rows on that date, not a lifetime total. A kitchen is one of the three Grade A matches only when the latest row's grade is A and the listing stores the same grade, score, and calendar day.",
  "Ali's Trinbago Roti Shop and Pho Hoang are in the section Latest inspection not yet graded. They are not in the Grade A count. Ali's latest row is May 20, 2026, with a score of 24 and no letter. Pho Hoang's latest row is September 14, 2026, with a score of 40 and no letter. A first inspection of 14 or more points does not issue a B or a C. The previous letter can remain posted until reinspection. That is why a blank latest grade is not described here as a new letter.",
  `Every figure above was checked on ${GRADE_A_BOROUGH_VERIFIED_ON}. A newer inspection can change a score or a letter. Recheck the listing and the city record before relying on an older date.`,
]

export const GRADE_A_BOROUGH_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Which Grade A restaurants by borough in NYC did this page verify?",
    answer:
      "On November 24, 2026, three kitchens had a latest NYC DOHMH inspection that is a Grade A and matches the published listing. Dirt Candy, at 86 Allen Street in the Lower East Side, Manhattan, is Grade A with 7 points and 2 violations from November 12, 2025. City Island Lobster House, at 691 Bridge Street, is labeled City Island, Bronx, and is Grade A with 9 points and 3 violations from December 4, 2025. The neighborhood field on that listing is Throgs Neck. Lakruwana Restaurant, at 668 Bay Street in Stapleton, Staten Island, is Grade A with 12 points and 3 violations from August 15, 2026. A Grade A means 0 to 13 points.",
  },
  {
    question: "What is the latest inspection for Ali's Trinbago Roti Shop and Pho Hoang?",
    answer:
      "Both are in the section Latest inspection not yet graded. The latest NYC Open Data rows, dataset 43nn-pn8j, have no letter. Ali's Trinbago Roti Shop at 1267 Fulton Street, Bedford-Stuyvesant, was inspected on May 20, 2026, with a score of 24 and 4 violations. Pho Hoang at 41-01 Kissena Boulevard, Flushing, was inspected on September 14, 2026, with a score of 40 and 6 violations. Twenty-four points is in the 14 to 27 band. Forty points is in the 28-or-more band. A B or a C is issued on a reinspection, so these initial visits have no letter.",
  },
  {
    question: "What do NYC inspection scores of 0 to 13, 14 to 27, and 28 or more mean?",
    answer:
      "A Grade A is a score of 0 to 13 points on the initial inspection or the reinspection. A B is a reinspection score of 14 to 27 points. A C is a reinspection score of 28 or more points. A first visit scoring 14 or more does not itself issue a B or a C. The grade field on that row can be blank while the score is already outside the Grade A band. Z and P in the city dataset mean Grade Pending, not a fourth letter. P means Grade Pending on reopening after a closure. This page uses those cutoffs and does not treat a blank grade as a letter.",
  },
  {
    question: "Where does this guide place City Island Lobster House?",
    answer:
      "This guide labels the location City Island, Bronx. The address is 691 Bridge Street, Bronx, NY 10464. The published neighborhood field on the listing is Throgs Neck. The official DBA is CITY ISLAND LOBSTER HOUSE, and the city's cuisine description is Seafood. The latest inspection on December 4, 2025 is a Grade A with 9 points and 3 violations, and that grade, score, and date match the listing.",
  },
  {
    question: "How current is this Grade A restaurants by borough check?",
    answer:
      "The database rows and the NYC Open Data file were both checked on November 24, 2026. The newest inspection among the five is Pho Hoang on September 14, 2026, with no letter and a score of 40. The newest Grade A match is Lakruwana Restaurant on August 15, 2026. The oldest Grade A match is Dirt Candy on November 12, 2025. NYC can inspect a restaurant again, and a new row can change the score or the letter. Use the listing and the official CAMIS record if you need a date later than November 24, 2026.",
  },
]

export const GRADE_A_BOROUGH_RELATED_HREFS = [
  "/guides/nyc-health-grades-explained",
  "/guides/nyc-restaurant-inspection-process",
  "/guides/best-italian-restaurants-nyc",
  "/guides/best-pizza-restaurants-nyc",
  "/guides/seafood-healthy-restaurants-nyc",
  "/healthy-restaurants/grade-a",
  "/healthy-restaurants/vegan",
  "/healthy-restaurants/vegetarian",
  "/nyc/manhattan/healthy-restaurants",
  "/nyc/brooklyn/healthy-restaurants",
  "/nyc/queens/healthy-restaurants",
  "/nyc/bronx/healthy-restaurants",
  "/nyc/staten-island/healthy-restaurants",
  "/about/our-data",
  "/data/nyc-restaurant-health-grade-report",
] as const

export function currentGradeARestaurants(): CheckedRestaurant[] {
  return GRADE_A_BOROUGH_RESTAURANTS.filter((row) => row.currentGradeA)
}

export function ungradedRestaurants(): CheckedRestaurant[] {
  return GRADE_A_BOROUGH_RESTAURANTS.filter((row) => !row.currentGradeA)
}

export function itemListSchema(siteUrl: string) {
  const matches = currentGradeARestaurants()
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: GRADE_A_BOROUGH_TITLE,
    description: GRADE_A_BOROUGH_DESCRIPTION,
    numberOfItems: matches.length,
    itemListElement: matches.map((restaurant, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: restaurant.name,
      url: `${siteUrl}${restaurantHref(restaurant.slug)}`,
    })),
  }
}

export function pageInternalHrefs(): string[] {
  const hrefs = new Set<string>(GRADE_A_BOROUGH_RELATED_HREFS)
  for (const restaurant of GRADE_A_BOROUGH_RESTAURANTS) {
    hrefs.add(restaurantHref(restaurant.slug))
    hrefs.add(boroughHref(restaurant.borough))
    hrefs.add(neighborhoodHref(restaurant.borough, restaurant.neighborhood))
  }
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
  const url = `${siteUrl}${GRADE_A_BOROUGH_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: GRADE_A_BOROUGH_TITLE,
    description: GRADE_A_BOROUGH_DESCRIPTION,
    datePublished: GRADE_A_BOROUGH_PUBLISHED,
    dateModified: GRADE_A_BOROUGH_PUBLISHED,
    author: guideAuthors(),
    publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl, logo: `${siteUrl}/logo.png` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GRADE_A_BOROUGH_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
