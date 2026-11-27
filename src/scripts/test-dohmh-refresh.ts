import { readFileSync } from "node:fs"
import { join } from "node:path"
import { latestInspectionDate, parseInspectionDate } from "../lib/inspection-dates"
import {
  addressKeyFromDohmh,
  addressKeyFromListing,
  inspectionNamesAgree,
  latestGradedInspection,
  namesLooselyMatch,
  planInspectionUpdates,
  type DohmhInspection,
  type GradeSnapshot,
  type InspectionTarget,
} from "../lib/dohmh-grade"
import {
  applyRestaurantRestWrites,
  buildGradeBackup,
  buildReconcilePlan,
  executeReconcile,
  gradeBackupFileName,
  loadRestaurantsFromRest,
  parseRestaurantRestRow,
  planExplicitNameFixes,
  reconcileSummary,
  redactSecrets,
  restaurantPatchQuery,
  type DirectoryRestaurantRow,
} from "../lib/dohmh-reconcile"
import {
  DOHMH_CRON_PAGE_SIZE,
  DOHMH_FETCH_ATTEMPTS,
  DOHMH_GROUPED_SELECT,
  DOHMH_REFRESH_LOOKBACK_YEARS,
  dohmhCronFetchConfig,
  dohmhGroupedInspectionsUrl,
  dohmhInspectionWhere,
  dohmhInspectionsUrl,
  dohmhLookbackStart,
  dohmhWindowStart,
  fetchDohmhInspections,
  newestInspectionIso,
  parseDohmhRow,
  runDohmhRefresh,
  snapshotsFromInspections,
  type DohmhRefreshResult,
} from "../lib/dohmh-refresh"
import { buildNewsletterIssue, type NewsletterSourceRow } from "../lib/newsletter-issue"
import { handleDohmhRefreshCron } from "../app/api/cron/refresh-dohmh/route"
import { inspectionRefreshPaths } from "../lib/inspection-revalidate"

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
    retryDelayMs: 0,
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
    assert(since === "2022-11-20", "the refresh asks for the four-year lookback")
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
      skippedAmbiguous: 0,
      skippedNameConflict: 0,
      nameConflictSample: [],
      unchanged: 0,
      nameMismatches: 0,
      nameMismatchSample: [],
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

assert(inspectionRefreshPaths({ dryRun: true, restaurantsUpdated: 4 }).length === 0, "a dry run does not revalidate pages")
assert(inspectionRefreshPaths({ dryRun: false, restaurantsUpdated: 0 }).length === 0, "a refresh that writes nothing does not revalidate pages")
const refreshPaths = inspectionRefreshPaths({ dryRun: false, restaurantsUpdated: 3 })
assert(refreshPaths.includes("/restaurants/[slug]"), "a grade change marks listing pages stale")
assert(
  refreshPaths.includes("/nyc/[borough]/healthy-restaurants") &&
    refreshPaths.includes("/nyc/[borough]/[neighborhood]/healthy-restaurants"),
  "a grade change marks borough and neighbourhood hubs stale"
)
assert(refreshPaths.includes("/data"), "a grade change marks the data lead counts stale")

const updatedBody = {
  dryRun: false,
  since: "2026-11-06",
  rowsFetched: 4,
  restaurantsUpdated: 3,
  plannedUpdates: 3,
  newestInspectionDate: "2026-11-18",
  matched: 3,
  skippedNameOnly: 0,
  skippedOlder: 0,
  skippedAmbiguous: 0,
  skippedNameConflict: 0,
  nameConflictSample: [],
  unchanged: 1,
  nameMismatches: 0,
  nameMismatchSample: [],
}
let revalidated = 0
const updated = await handleDohmhRefreshCron(
  new Request("https://www.eatrealfoodnyc.com/api/cron/refresh-dohmh", {
    headers: { authorization: "Bearer cron-secret" },
  }),
  async () => updatedBody,
  (result) => {
    revalidated = inspectionRefreshPaths(result).length
  }
)
assert(
  updated.status === 200 && revalidated === refreshPaths.length,
  "a successful refresh revalidates listing and hub paths"
)

