import { DOHMH_DATASET } from "@/config/data-product"

/** Vercel cron in vercel.json. 12:00 UTC is 7:00 AM Eastern Time. */
export const DOHMH_REFRESH_CRON = "0 12 * * *"
export const DOHMH_REFRESH_CLOCK = "7:00 AM ET"
export const DOHMH_REFRESH_PATH = "/api/cron/refresh-dohmh"

export function dohmhRefreshSentence(): string {
  return `NYC DOHMH inspection grades refresh automatically every day at ${DOHMH_REFRESH_CLOCK}. A Vercel cron (${DOHMH_REFRESH_CRON} UTC) calls ${DOHMH_REFRESH_PATH} and reads NYC Open Data dataset ${DOHMH_DATASET.id}.`
}
