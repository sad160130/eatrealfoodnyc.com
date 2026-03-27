import { prisma } from "@/lib/db"
import SavedPageClient from "@/components/saved-page-client"

export const metadata = {
  title: "Your Saved Restaurants — Eat Real Food NYC",
  description: "Your personal collection of saved NYC healthy restaurants.",
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
}

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>
}) {
  const { list } = await searchParams

  let sharedRestaurants = null

  if (list) {
    const slugs = list.split(",").slice(0, 20)
    const restaurants = await prisma.restaurant.findMany({
      where: {
        slug: { in: slugs },
        business_status: "OPERATIONAL",
      },
      select: {
        slug: true,
        name: true,
        neighborhood: true,
        borough: true,
        rating: true,
        inspection_grade: true,
        dietary_tags: true,
        photo: true,
        is_hidden_gem: true,
      },
    })
    sharedRestaurants = restaurants
  }

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <SavedPageClient sharedRestaurants={sharedRestaurants} />
    </div>
  )
}
