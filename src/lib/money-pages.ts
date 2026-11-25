import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import { DATA_PRODUCT, DOHMH_DATASET } from "@/config/data-product"
import { PARTNER_TIERS } from "@/config/partner-tiers"
import { DATA_SAMPLE_LIMIT } from "@/lib/data-sample"
import { dohmhRefreshSentence } from "@/lib/dohmh-cadence"
import { HIGH_SCORE } from "@/lib/compliance-csv"
import { fitTitle, TITLE_MAX } from "@/lib/seo-titles"

export interface FaqEntry {
  question: string
  answer: string
}

export const CATERING_TITLE = fitTitle(
  [
    "NYC Catering Requests from Grade A Restaurants | Eat Real Food NYC",
    "NYC Catering Requests from Grade A | Eat Real Food NYC",
    "NYC Catering Requests | Eat Real Food NYC",
  ],
  { allowBrand: false, max: TITLE_MAX, cap: TITLE_MAX }
)

export const DATA_WEEKLY_TITLE = fitTitle(
  [
    "NYC Restaurant Inspection Leads Weekly | Compliance Weekly",
    "NYC Inspection Leads Weekly | Compliance Weekly",
    "NYC Restaurant Inspection Leads Weekly",
  ],
  { allowBrand: false, max: TITLE_MAX, cap: TITLE_MAX }
)

export const PARTNER_TITLE = fitTitle(
  [
    "Claim Your NYC Restaurant Listing + Free Grade A Badge",
    "Claim Your NYC Restaurant Listing | Free Grade A Badge",
    "Claim Your NYC Restaurant Listing",
  ],
  { allowBrand: false, max: TITLE_MAX, cap: TITLE_MAX }
)

export const CATERING_INTRO =
  "A catering request on Eat Real Food NYC is free. The form does not take payment and it does not list prices. You send the date, the headcount, the neighborhood, and any dietary needs. We save the request and may share it with restaurants. A restaurant decides whether it caters."

/** Wording stays aligned with the holiday catering FAQ. Nothing here is a price or a booking. */
export const CATERING_FAQS: FaqEntry[] = [
  {
    question: "Does it cost anything to request catering?",
    answer:
      "Sending the request is free for the person filling out the form. Eat Real Food NYC does not collect payment on this page. Restaurant prices are not listed here, and this form does not quote a menu price.",
  },
  {
    question: "Does the form book a restaurant?",
    answer:
      "No. We save the request and may share it with restaurants. A restaurant decides whether it caters and whether the date is still open. This page does not hold a slot.",
  },
  {
    question: "Can a catering request include dietary needs?",
    answer:
      "Yes. The form asks about vegan, vegetarian, gluten-free, kosher, halal, nut-free, and other needs. Dietary tags on a listing are applied only when a restaurant identifies that way or has substantial dedicated menu coverage. A tag is not a catering menu.",
  },
  {
    question: "How do NYC health grades relate to a catering request?",
    answer:
      "A Grade A is the letter matched from NYC Department of Health and Mental Hygiene inspection data. A Grade A is a score of 0 to 13 points on the initial inspection or the reinspection. It describes a sanitary inspection. It is not a catering certification. The guide at /guides/nyc-health-grades-explained covers how A, B, and C are assigned.",
  },
  {
    question: "Where can I send a holiday party catering request?",
    answer:
      "Office holiday catering and Thanksgiving week requests use the same free form. The holiday page lists published Grade A restaurants for group orders. The directory does not record a catering menu, and being listed is not a statement that the restaurant will cater.",
  },
]

export function dataWeeklyFaqs(): FaqEntry[] {
  return [
    {
      question: "What is in the Compliance Weekly email?",
      answer: `Every Monday the email has two CSVs. Inspection leads cover Grade Pending (city codes Z and P), ${HIGH_SCORE} or more violation points, or a closed status. New openings are published listings not yet inspected.`,
    },
    {
      question: "Where does the data come from?",
      answer: `The rows come from NYC Open Data dataset ${DOHMH_DATASET.id}, ${DOHMH_DATASET.name}, published by the NYC Department of Health and Mental Hygiene. Names in the on-page sample are reduced to a first letter and street addresses are omitted.`,
    },
    {
      question: "How often does the email go out, and how often are grades refreshed?",
      answer: `Paid lists land every Monday. ${dohmhRefreshSentence()} The free sample does not wait for Monday.`,
    },
    {
      question: "How do I cancel?",
      answer: `Cancel anytime by email to ${PARTNER_INQUIRY_EMAIL}.`,
    },
    {
      question: "Is the sample free?",
      answer: `Yes. The sample is ${DATA_SAMPLE_LIMIT} real rows by email. It does not ask for a card. ${DATA_PRODUCT.name} is the paid Monday email.`,
    },
  ]
}

export function partnerFaqs(): FaqEntry[] {
  const [featured, spotlight, neighborhood] = PARTNER_TIERS
  return [
    {
      question: "Is the listing, the claim, and the Grade A badge free?",
      answer:
        "Yes. A listing, a claim, and a Grade A badge are free. You can claim a listing to correct hours, photos, the address, or diet tags. A person reviews the claim. The grade does not change.",
    },
    {
      question: "What do the paid placements cost?",
      answer: `${featured.name} is $${featured.priceMonthlyUsd}/mo, ${spotlight.name} is $${spotlight.priceMonthlyUsd}/mo, and ${neighborhood.name} is $${neighborhood.priceMonthlyUsd}/mo. Payment never changes a grade, a score, a dietary tag, or a ranking.`,
    },
    {
      question: "Can I pay to be listed or to raise a grade?",
      answer:
        "No. Listing is free if the restaurant meets the directory’s inclusion rules. Payment never changes an official grade, a Health Score, a dietary tag, or a ranking.",
    },
    {
      question: "Do you guarantee traffic, bookings, or rankings?",
      answer:
        "No. We do not guarantee traffic, bookings, or search rankings. Analytics started in November 2026. We share a current traffic report on request.",
    },
    {
      question: "Will diners know a placement was paid?",
      answer:
        "Yes. Paid placements are labeled Partner or Sponsored. The official grade, score, and date stay as the Health Department published them, and the organic list order does not change.",
    },
  ]
}

export function homeFaqs(): FaqEntry[] {
  return [
    {
      question: "What does a NYC Grade A mean?",
      answer:
        "Grade A means 0–13 points on the NYC Department of Health and Mental Hygiene inspection, on the initial visit or the reinspection. The letter is the city’s, not a score this directory assigns. See /guides/nyc-health-grades-explained.",
    },
    {
      question: "Where do the grades come from?",
      answer:
        "Grades are matched from NYC Open Data dataset 43nn-pn8j, DOHMH New York City Restaurant Inspection Results. A missing grade is not Grade A. Read /about/our-data and /guides/nyc-health-grades-explained.",
    },
    {
      question: "How often are grades refreshed?",
      answer: dohmhRefreshSentence(),
    },
    {
      question: "Is Eat Real Food NYC free to use?",
      answer:
        "Yes. Browsing the directory is free. A restaurant listing, a claim, and a Grade A badge are free. Paid placements are optional and never change a grade or a ranking.",
    },
  ]
}
