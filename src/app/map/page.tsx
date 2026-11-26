import type { Metadata } from "next"
import Link from "next/link"
import MapPageClient from "@/components/map-page-client"
import CityGradeBrief from "@/components/city-grade-brief"
import { REPORT_RECORD } from "@/lib/nta-grade-share"
import { pageMeta } from "@/lib/page-meta"
import { getPublishedDirectoryCounts } from "@/lib/directory-stats"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

export async function generateMetadata(): Promise<Metadata> {
  const { restaurants } = await getPublishedDirectoryCounts()
  return pageMeta({
    path: "/map",
    title: "NYC Healthy Restaurant Map — Health Grades by Location",
    description: `Interactive map of ${restaurants.toLocaleString()} published NYC healthy restaurants color-coded by health inspection grade. Filter by borough, dietary need, and find hidden gems near you.`,
  })
}

export default function MapPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Map", path: "/map" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            url: "https://www.eatrealfoodnyc.com/map",
            dateModified: "2026-11-26",
          }),
        }}
      />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <CityGradeBrief
          answer={`${REPORT_RECORD.citywideShare} of letter-graded NYC restaurants hold a Grade A, and this map plots the published healthy listings.`}
          howTo="Use the map below to filter published listings by borough, letter grade, dietary tag, hidden-gem status, or whether the restaurant is open now. The tables above are the city file, not the directory: they count every letter-graded establishment in the November 13, 2026 extract. A pin is a published listing in this directory. The letter on the pin is the matched inspection grade."
        />
        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
          Grades are matched to the{" "}
          <Link href="https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j" className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            DOHMH New York City Restaurant Inspection Results
          </Link>
          .
        </p>
      </div>
      <MapPageClient />
    </div>
  )
}
