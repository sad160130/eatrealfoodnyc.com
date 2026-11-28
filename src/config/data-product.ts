/**
 * NYC Restaurant Compliance Weekly.
 * Leave a Stripe Payment Link empty until the live link exists.
 * An empty link shows the early-access email form instead of checkout.
 * Both subscription links return the buyer to /data?subscribed=1.
 * The one-time neighborhood report returns the buyer to /data?purchased=1.
 */
export const DATA_PRODUCT = {
  name: "NYC Restaurant Compliance Weekly",
  priceMonthlyUsd: 79,
  priceYearlyUsd: 790,
  stripePaymentLinkMonthly: "https://buy.stripe.com/14A6oHbt93sc7sqgu1cV203",
  stripePaymentLinkYearly: "https://buy.stripe.com/5kQ9AT7cT5Ak4ge3HfcV204",
} as const

/** One-time Excel file. Not the Compliance Weekly subscription. */
export const NEIGHBORHOOD_INSPECTION_REPORT = {
  name: "NYC Neighborhood Inspection Report",
  priceUsd: 99,
  stripePaymentLink: "https://buy.stripe.com/28E7sLgNt5AkfYW91zcV205",
} as const

export const DOHMH_DATASET = {
  id: "43nn-pn8j",
  name: "DOHMH New York City Restaurant Inspection Results",
  source: "Department of Health and Mental Hygiene (DOHMH)",
  url: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
} as const
