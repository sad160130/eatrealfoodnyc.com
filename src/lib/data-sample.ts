import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import { DATA_PRODUCT, DOHMH_DATASET } from "@/config/data-product"
import { getCanonicalUrl } from "@/config/seo"
import { HIGH_SCORE, leadReasons } from "@/lib/compliance-csv"
import {
  DATA_SAMPLE_MESSAGES,
  DATA_SAMPLE_SOURCES,
  type DataSampleSource,
} from "@/lib/data-sample-copy"
import { presentGrade } from "@/lib/grade-display"

export const DATA_SAMPLE_LIMIT = 10
export const DATA_SAMPLE_DEDUPE_MS = 24 * 60 * 60 * 1000
export const DATA_SAMPLE_RATE_MAX = 5
export const DATA_SAMPLE_RATE_WINDOW_MS = 10 * 60 * 1000
export const DATA_SAMPLE_SUBJECT = "Free sample: NYC Restaurant Compliance Weekly"
export const DATA_SAMPLE_COMPANY_MAX = 120
export const DATA_SAMPLE_SELLS_MAX = 160
export const DATA_SAMPLE_EMAIL_MAX = 254
export const DATA_SAMPLE_SUBMISSION_TYPE = "data_sample"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CATEGORY_ORDER = ["grade-pending", "high-score", "not-yet-inspected"] as const

export type SampleCategory = (typeof CATEGORY_ORDER)[number]

export const SAMPLE_CATEGORY_LABEL: Record<SampleCategory, string> = {
  "grade-pending": "Grade pending",
  "high-score": "High score",
  "not-yet-inspected": "Not yet inspected",
}

export type SampleSourceRow = {
  name: string
  borough: string | null
  neighborhood: string | null
  inspection_grade: string | null
  inspection_score: number | null
  inspection_date: string | null
  is_published: boolean
}

export type SampleFact = {
  name: string
  borough: string | null
  neighborhood: string | null
  inspection_grade: string | null
  inspection_score: number | null
}

export type SampleLeadRow = {
  category: SampleCategory
  name: string
  place: string
  grade: string
  score: string
}

export type DataSampleLead = {
  email: string
  company: string
  sells: string
  source: DataSampleSource
  sourcePath: string
}

export type DataSampleDecision =
  | { ok: true; lead: DataSampleLead }
  | { ok: false; reason: "honeypot" }
  | { ok: false; reason: "email" | "source" | "length"; error: string }

export type SampleEmailLinks = {
  monthly: string
  yearly: string
  monthlyPrice: number
  yearlyPrice: number
}

export function isDataSampleSource(value: string): value is DataSampleSource {
  return Object.prototype.hasOwnProperty.call(DATA_SAMPLE_SOURCES, value)
}

/** Same Z/P check as the compliance lead file and the /data sample query. */
export function isGradePendingSample(row: Pick<SampleSourceRow, "is_published" | "inspection_grade">): boolean {
  if (!row.is_published) return false
  return leadReasons({
    inspection_grade: row.inspection_grade,
    inspection_score: null,
    business_status: "OPERATIONAL",
  }).includes("grade-pending")
}

/** Score at or above the Grade C threshold. Published rows only. */
export function isHighScoreSample(row: Pick<SampleSourceRow, "is_published" | "inspection_score">): boolean {
  return row.is_published && row.inspection_score != null && row.inspection_score >= HIGH_SCORE
}

/**
 * The /data "not yet inspected" list: published, no inspection date,
 * and a grade of blank or N. Z and P stay on the grade-pending list.
 */
export function isNotYetInspectedSample(
  row: Pick<SampleSourceRow, "is_published" | "inspection_date" | "inspection_grade">
): boolean {
  if (!row.is_published) return false
  if (row.inspection_date != null && row.inspection_date !== "") return false
  const grade = row.inspection_grade ?? ""
  return grade === "" || grade === "N"
}

export function redactSampleName(name: string): string {
  const first = name.trim().charAt(0)
  return first ? `${first}…` : "…"
}

export function presentSampleFact(row: SampleFact, redactName: boolean): Omit<SampleLeadRow, "category"> {
  const name = row.name.trim()
  const place = [row.neighborhood?.trim(), row.borough?.trim()].filter(Boolean).join(", ") || "New York City"
  return {
    name: redactName ? redactSampleName(name) : name,
    place,
    grade: presentGrade(row.inspection_grade).title,
    score: row.inspection_score == null ? "—" : String(row.inspection_score),
  }
}

