import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { DataSectionLink } from "@/components/data-section-link"
import { FALL_2026_REPORT as R } from "@/data/fall-2026-inspection-report"
import { InspectionLeadsCta } from "@/components/product-ctas"
import { dohmhInspectionDataset } from "@/lib/schema"

const PATH = "/data/nyc-restaurant-health-grade-report"
const URL = `https://www.eatrealfoodnyc.com${PATH}`
const TITLE = "NYC Restaurant Inspection Report, Fall 2026"
const META_TITLE = "NYC Inspection Report, Fall 2026"
const DESCRIPTION =
  "Nov 10, 2026: NYC closed 118 still-active restaurants. 4,059 of 31,502 are uninspected. 90.2% of letter grades are A. Open Data 43nn-pn8j, extract Nov 13."

export const metadata: Metadata = {
  title: META_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    url: URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
  },
}

const article = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  datePublished: "2026-11-15",
  dateModified: "2026-11-15",
  author: { "@type": "Organization", name: "Eat Real Food NYC", url: "https://www.eatrealfoodnyc.com" },
  publisher: { "@id": "https://www.eatrealfoodnyc.com/#organization" },
  mainEntityOfPage: URL,
  isBasedOn: R.datasetUrl,
}

const faqs = [
  {
    q: "How many NYC restaurants were closed in fall 2026?",
    a: "From September 1 through November 10, 2026, the Health Department ordered 118 still-active restaurants closed, in 158 closure or re-closure events. The same dates in 2025 still show 99 restaurants and 128 events in the current active file. That file omits restaurants that later left active status, so the 2025 figure is not a complete historical census.",
  },
  {
    q: "How many NYC restaurants have never been inspected?",
    a: "In the November 13, 2026 extract, 4,059 of 31,502 active establishments have the placeholder inspection date of January 1, 1900. The city uses that date for an establishment that has not yet been inspected. Some of those records may be permitted and not yet open.",
  },
  {
    q: "Does Grade A mean a restaurant is healthy?",
    a: "No. Grade A means the latest inspection score is 0–13. It is a food-safety grade, not a nutrition rating and not one of Eat Real Food NYC’s dietary tags.",
  },
]

const dataset = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: TITLE,
  description: DESCRIPTION,
  url: URL,
  dateModified: "2026-11-15",
  creator: { "@type": "Organization", name: "Eat Real Food NYC", url: "https://www.eatrealfoodnyc.com" },
  license: "https://creativecommons.org/licenses/by/4.0/",
  isBasedOn: dohmhInspectionDataset(R.datasetId),
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "text/csv",
    contentUrl: "https://www.eatrealfoodnyc.com/data/nyc-inspection-fall-2026.csv",
  },
}