const revalidateFailed = await handleDohmhRefreshCron(
  new Request("https://www.eatrealfoodnyc.com/api/cron/refresh-dohmh", {
    headers: { authorization: "Bearer cron-secret" },
  }),
  async () => updatedBody,
  () => {
    throw new Error("revalidate exploded")
  }
)
const revalidateBody = await revalidateFailed.json()
assert(
  revalidateFailed.status === 200 && revalidateBody.restaurantsUpdated === 3,
  "a revalidation failure still reports the completed refresh"
)

const addressPairs: Array<[string, { building: string; street: string; zip: string }]> = [
  ["4415 4th Ave, Brooklyn, NY 11220", { building: "4415", street: "4 AVENUE", zip: "11220" }],
  ["62 W 22nd St, New York, NY 10010", { building: "62", street: "WEST 22 STREET", zip: "10010" }],
  ["133-40 79th St Suite H, Flushing, NY 11367", { building: "133-40", street: "79 STREET", zip: "11367" }],
  ["54 Orchard St Storefront 2, New York, NY 10002", { building: "54", street: "ORCHARD STREET", zip: "10002" }],
  ["552 Court St, Brooklyn, NY 11231", { building: "552", street: "COURT STREET", zip: "11231" }],
  ["100 St. Nicholas Ave, New York, NY 10026", { building: "100", street: "SAINT NICHOLAS AVENUE", zip: "10026" }],
  ["1 Shore Pkwy, Brooklyn, NY 11209", { building: "1", street: "SHORE PARKWAY", zip: "11209" }],
]
for (const [listingAddress, city] of addressPairs) {
  assert(
    addressKeyFromListing(listingAddress) === addressKeyFromDohmh(city),
    `${listingAddress} matches ${city.building} ${city.street}`
  )
}
assert(
  addressKeyFromListing("12345 Broadway, New York, NY 10001") === "12345|broadway|10001",
  "the ZIP is the last five-digit group, not a five-digit building number"
)
assert(addressKeyFromListing("33-07 Ditmars Blvd, Queens, NY 11105") === "33-07|ditmars blvd|11105", "Ditmars Blvd keeps its existing key")
assert(namesLooselyMatch("Halal Havn", "HALAL HEAVEN"), "a shared first token is a loose name match")
assert(namesLooselyMatch("Poke & Roll Sushi", "POKE N' ROLL"), "poke and roll shares a first token with the city DBA")
assert(!namesLooselyMatch("Red Hook Kitchenette", "RHK Marketplace"), "rhk marketplace does not loosely match Red Hook Kitchenette")
assert(
  namesLooselyMatch("Red Hook Kitchenette Cafe", "Blue Hook Kitchenette Cafe"),
  "token overlap of 0.6 or more matches without the same first token"
)
assert(!namesLooselyMatch("Red Hook Kitchenette", "Blue Bottle Coffee"), "unrelated names do not match")

function cityInspection(overrides: Partial<DohmhInspection> & Pick<DohmhInspection, "camis" | "name" | "inspectionDate">): DohmhInspection {
  return {
    borough: "Brooklyn",
    grade: null,
    score: null,
    building: "1",
    street: "MAIN STREET",
    zip: "11231",
    ...overrides,
  }
}

const daGennaro = latestGradedInspection([
  cityInspection({ camis: "1", name: "DA GENNARO", grade: "A", score: 4, inspectionDate: "2024-06-13" }),
  cityInspection({ camis: "1", name: "DA GENNARO", grade: "Z", score: 22, inspectionDate: "2026-07-01" }),
  cityInspection({ camis: "1", name: "DA GENNARO", grade: null, score: 0, inspectionDate: "2026-09-17" }),
])
assert(
  daGennaro?.grade === "Z" && daGennaro.inspectionDate === "2026-07-01",
  "a later blank grade does not restore an older A over a newer Z"
)