export function formatSampleLine(row: SampleLeadRow): string {
  return `${SAMPLE_CATEGORY_LABEL[row.category]}: ${row.name} — ${row.place} — ${row.grade} — score ${row.score}`
}

export function dohmhSourceLine(): string {
  return `Source: ${DOHMH_DATASET.source}. Dataset: ${DOHMH_DATASET.name} (${DOHMH_DATASET.id}). Version: NYC Open Data rows updated ${DOHMH_DATASET.version}.`
}

function categoryFor(row: SampleSourceRow): SampleCategory | null {
  if (!row.name.trim()) return null
  if (isGradePendingSample(row)) return "grade-pending"
  if (isHighScoreSample(row)) return "high-score"
  if (isNotYetInspectedSample(row)) return "not-yet-inspected"
  return null
}

function rowKey(row: SampleSourceRow): string {
  return [
    row.name.trim().toLowerCase(),
    (row.neighborhood ?? "").trim().toLowerCase(),
    (row.borough ?? "").trim().toLowerCase(),
    row.inspection_grade ?? "",
    row.inspection_score ?? "",
    row.inspection_date ?? "",
  ].join("|")
}

function byScoreDesc(a: SampleSourceRow, b: SampleSourceRow): number {
  const left = a.inspection_score
  const right = b.inspection_score
  if (left == null && right != null) return 1
  if (right == null && left != null) return -1
  if (left != null && right != null && left !== right) return right - left
  return a.name.localeCompare(b.name)
}

export function sampleQuotas(limit: number): Record<SampleCategory, number> {
  const cap = Math.max(0, Math.floor(limit))
  const base = Math.floor(cap / CATEGORY_ORDER.length)
  let extra = cap - base * CATEGORY_ORDER.length
  const quotas: Record<SampleCategory, number> = {
    "grade-pending": base,
    "high-score": base,
    "not-yet-inspected": base,
  }
  for (const category of CATEGORY_ORDER) {
    if (extra <= 0) break
    quotas[category] += 1
    extra -= 1
  }
  return quotas
}

/**
 * Up to `limit` real rows. A restaurant that matches more than one list
 * is kept once: grade pending, then high score, then not yet inspected.
 * Short lists are filled from the lists that still have rows. Nothing is invented.
 */
export function buildSampleRows(rows: readonly SampleSourceRow[], limit = DATA_SAMPLE_LIMIT): SampleLeadRow[] {
  const cap = Math.max(0, Math.floor(limit))
  const buckets: Record<SampleCategory, SampleSourceRow[]> = {
    "grade-pending": [],
    "high-score": [],
    "not-yet-inspected": [],
  }
  const seen = new Set<string>()
  for (const row of rows) {
    const category = categoryFor(row)
    if (!category) continue
    const key = rowKey(row)
    if (seen.has(key)) continue
    seen.add(key)
    buckets[category].push(row)
  }
  buckets["grade-pending"].sort(byScoreDesc)
  buckets["high-score"].sort(byScoreDesc)
  buckets["not-yet-inspected"].sort((a, b) => a.name.localeCompare(b.name))

  const quotas = sampleQuotas(cap)
  const take: Record<SampleCategory, number> = {
    "grade-pending": 0,
    "high-score": 0,
    "not-yet-inspected": 0,
  }
  let remaining = cap
  for (const category of CATEGORY_ORDER) {
    const count = Math.min(quotas[category], buckets[category].length, remaining)
    take[category] = count
    remaining -= count
  }
  for (const category of CATEGORY_ORDER) {
    if (remaining === 0) break
    const extra = Math.min(buckets[category].length - take[category], remaining)
    take[category] += extra
    remaining -= extra
  }

  return CATEGORY_ORDER.flatMap((category) =>
    buckets[category].slice(0, take[category]).map((row) => ({
      category,
      ...presentSampleFact(row, false),
    }))
  )
}

export function defaultSampleEmailLinks(): SampleEmailLinks {
  return {
    monthly: DATA_PRODUCT.stripePaymentLinkMonthly,
    yearly: DATA_PRODUCT.stripePaymentLinkYearly,
    monthlyPrice: DATA_PRODUCT.priceMonthlyUsd,
    yearlyPrice: DATA_PRODUCT.priceYearlyUsd,
  }
}

function planLine(label: string, price: number, href: string): string {
  const url = href.trim()
  if (!url) return `${label}, $${price}: Payment link is not set.`
  return `${label}, $${price}: ${url}`
}

