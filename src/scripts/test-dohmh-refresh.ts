import { readFileSync } from "node:fs"
import { join } from "node:path"
import { latestInspectionDate, parseInspectionDate } from "../lib/inspection-dates"
import {
  addressKeyFromListing,
  planInspectionUpdates,
  type GradeSnapshot,
  type InspectionTarget,
} from "../lib/dohmh-grade"
import {
  dohmhInspectionWhere,
  dohmhInspectionsUrl,
  dohmhWindowStart,
  fetchDohmhInspections,
  newestInspectionIso,
  runDohmhRefresh,
  snapshotsFromInspections,
  type DohmhRefreshResult,
} from "../lib/dohmh-refresh"
import { buildNewsletterIssue, type NewsletterSourceRow } from "../lib/newsletter-issue"
import { handleDohmhRefreshCron } from "../app/api/cron/refresh-dohmh/route"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

async function main() {

function listing(overrides: Partial<InspectionTarget> & Pick<InspectionTarget, "id" | "name">): InspectionTarget {
  return {
    borough: "Manhattan",
    address: "10 Main St, New York, NY 10001",
    inspection_grade: "A",
    inspection_score: 8,
    inspection_date: "9/9/2026",
    ...overrides,
  }
}

function snapshot(overrides: Partial<GradeSnapshot> & Pick<GradeSnapshot, "camis" | "inspectionDate">): GradeSnapshot {
  return {
    name: "Alpha",
    borough: "manhattan",
    grade: "A",
    score: 8,
    addressKey: addressKeyFromListing("10 Main St, New York, NY 10001"),
    ...overrides,
  }
}

function newsletterRow(overrides: Partial<NewsletterSourceRow> & Pick<NewsletterSourceRow, "name" | "slug">): NewsletterSourceRow {
  return {
    borough: "Manhattan",
    neighborhood: "East Village",
    inspection_grade: "A",
    inspection_date: "11/18/2026",
    is_published: true,
    ...overrides,
  }
}

const storedOrder = ["9/30/2026", "9/9/2026", "10/2/2026", "11/10/2026"]
assert(
  [...storedOrder].sort().reverse()[0] === "9/9/2026",
  "M/D/YYYY text sort treats September 9 as the newest of this set"
)
assert(parseInspectionDate("9/9/2026")?.toISOString().slice(0, 10) === "2026-09-09", "9/9/2026 parses to September 9")
assert(parseInspectionDate("11/10/2026")?.toISOString().slice(0, 10) === "2026-11-10", "11/10/2026 parses to November 10")
assert(
  latestInspectionDate(storedOrder)?.toISOString().slice(0, 10) === "2026-11-10",
  "the newest inspection date is November 10, not the string-sorted September date"
)
assert(parseInspectionDate("2/31/2026") === null, "February 31 does not roll into March")
assert(parseInspectionDate("2/29/2026") === null, "February 29 is rejected in a non-leap year")
assert(parseInspectionDate("2/29/2024")?.toISOString().slice(0, 10) === "2024-02-29", "February 29 is kept in a leap year")
assert(parseInspectionDate("13/1/2026") === null, "month 13 is rejected")
assert(parseInspectionDate("11/19/1999") === null, "years before 2000 are rejected")
assert(parseInspectionDate(" 11/18/2026 ")?.toISOString().slice(0, 10) === "2026-11-18", "surrounding spaces are ignored")
assert(parseInspectionDate("2026-11-18T00:00:00.000")?.toISOString().slice(0, 10) === "2026-11-18", "a SODA timestamp keeps its calendar day")
assert(parseInspectionDate("2026-02-31") === null, "an overflowing ISO date is rejected")
assert(
  latestInspectionDate(["2/31/2026", "9/9/2026"])?.toISOString().slice(0, 10) === "2026-09-09",
  "an impossible day cannot become the newest date"
)

const septemberHeavy = [...Array.from({ length: 40 }, (_, index) => `9/${(index % 28) + 1}/2025`), "11/18/2026", "10/2/2026"]
const stringPage = [...septemberHeavy].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)).slice(0, 40)
assert(
  latestInspectionDate(stringPage)?.toISOString().slice(0, 10) !== "2026-11-18",
  "the first 40 string-sorted dates hide November behind September"
)
assert(
  latestInspectionDate(septemberHeavy)?.toISOString().slice(0, 10) === "2026-11-18",
  "parsing every distinct date keeps November"
)

