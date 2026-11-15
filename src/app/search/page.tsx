import { Suspense } from "react"
import SearchPageClient from "@/components/search-page-client"
import { pageMeta } from "@/lib/page-meta"

export const metadata = pageMeta({
  path: "/search",
  title: "Search Healthy Restaurants — NYC",
  description: "Search and filter healthy restaurants across New York City.",
  index: false,
})

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    borough?: string
    diet?: string | string[]
    grade?: string
    page?: string
    open?: string
  }>
}) {
  const params = await searchParams
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageClient searchParams={params} />
    </Suspense>
  )
}

function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl border bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
