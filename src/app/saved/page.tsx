import { prisma } from "@/lib/db"
import SavedPageClient from "@/components/saved-page-client"
import { pageMeta } from "@/lib/page-meta"

export const metadata = pageMeta({
  path: "/saved",
  title: "Your Saved Restaurants",
  description: "Your personal collection of saved NYC healthy restaurants.",
  index: false,
})

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
