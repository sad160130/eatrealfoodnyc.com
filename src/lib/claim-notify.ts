import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"

/** Log every claim. Send mail only when RESEND_API_KEY is configured. */
export async function notifyClaim(input: {
  restaurantName: string
  restaurantSlug: string
  content: string
}): Promise<"sent" | "logged"> {
  console.info(
    JSON.stringify({
      event: "claim_notification",
      restaurant: input.restaurantName,
      slug: input.restaurantSlug,
    })
  )
  const key = process.env.RESEND_API_KEY
  if (!key) return "logged"
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Eat Real Food NYC <${PARTNER_INQUIRY_EMAIL}>`,
      to: [PARTNER_INQUIRY_EMAIL],
      subject: `Claim: ${input.restaurantName}`,
      text: `${input.restaurantName}\n${input.restaurantSlug}\n\n${input.content}`,
    }),
  })
  if (!response.ok) {
    console.error("claim email failed")
    return "logged"
  }
  return "sent"
}
