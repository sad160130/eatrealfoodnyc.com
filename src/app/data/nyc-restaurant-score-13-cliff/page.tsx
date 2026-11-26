import type { Metadata } from "next"
import { getCanonicalUrl } from "@/config/seo"
import { OriginalResearch, ResearchDownload, researchJsonLd } from "@/components/original-research"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import score from "@/data/score-13-cliff.json"

const PATH = "/data/nyc-restaurant-score-13-cliff"
const CSV = "/data/nyc-restaurant-score-13-cliff.csv"
const TITLE = "The score 13 cliff in 2026 NYC initial inspections"
const at = (points: number) => score.histogram.find((row) => row.score === points)?.n ?? 0
const DESCRIPTION = `Record date ${score.recordDateLabel}: ${score.n.toLocaleString("en-US")} unique 2026 initial inspections. ${at(12).toLocaleString("en-US")} scored 12, ${at(13).toLocaleString("en-US")} scored 13, ${at(14).toLocaleString("en-US")} scored 14, and ${at(15).toLocaleString("en-US")} scored 15. NYC Open Data ${score.datasetId}.`

export const metadata: Metadata = {
  title: "NYC inspection score 13 cliff",
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(PATH) },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: `https://www.eatrealfoodnyc.com${PATH}` },
}

export default function ScoreCliffPage() {
  const cite = `How to cite: Eat Real Food NYC. “${TITLE}.” ${score.computedOn}. Based on NYC Open Data dataset ${score.datasetId}, record date ${score.recordDateLabel} (${score.recordDate}), inspections through ${score.inspectionMaxLabel}. https://www.eatrealfoodnyc.com${PATH}`
  return (
    <OriginalResearch
      path={PATH}
      crumb="Score 13 cliff"
      title={TITLE}
      jsonLd={researchJsonLd({
        path: PATH,
        title: TITLE,
        description: DESCRIPTION,
        datePublished: score.computedOn,
        dateModified: score.computedOn,
        csvPath: CSV,
        datasetUrl: score.datasetUrl,
        datasetId: score.datasetId,
      })}
    >
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        Computed {score.computedOn}, America/New_York. NYC Open Data dataset {score.datasetId}, record date {score.recordDateLabel}, stored as {score.recordDate}. The dataset’s rowsUpdatedAt was {score.rowsUpdatedAt}. The newest inspection_date in the file is {score.inspectionMaxLabel}. The file had {score.fileRows.toLocaleString("en-US")} rows.
      </p>
      <h2 className="h2-serif mt-8">What the 2026 initial inspections show</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        <p>
          This histogram counts unique combinations of CAMIS, inspection date, and inspection type where the type is {score.inspectionType}, the inspection date is in 2026, and a score is present. That is {score.n.toLocaleString("en-US")} inspections. {at(12).toLocaleString("en-US")} of them scored 12 and {at(13).toLocaleString("en-US")} scored 13. The next two scores are much smaller: {at(14).toLocaleString("en-US")} at 14 and {at(15).toLocaleString("en-US")} at 15. The count rises again at 16, to {at(16).toLocaleString("en-US")}.
        </p>
        <p>
          A score of 0 to 13 is the Grade A band. A score of 14 is the first point of the B band. The table is the count at each score from 0 through 30. {score.above30.toLocaleString("en-US")} inspections scored above 30. {FOOD_SAFETY_SENTENCE} The table describes the counts. It does not say why a score is more or less common.
        </p>
      </div>
      <div className="mt-6 overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Score histogram for 2026 cycle initial inspections, 0 through 30</caption>
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              <th scope="col" className="px-3 py-2 font-medium">Score</th>
              <th scope="col" className="px-3 py-2 font-medium">Inspections</th>
            </tr>
          </thead>
          <tbody>
            {score.histogram.map((row) => (
              <tr key={row.score} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                <td className="px-3 py-2 tabular">{row.score}</td>
                <td className="px-3 py-2 tabular">{row.n.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="h2-serif mt-12">Method</h2>
      <p className="mt-3 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        Source file: DOHMH New York City Restaurant Inspection Results, Socrata id {score.datasetId}. An inspection is one unique (CAMIS, inspection_date, inspection_type) with inspection_type equal to {score.inspectionType}, inspection_date in 2026, and a non-null score. Violation rows that share those three fields are one inspection. No inspection in this pull had two different scores. Scores above 30 are counted in the sentence above and in the CSV, and they are outside the 0–30 table.
      </p>
      <ResearchDownload csvPath={CSV} datasetId={score.datasetId} cite={cite} />
    </OriginalResearch>
  )
}
