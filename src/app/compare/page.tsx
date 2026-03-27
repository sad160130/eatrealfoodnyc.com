import { prisma } from "@/lib/db"
import ComparePageView from "@/components/compare-page-view"
import Link from "next/link"

export const metadata = {
  title: "Compare Restaurants — Eat Real Food NYC",
  description: "Side-by-side restaurant comparison.",
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ restaurants?: string }>
}) {
  const { restaurants: restaurantParam } = await searchParams
  const slugs = restaurantParam ? restaurantParam.split(",").slice(0, 3).filter(Boolean) : []

  if (slugs.length < 2) {
    return (
      <div
        className="flex min-h-screen items-center justify-center pt-16"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="px-6 text-center">
          <p className="mb-4 text-6xl">⚖️</p>
          <h1
            className="text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No restaurants to compare
          </h1>
          <p className="mt-3" style={{ color: "var(--color-muted)" }}>
            Add at least 2 restaurants using the ⚖️ button on any restaurant card.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-forest px-8 py-3 font-semibold text-white transition-colors hover:bg-jade"
          >
            Browse restaurants →
          </Link>
        </div>
      </div>
    )
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { slug: { in: slugs } },
  })

  const ordered = slugs
    .map((slug) => restaurants.find((r) => r.slug === slug))
    .filter(Boolean) as typeof restaurants

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <ComparePageView restaurants={ordered} />
    </div>
  )
}
