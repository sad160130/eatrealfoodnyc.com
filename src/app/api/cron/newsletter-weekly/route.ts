import { cronAuthorized } from "@/lib/compliance-weekly"
import { runNewsletterWeekly, type NewsletterWeeklyResult } from "@/lib/newsletter-weekly"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function publicResult(result: NewsletterWeeklyResult) {
  return {
    dryRun: result.dryRun,
    noop: result.noop,
    issueDate: result.issueDate,
    confirmed: result.confirmed,
    sent: result.sent,
    failed: result.failed,
    skipped: result.skipped,
    capped: result.capped,
    gradeACount: result.gradeACount,
    neighborhoodPick: result.neighborhoodPick
      ? {
          borough: result.neighborhoodPick.borough,
          neighborhood: result.neighborhoodPick.neighborhood,
          count: result.neighborhoodPick.count,
        }
      : null,
    gradeChanges: null,
    subject: result.subject,
  }
}

export async function handleNewsletterCron(
  request: Request,
  run: typeof runNewsletterWeekly = runNewsletterWeekly
): Promise<Response> {
  if (!cronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const dry = new URL(request.url).searchParams.get("dry") === "1"
  try {
    const result = await run({ dry })
    const summary = publicResult(result)
    console.info(JSON.stringify({
      event: "newsletter_weekly",
      message: result.noop ? "no confirmed subscribers" : dry ? "dry run" : result.sent === 0 && result.failed > 0 ? "send failed" : "sent",
      ...summary,
    }))
    if (dry) {
      return Response.json({
        ok: true,
        ...summary,
        html: result.html,
        text: result.text,
        gradeA: result.issue.gradeA.map((item) => ({
          name: item.name,
          slug: item.slug,
          href: item.href,
          inspectionDate: item.inspectionDate,
        })),
        sponsored: result.issue.sponsored,
        window: { start: result.issue.windowStart, end: result.issue.windowEnd },
      })
    }
    return Response.json({ ok: true, ...summary })
  } catch {
    console.error(JSON.stringify({ event: "newsletter_weekly_failed" }))
    return Response.json({ error: "send failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return handleNewsletterCron(request)
}