const mazzatAddress = "208 Columbia St, Brooklyn, NY 11231"
const mazzatSnap = snapshot({
  camis: "41231005",
  name: "MAZZAT",
  borough: "brooklyn",
  grade: "A",
  score: 9,
  inspectionDate: "2026-10-21",
  addressKey: addressKeyFromDohmh({ building: "208", street: "COLUMBIA STREET", zip: "11231" }),
})
const mazzatStored = listing({
  id: 1,
  name: "Mazzat",
  borough: "Brooklyn",
  address: mazzatAddress,
  inspection_grade: "A",
  inspection_score: 13,
  inspection_date: "5/7/2025",
})
const mazzatPlan = planInspectionUpdates([mazzatStored], [mazzatSnap])
assert(mazzatPlan.writes.length === 1 && mazzatPlan.writes[0].toGrade === "A", "Mazzat's newer Grade A replaces the stored A")
assert(mazzatPlan.writes[0].toScore === 9 && mazzatPlan.writes[0].toDate === "10/21/2026", "Mazzat takes the city's score and date")
const mazzatAgain = planInspectionUpdates(
  [listing({ ...mazzatStored, inspection_grade: "A", inspection_score: 9, inspection_date: "10/21/2026" })],
  [mazzatSnap]
)
assert(mazzatAgain.writes.length === 0 && mazzatAgain.unchanged === 1, "planning Mazzat a second time writes nothing")

const aromiPlan = planInspectionUpdates(
  [listing({
    id: 2,
    name: "Aromi",
    borough: "Brooklyn",
    address: "552 Court St, Brooklyn, NY 11231",
    inspection_grade: "A",
    inspection_score: 13,
    inspection_date: "3/22/2023",
  })],
  [snapshot({
    camis: "50117506",
    name: "AROMI",
    borough: "brooklyn",
    grade: "A",
    score: 12,
    inspectionDate: "2026-07-30",
    addressKey: addressKeyFromDohmh({ building: "552", street: "COURT STREET", zip: "11231" }),
  })]
)
assert(
  aromiPlan.writes.length === 1 && aromiPlan.writes[0].toScore === 12 && aromiPlan.writes[0].toDate === "7/30/2026",
  "Aromi's 2023 Grade A is replaced by the July 2026 inspection"
)

const missingGrade = planInspectionUpdates(
  [listing({
    id: 3,
    name: "Halal Havn",
    borough: "Brooklyn",
    address: "10 Broadway Rear, Brooklyn, NY 11231",
    inspection_grade: null,
    inspection_score: null,
    inspection_date: null,
  })],
  [snapshot({
    camis: "50189810",
    name: "HALAL HEAVEN",
    borough: "brooklyn",
    grade: "A",
    score: 12,
    inspectionDate: "2026-09-11",
    addressKey: addressKeyFromDohmh({ building: "10", street: "BROADWAY", zip: "11231" }),
  })]
)
assert(
  missingGrade.writes.length === 1 &&
    missingGrade.writes[0].matchedBy === "zip-building" &&
    missingGrade.writes[0].toGrade === "A" &&
    missingGrade.writes[0].toScore === 12,
  "a blank grade is filled from the same building and ZIP when the names agree"
)
assert(missingGrade.nameMismatches === 1, "Halal Havn versus HALAL HEAVEN is logged and not renamed by the planner")

