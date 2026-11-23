import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { DATA_SAMPLE_MESSAGES, DATA_SAMPLE_SOURCES } from "@/lib/data-sample-copy"
import { prisma } from "@/lib/db"
import {
  allowDataSampleRequest,
  dataSampleClientIp,
  dataSampleSubmission,
  DATA_SAMPLE_DEDUPE_MS,
  DATA_SAMPLE_SUBMISSION_TYPE,
  findDuplicateSample,
  isDataSampleSource,
  maskEmail,
  sampleEmailText,
  validateDataSampleRequest,
} from "@/lib/data-sample"
import { sendDataSampleEmail } from "@/lib/data-sample-mail"
import { loadDataSampleRows, loadNewestInspectionLabel } from "@/lib/data-sample-query"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const FIELD_KEYS = ["email", "company", "sells", "company_website", "source"] as const

type SampleBody =
  | { ok: true; sample: "sent" | "duplicate" | "ignored" }
  | { ok: false; error: string }

function isMissingSubmissionsTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes("42P01") || (/user_submissions/i.test(message) && /does not exist/i.test(message))) {
    return true
  }
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021"
}

function prefersHtml(request: NextRequest): boolean {
  if (request.headers.get("sec-fetch-mode") === "navigate") return true
  const accept = request.headers.get("accept") ?? ""
  return accept.includes("text/html") && !accept.includes("application/json")
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function backPath(source: string | undefined): string {
  if (source && isDataSampleSource(source)) return DATA_SAMPLE_SOURCES[source]
  return DATA_SAMPLE_SOURCES.data_page_top
}

function respond(request: NextRequest, status: number, body: SampleBody, source: string | undefined) {
  if (!prefersHtml(request)) {
    return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } })
  }
  const message = body.ok
    ? body.sample === "duplicate"
      ? DATA_SAMPLE_MESSAGES.duplicate
      : DATA_SAMPLE_MESSAGES.sent
    : body.error
  const title = body.ok ? "Sample request received" : "Sample request not sent"
  const path = backPath(source)
  const href = `${path}#free-sample`
  const backLabel = path === "/data" ? "Back to the data page" : "Back to the grades guide"
  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    `<title>${escapeHtml(title)}</title>`,
    "</head>",
    '<body style="margin:0;background:#F8F6F1;color:#1B3A2D;font-family:Georgia,serif;">',
    '<main style="max-width:40rem;margin:0 auto;padding:3rem 1.5rem;">',
    `<h1 style="font-size:2rem;line-height:1.2;">${escapeHtml(title)}</h1>`,
    `<p style="font-family:&quot;DM Sans&quot;,system-ui,sans-serif;font-size:1.05rem;line-height:1.5;">${escapeHtml(message)}</p>`,
    `<p style="font-family:&quot;DM Sans&quot;,system-ui,sans-serif;font-size:1.05rem;line-height:1.5;"><a href="${escapeHtml(href)}" style="color:#2D6A4F;">${escapeHtml(backLabel)}</a></p>`,
    "</main>",
    "</body>",
    "</html>",
  ].join("")
  return new NextResponse(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  })
}

function pickFields(record: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const key of FIELD_KEYS) {
    const value = record[key]
    fields[key] = typeof value === "string" ? value : ""
  }
  return fields
}

async function readFields(request: NextRequest): Promise<Record<string, string> | null> {
  const contentType = request.headers.get("content-type") ?? ""
  try {
    if (contentType.includes("application/json")) {
      const body: unknown = await request.json()
      if (!body || typeof body !== "object" || Array.isArray(body)) return null
      return pickFields(body as Record<string, unknown>)
    }
    const form = await request.formData()
    const fields: Record<string, string> = {}
    for (const key of FIELD_KEYS) {
      const value = form.get(key)
      fields[key] = typeof value === "string" ? value : ""
    }
    return fields
  } catch {
    return null
  }
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return dataSampleClientIp(forwarded)
  const real = request.headers.get("x-real-ip")?.trim()
  return real ? real.slice(0, 80) : "unknown"
}

export async function POST(request: NextRequest) {
  const fields = await readFields(request)
  if (!fields) {
    return respond(request, 400, { ok: false, error: DATA_SAMPLE_MESSAGES.source }, undefined)
  }

  const decision = validateDataSampleRequest(fields)
  if (!decision.ok) {
    if (decision.reason === "honeypot") {
      return respond(request, 200, { ok: true, sample: "ignored" }, fields.source)
    }
    return respond(request, 400, { ok: false, error: decision.error }, fields.source)
  }

  if (!allowDataSampleRequest(clientIp(request))) {
    return respond(request, 429, { ok: false, error: DATA_SAMPLE_MESSAGES.limited }, fields.source)
  }

  const lead = decision.lead
  const since = new Date(Date.now() - DATA_SAMPLE_DEDUPE_MS)
  try {
    const recent = await prisma.userSubmission.findMany({
      where: {
        submission_type: DATA_SAMPLE_SUBMISSION_TYPE,
        created_at: { gte: since },
        restaurant_slug: { in: Object.values(DATA_SAMPLE_SOURCES) },
      },
      select: { content: true },
    })
    if (findDuplicateSample(recent.map((row) => row.content), lead.email)) {
      console.info(
        JSON.stringify({
          event: "data_sample_duplicate",
          email: maskEmail(lead.email),
          source: lead.source,
        })
      )
      return respond(request, 200, { ok: true, sample: "duplicate" }, lead.source)
    }
  } catch (error) {
    if (isMissingSubmissionsTable(error)) {
      console.error(JSON.stringify({ event: "data_sample_store_failed", reason: "missing_table" }))
      return respond(request, 503, { ok: false, error: DATA_SAMPLE_MESSAGES.unavailable }, lead.source)
    }
    console.error(JSON.stringify({ event: "data_sample_store_failed", reason: "lookup" }))
    return respond(request, 500, { ok: false, error: DATA_SAMPLE_MESSAGES.failed }, lead.source)
  }

  let rows
  let newestInspectionLabel: string | null = null
  try {
    ;[rows, newestInspectionLabel] = await Promise.all([loadDataSampleRows(), loadNewestInspectionLabel()])
  } catch {
    console.error(JSON.stringify({ event: "data_sample_store_failed", reason: "rows" }))
    return respond(request, 500, { ok: false, error: DATA_SAMPLE_MESSAGES.failed }, lead.source)
  }

  try {
    await prisma.userSubmission.create({ data: dataSampleSubmission(lead) })
  } catch (error) {
    if (isMissingSubmissionsTable(error)) {
      console.error(JSON.stringify({ event: "data_sample_store_failed", reason: "missing_table" }))
      return respond(request, 503, { ok: false, error: DATA_SAMPLE_MESSAGES.unavailable }, lead.source)
    }
    console.error(JSON.stringify({ event: "data_sample_store_failed", reason: "create" }))
    return respond(request, 500, { ok: false, error: DATA_SAMPLE_MESSAGES.failed }, lead.source)
  }

  const emailed = await sendDataSampleEmail(lead.email, sampleEmailText(rows, undefined, newestInspectionLabel))
  console.info(
    JSON.stringify({
      event: "data_sample_stored",
      email: maskEmail(lead.email),
      source: lead.source,
      rows: rows.length,
      email_status: emailed,
    })
  )
  return respond(request, 200, { ok: true, sample: "sent" }, lead.source)
}
