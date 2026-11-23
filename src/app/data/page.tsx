import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import { DATA_SAMPLE_LIMIT, dohmhSourceLine, presentSampleFact } from "@/lib/data-sample"
import { loadNewestInspectionLabel } from "@/lib/data-sample-query"
import { HIGH_SCORE } from "@/lib/compliance-csv"
import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import DataProductCta, { DataHeroCta } from "@/components/data-product-cta"
import DataSampleForm from "@/components/data-sample-form"
import { DATA_PRODUCT, DOHMH_DATASET } from "@/config/data-product"

export const revalidate = 86400

const title = buildPipeTitle(DATA_PRODUCT.name, null)

export const metadata = pageMeta({
  path: "/data",
  title,
  description:
    "A Monday email with two CSVs: NYC inspection leads and new openings. $79 a month or $790 a year. Built from DOHMH dataset 43nn-pn8j.",
})

type SampleRow = {
  label: string
  name: string
  place: string
  grade: string
  score: string
}

export default async function DataProductPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>
}) {
  const { subscribed } = await searchParams
  const purchaseConfirmed = subscribed === "1"
  const [pending, highScore, closed, notInspected, pendingRows, highRows, uninspectedRows, newestInspectionLabel] =
    await Promise.all([
    prisma.restaurant.count({ where: { inspection_grade: { in: ["Z", "P"] } } }),
    prisma.restaurant.count({ where: { inspection_score: { gte: HIGH_SCORE } } }),
    prisma.restaurant.count({ where: { NOT: { business_status: "OPERATIONAL" } } }),
    prisma.restaurant.count({
      where: {
        is_published: true,
        inspection_date: null,
        OR: [{ inspection_grade: null }, { inspection_grade: "" }, { inspection_grade: "N" }],
      },
    }),
    prisma.restaurant.findMany({
      where: { is_published: true, inspection_grade: { in: ["Z", "P"] } },
      select: { name: true, borough: true, neighborhood: true, inspection_grade: true, inspection_score: true },
      orderBy: { inspection_score: "desc" },
      take: 3,
    }),
    prisma.restaurant.findMany({
      where: { is_published: true, inspection_score: { gte: HIGH_SCORE } },
      select: { name: true, borough: true, neighborhood: true, inspection_grade: true, inspection_score: true },
      orderBy: { inspection_score: "desc" },
      take: 3,
    }),
    prisma.restaurant.findMany({
      where: {
        is_published: true,
        inspection_date: null,
        OR: [{ inspection_grade: null }, { inspection_grade: "" }, { inspection_grade: "N" }],
      },
      select: { name: true, borough: true, neighborhood: true, inspection_grade: true, inspection_score: true },
      take: 3,
    }),
    loadNewestInspectionLabel(),
  ])

  const rows: SampleRow[] = [
    ...pendingRows.map((row) => toSample(row, "Grade pending")),
    ...highRows.map((row) => toSample(row, "High score")),
    ...uninspectedRows.map((row) => toSample(row, "Not yet inspected")),
  ]

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Data", path: "/data" }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-8 sm:pb-10 sm:pt-10">
          <p className="eyebrow">{DATA_PRODUCT.name}</p>
          <h1 className="display-2 mt-3">Reach NYC restaurants the week they need help.</h1>
          <p className="dek mt-4">
            Every Monday, get a CSV of restaurants with Grade Pending, high scores, or closed status, plus new openings not yet inspected.
          </p>
          {purchaseConfirmed ? (
            <p
              role="status"
              className="mt-6 border px-5 py-4 text-base leading-relaxed"
              style={{ borderColor: "var(--color-jade)", backgroundColor: "#fff", color: "var(--color-forest)" }}
            >
              Thanks. Your subscription is confirmed.
            </p>
          ) : null}
          <DataHeroCta />
          <section aria-labelledby="what-you-get" className="mt-8">
            <h2 id="what-you-get" className="eyebrow">What you get</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed sm:text-base">
              <li>
                <span className="font-semibold" style={{ color: "var(--color-forest)" }}>Inspection leads CSV: </span>
                Grade Pending (city codes Z and P), {HIGH_SCORE}+ violation points (the Grade C threshold), or closed status — today {countLabel(pending, "grade-pending row", "grade-pending rows")} and {countLabel(highScore, "high-score row", "high-score rows")}.
              </li>
              <li>
                <span className="font-semibold" style={{ color: "var(--color-forest)" }}>New openings CSV: </span>
                published listings not yet inspected — today {countLabel(notInspected, "row", "rows")}.
              </li>
              <li>
                <span className="font-semibold" style={{ color: "var(--color-forest)" }}>Fast start: </span>
                {DATA_SAMPLE_LIMIT} real rows arrive by email right away; paid lists land every Monday; source NYC Open Data {DOHMH_DATASET.id}, refreshed daily.
              </li>
            </ul>
          </section>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <div id="free-sample" className="scroll-mt-24">
          <DataSampleForm source="data_page_top" variant="full" idPrefix="data-sample-top" />
        </div>
        <p className="mt-8 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
          See {DATA_SAMPLE_LIMIT} real rows free first, no card needed. If you subscribe, cancel anytime by email to{" "}
          <a
            href={`mailto:${PARTNER_INQUIRY_EMAIL}`}
            className="underline underline-offset-4"
            style={{ color: "var(--color-jade)" }}
          >
            {PARTNER_INQUIRY_EMAIL}
          </a>
          .
        </p>
        <DataProductCta />
      </div>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="h2-serif">What is in the email</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="border p-5" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
            <h3 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>Inspection leads</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Grade pending (city codes Z and P), high score (28 or more violation points, the city&apos;s Grade C threshold), and closed (any business status other than operational). This database currently has {pending.toLocaleString("en-US")} grade-pending rows, {highScore.toLocaleString("en-US")} high-score rows, and {closed.toLocaleString("en-US")} non-operational rows.
            </p>
          </section>
          <section className="border p-5" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
            <h3 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>New openings</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Pre-permit listings and restaurants not yet inspected. This directory does not store a pre-permit flag, so that column is specified and left empty. Not-yet-inspected means a published listing with no inspection date and no A, B, or C: {notInspected.toLocaleString("en-US")} rows.
            </p>
          </section>
        </div>

        <h2 className="h2-serif mt-12">Redacted sample</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          These rows are from the live directory. The name is reduced to its first letter. Street addresses are omitted.
        </p>
        <div className="mt-4 overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--color-muted)" }}>
                <th className="px-3 py-2 font-medium">Lead</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Place</th>
                <th className="px-3 py-2 font-medium">Grade</th>
                <th className="px-3 py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.label}-${index}`} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                  <td className="px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.place}</td>
                  <td className="px-3 py-2">{row.grade}</td>
                  <td className="px-3 py-2 tabular">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <DataSampleForm source="data_page_bottom" variant="compact" idPrefix="data-sample-bottom" />
        </div>

        <h2 className="h2-serif mt-12">Source</h2>
        <p className="mt-3 text-sm leading-relaxed">
          {dohmhSourceLine(newestInspectionLabel)}{" "}
          <a href={DOHMH_DATASET.url} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            NYC Open Data
          </a>
          . This extract was modified: names are redacted, addresses are removed, rows are filtered to this directory, and Z and P are labeled Grade Pending rather than printed as letters.
        </p>
      </article>
    </div>
  )
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`
}

function toSample(
  row: { name: string; borough: string | null; neighborhood: string | null; inspection_grade: string | null; inspection_score: number | null },
  label: string
): SampleRow {
  const fact = presentSampleFact(row, true)
  return { label, name: fact.name, place: fact.place, grade: fact.grade, score: fact.score }
}