const ambiguous = planInspectionUpdates(
  [listing({
    id: 4,
    name: "Cafe Volkan",
    borough: "Brooklyn",
    address: "10 Main St Rear, Brooklyn, NY 11231",
    inspection_grade: null,
    inspection_score: null,
    inspection_date: null,
  })],
  [
    snapshot({
      camis: "1",
      name: "CAFE ONE",
      borough: "brooklyn",
      grade: "A",
      score: 3,
      inspectionDate: "2026-10-15",
      addressKey: addressKeyFromDohmh({ building: "10", street: "OTHER STREET", zip: "11231" }),
    }),
    snapshot({
      camis: "2",
      name: "CAFE TWO",
      borough: "brooklyn",
      grade: "B",
      score: 20,
      inspectionDate: "2026-10-15",
      addressKey: addressKeyFromDohmh({ building: "10", street: "SIDE STREET", zip: "11231" }),
    }),
  ]
)
assert(
  ambiguous.writes.length === 0 && ambiguous.skippedNameConflict === 1,
  "two different cafes at the same building are a name conflict, not a write"
)

const zipName = planInspectionUpdates(
  [listing({
    id: 5,
    name: "Slimak Cafe",
    borough: "Brooklyn",
    address: "9 Other St, Brooklyn, NY 11231",
    inspection_grade: "A",
    inspection_score: 2,
    inspection_date: "11/8/2024",
  })],
  [snapshot({
    camis: "3",
    name: "SLIMAK CAFE",
    borough: "brooklyn",
    grade: "A",
    score: 12,
    inspectionDate: "2026-03-25",
    addressKey: addressKeyFromDohmh({ building: "40", street: "DIFFERENT STREET", zip: "11231" }),
  })]
)
assert(
  zipName.writes.length === 1 && zipName.writes[0].matchedBy === "zip-name" && zipName.writes[0].toDate === "3/25/2026",
  "the same ZIP and exact normalized name updates a stale grade"
)

const ambiguousName = planInspectionUpdates(
  [listing({
    id: 6,
    name: "Slimak Cafe",
    borough: "Brooklyn",
    address: "9 Other St, Brooklyn, NY 11231",
    inspection_grade: null,
    inspection_date: null,
    inspection_score: null,
  })],
  [
    snapshot({
      camis: "3",
      name: "SLIMAK CAFE",
      borough: "brooklyn",
      grade: "A",
      score: 12,
      inspectionDate: "2026-03-25",
      addressKey: "40|different st|11231",
    }),
    snapshot({
      camis: "4",
      name: "SLIMAK CAFE",
      borough: "brooklyn",
      grade: "B",
      score: 18,
      inspectionDate: "2026-04-01",
      addressKey: "41|another st|11231",
    }),
  ]
)
assert(ambiguousName.writes.length === 0 && ambiguousName.skippedAmbiguous === 1, "two CAMIS with the same name and ZIP are skipped")

const cronConfig = dohmhCronFetchConfig("app-token")
assert(DOHMH_REFRESH_LOOKBACK_YEARS >= 3, "the scheduled lookback is at least three years")
assert(dohmhLookbackStart(new Date("2026-11-20T12:00:00.000Z")) === "2022-11-20", "four years before November 20 2026 is November 20 2022")
assert(cronConfig.grouped && cronConfig.pageSize === DOHMH_CRON_PAGE_SIZE && DOHMH_CRON_PAGE_SIZE === 50_000, "the cron pulls grouped pages of 50,000")
assert(!DOHMH_GROUPED_SELECT.includes("as score") && !DOHMH_GROUPED_SELECT.includes("as grade"), "aggregate aliases do not reuse column names")
const groupedUrl = new URL(dohmhGroupedInspectionsUrl("2022-11-20", 0, 50_000))
assert(groupedUrl.searchParams.get("$select") === DOHMH_GROUPED_SELECT, "the grouped URL selects max(score) as sc and max(grade) as gr")
assert(
  groupedUrl.searchParams.get("$where") === "inspection_date >= '2022-11-20T00:00:00.000' AND score IS NOT NULL",
  "the grouped filter is the inspection date plus a non-null score"
)
assert(!groupedUrl.toString().includes("app-token"), "the grouped URL does not carry the app token")
let shortLookback = false
try {
  dohmhLookbackStart(new Date("2026-11-20T12:00:00.000Z"), 2)
} catch {
  shortLookback = true
}
assert(shortLookback, "a lookback under three years is rejected")

