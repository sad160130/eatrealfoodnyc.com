import { timingSafeEqual } from "node:crypto"
import { prisma } from "@/lib/db"
import { inspectionLeadCsv, isInspectionLead, isNewOpening, newOpeningCsv, type RestaurantFileRow } from "@/lib/compliance-csv"
import { complianceBody, complianceSubject, deliverComplianceWeek, sendComplianceEmail } from "@/lib/compliance-mail"

const FILE_SELECT = {
  name: true,
  address: true,
  borough: true,
  neighborhood: true,
  phone: true,
  inspection_grade: true,
  inspection_score: true,
  inspection_date: true,
  business_status: true,
  is_published: true,
} as const

export function cronAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false
  const actual = Buffer.from(header)
  const expected = Buffer.from(`Bearer ${secret}`)
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export async function buildComplianceFiles(): Promise<{ leadsCsv: string; openingsCsv: string; leadCount: number; openingCount: number }> {
  const rows = await prisma.restaurant.findMany({ select: FILE_SELECT })
  const typed = rows as RestaurantFileRow[]
  return {
    leadsCsv: inspectionLeadCsv(typed),
    openingsCsv: newOpeningCsv(typed),
    leadCount: typed.filter(isInspectionLead).length,
    openingCount: typed.filter(isNewOpening).length,
  }
}

export async function runComplianceWeekly(now = new Date()): Promise<{ sent: number; skipped: number; failed: number; leadCount: number; openingCount: number }> {
  const subscribers = await prisma.complianceSubscription.findMany({
    where: { status: "active" },
    select: { stripe_subscription_id: true, email: true },
    orderBy: { id: "asc" },
  })
  if (subscribers.length === 0) {
    return { sent: 0, skipped: 0, failed: 0, leadCount: 0, openingCount: 0 }
  }
  const files = await buildComplianceFiles()
  const subject = complianceSubject(now)
  const text = complianceBody(now)
  const result = await deliverComplianceWeek({
    now,
    subscribers,
    alreadySent: async (subscriptionId, monday) => {
      const existing = await prisma.complianceWeeklySend.findUnique({
        where: {
          stripe_subscription_id_monday_date: {
            stripe_subscription_id: subscriptionId,
            monday_date: monday,
          },
        },
        select: { id: true },
      })
      return existing != null
    },
    send: (email) => sendComplianceEmail({ to: email, subject, text, leadsCsv: files.leadsCsv, openingsCsv: files.openingsCsv }),
    record: async (subscriptionId, email, monday) => {
      await prisma.complianceWeeklySend.create({
        data: { stripe_subscription_id: subscriptionId, email, monday_date: monday },
      })
    },
  })
  return { ...result, leadCount: files.leadCount, openingCount: files.openingCount }
}
