import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import { COMPLIANCE_FROM } from "@/lib/compliance-mail"
import { DATA_SAMPLE_SUBJECT, maskEmail } from "@/lib/data-sample"

/** Same Resend endpoint and From address as the Monday compliance email. */
export function dataSampleMessage(to: string, text: string) {
  return {
    from: COMPLIANCE_FROM,
    to: [to],
    subject: DATA_SAMPLE_SUBJECT,
    text,
    reply_to: PARTNER_INQUIRY_EMAIL,
  }
}

export async function sendDataSampleEmail(to: string, text: string): Promise<"sent" | "skipped" | "failed"> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn(
      JSON.stringify({
        event: "data_sample_email_skipped",
        reason: "missing_api_key",
        email: maskEmail(to),
      })
    )
    return "skipped"
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataSampleMessage(to, text)),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) {
      console.warn(
        JSON.stringify({
          event: "data_sample_email_failed",
          status: response.status,
          email: maskEmail(to),
        })
      )
      return "failed"
    }
    return "sent"
  } catch {
    console.warn(
      JSON.stringify({
        event: "data_sample_email_failed",
        status: null,
        email: maskEmail(to),
      })
    )
    return "failed"
  }
}