const groupedRow = parseDohmhRow({
  camis: "50189810",
  dba: "HALAL HEAVEN",
  boro: "Brooklyn",
  building: "10",
  street: "BROADWAY",
  zipcode: "11231",
  inspection_date: "2026-09-11T00:00:00.000",
  sc: "12",
  gr: "A",
})
assert(groupedRow?.grade === "A" && groupedRow.score === 12, "a grouped row reads gr and sc")
const blankGrouped = parseDohmhRow({
  camis: "1",
  dba: "DA GENNARO",
  boro: "Manhattan",
  building: "1",
  street: "MAIN STREET",
  zipcode: "10001",
  inspection_date: "2026-09-17T00:00:00.000",
  sc: "0",
})
assert(blankGrouped?.grade === null && blankGrouped.score === 0, "a grouped row with no gr stays ungraded")

let groupedAttempts = 0
const groupedFetched = await fetchDohmhInspections({
  since: "2022-11-20",
  grouped: true,
  pageSize: 2,
  maxRows: 4,
  retryDelayMs: 0,
  token: "secret-token",
  fetchImpl: async (input) => {
    groupedAttempts += 1
    const url = new URL(String(input))
    assert(url.searchParams.get("$group")?.includes("inspection_date") === true, "the grouped pull sends $group")
    if (groupedAttempts === 1) return new Response("busy", { status: 503 })
    return new Response(JSON.stringify([
      { camis: "9", dba: "BETA", boro: "Queens", building: "5", street: "BROADWAY", zipcode: "11101", inspection_date: "2026-01-02T00:00:00.000", sc: "4", gr: "A" },
    ]), { status: 200 })
  },
})
assert(groupedAttempts === 2 && groupedFetched.length === 1 && groupedFetched[0].grade === "A", "a transient 503 is retried and the next page is kept")
assert(DOHMH_FETCH_ATTEMPTS === 4, "SODA is tried four times before the refresh fails")

const olderCity = await runDohmhRefresh({
  dry: false,
  now: new Date("2026-11-20T12:00:00.000Z"),
  fetchInspections: async () => [
    {
      camis: "1",
      name: "ALPHA",
      borough: "Manhattan",
      grade: "B",
      score: 20,
      inspectionDate: "2026-06-01T00:00:00.000",
      building: "10",
      street: "Main St",
      zip: "10001",
    },
  ],
  loadRestaurants: async () => [listing({ id: 7, name: "Alpha", inspection_grade: "A", inspection_score: 4, inspection_date: "11/18/2026" })],
  applyWrites: async (batch) => batch.length,
})
assert(
  olderCity.plannedUpdates === 1 && olderCity.restaurantsUpdated === 1,
  "the full lookback trusts the city's latest graded inspection over a newer stored date"
)

let renamed = false
const rhkRefresh = await runDohmhRefresh({
  dry: false,
  now: new Date("2026-11-20T12:00:00.000Z"),
  fetchInspections: async () => [
    {
      camis: "50157966",
      name: "RED HOOK KITCHENETTE",
      borough: "Brooklyn",
      grade: "A",
      score: 4,
      inspectionDate: "2026-10-23T00:00:00.000",
      building: "236",
      street: "CONOVER STREET",
      zip: "11231",
    },
  ],
  loadRestaurants: async () => [
    listing({
      id: 8752,
      name: "rhk marketplace",
      borough: "Brooklyn",
      address: "236 Conover St, Brooklyn, NY 11231",
      inspection_grade: "A",
      inspection_score: 4,
      inspection_date: "10/23/2026",
    }),
  ],
  applyWrites: async () => {
    renamed = true
    return 1
  },
})
assert(
  !renamed && rhkRefresh.plannedUpdates === 0 && rhkRefresh.skippedNameConflict === 1,
  "the cron skips rhk marketplace as a name conflict and does not write the grade"
)

