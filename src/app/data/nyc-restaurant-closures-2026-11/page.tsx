import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCanonicalUrl } from "@/config/seo"
import { OriginalResearch, ResearchDownload, researchJsonLd } from "@/components/original-research"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import data from "@/data/restaurant-closures.json"

const PATH = `/data/nyc-restaurant-closures-${data.latestMonth}`
const CSV = `/data/nyc-restaurant-closures-${data.latestMonth}.csv`
const TITLE = `NYC restaurant closures, ${data.latestMonth}`
const latest = data.months.find((row) => row.month === data.latestMonth)
const DESCRIPTION = latest
  ? `Record date ${data.recordDateLabel}: ${data.latestMonth} has ${latest.events.toLocaleString("en-US")} closure events and ${latest.restaurants.toLocaleString("en-US")} unique restaurants on the active file. NYC Open Data ${data.datasetId}.`
  : "NYC restaurant closure series."

export const metadata: Metadata = {
  title: `NYC restaurant closures, ${data.latestMonth}`,
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(PATH) },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: `https://www.eatrealfoodnyc.com${PATH}` },
}

export default function ClosuresPage() {
  if (!latest) notFound()
  const cite = `How to cite: Eat Real Food NYC. “${TITLE}.” ${data.computedOn}. Based on NYC Open Data dataset ${data.datasetId}, record date ${data.recordDateLabel} (${data.recordDate}), inspections through ${data.inspectionMaxLabel}. https://www.eatrealfoodnyc.com${PATH}`
  return (
    <OriginalResearch
      path={PATH}
      crumb={`Closures ${data.latestMonth}`}
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
        Computed {data.computedOn}, America/New_York. Record date {data.recordDateLabel}, stored as {data.recordDate}. Newest inspection_date in the file: {data.inspectionMaxLabel}. {data.latestMonth} is not a finished month.
      </p>
      <h2 className="h2-serif mt-8">Events and unique restaurants by month</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        <p>
          In {data.latestMonth}, the file shows {latest.events.toLocaleString("en-US")} closure events and {latest.restaurants.toLocaleString("en-US")} unique restaurants. An event is one CAMIS, one inspection date, and one closure action. A restaurant is one CAMIS with at least one event that month. A same-day closure and re-closure is two events and one restaurant. Adding the monthly restaurant counts together would count a restaurant again in each month it appears, so this page does not publish that sum. {FOOD_SAFETY_SENTENCE}
        </p>
        <p>
          The open-data file includes restaurants in active status on the extract date. A restaurant that was closed and later left the active file is absent. Counts for earlier months are what the current active file still shows, not a complete historical census.
        </p>
      </div>
      <div className="mt-6 overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Closure events and unique restaurants by month and borough, January 2025 through the latest month in the file</caption>
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              <th scope="col" className="px-3 py-2 font-medium">Month</th>
              <th scope="col" className="px-3 py-2 font-medium">Borough</th>
              <th scope="col" className="px-3 py-2 font-medium">Events</th>
              <th scope="col" className="px-3 py-2 font-medium">Restaurants</th>
            </tr>
          </thead>
          <tbody>
            {data.months.flatMap((month) => [
              <tr key={`${month.month}-city`} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                <td className="px-3 py-2 tabular">{month.month}</td>
                <td className="px-3 py-2">New York City</td>
                <td className="px-3 py-2 tabular">{month.events.toLocaleString("en-US")}</td>
                <td className="px-3 py-2 tabular">{month.restaurants.toLocaleString("en-US")}</td>
              </tr>,
              ...month.byBorough.map((row) => (
                <tr key={`${month.month}-${row.name}`} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                  <td className="px-3 py-2 tabular">{month.month}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2 tabular">{row.events.toLocaleString("en-US")}</td>
                  <td className="px-3 py-2 tabular">{row.restaurants.toLocaleString("en-US")}</td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
      <h2 className="h2-serif mt-12">Method</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
        <p>
          Source file: DOHMH New York City Restaurant Inspection Results, Socrata id {data.datasetId}. The actions counted are the two strings in the city file: “Establishment Closed by DOHMH…” and “Establishment re-closed by DOHMH.” This series starts in {data.seriesStart}. The same file still has {data.before2025Events.toLocaleString("en-US")} earlier events on {data.before2025Restaurants.toLocaleString("en-US")} restaurants; those rows are in the extract and are not in the table.
        </p>
        <p>
          Use any comparison with an earlier year only with the active-file caveat above. A closure in 2025 that no longer has an active record is not in the 2025 months.
        </p>
      </div>
      <ResearchDownload csvPath={CSV} datasetId={data.datasetId} cite={cite} />
    </OriginalResearch>
  )
}
