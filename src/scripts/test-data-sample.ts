import { PARTNER_INQUIRY_EMAIL } from "../config/contact"
import { DATA_PRODUCT, DOHMH_DATASET } from "../config/data-product"
import { getCanonicalUrl } from "../config/seo"
import { HIGH_SCORE } from "../lib/compliance-csv"
import { COMPLIANCE_FROM } from "../lib/compliance-mail"
import { DATA_SAMPLE_BUTTON, DATA_SAMPLE_MESSAGES, DATA_SAMPLE_NOTE, DATA_SAMPLE_SOURCES } from "../lib/data-sample-copy"
import {
  buildSampleRows,
  createAttemptLimiter,
  dataSampleSubmission,
  DATA_SAMPLE_DEDUPE_MS,
  DATA_SAMPLE_EMAIL_MAX,
  DATA_SAMPLE_LIMIT,
  DATA_SAMPLE_RATE_MAX,
  DATA_SAMPLE_RATE_WINDOW_MS,
  DATA_SAMPLE_SUBJECT,
  findDuplicateSample,
  isGradePendingSample,
  isHighScoreSample,
  isNotYetInspectedSample,
  maskEmail,
  presentSampleFact,
  dohmhSourceLine,
  sampleEmailText,
  validateDataSampleRequest,
  type SampleSourceRow,
} from "../lib/data-sample"
import { dataSampleMessage, sendDataSampleEmail } from "../lib/data-sample-mail"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
  console.log("ok: " + message)
}

assert(HIGH_SCORE === 28, "a high score starts at 28 violation points")
assert(DATA_SAMPLE_LIMIT === 10, "the sample is capped at 10 rows")
assert(DATA_SAMPLE_DEDUPE_MS === 24 * 60 * 60 * 1000, "the same email is deduped for 24 hours")
assert(DATA_SAMPLE_RATE_MAX === 5, "five sample requests are allowed in a window")
assert(DATA_SAMPLE_RATE_WINDOW_MS === 10 * 60 * 1000, "the sample rate window is 10 minutes")
assert(
  DATA_SAMPLE_NOTE === "Get one free sample: 10 current rows from this week's lead lists, sent once. No subscription.",
  "the form states the offer once, with no subscription"
)
assert(DATA_SAMPLE_BUTTON === "Email me a free sample", "the button asks for the sample by email")
assert(DATA_SAMPLE_SOURCES.data_page_top === "/data", "the top form is stored against /data")
assert(DATA_SAMPLE_SOURCES.data_page_bottom === "/data", "the bottom form is stored against /data")
assert(
  DATA_SAMPLE_SOURCES.grades_guide === "/guides/nyc-health-grades-explained",
  "the grades guide form stores that path"
)

const base: SampleSourceRow = {
  name: "Alpha Cafe",
  borough: "Brooklyn",
  neighborhood: "Williamsburg",
  inspection_grade: "A",
  inspection_score: 10,
  inspection_date: "11/01/2024",
  is_published: true,
}

assert(!isGradePendingSample(base), "Grade A is not grade pending")
assert(isGradePendingSample({ ...base, inspection_grade: "Z" }), "Z is grade pending")
assert(isGradePendingSample({ ...base, inspection_grade: "P" }), "P is grade pending")
assert(!isGradePendingSample({ ...base, inspection_grade: "Z", is_published: false }), "an unpublished Z is not in the sample")
assert(!isHighScoreSample(base), "10 points is not a high score")
assert(isHighScoreSample({ ...base, inspection_score: 28 }), "28 points is a high score")
assert(!isHighScoreSample({ ...base, inspection_score: 27 }), "27 points is not a high score")
assert(!isNotYetInspectedSample(base), "a dated Grade A is not not-yet-inspected")
assert(
  isNotYetInspectedSample({ ...base, inspection_date: null, inspection_grade: "N" }),
  "grade N with no date is not yet inspected"
)
assert(
  isNotYetInspectedSample({ ...base, inspection_date: "", inspection_grade: null }),
  "a blank date and a blank grade is not yet inspected"
)
assert(
  !isNotYetInspectedSample({ ...base, inspection_date: null, inspection_grade: "A" }),
  "Grade A with no date is not the not-yet-inspected list"
)
assert(
  !isNotYetInspectedSample({ ...base, inspection_date: null, inspection_grade: "Z" }),
  "grade Z stays on the grade-pending list"
)
assert(
  !isNotYetInspectedSample({ ...base, inspection_date: " ", inspection_grade: "N" }),
  "a whitespace date is not treated as missing"
)

