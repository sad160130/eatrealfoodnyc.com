import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { cateringPageIsIndexable } from "@/lib/catering-robots"
import { pageMeta } from "@/lib/page-meta"
import { gradeABoroughPath } from "@/lib/grade-a"
import { getDirectorySnapshot } from "@/lib/directory-snapshot"
import { getIndexableDietTags } from "@/lib/diet-hubs"
import { CATERING_FAQS, CATERING_INTRO, CATERING_TITLE } from "@/lib/money-pages"
import { HOLIDAY_CATERING_PATH } from "@/lib/holiday-catering"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import CateringForm from "@/components/catering-form"
import FAQSchema from "@/components/faq-schema"
import HolidayCateringBanner from "@/components/holiday-catering-banner"
import { UpdatedWebPage } from "@/components/updated-webpage"

export const revalidate = 86400

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const meta = pageMeta({
    path: "/catering",
    title: CATERING_TITLE,
    description:
      "Tell us the date, headcount, neighborhood, and dietary needs. We save the request and may share it with restaurants. No payment is collected here.",
    index: cateringPageIsIndexable(params),
  })
  return meta
}

export default async function CateringPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>
}) {
  const { restaurant } = await searchParams
  const slug = restaurant?.trim() ?? ""
  const [match, snapshot, diets] = await Promise.all([
    slug
      ? prisma.restaurant.findFirst({
          where: { slug, is_published: true },
          select: { slug: true, name: true },
        })
      : Promise.resolve(null),
    getDirectorySnapshot(),
    getIndexableDietTags(),
  ])

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Catering", path: "/catering" }]} />
      <FAQSchema faqs={CATERING_FAQS} />
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-4 md:px-6 md:pt-10">
        <header>
          <p className="eyebrow">Catering</p>
          <h1 className="display-2 mt-2 md:mt-3">Request catering in NYC</h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
            {CATERING_INTRO}
          </p>
          {snapshot.latestInspectionAt ? (
            <>
              <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
                Updated {snapshot.latestInspectionLabel}.
              </p>
              <UpdatedWebPage date={snapshot.latestInspectionAt} urlPath="/catering" hideLabel />
            </>
          ) : null}
          <p className="dek mt-4 hidden md:block">
            Share the date, the headcount, where it should be delivered, and any dietary needs. We save the request and may pass it to restaurants. This form does not take payment.
          </p>
          <div className="mt-4">
            <HolidayCateringBanner variant="line" />
          </div>
        </header>
        <nav aria-label="Related catering pages" className="mt-8">
          <h2 className="h2-serif">Where to look next</h2>
          <ul className="mt-4 space-y-2 text-base leading-relaxed">
            <li>
              <Link href={HOLIDAY_CATERING_PATH} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                Holiday party catering in NYC
              </Link>
            </li>
            {BOROUGHS.map((borough) => (
              <li key={borough}>
                <Link href={gradeABoroughPath(borough)} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                  Grade A restaurants in {borough}
                </Link>
              </li>
            ))}
            {diets.map((diet) => (
              <li key={diet.tag}>
                <Link href={`/healthy-restaurants/${diet.tag}`} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                  {diet.label} restaurants in NYC
                </Link>
              </li>
            ))}
            <li>
              <Link href="/guides/nyc-health-grades-explained" className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                How NYC health grades work
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-4 md:mt-10">
          <CateringForm restaurantSlug={match?.slug ?? ""} restaurantName={match?.name ?? ""} />
        </div>
        <p className="dek mt-8 md:hidden">
          Share the date, the headcount, where it should be delivered, and any dietary needs. We save the request and may pass it to restaurants. This form does not take payment.
        </p>
        <section className="mt-12" aria-labelledby="catering-faq">
          <h2 id="catering-faq" className="h2-serif">Questions about the request</h2>
          <div className="mt-6 space-y-6">
            {CATERING_FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{faq.question}</h3>
                <p className="mt-2 text-base leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
