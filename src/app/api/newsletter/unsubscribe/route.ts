import { getCanonicalUrl } from "@/config/seo"
import { unsubscribeNewsletterSubscriber } from "@/lib/newsletter-subscribers"
import { verifyNewsletterToken } from "@/lib/newsletter-token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function tokenFrom(request: Request): string {
  return new URL(request.url).searchParams.get("token")?.trim() ?? ""
}

/** Mail clients that open the header link land on the human unsubscribe page. */
export async function GET(request: Request) {
  const token = tokenFrom(request)
  const dest = new URL(getCanonicalUrl("/newsletter/unsubscribe"))
  if (token) dest.searchParams.set("token", token)
  return Response.redirect(dest, 303)
}

/**
 * One-click unsubscribe (RFC 8058). The body is `List-Unsubscribe=One-Click`.
 * The token in the query identifies the address. Sets confirmed to false.
 */
export async function POST(request: Request) {
  const verified = verifyNewsletterToken(tokenFrom(request), { purpose: "unsubscribe" })
  if (!verified.ok) return Response.json({ ok: false }, { status: 400 })
  const result = await unsubscribeNewsletterSubscriber(verified.email)
  if (result === "error") return Response.json({ ok: false }, { status: 500 })
  return Response.json({ ok: true })
}