const pendingHigh = buildSampleRows([
  { ...base, name: "Both Lists", inspection_grade: "Z", inspection_score: 40 },
])
assert(pendingHigh.length === 1 && pendingHigh[0].category === "grade-pending", "a pending high score is one grade-pending row")
assert(pendingHigh[0].name === "Both Lists", "the sample keeps the restaurant name")
assert(!("address" in pendingHigh[0]), "the sample row has no address field")
assert(
  Object.keys(pendingHigh[0]).sort().join() === "category,grade,name,place,score",
  "a sample row is category, name, place, grade, and score"
)

const scored = buildSampleRows([
  { ...base, name: "Low", inspection_grade: "Z", inspection_score: 2 },
  { ...base, name: "High", inspection_grade: "P", inspection_score: 30 },
  { ...base, name: "Missing", inspection_grade: "Z", inspection_score: null },
])
assert(scored.map((row) => row.name).join() === "High,Low,Missing", "grade-pending rows sort by score, blanks last")
assert(scored[2].score === "—", "a missing score is an em dash, not a zero")

const redacted = presentSampleFact(
  { name: "Alpha Cafe", borough: "Brooklyn", neighborhood: "Williamsburg", inspection_grade: "Z", inspection_score: 4 },
  true
)
assert(redacted.name === "A…", "the public table still reduces the name to its first letter")
assert(redacted.place === "Williamsburg, Brooklyn", "place is neighborhood and borough")
assert(redacted.grade === "Grade Pending", "Z is labeled Grade Pending")

const mixed = buildSampleRows([
  { ...base, name: "Opened", inspection_date: null, inspection_grade: "N", inspection_score: 28 },
  { ...base, name: "Quiet", inspection_date: null, inspection_grade: "N", inspection_score: null },
])
assert(mixed.length === 2, "a high-score uninspected row is kept, and so is a plain uninspected row")
assert(mixed[0].category === "high-score" && mixed[0].name === "Opened", "score 28 wins over not-yet-inspected")
assert(mixed[1].category === "not-yet-inspected" && mixed[1].name === "Quiet", "grade N with no score stays not yet inspected")

const manyPending = Array.from({ length: 12 }, (_, index) => ({
  ...base,
  name: `Pending ${String(index).padStart(2, "0")}`,
  inspection_grade: "Z",
  inspection_score: index,
}))
const capped = buildSampleRows(manyPending)
assert(capped.length === 10, "twelve pending rows cap at 10")
assert(capped[0].name === "Pending 11", "the highest pending score is first")
assert(capped.every((row) => manyPending.some((source) => source.name === row.name)), "every sample name comes from the input")

const highOnly = Array.from({ length: 6 }, (_, index) => ({
  ...base,
  name: `Score ${index}`,
  inspection_grade: "A",
  inspection_score: 28 + index,
}))
const quietOnly = Array.from({ length: 6 }, (_, index) => ({
  ...base,
  name: `New ${index}`,
  inspection_grade: "N",
  inspection_date: null,
  inspection_score: null,
}))
const filled = buildSampleRows([...highOnly, ...quietOnly])
assert(filled.length === 10, "a short pending list is filled from the other lists")
assert(filled.filter((row) => row.category === "high-score").length === 6, "all six high scores are used before more uninspected rows")
assert(filled.filter((row) => row.category === "not-yet-inspected").length === 4, "the rest of the ten rows are not yet inspected")
assert(buildSampleRows([]).length === 0, "an empty extract produces no rows")
assert(
  buildSampleRows([{ ...base, name: "   ", inspection_grade: "Z" }]).length === 0,
  "a blank name is left out"
)

