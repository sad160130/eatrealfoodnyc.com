import Link from "next/link"
import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { GRADE_A_WHERE } from "@/lib/grade-a"
import { isDirectoryEligible } from "@/config/publishable-types"
import {
  groupGradeAForHoliday,
  HOLIDAY_CATERING_FAQS,
  HOLIDAY_CATERING_PATH,
  HOLIDAY_CATERING_SOURCE,
  HOLIDAY_CATERING_TITLE,
  holidayCateringDescription,
  type HolidayCateringRestaurant,
} from "@/lib/holiday-catering"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import CateringForm from "@/components/catering-form"
import FAQSection from "@/components/faq-section"
import AboutThisData from "@/components/about-this-data"
import HolidayGroupOrders from "@/components/holiday-group-orders"

export const revalidate = 86400

const description = holidayCateringDescription()

export const metadata = pageMeta({
  path: HOLIDAY_CATERING_PATH,
  title: HOLIDAY_CATERING_TITLE,
  description,
})

async function loadGradeARestaurants(): Promise<HolidayCateringRestaurant[]> {
  const rows = await prisma.restaurant.findMany({
    where: GRADE_A_WHERE,
    select: {
      name: true,
      slug: true,
      type: true,
      borough: true,
      neighborhood: true,
      rating: true,
      reviews: true,
      dietary_tags: true,
    },
  })
  return rows.filter((row) => isDirectoryEligible(row))
}

export default async function HolidayPartyCateringPage() {
  const groups = groupGradeAForHoliday(await loadGradeARestaurants())

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Catering", path: "/catering" },
          { name: "Holiday party catering NYC", path: HOLIDAY_CATERING_PATH },
        ]}
      />
      <div className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-4 md:px-6 md:pt-8">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm" style={{ color: "var(--color-muted)" }}>
            <Link href="/" className="underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
              Eat Real Food NYC
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href="/catering" className="underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
              Catering
            </Link>
            <span aria-hidden="true"> / </span>
            <span style={{ color: "var(--color-forest)" }}>Holiday party catering NYC</span>
          </nav>
          <p className="eyebrow">Holiday season</p>
          <h1 className="display-2 mt-2">Holiday party catering in NYC</h1>
          <p className="dek mt-3">
            Office holiday catering in NYC, and Thanksgiving and holiday catering in NYC, from restaurants with a NYC Department of Health and Mental Hygiene Grade A on file. Sending a request is free. This page does not list prices, book a kitchen, or confirm that a restaurant caters.
          </p>
          <div className="mt-6" id="holiday-catering-request">
            <h2 className="h2-serif" id="holiday-request-heading">
              Send a holiday catering request
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              We save the date, headcount, place, and dietary needs, and we may share them with restaurants. No payment is collected here.
            </p>
            <div className="mt-4">
              <CateringForm
                source={HOLIDAY_CATERING_SOURCE}
                sourcePath={HOLIDAY_CATERING_PATH}
                labelledBy="holiday-request-heading"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <HolidayGroupOrders groups={groups} />
        <AboutThisData variant="hub" restaurantCount={groups.total} gradeACount={groups.total} />
      </div>

      <FAQSection
        faqs={HOLIDAY_CATERING_FAQS}
        heading="Holiday catering questions"
        subheading="Lead time, group size, dietary needs, health grades, and what the request costs."
      />

      <div className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
          A Grade A is a sanitary inspection letter.{" "}
          <Link
            href="/guides/nyc-health-grades-explained"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--color-jade)" }}
          >
            NYC restaurant health grades explained
          </Link>{" "}
          covers how the Department of Health assigns A, B, and C.
        </p>
        <h2 className="h2-serif mt-10" id="holiday-request-bottom-heading">
          Send a holiday catering request
        </h2>
        <div className="mt-6" id="holiday-catering-request-bottom">
          <CateringForm
            source={HOLIDAY_CATERING_SOURCE}
            sourcePath={HOLIDAY_CATERING_PATH}
            labelledBy="holiday-request-bottom-heading"
          />
        </div>
      </div>
    </div>
  )
}
