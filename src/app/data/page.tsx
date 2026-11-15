import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import { presentGrade } from "@/lib/grade-display"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import DataProductCta from "@/components/data-product-cta"
import { DATA_PRODUCT, DOHMH_DATASET } from "@/config/data-product"

export const revalidate = 86400

const title = buildPipeTitle(DATA_PRODUCT.name, null)

export const metadata = pageMeta({
  path: "/data",
  title,
  description:
    "A Monday email with two CSVs: NYC inspection leads and new openings. $79 a month or $790 a year. Built from DOHMH dataset 43nn-pn8j.",
})

function redactName(name: string) {
  const first = name.trim().charAt(0)
  return first ? `${first}…` : "…"
}

type SampleRow = {
  label: string
  name: string
  place: string
  grade: string
  score: string
}

export default async function DataProductPage() {
  const [pending, highScore, closed, notInspected, pendingRows, highRows, uninspectedRows] = await Promise.all([
    prisma.restaurant.count({ where: { inspection_grade: { in: ["Z", "P"] } } }),
    prisma.restaurant.count({ where: { inspection_score: { gte: 28 } } }),
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
      where: { is_published: true, inspection_score: { gte: 28 } },
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
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-10">
          <p className="eyebrow">Monday email</p>
          <h1 className="display-2 mt-3">{DATA_PRODUCT.name}</h1>
          <p className="dek mt-4">
            One email each Monday with two CSV files for people who sell to restaurants. ${DATA_PRODUCT.priceMonthlyUsd} a month, or ${DATA_PRODUCT.priceYearlyUsd} a year.
          </p>
          <DataProductCta />
        </div>
      </header>
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

        <h2 className="h2-serif mt-12">Source</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Source: {DOHMH_DATASET.source}. Dataset: {DOHMH_DATASET.name} ({DOHMH_DATASET.id}). Version: NYC Open Data rows updated {DOHMH_DATASET.version}.{" "}
          <a href={DOHMH_DATASET.url} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            NYC Open Data
          </a>
          . This extract was modified: names are redacted, addresses are removed, rows are filtered to this directory, and Z and P are labeled Grade Pending rather than printed as letters.
        </p>
      </article>
    </div>
  )
}

function toSample(
  row: { name: string; borough: string | null; neighborhood: string | null; inspection_grade: string | null; inspection_score: number | null },
  label: string
): SampleRow {
  return {
    label,
    name: redactName(row.name),
    place: [row.neighborhood, row.borough].filter(Boolean).join(", ") || "New York City",
    grade: presentGrade(row.inspection_grade).title,
    score: row.inspection_score == null ? "—" : String(row.inspection_score),
  }
}
