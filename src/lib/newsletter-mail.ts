import { GENERAL_CONTACT_EMAIL } from "@/config/contact"
import { getCanonicalUrl } from "@/config/seo"
import { prisma } from "@/lib/db"
import {
  NEWSLETTER_DAILY_LIMIT,
  noteNewsletterQuotaUsed,
  releaseNewsletterSendQuota,
  takeNewsletterSendQuota,
} from "@/lib/newsletter-quota"
import {
  isNewsletterEmail,
  signNewsletterToken,
  type NewsletterPurpose,
} from "@/lib/newsletter-token"

const FROM = `Eat Real Food NYC <${GENERAL_CONTACT_EMAIL}>`
const CONFIRM_SUBJECT = "Confirm your Grade A Eats This Week email"
const CONFIRM_TIMEOUT_MS = 8_000
const ISSUE_TIMEOUT_MS = 15_000

export type ConfirmSendResult = "sent" | "skipped" | "failed"

export type NewsletterIssueResult = {
  sent: number
  skipped: number
  capped: boolean
}

export function newsletterLink(path: "/newsletter/confirm" | "/newsletter/unsubscribe", token: string): string {
  const url = new URL(getCanonicalUrl(path))
  url.searchParams.set("token", token)
  return url.toString()
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

function listUnsubscribeHeader(url: string): Record<string, string> {
  return { "List-Unsubscribe": `<${url}>` }
}

export function confirmationContent(confirmUrl: string, unsubscribeUrl: string): { html: string; text: string } {
  const confirmHref = escapeAttr(confirmUrl)
  const unsubscribeHref = escapeAttr(unsubscribeUrl)
  const text = [
    "Confirm your email for Grade A Eats This Week, the weekly note from Eat Real Food NYC.",
    "",
    "This link expires in 7 days:",
    confirmUrl,
    "",
    "You will receive the weekly email after you confirm. If you did not sign up, you can ignore this message.",
    "",
    "Unsubscribe:",
    unsubscribeUrl,
    "",
    "Eat Real Food NYC",
    getCanonicalUrl("/"),
  ].join("\n")
  const html = [
    `<div style="margin:0;padding:24px;background:#F8F6F1;color:#1B3A2D;font-family:Georgia,serif;">`,
    `<p style="margin:0 0 12px;font-size:22px;font-weight:bold;">Confirm your email</p>`,
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Grade A Eats This Week is one email a week from Eat Real Food NYC. This link expires in 7 days.</p>`,
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;"><a href="${confirmHref}" style="color:#2D6A4F;">Confirm your email</a></p>`,
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">You will receive the weekly email after you confirm. If you did not sign up, you can ignore this message.</p>`,
    `<p style="margin:24px 0 0;font-size:14px;line-height:1.5;"><a href="${unsubscribeHref}" style="color:#2D6A4F;">Unsubscribe</a></p>`,
    `</div>`,
  ].join("")
  return { html, text }
}

function appendUnsubscribe(html: string, text: string, unsubscribeUrl: string): { html: string; text: string } {
  const href = escapeAttr(unsubscribeUrl)
  return {
    html: `${html}<p style="margin:24px 0 0;font-family:Georgia,serif;font-size:14px;line-height:1.5;"><a href="${href}" style="color:#2D6A4F;">Unsubscribe</a> from Grade A Eats This Week.</p>`,
    text: `${text}\n\nUnsubscribe from Grade A Eats This Week:\n${unsubscribeUrl}\n`,
  }
}

type ResendPost = { status: number | null; dailyUsed: number | null; dailyExceeded: boolean }

function applyResendQuota(result: ResendPost): void {
  if (result.dailyExceeded) noteNewsletterQuotaUsed(NEWSLETTER_DAILY_LIMIT)
  else if (result.dailyUsed !== null) noteNewsletterQuotaUsed(result.dailyUsed)
}

async function postResend(path: "/emails" | "/emails/batch", body: unknown, timeoutMs: number): Promise<ResendPost> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { status: null, dailyUsed: null, dailyExceeded: false }
  try {
    const response = await fetch(`https://api.resend.com${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    })
    const dailyHeader = Number(response.headers.get("x-resend-daily-quota"))
    let dailyExceeded = false
    if (response.status === 429) {
      try {
        const payload: unknown = await response.json()
        dailyExceeded = Boolean(
          payload && typeof payload === "object" && (payload as { name?: unknown }).name === "daily_quota_exceeded"
        )
      } catch {
        dailyExceeded = false
      }
    }
    return {
      status: response.status,
      dailyUsed: Number.isFinite(dailyHeader) ? dailyHeader : null,
      dailyExceeded,
    }
  } catch {
    return { status: null, dailyUsed: null, dailyExceeded: false }
  }
}

function tokenFor(email: string, purpose: NewsletterPurpose): string | null {
  return signNewsletterToken({ email, purpose })
}

/**
 * Send the confirmation message. Never throws.
 * Skips the network call when the token, the API key, or the daily quota is unavailable.
 */
export async function sendNewsletterConfirmation(email: string): Promise<ConfirmSendResult> {
  const confirm = tokenFor(email, "confirm")
  const unsubscribe = tokenFor(email, "unsubscribe")
  if (!confirm || !unsubscribe) {
    console.error("newsletter confirm email skipped: token unavailable")
    return "skipped"
  }
  if (!process.env.RESEND_API_KEY) {
    console.error("newsletter confirm email skipped: sender unavailable")
    return "skipped"
  }
  const granted = takeNewsletterSendQuota(1)
  if (granted < 1) {
    console.error("newsletter confirm email skipped: daily limit")
    return "skipped"
  }
  const confirmUrl = newsletterLink("/newsletter/confirm", confirm)
  const unsubscribeUrl = newsletterLink("/newsletter/unsubscribe", unsubscribe)
  const content = confirmationContent(confirmUrl, unsubscribeUrl)
  const posted = await postResend(
    "/emails",
    {
      from: FROM,
      to: [email],
      subject: CONFIRM_SUBJECT,
      html: content.html,
      text: content.text,
      reply_to: GENERAL_CONTACT_EMAIL,
      headers: listUnsubscribeHeader(unsubscribeUrl),
    },
    CONFIRM_TIMEOUT_MS
  )
  if (posted.status !== null && posted.status >= 200 && posted.status < 300) {
    applyResendQuota(posted)
    return "sent"
  }
  releaseNewsletterSendQuota(1)
  applyResendQuota(posted)
  console.error(posted.status === null ? "newsletter confirm email failed" : `newsletter confirm email failed: ${posted.status}`)
  return "failed"
}

/**
 * Send one issue to confirmed subscribers only.
 * Not scheduled, and no route calls this.
 *
 * Guard: at most 100 emails per UTC day on this server instance (Resend's free
 * transactional quota), shared with confirmation sends, and at most one batch
 * request. Callers pass an HTML fragment and plain text. Any sponsor block in
 * that copy must be labeled Sponsored. Each message gets its own unsubscribe
 * link and List-Unsubscribe header.
 */
export async function sendNewsletterIssue(subject: string, html: string, text: string): Promise<NewsletterIssueResult> {
  const cleanSubject = subject.trim()
  const cleanHtml = html.trim()
  const cleanText = text.trim()
  if (!cleanSubject || (!cleanHtml && !cleanText)) {
    return { sent: 0, skipped: 0, capped: false }
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { confirmed: true },
    select: { email: true },
    orderBy: { created_at: "asc" },
  })
  const eligible = subscribers.filter((row) => isNewsletterEmail(row.email))
  if (eligible.length === 0) {
    return { sent: 0, skipped: subscribers.length, capped: false }
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("newsletter issue skipped: sender unavailable")
    return { sent: 0, skipped: subscribers.length, capped: false }
  }

  const granted = takeNewsletterSendQuota(eligible.length)
  const capped = granted < subscribers.length
  if (granted === 0) {
    console.error("newsletter issue skipped: daily limit")
    return { sent: 0, skipped: subscribers.length, capped: true }
  }

  const batch: Array<Record<string, unknown>> = []
  for (const row of eligible.slice(0, granted)) {
    const token = tokenFor(row.email, "unsubscribe")
    if (!token) continue
    const unsubscribeUrl = newsletterLink("/newsletter/unsubscribe", token)
    const wrapped = appendUnsubscribe(cleanHtml, cleanText, unsubscribeUrl)
    batch.push({
      from: FROM,
      to: [row.email],
      subject: cleanSubject,
      html: wrapped.html,
      text: wrapped.text,
      reply_to: GENERAL_CONTACT_EMAIL,
      headers: listUnsubscribeHeader(unsubscribeUrl),
    })
  }

  if (batch.length < granted) releaseNewsletterSendQuota(granted - batch.length)
  if (batch.length === 0) {
    console.error("newsletter issue skipped: token unavailable")
    return { sent: 0, skipped: subscribers.length, capped }
  }

  const posted = await postResend("/emails/batch", batch, ISSUE_TIMEOUT_MS)
  if (posted.status !== null && posted.status >= 200 && posted.status < 300) {
    applyResendQuota(posted)
    return { sent: batch.length, skipped: subscribers.length - batch.length, capped }
  }
  releaseNewsletterSendQuota(batch.length)
  applyResendQuota(posted)
  console.error(posted.status === null ? "newsletter issue failed" : `newsletter issue failed: ${posted.status}`)
  return { sent: 0, skipped: subscribers.length, capped }
}
