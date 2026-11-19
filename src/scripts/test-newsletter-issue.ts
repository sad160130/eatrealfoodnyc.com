import { createElement } from "react"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { renderToStaticMarkup } from "react-dom/server"
import NewsletterArchiveList from "../components/newsletter-archive-list"
import NewsletterIssueView from "../components/newsletter-issue-view"
import { pageMeta } from "../lib/page-meta"
import { DESCRIPTION_MAX, fitTitle } from "../lib/seo-titles"
import {
  GRADE_CHANGE_HISTORY,
  NEWSLETTER_INDEX_MIN_GRADE_A,
  NEWSLETTER_RECENT_WEEKS,
  NEWSLETTER_SPONSOR_TEXT,
  addIsoDays,
  archivedIssueDates,
  archivePageDescription,
  buildNewsletterIssue,
  currentIssueDate,
  isIssueDate,
  isNewsletterIssueIndexable,
  issuePageDescription,
  issuePageTitle,
  issueWindow,
  newsletterWebPageSchema,
  parseInspectionDay,
  partitionNewsletterArchive,
  recentNewsletterIssueStart,
  summarizeNewsletterArchive,
  thursdayOnOrBefore,
  type NewsletterSourceRow,
} from "../lib/newsletter-issue"
import { deliverNewsletterIssue } from "../lib/newsletter-mail"
import { resetNewsletterQuotaForTests } from "../lib/newsletter-quota"
import { runNewsletterWeekly } from "../lib/newsletter-weekly"
import { GET as unsubscribeGet, POST as unsubscribePost } from "../app/api/newsletter/unsubscribe/route"
import { GET, handleNewsletterCron } from "../app/api/cron/newsletter-weekly/route"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

function row(overrides: Partial<NewsletterSourceRow> & Pick<NewsletterSourceRow, "name" | "slug">): NewsletterSourceRow {
  return {
    borough: "Manhattan",
    neighborhood: "East Village",
    inspection_grade: "A",
    inspection_date: "11/19/2026",
    is_published: true,
    ...overrides,
  }
}

const secret = "weekly-secret"

