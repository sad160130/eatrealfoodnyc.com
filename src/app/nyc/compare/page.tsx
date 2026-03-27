import ComparePageClient from "@/components/compare-page-client"

export const metadata = {
  title: "NYC Neighborhood Health Comparison",
  description: "Compare NYC neighborhoods by restaurant health metrics.",
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
}

export default function ComparePage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <ComparePageClient />
    </div>
  )
}