function directoryRow(overrides: Partial<DirectoryRestaurantRow> & Pick<DirectoryRestaurantRow, "id" | "slug" | "name">): DirectoryRestaurantRow {
  return {
    borough: "Brooklyn",
    address: "236 Conover St, Brooklyn, NY 11231",
    inspection_grade: "A",
    inspection_score: 4,
    inspection_date: "10/23/2026",
    ...overrides,
  }
}

const rhkRow = directoryRow({ id: 8752, slug: "rhk-marketplace", name: "rhk marketplace" })
const rhkSnap = snapshot({
  camis: "50157966",
  name: "RED HOOK KITCHENETTE",
  borough: "brooklyn",
  grade: "A",
  score: 4,
  inspectionDate: "2026-10-23",
  addressKey: addressKeyFromDohmh({ building: "236", street: "CONOVER STREET", zip: "11231" }),
})
const rhkBuilt = buildReconcilePlan([rhkRow], [rhkSnap])
assert(rhkBuilt.inspection.writes.length === 0 && rhkBuilt.nameFixes.fixes.length === 1, "the backfill lists the Red Hook rename and does not invent a grade change")
assert(rhkBuilt.writes.length === 1 && rhkBuilt.writes[0].name === "Red Hook Kitchenette" && rhkBuilt.writes[0].inspection_grade === undefined, "the rename payload does not touch the grade")
const rhkDone = buildReconcilePlan(
  [directoryRow({ id: 8752, slug: "rhk-marketplace", name: "Red Hook Kitchenette" })],
  [rhkSnap]
)
assert(rhkDone.writes.length === 0 && rhkDone.nameFixes.alreadyApplied === 1, "a second backfill plan is a no-op once the name and grade match")
const wrongSlug = planExplicitNameFixes([directoryRow({ id: 8752, slug: "someone-else", name: "rhk marketplace" })])
assert(wrongSlug.fixes.length === 0 && wrongSlug.skipped === 1, "the rename is skipped when id 8752 is no longer rhk-marketplace")

let backupCalls = 0
let applyCalls = 0
const dryReconcile = await executeReconcile({
  dry: true,
  writes: rhkBuilt.writes,
  writeBackup: () => {
    backupCalls += 1
  },
  applyWrites: async () => {
    applyCalls += 1
    return 1
  },
})
assert(dryReconcile.written === 0 && dryReconcile.backupWritten === false && backupCalls === 0 && applyCalls === 0, "a reconcile dry run writes nothing and saves no backup")
const applyEvents: string[] = []
const applied = await executeReconcile({
  dry: false,
  writes: rhkBuilt.writes,
  writeBackup: () => {
    applyEvents.push("backup")
  },
  applyWrites: async (batch) => {
    applyEvents.push("apply")
    return batch.length
  },
})
assert(applyEvents.join("|") === "backup|apply" && applied.written === 1, "an apply saves the backup before it writes")
const idle = await executeReconcile({
  dry: false,
  writes: [],
  writeBackup: () => {
    throw new Error("backup should not run")
  },
  applyWrites: async () => {
    throw new Error("apply should not run")
  },
})
assert(idle.written === 0 && idle.backupWritten === false, "an apply with nothing to change does not write")