const issueDate = "2026-11-19"
const week = buildNewsletterIssue(
  [
    newsletterRow({ name: "September", slug: "september", inspection_date: "9/30/2026" }),
    newsletterRow({ name: "Day Before", slug: "day-before", inspection_date: "11/12/2026" }),
    newsletterRow({ name: "Window Start", slug: "window-start", inspection_date: "11/13/2026" }),
    newsletterRow({ name: "Middle", slug: "middle", inspection_date: "11/18/2026", inspection_score: 6 }),
    newsletterRow({ name: "Issue Day", slug: "issue-day", inspection_date: "11/19/2026" }),
    newsletterRow({ name: "Day After", slug: "day-after", inspection_date: "11/20/2026" }),
    newsletterRow({ name: "Grade B", slug: "grade-b", inspection_grade: "B", inspection_date: "11/18/2026" }),
    newsletterRow({ name: "Hidden", slug: "hidden", is_published: false, inspection_date: "11/18/2026" }),
    newsletterRow({ name: "Overflow", slug: "overflow", inspection_date: "2/31/2026" }),
    newsletterRow({ name: "Single Digit", slug: "single-digit", inspection_date: "11/9/2026" }),
  ],
  issueDate
)
assert(
  week.gradeA.map((item) => item.slug).join("|") === "issue-day|middle|window-start",
  "new Grade A this week is chosen by parsed date, newest first"
)
assert(week.windowStart === "2026-11-13" && week.windowEnd === "2026-11-19", "the newsletter window is seven days ending on the issue date")
assert(!week.gradeA.some((item) => item.slug === "september"), "a September date is outside the week even though its text sorts later")
assert(!week.gradeA.some((item) => item.slug === "single-digit"), "November 9 is before the seven-day window")
assert(!week.gradeA.some((item) => item.slug === "grade-b"), "grade B is not a new Grade A")
assert(!week.gradeA.some((item) => item.slug === "hidden"), "unpublished listings are not new Grade A")
assert(!week.gradeA.some((item) => item.slug === "overflow"), "an impossible inspection date is not new Grade A")
assert(week.gradeA.length === 3, "three Grade A listings fall in the week")

const newerSameGrade = planInspectionUpdates(
  [listing({ id: 1, name: "Alpha" })],
  [snapshot({ camis: "100", inspectionDate: "2026-11-18" })]
)
assert(newerSameGrade.writes.length === 1, "a newer Grade A date is written even when the letter stays A")
assert(newerSameGrade.writes[0].toDate === "11/18/2026", "the stored date stays M/D/YYYY")
assert(newerSameGrade.writes[0].toGrade === "A", "the grade letter is unchanged")
assert(
  "9/9/2026" > "11/18/2026",
  "the stored September string still sorts after the November string"
)

const alreadyCurrent = planInspectionUpdates(
  [listing({ id: 1, name: "Alpha", inspection_date: "11/18/2026", inspection_score: 8, inspection_grade: "A" })],
  [snapshot({ camis: "100", inspectionDate: "2026-11-18", score: 8 })]
)
assert(alreadyCurrent.writes.length === 0 && alreadyCurrent.unchanged === 1, "a second pass with the same grade, score, and date writes nothing")

const olderGrade = planInspectionUpdates(
  [listing({ id: 1, name: "Alpha", inspection_date: "11/18/2026", inspection_grade: "A" })],
  [snapshot({ camis: "100", inspectionDate: "2026-11-01", grade: "B", score: 20 })]
)
assert(olderGrade.writes.length === 0 && olderGrade.skippedOlder === 1, "an older inspection does not replace a newer stored date")

