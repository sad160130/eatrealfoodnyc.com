import { GENERAL_CONTACT_EMAIL } from "@/config/contact"
import { getCanonicalUrl } from "@/config/seo"
import { prisma } from "@/lib/db"
import {
  NEWSLETTER_BATCH_LIMIT,
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

export type ResendPost = { status: number | null; dailyUsed: number | null; dailyExceeded: boolean }

export type NewsletterIssueResult = {
  sent: number
  skipped: number
  failed: number
  capped: boolean
}

export type NewsletterBatchPoster = (
  path: "/emails" | "/emails/batch",
  body: unknown
) => Promise<ResendPost>

export function newsletterLink(
  path: "/newsletter/confirm" | "/newsletter/unsubscribe" | "/api/newsletter/unsubscribe",
  token: string
): string {
  const url = new URL(getCanonicalUrl(path))
  url.searchParams.set("token", token)
  return url.toString()
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

function listUnsubscribeHeader(url: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  }
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
  const oneClickUrl = newsletterLink("/api/newsletter/unsubscribe", unsubscribe)
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
      headers: listUnsubscribeHeader(oneClickUrl),
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

function issueMessage(email: string, subject: string, html: string, text: string): Record<string, unknown> | null {
  const token = tokenFor(email, "unsubscribe")
  if (!token) return null
  const pageUrl = newsletterLink("/newsletter/unsubscribe", token)
  const oneClickUrl = newsletterLink("/api/newsletter/unsubscribe", token)
  const wrapped = appendUnsubscribe(html, text, pageUrl)
  return {
    from: FROM,
    to: [email],
    subject,
    html: wrapped.html,
    text: wrapped.text,
    reply_to: GENERAL_CONTACT_EMAIL,
    headers: listUnsubscribeHeader(oneClickUrl),
  }
}

function accepted(status: number | null): boolean {
  return status !== null && status >= 200 && status < 300
}

async function postIssueBatch(
  batch: Array<Record<string, unknown>>,
  post: NewsletterBatchPoster
): Promise<{ sent: number; failed: number }> {
  let posted: ResendPost
  try {
    posted = await post("/emails/batch", batch)
  } catch {
    posted = { status: null, dailyUsed: null, dailyExceeded: false }
  }
  applyResendQuota(posted)
  if (accepted(posted.status)) return { sent: batch.length, failed: 0 }

  const splittable = (posted.status === 400 || posted.status === 422) && batch.length > 1
  if (!splittable) {
    releaseNewsletterSendQuota(batch.length)
    console.error(JSON.stringify({
      event: "newsletter_weekly_batch_failed",
      attempted: batch.length,
      status: posted.status,
    }))
    return { sent: 0, failed: batch.length }
  }

  let sent = 0
  let failed = 0
  for (const one of batch) {
    const single = await postIssueBatch([one], post)
    sent += single.sent
    failed += single.failed
  }
  return { sent, failed }
}

/**
 * Send one issue to the given addresses.
 * Uses Resend's batch endpoint, at most 100 emails per request and per UTC day
 * on this server instance, shared with confirmation sends.
 * A rejected batch is retried one address at a time so one bad recipient does
 * not drop the rest. Network and 5xx failures are not retried. Never throws.
 * Each message gets its own unsubscribe link and one-click List-Unsubscribe header.
 */
export async function deliverNewsletterIssue(input: {
  emails: string[]
  subject: string
  html: string
  text: string
  post?: NewsletterBatchPoster
}): Promise<NewsletterIssueResult> {
  const subject = input.subject.trim()
  const html = input.html.trim()
  const text = input.text.trim()
  const empty = { sent: 0, skipped: 0, failed: 0, capped: false }
  if (!subject || (!html && !text)) return empty

  const seen = new Set<string>()
  const eligible: string[] = []
  let skipped = 0
  for (const raw of input.emails) {
    const email = raw.trim().toLowerCase()
    if (!isNewsletterEmail(email) || seen.has(email)) {
      skipped += 1
      continue
    }
    seen.add(email)
    eligible.push(email)
  }
  if (eligible.length === 0) return { ...empty, skipped }

  const post = input.post
  if (!post && !process.env.RESEND_API_KEY) {
    console.error(JSON.stringify({ event: "newsletter_weekly", message: "sender unavailable", skipped: input.emails.length }))
    return { sent: 0, skipped: input.emails.length, failed: 0, capped: false }
  }

  const granted = takeNewsletterSendQuota(eligible.length)
  const capped = granted < eligible.length
  if (granted === 0) {
    console.error(JSON.stringify({ event: "newsletter_weekly", message: "daily limit", skipped: input.emails.length }))
    return { sent: 0, skipped: input.emails.length, failed: 0, capped: true }
  }

  const batch: Array<Record<string, unknown>> = []
  for (const email of eligible.slice(0, granted)) {
    const message = issueMessage(email, subject, html, text)
    if (!message) {
      skipped += 1
      continue
    }
    batch.push(message)
  }
  if (batch.length < granted) releaseNewsletterSendQuota(granted - batch.length)
  if (batch.length === 0) {
    console.error(JSON.stringify({ event: "newsletter_weekly", message: "token unavailable" }))
    return { sent: 0, skipped: skipped + (eligible.length - granted), failed: 0, capped }
  }

  const poster: NewsletterBatchPoster = post ?? ((path, body) => postResend(path, body, ISSUE_TIMEOUT_MS))
  let sent = 0
  let failed = 0
  try {
    for (let index = 0; index < batch.length; index += NEWSLETTER_BATCH_LIMIT) {
      const chunk = batch.slice(index, index + NEWSLETTER_BATCH_LIMIT)
      const outcome = await postIssueBatch(chunk, poster)
      sent += outcome.sent
      failed += outcome.failed
    }
  } catch {
    console.error(JSON.stringify({ event: "newsletter_weekly_batch_failed", attempted: batch.length, status: null }))
    const remaining = batch.length - sent - failed
    if (remaining > 0) {
      releaseNewsletterSendQuota(remaining)
      failed += remaining
    }
  }

  skipped += eligible.length - granted
  return { sent, skipped, failed, capped }
}

/** Send the issue to every confirmed subscriber. Never throws. */
export async function sendNewsletterIssue(subject: string, html: string, text: string): Promise<NewsletterIssueResult> {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { confirmed: true },
      select: { email: true },
      orderBy: { created_at: "asc" },
    })
    return deliverNewsletterIssue({
      emails: subscribers.map((row) => row.email),
      subject,
      html,
      text,
    })
  } catch {
    console.error(JSON.stringify({ event: "newsletter_weekly", message: "subscriber lookup failed" }))
    return { sent: 0, skipped: 0, failed: 0, capped: false }
  }
}