const secret = "service-role-secret-value"
const summary = reconcileSummary({
  dry: true,
  since: "2022-11-20",
  restaurantCount: 1,
  rowsFetched: 1,
  snapshotCount: 1,
  inspection: rhkBuilt.inspection,
  nameFixes: rhkBuilt.nameFixes,
  restaurantById: new Map([[8752, { slug: "rhk-marketplace", name: "rhk marketplace" }]]),
}).join("\n")
assert(summary.includes("Red Hook Kitchenette") && summary.includes("dry run"), "the dry-run summary lists the rename and says it will not write")
assert(!summary.includes(secret), "the summary has no place to print a key")
assert(redactSecrets(`failed ${secret} https://example.com/secret`, [secret]) === "failed [redacted] [redacted]", "errors redact the key and any URL")
assert(restaurantPatchQuery(8752) === "restaurants?id=eq.8752", "a write patches one restaurant id and does not put the key in the URL")
const backup = buildGradeBackup({
  generatedAt: "2026-11-25T00:00:00.000Z",
  since: "2022-11-20",
  restaurants: [rhkRow],
  gradeWrites: [],
  nameFixes: rhkBuilt.nameFixes.fixes,
})
assert(backup.rows[0].previous.name === "rhk marketplace" && backup.rows[0].next.name === "Red Hook Kitchenette", "the backup keeps the old name")
assert(
  gradeBackupFileName("/tmp/data", new Date("2026-11-25T15:04:05.000Z"), () => false).endsWith("grade-backup-2026-11-25.json"),
  "the first backup of the day uses the date"
)
assert(
  gradeBackupFileName("/tmp/data", new Date("2026-11-25T15:04:05.000Z"), () => true).endsWith("grade-backup-2026-11-25-150405.json"),
  "a second backup the same day gets a time suffix"
)

const seenUrls: string[] = []
const loaded = await loadRestaurantsFromRest({
  baseUrl: "https://example.supabase.co/",
  key: secret,
  pageSize: 1,
  fetchImpl: async (input, init) => {
    const url = String(input)
    seenUrls.push(url)
    assert(!url.includes(secret), "the read URL does not include the key")
    assert(new Headers(init?.headers).get("apikey") === secret, "the key is sent as a header")
    if (seenUrls.length === 1) {
      return new Response(JSON.stringify([{ id: 8752, slug: "rhk-marketplace", name: "rhk marketplace", borough: "Brooklyn", address: "236 Conover St", inspection_grade: "A", inspection_score: "4", inspection_date: "10/23/2026" }]), { status: 200 })
    }
    return new Response(JSON.stringify([]), { status: 200 })
  },
})
assert(loaded.length === 1 && loaded[0].inspection_score === 4, "a string score from REST is stored as a number")
assert(parseRestaurantRestRow({ id: "nope" }) === null, "a REST row without an id is skipped")

const passingNames: Array<[string, string]> = [
  ["Kesté Pizza e Vino", "KESTE"],
  ["Añejo", "ANEJO"],
  ["Rezdôra", "REZDORA"],
  ["12 Chairs Cafe", "TWELVE CHAIRS"],
  ["Mazzat", "MAZZAT"],
  ["Hook & Reel Cajun Seafood & Bar", "HOOK & REEL"],
  ['Chick It Out " Khao Man Gai"', "CHICK IT OUT"],
]
for (const [listingName, cityName] of passingNames) {
  assert(inspectionNamesAgree(listingName, cityName), `${listingName} agrees with ${cityName}`)
}
assert(!inspectionNamesAgree("rhk marketplace", "RED HOOK KITCHENETTE"), "rhk marketplace does not agree with Red Hook Kitchenette")

function sameAddressConflict(listingName: string, cityName: string, fromDate: string, toIso: string, replaceOlder = false) {
  const address = "10 Main St, New York, NY 10001"
  return planInspectionUpdates(
    [listing({
      id: 11,
      name: listingName,
      address,
      inspection_grade: "A",
      inspection_score: 5,
      inspection_date: fromDate,
    })],
    [snapshot({
      camis: "99",
      name: cityName,
      grade: "A",
      score: 8,
      inspectionDate: toIso,
      addressKey: addressKeyFromListing(address),
    })],
    { replaceOlder }
  )
}

