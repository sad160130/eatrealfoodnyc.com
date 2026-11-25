import type { Metadata } from "next"
import { getCanonicalUrl } from "@/config/seo"
import { OriginalResearch, ResearchDownload, researchJsonLd } from "@/components/original-research"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import data from "@/data/not-yet-inspected.json"

const PATH = "/data/not-yet-inspected-restaurants-nyc"
const CSV = "/data/not-yet-inspected-restaurants-nyc.csv"
const TITLE = "NYC restaurants not yet inspected"
const DESCRIPTION = `Record date ${data.recordDateLabel}: ${data.uninspected.toLocaleString("en-US")} of ${data.establishments.toLocaleString("en-US")} establishments still have only the January 1, 1900 inspection date. NYC Open Data ${data.datasetId}.`

export const metadata: Metadata = {
  title: "NYC restaurants not yet inspected",
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(PATH) },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: `https://www.eatrealfoodnyc.com${PATH}` },
}

export default function NotYetInspectedPage() {
  const cite = `How to cite: Eat Real Food NYC. “${TITLE}.” ${data.computedOn}. Based on NYC Open Data dataset ${data.datasetId}, record date ${data.recordDateLabel} (${data.recordDate}), inspections through ${data.inspectionMaxLabel}. https://www.eatrealfoodnyc.com${PATH}`
  return (
    <OriginalResearch
      path={PATH}
      crumb="Not yet inspected"
      title={TITLE}
      jsonLd={researchJsonLd({
        path: PATH,
        title: TITLE,
        description: DESCRIPTION,
        datePublished: data.computedOn,
        dateModified: data.computedOn,
        csvPath: CSV,
        datasetUrl: data.datasetUrl,
        datasetId: data.datasetId,
      })}
    >
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        Computed {data.computedOn}, America/New_York. Refresh this page monthly from a new pull of dataset {data.datasetId}. Record date {data.recordDateLabel}, stored as {data.recordDate}. The newest inspection_date in the file is {data.inspectionMaxLabel}.
      </p>
      <h2 className="h2-serif mt-8">Placeholder date by borough</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        <p>
          {data.uninspected.toLocaleString("en-US")} of {data.establishments.toLocaleString("en-US")} establishments in this file have no inspection date after January 1, 1900. The city uses that placeholder for an establishment that has not yet been inspected. Some of those records may be permitted and not yet open. {FOOD_SAFETY_SENTENCE}
        </p>
      </div>
      <div className="mt-6 overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Establishments whose only inspection date is January 1, 1900, by borough</caption>
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              <th scope="col" className="px-3 py-2 font-medium">Borough</th>
              <th scope="col" className="px-3 py-2 font-medium">Establishments</th>
            </tr>
          </thead>
          <tbody>
            {data.byBorough.map((row) => (
              <tr key={row.name} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 tabular">{row.count.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="h2-serif mt-12">Method</h2>
      <p className="mt-3 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        Same source as the fall 2026 inspection report: DOHMH New York City Restaurant Inspection Results, Socrata id {data.datasetId}. An establishment is one CAMIS. It is counted here when every inspection_date on that CAMIS is before 1901, which on this file is the January 1, 1900 placeholder. A CAMIS that has both the placeholder and a later inspection is not counted. Borough is the boro value on the placeholder row. Rows with no borough code are listed as missing.
      </p>
      <ResearchDownload csvPath={CSV} datasetId={data.datasetId} cite={cite} />
    </OriginalResearch>
  )
}