const fullLookback = planInspectionUpdates(
  [listing({ id: 1, name: "Alpha", inspection_date: "11/18/2026", inspection_grade: "A" })],
  [snapshot({ camis: "100", inspectionDate: "2026-11-01", grade: "B", score: 20 })],
  { replaceOlder: true }
)
assert(fullLookback.writes.length === 1 && fullLookback.writes[0].toGrade === "B", "the manual full lookback trusts the fetched latest")

const nameOnly = planInspectionUpdates(
  [listing({ id: 2, name: "Alpha", address: "99 Other St, New York, NY 10002" })],
  [snapshot({ camis: "200", inspectionDate: "2026-11-18", addressKey: "10|main st|10001" })]
)
assert(nameOnly.writes.length === 0 && nameOnly.skippedNameOnly === 1, "a name-only match is not written")

const zeroScore = planInspectionUpdates(
  [listing({ id: 3, name: "Alpha", inspection_score: null, inspection_date: "11/18/2026" })],
  [snapshot({ camis: "300", inspectionDate: "2026-11-18", score: 0 })]
)
assert(zeroScore.writes.length === 1 && zeroScore.writes[0].toScore === 0, "an inspection score of 0 is a real score")

const notYetGraded = planInspectionUpdates(
  [listing({ id: 4, name: "Alpha", inspection_grade: "A", inspection_date: "11/10/2026" })],
  [snapshot({ camis: "400", inspectionDate: "2026-11-18", grade: "N", score: null })]
)
assert(notYetGraded.writes.length === 1 && notYetGraded.writes[0].toGrade === null, "a newer N code clears the letter instead of painting a badge")

const snapshots = snapshotsFromInspections([
  {
    camis: "1",
    name: "ALPHA",
    borough: "Manhattan",
    grade: null,
    score: 16,
    inspectionDate: "2026-11-20T00:00:00.000",
    building: "10",
    street: "Main St",
    zip: "10001",
  },
  {
    camis: "1",
    name: "ALPHA",
    borough: "Manhattan",
    grade: "A",
    score: 9,
    inspectionDate: "2026-11-18T00:00:00.000",
    building: "10",
    street: "Main Street",
    zip: "10001",
  },
  {
    camis: "1",
    name: "ALPHA",
    borough: "Manhattan",
    grade: "B",
    score: 22,
    inspectionDate: "2026-09-30T00:00:00.000",
    building: "10",
    street: "Main St",
    zip: "10001",
  },
])
assert(snapshots.length === 1 && snapshots[0].grade === "A" && snapshots[0].inspectionDate === "2026-11-18", "a later blank grade does not hide the newest letter")
assert(
  newestInspectionIso([
    { inspectionDate: "2026-09-30T00:00:00.000" },
    { inspectionDate: "2026-11-18T00:00:00.000" },
    { inspectionDate: "not-a-date" },
  ]) === "2026-11-18",
  "the newest fetched inspection date is parsed"
)

assert(dohmhWindowStart(new Date("2026-11-20T15:00:00.000Z"), 14) === "2026-11-06", "a 14-day lookback from November 20 starts November 6")
const where = dohmhInspectionWhere("2026-11-06", true)
assert(
  where.startsWith("(inspection_date >=") &&
    where.includes("OR record_date >=") &&
    where.includes("AND inspection_date >=") &&
    where.includes("AND grade in("),
  "the SODA filter checks both dates, floors inspection_date, and still requires a grade code"
)
assert(
  dohmhInspectionWhere("2026-11-06") === "inspection_date >= '2026-11-06T00:00:00.000' AND grade in('A','B','C','Z','P','N')",
  "the manual lookback filters on inspection_date"
)
let rejectedSince = false
try {
  dohmhInspectionWhere("2026-11-06' OR 1=1 --")
} catch {
  rejectedSince = true
}
assert(rejectedSince, "a since value that is not a calendar day is rejected")

const whereUrl = new URL(dohmhInspectionsUrl("2026-11-06", 5000, 5000, true))
assert(whereUrl.searchParams.get("$where") === where, "the request URL carries the parenthesized filter")
assert(whereUrl.searchParams.get("$offset") === "5000", "pages advance by offset")
assert(!whereUrl.toString().includes("X-App-Token"), "the app token is not placed in the URL")

