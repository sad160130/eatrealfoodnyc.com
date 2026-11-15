import { cronAuthorized, runComplianceWeekly } from "@/lib/compliance-weekly"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: Request) {
  if (!cronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const result = await runComplianceWeekly()
    console.info(JSON.stringify({ event: "compliance_weekly", ...result }))
    return Response.json({ ok: true, ...result })
  } catch {
    console.error(JSON.stringify({ event: "compliance_weekly_failed" }))
    return Response.json({ error: "send failed" }, { status: 500 })
  }
}