export function sampleEmailText(rows: readonly SampleLeadRow[], links: SampleEmailLinks = defaultSampleEmailLinks()): string {
  const countLine =
    rows.length === 0
      ? "The current extract has no published rows in the grade-pending, high-score, or not-yet-inspected lists."
      : rows.length === 1
        ? "Here is 1 current row from this week's lead lists. Sent once. No subscription."
        : `Here are ${rows.length} current rows from this week's lead lists. Sent once. No subscription.`
  const lines = rows.map(formatSampleLine)
  return [
    DATA_PRODUCT.name,
    "Free sample",
    "",
    countLine,
    "",
    ...lines,
    ...(lines.length > 0 ? [""] : []),
    dohmhSourceLine(),
    DOHMH_DATASET.url,
    "",
    "This extract is filtered to published listings in this directory. Street addresses are not included. Z and P are labeled Grade Pending rather than printed as letters. These rows are the current file. They are not a forecast.",
    "",
    "The Monday email is two CSV files: inspection leads and new openings.",
    planLine("Monthly", links.monthlyPrice, links.monthly),
    planLine("Yearly", links.yearlyPrice, links.yearly),
    "",
    `Reply to this email and it goes to ${PARTNER_INQUIRY_EMAIL}.`,
    "Eat Real Food NYC",
    getCanonicalUrl("/data"),
    "",
  ].join("\n")
}

function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim()
}

export function validateDataSampleRequest(fields: {
  email?: string
  company?: string
  sells?: string
  company_website?: string
  source?: string
}): DataSampleDecision {
  if ((fields.company_website ?? "").trim().length > 0) return { ok: false, reason: "honeypot" }

  const source = (fields.source ?? "").trim()
  if (!isDataSampleSource(source)) {
    return { ok: false, reason: "source", error: DATA_SAMPLE_MESSAGES.source }
  }

  const email = (fields.email ?? "").trim().toLowerCase()
  if (!email || email.length > DATA_SAMPLE_EMAIL_MAX || !EMAIL.test(email)) {
    return { ok: false, reason: "email", error: DATA_SAMPLE_MESSAGES.invalid }
  }

  const company = singleLine(fields.company ?? "")
  if (company.length > DATA_SAMPLE_COMPANY_MAX) {
    return { ok: false, reason: "length", error: DATA_SAMPLE_MESSAGES.company }
  }
  const sells = singleLine(fields.sells ?? "")
  if (sells.length > DATA_SAMPLE_SELLS_MAX) {
    return { ok: false, reason: "length", error: DATA_SAMPLE_MESSAGES.sells }
  }

  return {
    ok: true,
    lead: {
      email,
      company,
      sells,
      source,
      sourcePath: DATA_SAMPLE_SOURCES[source],
    },
  }
}

export function dataSampleSubmission(lead: DataSampleLead) {
  return {
    restaurant_slug: lead.sourcePath,
    restaurant_name: "",
    submission_type: DATA_SAMPLE_SUBMISSION_TYPE,
    content: JSON.stringify({
      email: lead.email,
      company: lead.company,
      sells: lead.sells,
      source_path: lead.sourcePath,
    }),
    status: "pending" as const,
  }
}

export function findDuplicateSample(contents: readonly string[], email: string): boolean {
  const target = email.trim().toLowerCase()
  return contents.some((content) => {
    try {
      const parsed: unknown = JSON.parse(content)
      if (!parsed || typeof parsed !== "object") return false
      const value = (parsed as { email?: unknown }).email
      return typeof value === "string" && value.trim().toLowerCase() === target
    } catch {
      return false
    }
  })
}

export function maskEmail(email: string): string {
  const at = email.indexOf("@")
  if (at <= 0 || at === email.length - 1) return "***"
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`
}

export function dataSampleClientIp(forwardedFor: string | null): string {
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown"
  return ip.slice(0, 80)
}

export function createAttemptLimiter(max: number, windowMs: number) {
  const attempts = new Map<string, number[]>()
  return function allow(key: string, now = Date.now()): boolean {
    const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs)
    if (recent.length >= max) {
      attempts.set(key, recent)
      return false
    }
    recent.push(now)
    attempts.set(key, recent)
    return true
  }
}

export const allowDataSampleRequest = createAttemptLimiter(DATA_SAMPLE_RATE_MAX, DATA_SAMPLE_RATE_WINDOW_MS)