let fetchedPages = 0
const fetched = await fetchDohmhInspections({
  since: "2026-11-06",
  token: "secret-token",
  recordDate: true,
  pageSize: 2,
  maxRows: 10,
  fetchImpl: async (input, init) => {
    fetchedPages += 1
    const header = new Headers(init?.headers).get("X-App-Token")
    assert(header === "secret-token", "the optional app token is sent as a header")
    const offset = new URL(String(input)).searchParams.get("$offset")
    const page = offset === "0"
      ? [
          { camis: "1", dba: "Alpha", boro: "Manhattan", grade: "A", score: "4", inspection_date: "2026-11-18T00:00:00.000", building: "10", street: "Main St", zipcode: "10001" },
          { camis: "", dba: "Skipped", grade: "A", inspection_date: "2026-11-18T00:00:00.000" },
        ]
      : [
          { camis: "2", dba: "Beta", boro: "Brooklyn", grade: "B", score: 18, inspection_date: "2026-09-09T00:00:00.000", building: "5", street: "Berry St", zipcode: "11211" },
        ]
    return new Response(JSON.stringify(page), { status: 200 })
  },
})
assert(fetchedPages === 2, "a short page ends the pull")
assert(fetched.map((row) => row.camis).join("|") === "1|2", "rows without a CAMIS are skipped and later pages are kept")
assert(fetched[1].score === 18, "a numeric SODA score is kept")

let tokenLeaked = false
try {
  await fetchDohmhInspections({
    since: "2026-11-06",
    token: "secret-token",
    fetchImpl: async () => new Response("secret-token", { status: 503 }),
  })
} catch (error) {
  tokenLeaked = error instanceof Error && error.message.includes("secret-token")
  assert(error instanceof Error && error.message.includes("503"), "a failed SODA response reports the status")
}
assert(!tokenLeaked, "a SODA failure does not include the app token")

const writes: unknown[] = []
const first = await runDohmhRefresh({
  dry: false,
  now: new Date("2026-11-20T12:00:00.000Z"),
  fetchInspections: async (since) => {
    assert(since === "2026-11-06", "the refresh asks for the 14-day window")
    return [
      {
        camis: "1",
        name: "ALPHA",
        borough: "Manhattan",
        grade: "B",
        score: 20,
        inspectionDate: "2026-11-02T00:00:00.000",
        building: "10",
        street: "Main St",
        zip: "10001",
      },
      {
        camis: "1",
        name: "ALPHA",
        borough: "Manhattan",
        grade: "A",
        score: 4,
        inspectionDate: "2026-11-18T00:00:00.000",
        building: "10",
        street: "Main St",
        zip: "10001",
      },
      {
        camis: "9",
        name: "OTHER",
        borough: "Queens",
        grade: "A",
        score: 3,
        inspectionDate: "2026-09-30T00:00:00.000",
        building: "1",
        street: "Broadway",
        zip: "11101",
      },
    ]
  },
  loadRestaurants: async () => [listing({ id: 7, name: "Alpha", inspection_date: "9/9/2026", inspection_score: 12 })],
  applyWrites: async (batch) => {
    writes.push(...batch)
    return batch.length
  },
})
assert(first.rowsFetched === 3, "the summary counts fetched rows")
assert(first.restaurantsUpdated === 1, "the summary counts restaurants updated")
assert(first.newestInspectionDate === "2026-11-18", "the summary reports the newest parsed inspection date")
assert(first.plannedUpdates === 1 && writes.length === 1, "the newer Grade A row is the one written")
assert((writes[0] as { toDate: string; toGrade: string }).toDate === "11/18/2026", "the written date is the November inspection")
assert((writes[0] as { toGrade: string }).toGrade === "A", "the earlier B in the window does not win")

