import { Suspense } from "react"
import NearMePageClient from "@/components/near-me-page-client"
import { pageMeta } from "@/lib/page-meta"

export const metadata = pageMeta({
  path: "/near-me",
  title: "Healthy Restaurants Near Me — NYC",
  description: "Find healthy restaurants near your current location in NYC.",
  index: false,
})

export default function NearMePage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <Suspense
        fallback={
          <div className="flex min-h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
          </div>
        }
      >
        <NearMePageClient />
      </Suspense>
    </div>
  )
}
