import Link from "next/link"
import {
  FOOD_SAFETY_SENTENCE,
  INSPECTION_REPORT_PATH,
  REPORT_RECORD,
  ntaExtremes,
  reportBoroughRows,
  type NtaExtreme,
} from "@/lib/nta-grade-share"

const BOROUGHS = [
  ["Manhattan", "manhattan"],
  ["Brooklyn", "brooklyn"],
  ["Queens", "queens"],
  ["Bronx", "bronx"],
  ["Staten Island", "staten-island"],
] as const

/**
 * Server-rendered Grade A shares for pages whose interactive UI is too thin
 * for a crawler. Every figure is the November 13, 2026 extract.
 */
export default function CityGradeBrief({
  answer,
  howTo,
}: {
  answer: string
  howTo: string
}) {
  const { lowest, highest } = ntaExtremes(10)
  return (
    <article>
      <h1 className="display-2">{answer}</h1>
      <p className="mt-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        {FOOD_SAFETY_SENTENCE} These shares are from NYC Open Data dataset {REPORT_RECORD.datasetId}, record date {REPORT_RECORD.recordDate} (stored as {REPORT_RECORD.recordStored}). Inspections in that file run through {REPORT_RECORD.inspectionCutoff}. Citywide, {REPORT_RECORD.gradeA.toLocaleString("en-US")} of {REPORT_RECORD.letterGraded.toLocaleString("en-US")} letter-graded restaurants hold an A ({REPORT_RECORD.citywideShare}).
      </p>

      <h2 id="borough-grade-a" className="h2-serif mt-10 scroll-mt-24">Grade A share by borough</h2>
      <ShareTable
        caption="Latest letter grade A share by borough"
        headers={["Borough", "Letter-graded", "Grade A", "A share"]}
        rows={reportBoroughRows().map((row) => [
          row.name,
          row.letterGraded.toLocaleString("en-US"),
          row.a.toLocaleString("en-US"),
          row.share,
        ])}
      />

      <h2 className="h2-serif mt-10">10 lowest Neighborhood Tabulation Areas</h2>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)", maxWidth: "65ch" }}>
        2010 NTA names with at least 80 letter-graded restaurants, lowest Grade A share first. North Side-South Side is the 2010 name for Williamsburg.
      </p>
      <NtaTable caption="Ten lowest Grade A shares among NTAs with at least 80 letter-graded restaurants" rows={lowest} />

      <h2 className="h2-serif mt-10">10 highest Neighborhood Tabulation Areas</h2>
      <NtaTable caption="Ten highest Grade A shares among NTAs with at least 80 letter-graded restaurants" rows={highest} />

      <h2 className="h2-serif mt-10">How to use this page</h2>
      <p className="mt-3 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>{howTo}</p>
      <p className="mt-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        <Link href={INSPECTION_REPORT_PATH} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
          NYC restaurant inspection report
        </Link>
        {" for the full borough, neighborhood, closure, and not-yet-inspected tables. Borough hubs: "}
        {BOROUGHS.map(([label, slug], index) => (
          <span key={slug}>
            {index > 0 ? ", " : ""}
            <Link href={`/nyc/${slug}/healthy-restaurants`} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
              healthy restaurants in {label}
            </Link>
          </span>
        ))}
        .
      </p>
    </article>
  )
}

function NtaTable({ caption, rows }: { caption: string; rows: NtaExtreme[] }) {
  return (
    <ShareTable
      caption={caption}
      headers={["NTA", "Code", "Grade A", "Letter-graded", "A share"]}
      rows={rows.map((row) => [
        row.name,
        row.code,
        row.a.toLocaleString("en-US"),
        row.letterGraded.toLocaleString("en-US"),
        row.share,
      ])}
    />
  )
}

function ShareTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-4 overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
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
          {rows.map((row) => (
            <tr key={row.join("|")} className="border-t" style={{ borderColor: "var(--hairline)" }}>
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