const emailRows = buildSampleRows([{ ...base, inspection_grade: "Z", inspection_score: 4 }])
const text = sampleEmailText(emailRows)
assert(text.includes("Grade pending: Alpha Cafe — Williamsburg, Brooklyn — Grade Pending — score 4"), "the email line names the restaurant")
assert(!text.includes("A…"), "the email does not redact the name")
assert(text.includes("Here is 1 current row from this week's lead lists."), "the email counts the rows it actually contains")
assert(text.includes(DOHMH_DATASET.source), "the email cites DOHMH")
assert(text.includes(DOHMH_DATASET.name), "the email names the dataset")
assert(text.includes(DOHMH_DATASET.id), "the email includes the dataset id")
assert(!text.includes("rows updated"), "the email does not print a stored Open Data timestamp")
assert(!text.includes("2026-11-13T23:06:43Z"), "the email does not print the stale version date")
assert(text.includes(DOHMH_DATASET.url), "the email links the NYC Open Data source")
const datedMail = sampleEmailText(emailRows, undefined, "November 19, 2026")
assert(
  datedMail.includes("Newest inspection date on file: November 19, 2026."),
  "the email prints a live inspection date when one is passed"
)
assert(dohmhSourceLine() === `Source: ${DOHMH_DATASET.source}. Dataset: ${DOHMH_DATASET.name} (${DOHMH_DATASET.id}).`, "a missing inspection date is left off the source line")
assert(dohmhSourceLine("  ") === dohmhSourceLine(), "a blank inspection date is left off the source line")
assert(text.includes("Street addresses are not included."), "the email says addresses are omitted")
assert(text.includes(DATA_PRODUCT.stripePaymentLinkMonthly), "the email uses the monthly payment link")
assert(text.includes(DATA_PRODUCT.stripePaymentLinkYearly), "the email uses the yearly payment link")
assert(text.includes(`$${DATA_PRODUCT.priceMonthlyUsd}`), "the email shows the monthly price")
assert(text.includes(`$${DATA_PRODUCT.priceYearlyUsd}`), "the email shows the yearly price")
assert(text.includes(PARTNER_INQUIRY_EMAIL), "the email names the reply address")
assert(text.includes(getCanonicalUrl("/data")), "the email links the data page")
assert(!/subscriber/i.test(text), "the email does not invent a subscriber count")
assert(!/testimonial/i.test(text), "the email does not invent a testimonial")
assert(!/guaranteed/i.test(text), "the email does not guarantee a result")

const emptyMail = sampleEmailText([])
assert(emptyMail.includes("no published rows"), "an empty extract says so")
assert(!emptyMail.includes("Grade pending:"), "an empty extract does not invent a row")

const unsetLinks = sampleEmailText(emailRows, { monthly: "  ", yearly: "", monthlyPrice: 79, yearlyPrice: 790 })
assert(unsetLinks.includes("Payment link is not set."), "a blank payment link is not replaced with a new URL")
assert(!unsetLinks.includes("stripe.com"), "a blank payment link does not invent a Stripe URL")

const valid = validateDataSampleRequest({
  email: "  Ada@Example.com ",
  company: "  North Pest\n",
  sells: "pest control",
  source: "grades_guide",
  company_website: "   ",
})
assert(valid.ok === true, "a trimmed email is accepted")
if (valid.ok) {
  assert(valid.lead.email === "ada@example.com", "the email is stored in lower case")
  assert(valid.lead.company === "North Pest", "the company is one trimmed line")
  assert(valid.lead.sells === "pest control", "the note is kept")
  assert(valid.lead.sourcePath === "/guides/nyc-health-grades-explained", "the guide source stores the guide path")
  const stored = dataSampleSubmission(valid.lead)
  assert(stored.restaurant_slug === "/guides/nyc-health-grades-explained", "restaurant_slug is the source path")
  assert(stored.restaurant_name === "", "restaurant_name is empty")
  assert(stored.submission_type === "data_sample", "submission_type is data_sample")
  assert(stored.status === "pending", "the lead is pending")
  const parsed = JSON.parse(stored.content) as { email: string; company: string; sells: string; source_path: string }
  assert(parsed.email === "ada@example.com" && parsed.company === "North Pest", "content JSON keeps the lead fields")
  assert(parsed.sells === "pest control" && parsed.source_path === valid.lead.sourcePath, "content JSON keeps the note and path")
  assert(Object.keys(parsed).join() === "email,company,sells,source_path", "content JSON has the four lead fields")
}

const honeypot = validateDataSampleRequest({
  email: "not-an-email",
  company_website: "https://spam.example",
  source: "data_page_top",
})
assert(!honeypot.ok && honeypot.reason === "honeypot", "a filled honeypot is rejected before the email check")

const badEmail = validateDataSampleRequest({ email: "ada@example", source: "data_page_bottom" })
assert(!badEmail.ok && badEmail.reason === "email" && badEmail.error === DATA_SAMPLE_MESSAGES.invalid, "an email without a dot is rejected")
const missing = validateDataSampleRequest({ email: "", source: "data_page_top" })
assert(!missing.ok && missing.reason === "email", "a missing email is rejected")
const badSource = validateDataSampleRequest({ email: "ada@example.com", source: "homepage" })
assert(!badSource.ok && badSource.reason === "source", "an unknown source is rejected")
const longSells = validateDataSampleRequest({
  email: "ada@example.com",
  source: "data_page_top",
  sells: "x".repeat(161),
})
assert(!longSells.ok && longSells.reason === "length", "a long note is rejected")
const longEmail = validateDataSampleRequest({
  email: `${"a".repeat(DATA_SAMPLE_EMAIL_MAX)}@example.com`,
  source: "data_page_top",
})
assert(!longEmail.ok && longEmail.reason === "email", "an email over 254 characters is rejected")

