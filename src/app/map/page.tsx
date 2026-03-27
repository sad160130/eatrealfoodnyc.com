import MapPageClient from "@/components/map-page-client"
import { getCanonicalUrl } from "@/config/seo"

export const metadata = {
  title: "Eat Real Food NYC Map — Interactive Health Grade Map",
  description:
    "Interactive map of 8,835 NYC healthy restaurants color-coded by health inspection grade. Filter by borough, dietary need, and find hidden gems near you.",
  alternates: { canonical: getCanonicalUrl("/map") },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MapPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <MapPageClient />
    </div>
  )
}
