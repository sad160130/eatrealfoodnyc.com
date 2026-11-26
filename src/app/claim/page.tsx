import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import ClaimForm from "@/components/claim-form"

const title = buildPipeTitle("Claim a listing", null)

export const metadata = pageMeta({
  path: "/claim",
  title,
  description: "Tell us you operate a listed restaurant and what we should correct. A person reviews every claim. Claiming does not change a grade.",
  index: false,
})

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>
}) {
  const { r } = await searchParams
  const slug = r?.trim() ?? ""
  const match = slug
    ? await prisma.restaurant.findFirst({
        where: { slug, is_published: true },
        select: { slug: true, name: true },
      })
    : null

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Claim a listing", path: "/claim" }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-10">
          <p className="eyebrow">For restaurants</p>
          <h1 className="display-2 mt-3">Claim a listing</h1>
          <p className="dek mt-4">
            Tell us you operate the restaurant and what we should fix. A person reviews every claim. Claiming does not change your grade or your place in the directory.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <ClaimForm restaurantSlug={match?.slug ?? ""} restaurantName={match?.name ?? ""} />
      </div>
    </div>
  )
}