const quoted = validateDataSampleRequest({
  email: "ada@example.com",
  company: 'Cafe "North"',
  source: "data_page_bottom",
})
assert(quoted.ok === true, "quotes in a company name are accepted")
if (quoted.ok) {
  const stored = dataSampleSubmission(quoted.lead)
  assert(stored.restaurant_slug === "/data", "the bottom form stores /data")
  assert(JSON.parse(stored.content).company === 'Cafe "North"', "quotes survive JSON storage")
}

assert(
  findDuplicateSample(['{"email":"Ada@Example.com","company":"","sells":"","source_path":"/data"}'], "ada@example.com"),
  "a duplicate matches the stored email ignoring case"
)
assert(!findDuplicateSample(['{"email":"other@example.com"}'], "ada@example.com"), "a different email is not a duplicate")
assert(!findDuplicateSample(["not json", ""], "ada@example.com"), "malformed content is not a duplicate")

const allow = createAttemptLimiter(2, 1000)
assert(allow("10.0.0.1", 0) && allow("10.0.0.1", 500), "two requests inside the window are allowed")
assert(!allow("10.0.0.1", 900), "the third request inside the window is rejected")
assert(allow("10.0.0.2", 900), "a different address has its own window")
assert(allow("10.0.0.1", 1500), "a request is allowed again after the window")

assert(maskEmail("ada@example.com") === "a***@example.com", "an email is masked to its first character")
assert(!maskEmail("ada@example.com").includes("ada@"), "the masked value is not the full address")
assert(maskEmail("not-an-email") === "***", "a value without a domain masks to asterisks")

const message = dataSampleMessage("ada@example.com", "Hello rows")
assert(message.from === COMPLIANCE_FROM, "the sample uses the compliance From address")
assert(message.from.includes("compliance@eatrealfoodnyc.com"), "the From mailbox is the compliance sender")
assert(message.reply_to === PARTNER_INQUIRY_EMAIL, "replies go to the partner inbox")
assert(message.subject === DATA_SAMPLE_SUBJECT, "the subject is the free sample")
assert(message.to.length === 1 && message.to[0] === "ada@example.com", "one recipient is the requester")
assert(!("html" in message), "the sample email is plain text")

async function main() {
  const previousKey = process.env.RESEND_API_KEY
  const previousFetch = global.fetch
  const previousWarn = console.warn
  const warnings: string[] = []
  console.warn = (value?: unknown) => {
    warnings.push(String(value))
  }
  try {
    delete process.env.RESEND_API_KEY
    let called = false
    global.fetch = async () => {
      called = true
      return new Response("{}", { status: 200 })
    }
    const skipped = await sendDataSampleEmail("ada@example.com", "Hello rows")
    assert(skipped === "skipped" && !called, "a missing API key does not call Resend")
    assert(warnings.length === 1, "a missing API key logs one warning")
    assert(warnings[0].includes("missing_api_key"), "the warning names the missing key")
    assert(warnings[0].includes("a***@example.com"), "the warning masks the email")
    assert(!warnings[0].includes("ada@example.com"), "the warning does not include the full email")

    warnings.length = 0
    process.env.RESEND_API_KEY = "re_test_key"
    let auth = ""
    let body = ""
    global.fetch = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      auth = headers.Authorization
      body = String(init?.body)
      return new Response("{}", { status: 500 })
    }
    const failed = await sendDataSampleEmail("ada@example.com", "Hello rows")
    assert(failed === "failed", "a Resend error is a failed send")
    assert(auth === "Bearer re_test_key", "the request uses the Resend key")
    assert(body.includes("compliance@eatrealfoodnyc.com"), "the payload uses the compliance From address")
    assert(body.includes(PARTNER_INQUIRY_EMAIL), "the payload sets reply_to")
    assert(!body.includes("re_test_key"), "the message body does not contain the API key")
    assert(warnings.some((line) => line.includes("data_sample_email_failed") && !line.includes("ada@example.com")), "a failed send logs a masked warning")

    warnings.length = 0
    global.fetch = async () => {
      throw new Error("network")
    }
    const dropped = await sendDataSampleEmail("ada@example.com", "Hello rows")
    assert(dropped === "failed", "a network error is a failed send and does not throw")
    assert(warnings.some((line) => !line.includes("ada@example.com")), "a network warning masks the email")
  } finally {
    console.warn = previousWarn
    global.fetch = previousFetch
    if (previousKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = previousKey
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "data sample test failed")
  process.exit(1)
})