const second = await runDohmhRefresh({
  dry: false,
  now: new Date("2026-11-20T12:00:00.000Z"),
  fetchInspections: async () => [
    {
      camis: "1",
      name: "ALPHA",
      borough: "Manhattan",
      grade: "A",
      score: 4,
      inspectionDate: "2026-11-18T00:00:00.000",
      building: "10",
      street: "Main St",
      zip: "10001",
    },
  ],
  loadRestaurants: async () => [
    listing({ id: 7, name: "Alpha", inspection_grade: "A", inspection_score: 4, inspection_date: "11/18/2026" }),
  ],
  applyWrites: async () => {
    throw new Error("apply should not run when nothing changed")
  },
})
assert(second.restaurantsUpdated === 0 && second.plannedUpdates === 0, "running the refresh again updates nothing")

let dryApplied = false
const dry = await runDohmhRefresh({
  dry: true,
  now: new Date("2026-11-20T12:00:00.000Z"),
  fetchInspections: async () => [
    {
      camis: "1",
      name: "ALPHA",
      borough: "Manhattan",
      grade: "A",
      score: 4,
      inspectionDate: "2026-11-18T00:00:00.000",
      building: "10",
      street: "Main St",
      zip: "10001",
    },
  ],
  loadRestaurants: async () => [listing({ id: 7, name: "Alpha", inspection_date: "9/9/2026" })],
  applyWrites: async () => {
    dryApplied = true
    return 1
  },
})
assert(dry.dryRun && dry.restaurantsUpdated === 0 && dry.plannedUpdates === 1 && !dryApplied, "a dry run plans the write and does not apply it")

const vercel = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
  crons: Array<{ path: string; schedule: string }>
}
const refreshCron = vercel.crons.find((cron) => cron.path === "/api/cron/refresh-dohmh")
const newsletterCron = vercel.crons.find((cron) => cron.path === "/api/cron/newsletter-weekly")
assert(refreshCron?.schedule === "0 12 * * *", "the refresh cron runs once a day at 12:00 UTC")
assert(newsletterCron?.schedule === "0 14 * * 4", "the newsletter cron stays Thursday at 14:00 UTC")
assert(
  Number(refreshCron?.schedule.split(" ")[1]) < Number(newsletterCron?.schedule.split(" ")[1]),
  "the refresh hour is before the newsletter hour"
)

process.env.CRON_SECRET = "cron-secret"
let ranDry: boolean | null = null
const unauthorized = await handleDohmhRefreshCron(
  new Request("https://www.eatrealfoodnyc.com/api/cron/refresh-dohmh?dry=1"),
  async () => {
    throw new Error("unauthorized calls must not run")
  }
)
assert(unauthorized.status === 401, "the cron route rejects a request without CRON_SECRET")

const dryResponse = await handleDohmhRefreshCron(
  new Request("https://www.eatrealfoodnyc.com/api/cron/refresh-dohmh?dry=1", {
    headers: { authorization: "Bearer cron-secret" },
  }),
  async (options) => {
    ranDry = options.dry
    const body: DohmhRefreshResult = {
      dryRun: options.dry,
      since: "2026-11-06",
      rowsFetched: 4,
      restaurantsUpdated: options.dry ? 0 : 4,
      plannedUpdates: 4,
      newestInspectionDate: "2026-11-18",
      matched: 4,
      skippedNameOnly: 0,
      skippedOlder: 0,
      unchanged: 0,
    }
    return body
  }
)
const dryBody = await dryResponse.json()
assert(dryResponse.status === 200 && ranDry === true, "dry=1 runs the refresh as a dry run")
assert(dryBody.rowsFetched === 4 && dryBody.restaurantsUpdated === 0 && dryBody.newestInspectionDate === "2026-11-18", "the dry-run response includes the summary")

const failed = await handleDohmhRefreshCron(
  new Request("https://www.eatrealfoodnyc.com/api/cron/refresh-dohmh", {
    headers: { authorization: "Bearer cron-secret" },
  }),
  async () => {
    throw new Error("secret-token exploded")
  }
)
const failedBody = await failed.json()
assert(failed.status === 500 && failedBody.error === "refresh failed", "a failed refresh returns a generic error")
assert(!JSON.stringify(failedBody).includes("secret-token"), "the error response does not include the failure detail")

console.log("\nDOHMH refresh tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