async function main() {
process.env.CRON_SECRET = secret

assert(parseInspectionDay("11/19/2026") === "2026-11-19", "M/D/YYYY parses to an ISO day")
assert(parseInspectionDay("9/2/2026") === "2026-09-02", "single-digit month and day parse")
assert(parseInspectionDay(" 10/1/2026 ") === "2026-10-01", "surrounding spaces are ignored")
assert(parseInspectionDay("2/31/2026") === null, "February 31 does not roll into March")
assert(parseInspectionDay("13/1/2026") === null, "month 13 is rejected")
assert(parseInspectionDay("11/19/1999") === null, "years before 2000 are rejected")
assert(parseInspectionDay("") === null, "an empty date is rejected")
assert(parseInspectionDay(null) === null, "a missing date is rejected")
assert(parseInspectionDay("2026-11-19") === "2026-11-19", "ISO dates still parse")
assert(parseInspectionDay("2026-02-31") === null, "an overflowing ISO date is rejected")

const stored = ["9/30/2026", "10/1/2026"]
assert([...stored].sort().reverse()[0] === "9/30/2026", "string sort treats September as later than October")
assert(parseInspectionDay("10/1/2026")! > parseInspectionDay("9/30/2026")!, "parsed October is after parsed September")

assert(new Date(Date.UTC(2026, 10, 19)).getUTCDay() === 4, "November 19, 2026 is a Thursday")
assert(thursdayOnOrBefore("2026-11-19") === "2026-11-19", "a Thursday stays on that Thursday")
assert(thursdayOnOrBefore("2026-11-18") === "2026-11-12", "Wednesday maps back to the previous Thursday")
assert(currentIssueDate(new Date("2026-11-19T14:00:00.000Z")) === "2026-11-19", "the Thursday cron uses that Thursday")
assert(issueWindow("2026-11-19").start === "2026-11-13", "the window is seven days including the issue date")
assert(issueWindow("2026-11-19").end === "2026-11-19", "the window ends on the issue date")
assert(addIsoDays("2026-11-13", -1) === "2026-11-12", "day math does not depend on string order")

assert(isIssueDate("2026-11-19", new Date("2026-11-19T14:00:00.000Z")), "the current Thursday is a public issue date")
assert(!isIssueDate("2026-11-18", new Date("2026-11-19T14:00:00.000Z")), "a Wednesday is not an issue date")
assert(!isIssueDate("2026-11-26", new Date("2026-11-19T14:00:00.000Z")), "a future Thursday is not public yet")
assert(!isIssueDate("2026-02-31", new Date("2026-11-19T14:00:00.000Z")), "an impossible date is not an issue date")
assert(!GRADE_CHANGE_HISTORY, "grade-change history is not available")

const week = buildNewsletterIssue(
  [
    row({ name: "Ninth", slug: "ninth", inspection_date: "11/9/2026" }),
    row({ name: "Tenth", slug: "tenth", inspection_date: "11/10/2026", neighborhood: "Hell's Kitchen" }),
    row({ name: "Too Early", slug: "too-early", inspection_date: "11/5/2026" }),
    row({ name: "Too Late", slug: "too-late", inspection_date: "11/13/2026" }),
    row({ name: "Grade B", slug: "grade-b", inspection_grade: "B", inspection_date: "11/10/2026" }),
    row({ name: "Hidden", slug: "hidden", is_published: false, inspection_date: "11/10/2026" }),
    row({ name: "Overflow", slug: "overflow", inspection_date: "2/31/2026" }),
    row({ name: "A & B <Cafe>", slug: "amp-cafe", inspection_date: "11/10/2026", neighborhood: "Hell's Kitchen", inspection_score: 9 }),
  ],
  "2026-11-12"
)

assert(week.gradeA.map((item) => item.name).join("|") === "A & B <Cafe>|Tenth|Ninth", "parsed dates sort newest first, not as strings")
assert(!week.gradeA.some((item) => item.slug === "too-early"), "the day before the window is excluded")
assert(!week.gradeA.some((item) => item.slug === "too-late"), "the day after the window is excluded")
assert(!week.gradeA.some((item) => item.slug === "grade-b"), "grade B is excluded")
assert(!week.gradeA.some((item) => item.slug === "hidden"), "unpublished listings are excluded")
assert(!week.gradeA.some((item) => item.slug === "overflow"), "an overflow inspection date is excluded")
assert(week.gradeChanges === null, "the issue does not invent grade changes")
assert(week.campaign === "grade-a-weekly-2026-11-12", "the campaign is the issue date")
assert(
  week.gradeA[1].href ===
    "https://www.eatrealfoodnyc.com/restaurants/tenth?utm_source=newsletter&utm_medium=email&utm_campaign=grade-a-weekly-2026-11-12",
  "listing links carry the newsletter campaign"
)
assert(week.html.includes("A &amp; B &lt;Cafe&gt;"), "restaurant names are escaped in HTML")
assert(week.text.includes("A & B <Cafe>"), "the plain-text version keeps the restaurant name")
assert(week.html.includes("inspection score 9"), "a real inspection score is included")
assert(week.html.includes("New Grade A"), "a non-empty grade A section is labeled")
assert(!week.html.includes("Grade change") && !week.text.includes("Grade change"), "no grade-change section is rendered")
assert(!week.html.includes("$") && !week.text.includes("$"), "the issue has no prices")
assert(week.html.includes("Sponsored") && week.text.includes("Sponsored"), "the sponsor slot is labeled Sponsored")
assert(week.html.includes(NEWSLETTER_SPONSOR_TEXT), "the unsold slot is the house ad")
assert(week.sponsored.href.includes("/partner-with-us") && week.sponsored.href.includes("#more-ways"), "the house ad links to the partner anchor")
assert(week.sponsored.href.includes("utm_campaign=grade-a-weekly-2026-11-12"), "the house ad keeps the campaign")
assert(
  week.gradeA[0].href.includes("/restaurants/amp-cafe"),
  "Hell's Kitchen listing still links to the restaurant slug"
)
assert(
  week.neighborhoodPick?.href.includes("/nyc/manhattan/hells-kitchen/healthy-restaurants"),
  "the neighborhood pick uses the healthy-restaurants hub"
)
assert(week.neighborhoodPick?.neighborhood === "Hell's Kitchen", "the pick is the neighborhood with the most new Grade A listings")
assert(week.neighborhoodPick?.count === 2, "East Village has one listing and Hell's Kitchen has two")

const tied = buildNewsletterIssue(
  [
    row({ name: "One", slug: "one", neighborhood: "Williamsburg", borough: "Brooklyn", inspection_date: "11/18/2026" }),
    row({ name: "Two", slug: "two", neighborhood: "Williamsburg", borough: "Brooklyn", inspection_date: "11/17/2026" }),
    row({ name: "Three", slug: "three", neighborhood: "Astoria", borough: "Queens", inspection_date: "11/18/2026" }),
    row({ name: "Four", slug: "four", neighborhood: "Astoria", borough: "Queens", inspection_date: "11/16/2026" }),
  ],
  "2026-11-19"
)
assert(tied.neighborhoodPick?.neighborhood === "Astoria", "a count tie breaks alphabetically by neighborhood")
assert(tied.neighborhoodPick?.borough === "Queens", "the alphabetical pick keeps its borough")

const sameName = buildNewsletterIssue(
  [
    row({ name: "Uptown", slug: "uptown", neighborhood: "Chelsea", borough: "Manhattan" }),
    row({ name: "Downtown", slug: "downtown", neighborhood: "Chelsea", borough: "Brooklyn" }),
  ],
  "2026-11-19"
)
assert(sameName.neighborhoodPick?.borough === "Brooklyn", "the same neighborhood name in two boroughs stays two groups")

const noPlace = buildNewsletterIssue(
  [
    row({ name: "Somewhere", slug: "somewhere", neighborhood: null, borough: null }),
    row({ name: "Placed", slug: "placed", neighborhood: "Boerum Hill", borough: "Brooklyn" }),
  ],
  "2026-11-19"
)
assert(noPlace.gradeA.length === 2, "a listing without a neighborhood still appears")
assert(noPlace.neighborhoodPick?.neighborhood === "Boerum Hill", "the pick ignores listings with no neighborhood")

const empty = buildNewsletterIssue([], "2026-11-19")
assert(empty.gradeA.length === 0 && empty.neighborhoodPick === null, "an empty week has no pick")
assert(!empty.html.includes("New Grade A") && !empty.text.includes("New Grade A"), "an empty grade A section is omitted")
assert(!empty.html.includes("Neighborhood pick") && !empty.text.includes("Neighborhood pick"), "an empty neighborhood pick is omitted")
assert(empty.html.includes("Sponsored") && empty.html.includes(NEWSLETTER_SPONSOR_TEXT), "an empty week still carries the house ad")
assert(empty.text.includes("No published restaurant has a current NYC DOHMH Grade A"), "an empty week says so")

const monthOrder = buildNewsletterIssue(
  [
    row({ name: "September", slug: "september", inspection_date: "9/30/2026" }),
    row({ name: "October", slug: "october", inspection_date: "10/1/2026" }),
  ],
  "2026-10-02"
)
assert(monthOrder.gradeA.map((item) => item.name).join("|") === "October|September", "October sorts ahead of September")

const archiveNow = new Date("2026-11-18T15:00:00.000Z")
const archive = summarizeNewsletterArchive(
  [
    row({ name: "Last", slug: "last", inspection_date: "11/12/2026" }),
    row({ name: "Next", slug: "next", inspection_date: "11/13/2026" }),
  ],
  archiveNow
)
assert(archive[0].date === "2026-11-12", "on Wednesday the archive leads with the latest Thursday")
assert(archive.some((entry) => entry.date === "2026-11-12" && entry.gradeACount === 1), "November 12 includes its own inspection")
assert(!archive.some((entry) => entry.date === "2026-11-19"), "an inspection after this Thursday waits for the next issue")
assert(archivedIssueDates(["11/12/2026"], archiveNow).includes("2026-11-12"), "archived dates include the current Thursday")

const title = fitTitle([issuePageTitle("2026-11-19")], { allowBrand: true })
assert(title.length <= 60, `issue title is ${title.length} characters`)
assert(title.includes("Eat Real Food NYC"), "issue title keeps the brand")
assert(issuePageDescription("2026-11-19").length <= DESCRIPTION_MAX, "issue description stays within 160 characters")
assert(
  archivePageDescription() ===
    "Weekly Grade A roundups, rebuilt from published listings and the NYC DOHMH inspection date on each one. The email edition started in November 2026.",
  "the archive description names roundups and the November 2026 email start"
)
assert(archivePageDescription().length <= DESCRIPTION_MAX, "archive description stays within 160 characters")
assert(
  "A weekly email of NYC restaurants newly showing a NYC DOHMH Grade A, plus that week's neighborhood. Confirm by email.".length <= DESCRIPTION_MAX,
  "newsletter page description stays within 160 characters"
)

const schema = newsletterWebPageSchema({
  name: "Grade A Eats This Week: November 19, 2026",
  description: issuePageDescription("2026-11-19"),
  path: "/newsletter/issues/2026-11-19",
})
assert(schema["@type"] === "WebPage", "archive schema is a WebPage")
assert(!JSON.stringify(schema).includes("NewsArticle"), "archive schema is not a NewsArticle")
assert(!JSON.stringify(schema).includes("Organization"), "archive schema does not add Organization")
assert(!JSON.stringify(schema).includes('"@type":"Article"'), "archive schema is not an Article")

const markup = renderToStaticMarkup(createElement(NewsletterIssueView, { issue: week }))
assert(markup.includes("Grade A Eats This Week"), "the archive view renders the issue title")
assert(markup.includes("A &amp; B &lt;Cafe&gt;"), "the archive view includes the restaurant name")
assert(markup.includes(">Sponsored<"), "the archive view labels the sponsor slot")
assert(markup.includes(NEWSLETTER_SPONSOR_TEXT), "the archive view shows the house ad")
assert(markup.includes("hells-kitchen/healthy-restaurants"), "the archive view links the neighborhood hub")
assert(!markup.includes("utm_medium"), "the archive page links are clean, without email campaign parameters")
assert(markup.includes('href="/partner-with-us#more-ways"'), "the archive house ad uses the partner anchor")
assert(!markup.includes("Grade change") && !markup.includes("$"), "the archive view has no grade changes and no prices")
const emptyMarkup = renderToStaticMarkup(createElement(NewsletterIssueView, { issue: empty }))
assert(!emptyMarkup.includes("New Grade A") && !emptyMarkup.includes("Neighborhood pick"), "the archive view omits empty sections")
assert(emptyMarkup.includes("Sponsored"), "the archive view keeps the sponsor slot when the week is empty")

const partnerPage = readFileSync(new URL("../app/partner-with-us/page.tsx", import.meta.url), "utf8")
assert(partnerPage.includes('id="more-ways"'), "the partner page exposes the more-ways anchor")
const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8")
assert(vercel.includes('"/api/cron/newsletter-weekly"') && vercel.includes('"0 14 * * 4"'), "Thursday 14:00 UTC is scheduled")

resetNewsletterQuotaForTests()
const calls: unknown[] = []
const delivery = await deliverNewsletterIssue({
  emails: ["ok@example.com", "bad@example.com", "also@example.com", "ok@example.com", "not-an-email"],
  subject: week.subject,
  html: week.html,
  text: week.text,
  post: async (_path, body) => {
    calls.push(body)
    const batch = body as Array<{ to: string[]; html: string; headers: Record<string, string> }>
    if (batch.some((item) => item.to[0] === "bad@example.com")) {
      if (batch.length === 1) return { status: 422, dailyUsed: null, dailyExceeded: false }
      return { status: 400, dailyUsed: null, dailyExceeded: false }
    }
    return { status: 200, dailyUsed: null, dailyExceeded: false }
  },
})
assert(delivery.sent === 2 && delivery.failed === 1, "one rejected recipient does not drop the rest")
assert(delivery.skipped === 2, "a duplicate and an invalid address are skipped")
assert(calls.length === 4, "a rejected batch is retried per recipient")
const first = calls[0] as Array<{ html: string; headers: Record<string, string> }>
assert(first[0].headers["List-Unsubscribe-Post"] === "List-Unsubscribe=One-Click", "issues send the one-click header")
assert(first[0].headers["List-Unsubscribe"].includes("/api/newsletter/unsubscribe?token="), "the header points at the one-click route")
assert(first[0].html.includes("/newsletter/unsubscribe?token="), "the message body links to the unsubscribe page")
assert(!JSON.stringify(calls).includes(secret), "batch payloads do not contain the signing secret")

resetNewsletterQuotaForTests()
let threw = false
try {
  const crashed = await deliverNewsletterIssue({
    emails: ["one@example.com", "two@example.com"],
    subject: "Grade A Eats This Week",
    html: "<p>Hi</p>",
    text: "Hi",
    post: async () => {
      throw new Error("resend down")
    },
  })
  assert(crashed.sent === 0 && crashed.failed === 2, "a thrown send is counted as failed")
} catch {
  threw = true
}
assert(!threw, "a send failure does not escape the batch sender")

const dryEmails: string[] = []
const dry = await runNewsletterWeekly({
  now: new Date("2026-11-19T14:00:00.000Z"),
  dry: true,
  loadRestaurants: async () => [row({ name: "Dry Run Cafe", slug: "dry-run-cafe" })],
  loadConfirmedEmails: async () => ["reader@example.com"],
  deliver: async (input) => {
    dryEmails.push(...input.emails)
    return { sent: input.emails.length, failed: 0, skipped: 0, capped: false }
  },
})
assert(dry.dryRun && dry.sent === 0 && dryEmails.length === 0, "dry run renders the issue and does not send")
assert(dry.html.includes("Dry Run Cafe"), "dry run HTML includes the week's restaurant")
assert(dry.gradeChanges === null, "dry run does not add grade changes")

let noopDelivered = false
const noop = await runNewsletterWeekly({
  now: new Date("2026-11-19T14:00:00.000Z"),
  loadRestaurants: async () => [],
  loadConfirmedEmails: async () => [],
  deliver: async () => {
    noopDelivered = true
    return { sent: 1, failed: 0, skipped: 0, capped: false }
  },
})
assert(noop.noop && noop.confirmed === 0 && noop.sent === 0 && !noopDelivered, "zero confirmed subscribers is a no-op")

let sendThrew = false
try {
  const failedRun = await runNewsletterWeekly({
    now: new Date("2026-11-19T14:00:00.000Z"),
    loadRestaurants: async () => [],
    loadConfirmedEmails: async () => ["reader@example.com"],
    deliver: async () => {
      throw new Error("resend down")
    },
  })
  assert(failedRun.failed === 1 && failedRun.sent === 0, "a thrown delivery is reported as a failure")
} catch {
  sendThrew = true
}
assert(!sendThrew, "the weekly runner does not throw when delivery throws")

const denied = await GET(new Request("https://www.eatrealfoodnyc.com/api/cron/newsletter-weekly?dry=1"))
assert(denied.status === 401, "dry run without CRON_SECRET is rejected")
const wrong = await GET(new Request("https://www.eatrealfoodnyc.com/api/cron/newsletter-weekly?dry=1", {
  headers: { authorization: "Bearer no" },
}))
assert(wrong.status === 401, "a wrong bearer token is rejected")

const logs: string[] = []
const originalInfo = console.info
console.info = (message?: unknown) => {
  logs.push(String(message))
}
try {
  const dryResponse = await handleNewsletterCron(
    new Request("https://www.eatrealfoodnyc.com/api/cron/newsletter-weekly?dry=1", {
      headers: { authorization: `Bearer ${secret}` },
    }),
    async (options) => {
      assert(options?.dry === true, "the route passes dry=1 through")
      return { ...dry, dryRun: true }
    }
  )
  assert(dryResponse.status === 200, "an authorized dry run returns 200")
  const dryBody = (await dryResponse.json()) as { dryRun: boolean; html: string; gradeChanges: null; sent: number }
  assert(dryBody.dryRun && dryBody.sent === 0 && dryBody.gradeChanges === null, "the dry run JSON does not send and has no grade changes")
  assert(dryBody.html.includes("Dry Run Cafe"), "the dry run JSON includes the rendered HTML")

  const liveResponse = await handleNewsletterCron(
    new Request("https://www.eatrealfoodnyc.com/api/cron/newsletter-weekly", {
      headers: { authorization: `Bearer ${secret}` },
    }),
    async (options) => {
      assert(options?.dry === false, "a live cron is not a dry run")
      return { ...noop, dryRun: false }
    }
  )
  const liveBody = (await liveResponse.json()) as { noop: boolean; confirmed: number; html?: string }
  assert(liveResponse.status === 200 && liveBody.noop && liveBody.confirmed === 0, "the live cron reports the no-op")
  assert(liveBody.html === undefined, "the live response does not dump the HTML")
} finally {
  console.info = originalInfo
}
assert(logs.some((line) => line.includes("no confirmed subscribers")), "zero confirmed subscribers is logged")
assert(logs.some((line) => line.includes("dry run")), "a dry run is logged")
assert(logs.every((line) => !line.includes(secret)), "cron logs do not include the secret")

const redirect = await unsubscribeGet(new Request("https://www.eatrealfoodnyc.com/api/newsletter/unsubscribe?token=abc"))
assert(redirect.status === 303, "a header click redirects to the unsubscribe page")
const location = redirect.headers.get("location") ?? ""
assert(location.includes("/newsletter/unsubscribe?token=abc"), "the redirect keeps the token")

const badPost = await unsubscribePost(new Request("https://www.eatrealfoodnyc.com/api/newsletter/unsubscribe?token=nope", {
  method: "POST",
  body: "List-Unsubscribe=One-Click",
}))
assert(badPost.status === 400, "a one-click post with a bad token is rejected")

const indexNow = new Date("2026-11-19T14:00:00.000Z")
assert(NEWSLETTER_RECENT_WEEKS === 12, "the recent window is twelve weeks")
assert(NEWSLETTER_INDEX_MIN_GRADE_A === 3, "indexing requires three Grade A listings")
assert(recentNewsletterIssueStart(indexNow) === "2026-09-03", "twelve Thursdays ending November 19 start on September 3")
assert(isNewsletterIssueIndexable("2026-11-19", 3, indexNow), "the current Thursday with three listings is indexable")
assert(isNewsletterIssueIndexable("2026-09-03", 3, indexNow), "the oldest of the twelve weeks with three listings is indexable")
assert(!isNewsletterIssueIndexable("2026-08-27", 10, indexNow), "the Thursday before the window stays out of the index")
assert(!isNewsletterIssueIndexable("2026-11-19", 2, indexNow), "two listings are below the minimum")
assert(!isNewsletterIssueIndexable("2026-10-08", 2, indexNow), "a recent week with two listings is not indexable")
assert(!isNewsletterIssueIndexable("2026-11-19", 0, indexNow), "an empty current week is not indexable")
assert(isNewsletterIssueIndexable("2026-11-12", 3, indexNow), "three listings is enough")
assert(!isNewsletterIssueIndexable("2026-11-18", 5, indexNow), "a Wednesday is not an issue date")
assert(!isNewsletterIssueIndexable("2026-11-26", 5, indexNow), "a future Thursday is not indexable")
assert(!isNewsletterIssueIndexable("2026-02-31", 5, indexNow), "an impossible date is not indexable")
assert(!isNewsletterIssueIndexable("2026-11-19", 2.5, indexNow), "a fractional count is not indexable")
assert(!isNewsletterIssueIndexable("2026-11-19", Number.NaN, indexNow), "NaN is not indexable")
assert(!isNewsletterIssueIndexable("2022-07-07", 1, indexNow), "a one-listing week from 2022 is not indexable")

const wednesday = new Date("2026-11-18T15:00:00.000Z")
assert(recentNewsletterIssueStart(wednesday) === "2026-08-27", "on Wednesday the window ends on the previous Thursday")
assert(isNewsletterIssueIndexable("2026-08-27", 3, wednesday), "that window includes August 27 when it has three listings")
assert(!isNewsletterIssueIndexable("2026-11-19", 5, wednesday), "next Thursday is not indexable yet")
assert(!isNewsletterIssueIndexable("2026-08-20", 9, wednesday), "the Thursday before that window is excluded")

const windowDates: string[] = []
for (let date = currentIssueDate(indexNow); date >= recentNewsletterIssueStart(indexNow); date = addIsoDays(date, -7)) {
  windowDates.push(date)
}
assert(windowDates.length === 12, "the window contains twelve Thursdays")
assert(
  windowDates.every((date) => isNewsletterIssueIndexable(date, NEWSLETTER_INDEX_MIN_GRADE_A, indexNow)),
  "every Thursday in the window is indexable at the minimum count"
)
assert(
  !isNewsletterIssueIndexable(addIsoDays(windowDates[windowDates.length - 1], -7), 3, indexNow),
  "one Thursday earlier is not indexable"
)

const archiveEntries = [
  ...windowDates.map((date) => ({ date })),
  { date: "2026-08-27" },
]
const parts = partitionNewsletterArchive(archiveEntries, indexNow)
assert(parts.recent.length === 12 && parts.older.length === 1, "the archive split keeps twelve recent weeks and the rest")
assert(parts.recent[0].date === "2026-11-19" && parts.older[0].date === "2026-08-27", "newest stays first and August 27 is older")

const indexRows = [
  row({ name: "Nov A", slug: "nov-a", inspection_date: "11/12/2026" }),
  row({ name: "Nov B", slug: "nov-b", inspection_date: "11/11/2026" }),
  row({ name: "Nov C", slug: "nov-c", inspection_date: "11/10/2026" }),
  row({ name: "Oct A", slug: "oct-a", inspection_date: "10/8/2026" }),
  row({ name: "Oct B", slug: "oct-b", inspection_date: "10/7/2026" }),
  row({ name: "Aug A", slug: "aug-a", inspection_date: "8/27/2026" }),
  row({ name: "Aug B", slug: "aug-b", inspection_date: "8/26/2026" }),
  row({ name: "Aug C", slug: "aug-c", inspection_date: "8/25/2026" }),
]
const candidateDates = archivedIssueDates(indexRows.map((item) => item.inspection_date), indexNow)
const countedIndexable = candidateDates.filter((date) =>
  isNewsletterIssueIndexable(date, buildNewsletterIssue(indexRows, date).gradeA.length, indexNow)
)
const probedIndexable = candidateDates.flatMap((date) => {
  if (!isNewsletterIssueIndexable(date, NEWSLETTER_INDEX_MIN_GRADE_A, indexNow)) return []
  const gradeACount = buildNewsletterIssue(indexRows, date).gradeA.length
  return isNewsletterIssueIndexable(date, gradeACount, indexNow) ? [date] : []
})
assert(countedIndexable.join("|") === "2026-11-12", "only the recent week with three listings is indexable")
assert(probedIndexable.join("|") === countedIndexable.join("|"), "the sitemap probe matches a full count")
assert(!countedIndexable.includes("2026-10-08"), "October 8 has two listings and stays out")
assert(!countedIndexable.includes("2026-08-27"), "August 27 has three listings and is still outside the window")
assert(!countedIndexable.includes("2026-11-19"), "the empty current Thursday is not indexable")

function robotsOf(meta: { robots?: unknown }): { index?: boolean; follow?: boolean; googleBot?: { index?: boolean; follow?: boolean } } {
  const robots = meta.robots
  if (!robots || typeof robots !== "object") throw new Error("missing robots")
  return robots as { index?: boolean; follow?: boolean; googleBot?: { index?: boolean; follow?: boolean } }
}

const indexedMeta = pageMeta({
  path: "/newsletter/issues/2026-11-12",
  title: issuePageTitle("2026-11-12"),
  description: issuePageDescription("2026-11-12"),
  index: isNewsletterIssueIndexable("2026-11-12", 3, indexNow),
})
const hiddenMeta = pageMeta({
  path: "/newsletter/issues/2026-08-27",
  title: issuePageTitle("2026-08-27"),
  description: issuePageDescription("2026-08-27"),
  index: isNewsletterIssueIndexable("2026-08-27", 6, indexNow),
})
const indexedRobots = robotsOf(indexedMeta)
const hiddenRobots = robotsOf(hiddenMeta)
assert(indexedRobots.index === true && indexedRobots.follow === true, "an indexable issue is index, follow")
const indexedCanonical = indexedMeta.alternates && "canonical" in indexedMeta.alternates ? indexedMeta.alternates.canonical : ""
assert(indexedCanonical === "https://www.eatrealfoodnyc.com/newsletter/issues/2026-11-12", "an issue canonical points at itself")
assert(hiddenRobots.index === false && hiddenRobots.follow === true, "an old issue is noindex, follow")
assert(hiddenRobots.googleBot?.index === false && hiddenRobots.googleBot?.follow === true, "googlebot follows noindex issues")
const hiddenCanonical = hiddenMeta.alternates && "canonical" in hiddenMeta.alternates ? hiddenMeta.alternates.canonical : ""
assert(hiddenCanonical === "https://www.eatrealfoodnyc.com/newsletter/issues/2026-08-27", "a noindex issue keeps a self canonical")
assert(issuePageTitle("2026-11-12") !== issuePageTitle("2026-09-03"), "issue titles differ by date")
assert(issuePageDescription("2026-11-12") !== issuePageDescription("2026-09-03"), "issue descriptions differ by date")

const archiveMarkup = renderToStaticMarkup(createElement(NewsletterArchiveList, {
  recent: [
    { date: "2026-11-12", label: "November 12, 2026", gradeACount: 3, neighborhood: "East Village", borough: "Manhattan" },
    { date: "2026-10-08", label: "October 8, 2026", gradeACount: 2, neighborhood: null, borough: null },
  ],
  older: [
    { date: "2026-08-27", label: "August 27, 2026", gradeACount: 6, neighborhood: "Astoria", borough: "Queens" },
  ],
}))
assert(archiveMarkup.includes("Recent weeks"), "recent weeks are labeled")
assert(archiveMarkup.includes("<details open"), "older weeks stay open in the HTML")
assert(archiveMarkup.includes("Older weekly roundups"), "older weeks have their heading")
assert(archiveMarkup.indexOf("/newsletter/issues/2026-11-12") < archiveMarkup.indexOf("Older weekly roundups"), "recent weeks come before older weeks")
assert(archiveMarkup.includes("3 new Grade A listings."), "a count of three is printed")
assert(archiveMarkup.includes("2 new Grade A listings."), "a thin week is still listed")
assert(archiveMarkup.includes("Neighborhood pick: East Village, Manhattan."), "the neighborhood pick is named")
assert(!archiveMarkup.includes("Past issues"), "the list does not call the weeks past email issues")

const onlyRecent = renderToStaticMarkup(createElement(NewsletterArchiveList, {
  recent: [{ date: "2026-11-12", label: "November 12, 2026", gradeACount: 0, neighborhood: null, borough: null }],
  older: [],
}))
assert(!onlyRecent.includes("<details"), "no older section when every week is recent")
assert(onlyRecent.includes("No new Grade A listings in this window."), "an empty week says so")

const scriptDir = dirname(fileURLToPath(import.meta.url))
const issuePageSource = readFileSync(join(scriptDir, "../app/newsletter/issues/[date]/page.tsx"), "utf8")
assert(issuePageSource.includes("isNewsletterIssueIndexable"), "issue metadata uses the indexing helper")
assert(issuePageSource.includes("issuePageTitle") && issuePageSource.includes("issuePageDescription"), "issue titles and descriptions stay unique per date")
const sitemapSource = readFileSync(join(scriptDir, "../app/sitemap.ts"), "utf8")
assert(sitemapSource.includes("isNewsletterIssueIndexable"), "the sitemap uses the indexing helper")
const archivePageSource = readFileSync(join(scriptDir, "../app/newsletter/issues/page.tsx"), "utf8")
assert(archivePageSource.includes("partitionNewsletterArchive"), "the archive page uses the same twelve-week split")
assert(archivePageSource.includes("archivePageDescription()"), "the archive page uses the shared description")
const newsletterPageSource = readFileSync(join(scriptDir, "../app/newsletter/page.tsx"), "utf8")
assert(newsletterPageSource.includes("The email edition started in November 2026."), "the newsletter page dates the email edition")
assert(!newsletterPageSource.includes("past edition"), "the newsletter page does not call the archive past editions")

console.log("\nNewsletter issue tests passed")
}

main()