export default function InspectionReportPage() {
  const lowest = R.neighborhoods[0]
  const highest = R.neighborhoods[R.neighborhoods.length - 1]
  return (
    <article style={{ backgroundColor: "var(--color-cream)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([article, dataset, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) }]) }} />
      <BreadcrumbJsonLd items={[{ name: "Fall 2026 inspection report", path: PATH }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-10">
          <p className="eyebrow">Original research · dated extract</p>
          <h1 className="display-2 mt-3">{TITLE}</h1>
          <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
            Last updated November 15, 2026, America/New_York. This is a dated extract, not a live ticker. Figures are from NYC Open Data dataset {R.datasetId}, extract {R.extractLabel}, inspections through {R.inspectionCutoff}.
          </p>
          <DataSectionLink />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="h2-serif">What the November 13, 2026 file shows</h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
          <p>
            From September 1 through {R.inspectionCutoff}, the Health Department ordered {R.closures.restaurants} still-active restaurants closed ({R.closures.events} closure or re-closure events). Brooklyn had the most ({R.closures.byBorough[0].restaurants}), then Queens ({R.closures.byBorough[1].restaurants}), Manhattan ({R.closures.byBorough[2].restaurants}), and the Bronx ({R.closures.byBorough[3].restaurants}). Staten Island had none in this window. In the same dates in 2025, the current active file still shows {R.closures.priorRestaurants} restaurants and {R.closures.priorEvents} events.
          </p>
          <p>
            Of {R.establishments.toLocaleString("en-US")} active establishments in the November 13, 2026 extract, {R.uninspected.toLocaleString("en-US")} ({R.uninspectedShare}) still have the placeholder inspection date of January 1, 1900, which the city defines as not yet inspected. Manhattan accounts for {R.boroughs[0].uninspected.toLocaleString("en-US")} of them.
          </p>
          <p>
            Among {R.letterGraded.toLocaleString("en-US")} restaurants whose latest grade is A, B, or C, {R.gradeA.toLocaleString("en-US")} ({R.gradeAShare}) currently hold an A, {R.gradeB.toLocaleString("en-US")} a B, and {R.gradeC.toLocaleString("en-US")} a C. Queens is the lowest borough, at {R.boroughs[2].share} ({R.boroughs[2].a.toLocaleString("en-US")} of {R.boroughs[2].letterGraded.toLocaleString("en-US")}). Among {R.neighborhoods.length} Neighborhood Tabulation Areas with at least 80 letter-graded restaurants, {lowest.name} ({lowest.code}) is the lowest, at {lowest.share} ({lowest.a} of {lowest.letterGraded}), and {highest.name} ({highest.code}) is the highest, at {highest.share} ({highest.a} of {highest.letterGraded}).
          </p>
        </div>

        <h2 id="boroughs" className="h2-serif mt-12 scroll-mt-24">Latest letter grade by borough</h2>
        <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
          One latest A, B, or C per CAMIS. A grade date is used when it exists; otherwise the most recent inspection that carries a letter.
        </p>
        <Table
          caption="Latest letter grade by borough"
          headers={["Borough", "Letter-graded", "A", "A share", "B", "C"]}
          rows={R.boroughs.map((row) => [row.name, fmt(row.letterGraded), fmt(row.a), row.share ?? "—", fmt(row.b), fmt(row.c)])}
          rowIds={R.boroughs.map((row) => BOROUGH_ANCHOR[row.name] ?? undefined)}
        />
        <p className="mt-3 text-sm">
          Citywide: {fmt(R.gradeA)} A, {fmt(R.gradeB)} B, and {fmt(R.gradeC)} C, out of {fmt(R.letterGraded)} letter-graded restaurants. Another {fmt(R.statusGrades)} restaurants have a status code rather than a letter: {fmt(R.notYetGraded)} N (not yet graded) and {fmt(R.gradePending)} Z (grade pending).
        </p>

        <h2 id="neighborhoods" className="h2-serif mt-12 scroll-mt-24">Neighborhoods with at least 80 letter-graded restaurants</h2>
        <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
          {R.neighborhoods.length} Neighborhood Tabulation Areas have at least 80 letter-graded restaurants. Names are the 2010 NTA names, which do not always match everyday names. North Side-South Side, for example, is the 2010 name for Williamsburg.
        </p>
        <Table
          caption="Neighborhood Tabulation Areas with at least 80 letter-graded restaurants"
          headers={["NTA", "Code", "Grade A", "Letter-graded", "A share"]}
          rows={R.neighborhoods.map((row) => [row.name, row.code, fmt(row.a), fmt(row.letterGraded), row.share])}
        />

        <h2 id="closures" className="h2-serif mt-12 scroll-mt-24">Closures, September 1–November 10</h2>
        <p className="mt-3 text-base leading-relaxed">
          An event is a unique combination of CAMIS, inspection date, and closure action. The actions counted are “Establishment Closed by DOHMH…” and “Establishment re-closed by DOHMH.” A same-day closure and re-closure counts as two events. This fall: {R.closures.restaurants} restaurants and {R.closures.events} events. The same dates in 2025, as they still appear in today’s active file: {R.closures.priorRestaurants} restaurants and {R.closures.priorEvents} events.
        </p>
        <p className="mt-3 text-base leading-relaxed">
          The open-data file includes only restaurants in active status on the extract date. A restaurant closed in 2025 that later left the active file would not appear in today’s 2025 count. Fall 2026 versus fall 2025 is a comparison among restaurants that are still in the active file, not a complete historical census of every shutdown.
        </p>
        <Table
          caption="Unique still-active restaurants closed, September 1 through November 10, 2026"
          headers={["Borough", "Unique restaurants closed"]}
          rows={R.closures.byBorough.map((row) => [row.name, String(row.restaurants)])}
        />
        <p className="mt-3 text-sm">
          Year to date through {R.inspectionCutoff}: {R.closures.ytd2026Restaurants} unique still-active restaurants with at least one closure event ({R.closures.ytd2026Events} events). The current file still shows {R.closures.year2025Restaurants} such restaurants for all of 2025 ({R.closures.year2025Events} events). Use that year comparison only with the active-file caveat above.
        </p>

        <h2 id="not-yet-inspected" className="h2-serif mt-12 scroll-mt-24">Not yet inspected</h2>
        <p className="mt-3 text-base leading-relaxed">
          {fmt(R.uninspected)} establishments ({R.uninspectedShare} of {fmt(R.establishments)}) have an inspection date of January 1, 1900. The city’s data dictionary uses that date for a new establishment that has not yet been inspected. Some of those records may have a permit and may not have opened yet.
        </p>
        <Table
          caption="Establishments with the January 1, 1900 inspection date"
          headers={["Borough", "Uninspected"]}
          rows={R.boroughs.map((row) => [row.name, fmt(row.uninspected)])}
        />

        <h2 id="cuisine-labels" className="h2-serif mt-12 scroll-mt-24">City cuisine labels</h2>
        <p className="mt-3 text-base leading-relaxed">
          These seven cuisine_description values are the city’s labels, not Eat Real Food NYC dietary tags, and they are not a nutrition grade: {R.cuisines.labels.join("; ")}. Among letter-graded restaurants with one of those labels, {fmt(R.cuisines.gradeA)} of {fmt(R.cuisines.letterGraded)} ({R.cuisines.share}) currently hold a Grade A.
        </p>

        <h2 className="h2-serif mt-12">How to check a restaurant’s grade</h2>
        <div className="mt-4 space-y-3 text-base leading-relaxed">
          <p>
            Look up a restaurant in the <a href={R.datasetUrl} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>DOHMH New York City Restaurant Inspection Results</a> on NYC Open Data, and search by name or address. A is 0–13 points, B is 14–27, and C is 28 or more. N means not yet graded. Z means grade pending.
          </p>
          <p>
            The same records are in <a href={R.datasetUrl} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>NYC Open Data dataset {R.datasetId}</a>. Eat Real Food NYC joins a matched grade onto published healthy-dining listings. A grade is a food-safety score, not a claim that a restaurant is healthy.
          </p>
          <p>
            <Link href="/guides/nyc-health-grades-explained" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>NYC health grades explained</Link>
            {" · "}
            <Link href="/guides/grade-a-restaurants-by-borough-nyc" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>Grade A restaurants by borough</Link>
            {" · "}
            <Link href="/guides/nyc-restaurant-inspection-process" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>NYC restaurant inspection process</Link>
            {" · "}
            <Link href="/healthy-restaurants/grade-a" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>Grade A restaurants in the directory</Link>
            {" · "}
            <Link href="/nyc/queens/healthy-restaurants" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>Healthy restaurants in Queens</Link>
            {" · "}
            <Link href="/data/best-rated-restaurants" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>best-rated restaurants</Link>
            {" · "}
            <Link href="/press" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>press</Link>
            {" · "}
            <Link href="/data/nyc-restaurant-score-13-cliff" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>score 13 cliff</Link>
            {" · "}
            <Link href="/data/not-yet-inspected-restaurants-nyc" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>not yet inspected</Link>
            {" · "}
            <Link href="/data/nyc-restaurant-closures-2026-11" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>monthly closures</Link>
          </p>
          <p className="text-sm">
            <InspectionLeadsCta source="inspection_report">
              Sell to NYC restaurants? Get weekly inspection leads
            </InspectionLeadsCta>
          </p>
        </div>

        <h2 className="h2-serif mt-12">Questions</h2>
        <div className="mt-4 space-y-5">
          {faqs.map((faq) => (
            <section key={faq.q}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>{faq.q}</h3>
              <p className="mt-2 text-base leading-relaxed">{faq.a}</p>
            </section>
          ))}
        </div>

        <h2 className="h2-serif mt-12">Method</h2>
        <div className="mt-4 space-y-3 text-base leading-relaxed">
          <p>
            Source file: DOHMH New York City Restaurant Inspection Results, Socrata id {R.datasetId}. The extract’s record_date is {R.extractLabel} (stored as {R.extractRecordedAt}). The latest inspection date in the file is {R.inspectionCutoff}. The file had {fmt(R.rows)} rows and {fmt(R.establishments)} distinct CAMIS values. These aggregates were computed on {R.computedOn}.
          </p>
          <p>
            Current grade is one latest grade per CAMIS. When a grade date exists, the most recent grade_date is used; otherwise the most recent inspection_date that has a grade is used. Neighborhood names use 2010 Neighborhood Tabulation Areas.
          </p>
        </div>

        <h2 className="h2-serif mt-12">Download and how to cite</h2>
        <p className="mt-3 text-base leading-relaxed">
          <a href="/data/nyc-inspection-fall-2026.csv" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>Download the aggregate CSV</a>. It is licensed <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>CC BY 4.0</a>. Attribute the NYC Department of Health and Mental Hygiene via NYC Open Data dataset {R.datasetId}, and Eat Real Food NYC for this aggregation. The city file has its own terms.
        </p>
        <p className="mt-3 text-base leading-relaxed">
          How to cite: Eat Real Food NYC. “NYC Restaurant Inspection Report, Fall 2026.” November 15, 2026. Based on NYC Open Data dataset {R.datasetId}, extract November 13, 2026, inspections through November 10, 2026. {URL}
        </p>
      </div>
    </article>
  )
}

const BOROUGH_ANCHOR: Record<string, string> = {
  Manhattan: "manhattan",
  Brooklyn: "brooklyn",
  Queens: "queens",
  Bronx: "bronx",
  "Staten Island": "staten-island",
}

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

function Table({ caption, headers, rows, rowIds }: { caption: string; headers: string[]; rows: string[][]; rowIds?: Array<string | undefined> }) {
  return (
    <div className="mt-4 overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "var(--color-cream)" }}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr style={{ color: "var(--color-muted)" }}>
            {headers.map((header) => (
              <th key={header} scope="col" className="px-3 py-2 font-medium">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr id={rowIds?.[rowIndex]} key={row.join("|")} className="scroll-mt-24 border-t" style={{ borderColor: "var(--hairline)" }}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-3 py-2 tabular">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
