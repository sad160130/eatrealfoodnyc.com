import type { Metadata } from "next"
import MapPageClient from "@/components/map-page-client"
import { getCanonicalUrl } from "@/config/seo"
import { getPublishedDirectoryCounts } from "@/lib/directory-stats"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

export async function generateMetadata(): Promise<Metadata> {
  const { restaurants } = await getPublishedDirectoryCounts()
  return {
    title: "NYC Healthy Restaurant Map — Health Grades by Location",
    description: `Interactive map of ${restaurants.toLocaleString()} published NYC healthy restaurants color-coded by health inspection grade. Filter by borough, dietary need, and find hidden gems near you.`,
    alternates: { canonical: getCanonicalUrl("/map") },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function MapPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Map", path: "/map" }]} />
      <MapPageClient />
    </div>
  )
}
