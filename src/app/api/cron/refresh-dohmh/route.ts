import { revalidatePath } from "next/cache"
import { cronAuthorized } from "@/lib/compliance-weekly"
import { prisma } from "@/lib/db"
import { applyInspectionWrites } from "@/lib/dohmh-refresh-db"
import { inspectionRefreshPaths } from "@/lib/inspection-revalidate"
import {
  DOHMH_CRON_MAX_ROWS,
  DOHMH_CRON_PAGE_SIZE,
  fetchDohmhInspections,
  runDohmhRefresh,
  type DohmhRefreshResult,
} from "@/lib/dohmh-refresh"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
/**
 * Hobby and Pro both allow 300 seconds. The pull is the last 14 days, paged,
 * and writes go out in batches of 50.
 */
export const maxDuration = 300

const RESTAURANT_SELECT = {
  id: true,
  name: true,
  borough: true,
  address: true,
  inspection_grade: true,
  inspection_score: true,
  inspection_date: true,
} as const

async function defaultRun(options: { dry: boolean }): Promise<DohmhRefreshResult> {
  const token = process.env.DOHMH_APP_TOKEN
  return runDohmhRefresh({
    dry: options.dry,
    fetchInspections: (since) =>
      fetchDohmhInspections({
        since,
        token: token || undefined,
        pageSize: DOHMH_CRON_PAGE_SIZE,
        maxRows: DOHMH_CRON_MAX_ROWS,
        recordDate: true,
      }),
    loadRestaurants: () => prisma.restaurant.findMany({ select: RESTAURANT_SELECT }),
    applyWrites: applyInspectionWrites,
  })
}

function revalidateInspectionPages(result: DohmhRefreshResult) {
  for (const path of inspectionRefreshPaths(result)) {
    revalidatePath(path, "page")
  }
}

export async function handleDohmhRefreshCron(
  request: Request,
  run: (options: { dry: boolean }) => Promise<DohmhRefreshResult> = defaultRun,
  revalidate: (result: DohmhRefreshResult) => void | Promise<void> = revalidateInspectionPages
): Promise<Response> {
  if (!cronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const dry = new URL(request.url).searchParams.get("dry") === "1"
  try {
    const result = await run({ dry })
    try {
      await revalidate(result)
    } catch (error) {
      const name = error instanceof Error ? error.name : "Error"
      const raw = error instanceof Error ? error.message : ""
      const message = raw.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[redacted]").slice(0, 160)
      console.error(`DOHMH page revalidation failed (${name}${message ? `: ${message}` : ""})`)
    }
    console.info(JSON.stringify({ event: "dohmh_refresh", ...result }))
    return Response.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "refresh failed"
    console.error(JSON.stringify({ event: "dohmh_refresh_failed", message }))
    return Response.json({ error: "refresh failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return handleDohmhRefreshCron(request)
}