const wrongVenues: Array<[string, string]> = [
  ["Chelsea Juice", "LA BIANCA PIZZERIA"],
  ["Westway Diner", "TROOP WINGS"],
  ["Breads Bakery", "NESPRESSO"],
  ["Green Cafe", "BROAD NOSH BAGELS"],
  ["Healthy Corner", "BELLA DONNA PIZZERIA"],
  ["Shahs Halal Food Norwood", "SUBWAY"],
  ["The Meatball Shop Hell's Kitchen", "BLUESTONE LANE"],
  ["Ci Siamo", "MIDNIGHT THEATRE"],
  ["Smoothie Central", "BAGEL BOSS"],
  ["Tea and Milk", "BANH MI SHACK"],
  ["Farmers Fridge Jamaica", "ANDY'S"],
]
for (const [listingName, cityName] of wrongVenues) {
  const plan = sameAddressConflict(listingName, cityName, "5/7/2025", "2026-11-10")
  assert(
    plan.writes.length === 0 && plan.skippedNameConflict === 1,
    `${listingName} is not written from ${cityName}`
  )
}
const tamar = sameAddressConflict("Tamar Juice Bar", "CHICKEN FEASTIN", "9/22/2025", "2025-07-16", true)
assert(
  tamar.writes.length === 0 && tamar.skippedNameConflict === 1,
  "tamar juice bar does not take an older date from CHICKEN FEASTIN"
)
const kesteWrite = sameAddressConflict("Kesté Pizza e Vino", "KESTE", "1/1/2024", "2026-06-01")
assert(kesteWrite.writes.length === 1 && kesteWrite.writes[0].toDate === "6/1/2026", "Kesté Pizza e Vino is written from KESTE")

let writeUrls: string[] = []
try {
  await applyRestaurantRestWrites({
    baseUrl: "https://example.supabase.co",
    key: secret,
    writes: [{ id: 8752, name: "Red Hook Kitchenette" }],
    fetchImpl: async (input, init) => {
      writeUrls.push(String(input))
      assert(init?.method === "PATCH", "a name fix is a PATCH")
      assert(String(input).endsWith("/rest/v1/restaurants?id=eq.8752"), "the PATCH targets that restaurant id")
      assert(!String(input).includes(secret), "the write URL does not include the key")
      assert(!String(input).includes("on_conflict"), "the write is not an upsert")
      assert(new Headers(init?.headers).get("prefer") === "return=minimal", "the PATCH asks PostgREST to return nothing")
      const body = JSON.parse(String(init?.body))
      assert(body.name === "Red Hook Kitchenette" && !("inspection_grade" in body), "a name-only patch does not send grade columns")
      return new Response(secret, { status: 503 })
    },
  })
  throw new Error("write should have failed")
} catch (error) {
  assert(error instanceof Error && error.message.includes("503") && !error.message.includes(secret), "a REST failure reports the status and not the key")
}
assert(writeUrls.length === 1, "a failed patch is not retried")

let inFlight = 0
let maxInFlight = 0
let releaseWrites: () => void = () => {}
const gate = new Promise<void>((resolve) => {
  releaseWrites = resolve
})
const concurrent = applyRestaurantRestWrites({
  baseUrl: "https://example.supabase.co",
  key: secret,
  concurrency: 5,
  writes: [1, 2, 3, 4, 5, 6].map((id) => ({ id, inspection_grade: "A" as string | null, inspection_score: 1, inspection_date: "1/1/2026" })),
  fetchImpl: async () => {
    inFlight += 1
    maxInFlight = Math.max(maxInFlight, inFlight)
    await gate
    inFlight -= 1
    return new Response(null, { status: 204 })
  },
})
await new Promise((resolve) => setTimeout(resolve, 20))
assert(maxInFlight === 5 && inFlight === 5, "patches run at most five at a time")
releaseWrites()
assert((await concurrent) === 6, "every patch is sent once the earlier ones finish")
assert(maxInFlight === 5, "the sixth patch waits for a free slot")

console.log("\nDOHMH refresh tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
