import { cache } from "react"
import { prisma } from "@/lib/db"
import { deliverNewsletterIssue, type NewsletterIssueResult } from "@/lib/newsletter-mail"
import {
  buildNewsletterIssue,
  currentIssueDate,
  isIssueDate,
  summarizeNewsletterArchive,
  type NewsletterArchiveEntry,
  type NewsletterIssue,
  type NewsletterSourceRow,
} from "@/lib/newsletter-issue"

const ROW_SELECT = {
  name: true,
  slug: true,
  borough: true,
  neighborhood: true,
  inspection_grade: true,
  inspection_date: true,
  inspection_score: true,
  is_published: true,
} as const

export type NewsletterWeeklyResult = {
  dryRun: boolean
  noop: boolean
  issueDate: string
  confirmed: number
  sent: number
  failed: number
  skipped: number
  capped: boolean
  gradeACount: number
  neighborhoodPick: NewsletterIssue["neighborhoodPick"]
  gradeChanges: null
  subject: string
  html: string
  text: string
  issue: NewsletterIssue
}

export async function loadNewsletterRestaurants(): Promise<NewsletterSourceRow[]> {
  return prisma.restaurant.findMany({
    where: {
      is_published: true,
      inspection_grade: "A",
      inspection_date: { not: null },
    },
    select: ROW_SELECT,
  })
}

export async function loadConfirmedNewsletterEmails(): Promise<string[]> {
  const rows = await prisma.newsletterSubscriber.findMany({
    where: { confirmed: true },
    select: { email: true },
    orderBy: { id: "asc" },
  })
  return rows.map((row) => row.email)
}

async function loadNewsletterIssueUncached(date: string, now = new Date()): Promise<NewsletterIssue | null> {
  if (!isIssueDate(date, now)) return null
  const rows = await loadNewsletterRestaurants()
  return buildNewsletterIssue(rows, date)
}

async function loadNewsletterArchiveUncached(now = new Date()): Promise<NewsletterArchiveEntry[]> {
  const rows = await loadNewsletterRestaurants()
  return summarizeNewsletterArchive(rows, now)
}

/** Metadata and the page render share one load per request. */
export const loadNewsletterIssue = cache(loadNewsletterIssueUncached)
export const loadNewsletterArchive = cache(loadNewsletterArchiveUncached)

/**
 * Build this Thursday's issue and send it to confirmed subscribers.
 * Zero confirmed subscribers is a no-op. Dry runs return the rendered issue
 * and do not send. Never throws for a single recipient failure.
 */
export async function runNewsletterWeekly(options?: {
  now?: Date
  dry?: boolean
  loadRestaurants?: () => Promise<NewsletterSourceRow[]>
  loadConfirmedEmails?: () => Promise<string[]>
  deliver?: (input: { emails: string[]; subject: string; html: string; text: string }) => Promise<NewsletterIssueResult>
}): Promise<NewsletterWeeklyResult> {
  const now = options?.now ?? new Date()
  const dry = options?.dry === true
  const issueDate = currentIssueDate(now)
  const loadRestaurants = options?.loadRestaurants ?? loadNewsletterRestaurants
  const loadConfirmedEmails = options?.loadConfirmedEmails ?? loadConfirmedNewsletterEmails
  const [rows, emails] = await Promise.all([loadRestaurants(), loadConfirmedEmails()])
  const issue = buildNewsletterIssue(rows, issueDate)
  const base = {
    dryRun: dry,
    issueDate,
    gradeACount: issue.gradeA.length,
    neighborhoodPick: issue.neighborhoodPick,
    gradeChanges: null as null,
    subject: issue.subject,
    html: issue.html,
    text: issue.text,
    issue,
  }

  if (dry) {
    return {
      ...base,
      noop: false,
      confirmed: emails.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      capped: false,
    }
  }

  if (emails.length === 0) {
    return {
      ...base,
      noop: true,
      confirmed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      capped: false,
    }
  }

  const deliver = options?.deliver ?? ((input: { emails: string[]; subject: string; html: string; text: string }) =>
    deliverNewsletterIssue(input))
  let delivery: NewsletterIssueResult
  try {
    delivery = await deliver({ emails, subject: issue.subject, html: issue.html, text: issue.text })
  } catch {
    console.error(JSON.stringify({ event: "newsletter_weekly_send_failed", confirmed: emails.length }))
    delivery = { sent: 0, failed: emails.length, skipped: 0, capped: false }
  }

  return {
    ...base,
    noop: false,
    confirmed: emails.length,
    sent: delivery.sent,
    failed: delivery.failed,
    skipped: delivery.skipped,
    capped: delivery.capped,
  }
}
