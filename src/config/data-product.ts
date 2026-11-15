/**
 * NYC Restaurant Compliance Weekly.
 * Leave a Stripe Payment Link empty until the live link exists.
 * An empty link shows the early-access email form instead of checkout.
 */
export const DATA_PRODUCT = {
  name: "NYC Restaurant Compliance Weekly",
  priceMonthlyUsd: 79,
  priceYearlyUsd: 790,
  stripePaymentLinkMonthly: "",
  stripePaymentLinkYearly: "",
} as const

export const DOHMH_DATASET = {
  id: "43nn-pn8j",
  name: "DOHMH New York City Restaurant Inspection Results",
  source: "Department of Health and Mental Hygiene (DOHMH)",
  url: "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j",
  /** NYC Open Data rowsUpdatedAt read on 2026-11-15. */
  version: "2026-11-13T23:06:43Z",
} as const
