import { DOHMH_DATASET } from "@/config/data-product"

export const COMPLIANCE_FROM = "Eat Real Food NYC <compliance@eatrealfoodnyc.com>"

export function mondayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value
  if (!year || !month || !day) throw new Error("Monday date missing")
  return `${year}-${month}-${day}`
}

export function mondayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date)
}

export function complianceSubject(date: Date): string {
  return `NYC Restaurant Compliance Weekly, ${mondayLabel(date)}`
}

export function complianceBody(date: Date): string {
  const when = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(date)
  return [
    "NYC Restaurant Compliance Weekly",
    `Extract: ${when}`,
    "",
    "Two files are attached:",
    "- inspection-leads.csv",
    "- new-openings.csv",
    "",
    `Source: NYC Open Data, ${DOHMH_DATASET.name}, dataset ${DOHMH_DATASET.id}.`,
    DOHMH_DATASET.url,
    "",
    "inspection-leads.csv includes a row when the grade is Z or P, the score is 28 or more, or the business status is present and is not operational. lead_type can list more than one of those reasons.",
    "new-openings.csv includes published operational restaurants with no inspection date and no A, B, or C. pre_permit is empty because this directory has no pre-permit flag.",
    "",
    "Street addresses are included in these files. The public sample on the site redacts them.",
  ].join("\n")
}

export async function sendComplianceEmail(input: {
  to: string
  subject: string
  text: string
  leadsCsv: string
  openingsCsv: string
}): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: COMPLIANCE_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      attachments: [
        { filename: "inspection-leads.csv", content: Buffer.from(input.leadsCsv, "utf8").toString("base64") },
        { filename: "new-openings.csv", content: Buffer.from(input.openingsCsv, "utf8").toString("base64") },
      ],
    }),
  })
  if (!response.ok) throw new Error(`Resend failed (${response.status})`)
}

export async function deliverComplianceWeek(input: {
  now: Date
  subscribers: Array<{ stripe_subscription_id: string; email: string }>
  alreadySent: (subscriptionId: string, monday: string) => Promise<boolean>
  send: (email: string) => Promise<void>
  record: (subscriptionId: string, email: string, monday: string) => Promise<void>
}): Promise<{ sent: number; skipped: number; failed: number }> {
  const monday = mondayKey(input.now)
  let sent = 0
  let skipped = 0
  let failed = 0
  for (const subscriber of input.subscribers) {
    if (await input.alreadySent(subscriber.stripe_subscription_id, monday)) {
      skipped += 1
      continue
    }
    try {
      await input.send(subscriber.email)
      await input.record(subscriber.stripe_subscription_id, subscriber.email, monday)
      sent += 1
    } catch {
      failed += 1
    }
  }
  return { sent, skipped, failed }
}
