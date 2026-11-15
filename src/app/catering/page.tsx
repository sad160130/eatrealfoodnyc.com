import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import CateringForm from "@/components/catering-form"

export const revalidate = 86400

const title = buildPipeTitle("Request catering in NYC", null)

export const metadata = pageMeta({
  path: "/catering",
  title,
  description:
    "Tell us the date, headcount, neighborhood, and dietary needs. We save the request and may share it with restaurants. No payment is collected here.",
})

export default async function CateringPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>
}) {
  const { restaurant } = await searchParams
  const slug = restaurant?.trim() ?? ""
  const match = slug
    ? await prisma.restaurant.findFirst({
        where: { slug, is_published: true },
        select: { slug: true, name: true },
      })
    : null

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Catering", path: "/catering" }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-10">
          <p className="eyebrow">Catering</p>
          <h1 className="display-2 mt-3">Request catering in NYC</h1>
          <p className="dek mt-4">
            Share the date, the headcount, where it should be delivered, and any dietary needs. We save the request and may pass it to restaurants. This form does not take payment.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <CateringForm restaurantSlug={match?.slug ?? ""} restaurantName={match?.name ?? ""} />
      </div>
    </div>
  )
}
