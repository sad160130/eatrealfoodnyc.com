/** Copy and source ids for the free compliance sample. No counts, quotes, or results. */
export const DATA_SAMPLE_NOTE =
  "Get one free sample: 10 current rows from this week's lead lists, sent once. No subscription."

export const DATA_SAMPLE_BUTTON = "Email me a free sample"

export const DATA_SAMPLE_SOURCES = {
  data_page_top: "/data",
  data_page_bottom: "/data",
  grades_guide: "/guides/nyc-health-grades-explained",
} as const

export type DataSampleSource = keyof typeof DATA_SAMPLE_SOURCES

export const DATA_SAMPLE_MESSAGES = {
  sent: "Sent. Check your inbox for the free sample. It is one email with up to 10 current rows. No subscription.",
  duplicate: "This address already requested a sample in the last 24 hours. We did not send another email.",
  invalid: "Enter a valid email address.",
  limited: "Too many requests from this network. Try again in a few minutes.",
  failed: "We couldn't save that request. Please try again.",
  unavailable: "Samples are temporarily unavailable. Please try again later.",
  sending: "Sending the sample request.",
  source: "That request could not be saved.",
  company: "Shorten the company name to 120 characters.",
  sells: "Shorten what you sell to 160 characters.",
} as const
