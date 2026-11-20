import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import CateringForm from "@/components/catering-form"
import HolidayCateringBanner from "@/components/holiday-catering-banner"

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
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-4 md:px-6 md:pt-10">
        <header>
          <p className="eyebrow">Catering</p>
          <h1 className="display-2 mt-2 md:mt-3">Request catering in NYC</h1>
          <p className="dek mt-4 hidden md:block">
            Share the date, the headcount, where it should be delivered, and any dietary needs. We save the request and may pass it to restaurants. This form does not take payment.
          </p>
          <div className="mt-4">
            <HolidayCateringBanner variant="line" />
          </div>
        </header>
        <div className="mt-4 md:mt-10">
          <CateringForm restaurantSlug={match?.slug ?? ""} restaurantName={match?.name ?? ""} />
        </div>
        <p className="dek mt-8 md:hidden">
          Share the date, the headcount, where it should be delivered, and any dietary needs. We save the request and may pass it to restaurants. This form does not take payment.
        </p>
      </div>
    </div>
  )
}
