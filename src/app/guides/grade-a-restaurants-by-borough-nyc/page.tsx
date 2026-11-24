import type { Metadata } from "next"
import Link from "next/link"
import FAQItem from "@/components/faq-item"
import { getCanonicalUrl } from "@/config/seo"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import GuideCTA from "@/components/guide-cta"
import AboutThisData from "@/components/about-this-data"
import ClaimListing from "@/components/claim-listing"
import GuideYoutubeShort from "@/components/guide-youtube-short"
import {
  DOHMH_DATASET_ID,
  DOHMH_DATASET_URL,
  GRADE_A_BOROUGH_DESCRIPTION,
  GRADE_A_BOROUGH_FAQS,
  GRADE_A_BOROUGH_HOW,
  GRADE_A_BOROUGH_INTRO,
  GRADE_A_BOROUGH_PATH,
  GRADE_A_BOROUGH_RESTAURANTS,
  GRADE_A_BOROUGH_TITLE,
  GRADE_A_BOROUGH_VERIFIED_ON,
  articleSchema,
  boroughHref,
  camisUrl,
  currentGradeARestaurants,
  faqPageSchema,
  itemListSchema,
  neighborhoodHref,
  organizationSchema,
  restaurantHref,
  ungradedRestaurants,
  type CheckedRestaurant,
} from "@/data/grade-a-restaurants-by-borough-nyc"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("grade-a-restaurants-by-borough-nyc")!

function KitchenEntry({ restaurant }: { restaurant: CheckedRestaurant }) {
  const ungraded = !restaurant.currentGradeA
  return (
    <li id={restaurant.slug} className="scroll-mt-24">
      <p className="eyebrow">
        {restaurant.placeLabel}
        {" · "}
        {ungraded
          ? `Latest inspection not yet graded · ${restaurant.latestDateLabel} · score ${restaurant.latestScore}`
          : `Grade ${restaurant.latestGrade} · ${restaurant.latestScore} points · ${restaurant.violationCount} violations`}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        <Link href={restaurantHref(restaurant.slug)} className="hover:text-jade">
          {restaurant.name}
        </Link>
      </h3>
      <p className="mt-2 text-base leading-relaxed text-gray-700">{restaurant.honestLine}</p>
      <p className="mt-4 text-base leading-relaxed text-gray-700">{restaurant.body}</p>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        {restaurant.currentGradeA ? (
          <>
            Official record: Grade {restaurant.latestGrade}, score {restaurant.latestScore},{" "}
            {restaurant.violationCount} violations, {restaurant.latestDateLabel} ({restaurant.inspectionType}
            ). The listing stores the same grade, score, and date.
          </>
        ) : (
          <>
            Latest NYC Open Data ({DOHMH_DATASET_ID}) inspection: {restaurant.latestDateLabel}, score{" "}
            {restaurant.latestScore}, {restaurant.violationCount} violations, no letter ({restaurant.inspectionType}
            ).
          </>
        )}{" "}
        Address: {restaurant.address}. CAMIS {restaurant.camis}
        {restaurant.officialDba !== restaurant.name.toUpperCase() ? `, filed as ${restaurant.officialDba}` : ""}.{" "}
        <a href={camisUrl(restaurant.camis)} className="font-semibold text-jade hover:text-forest">
          City restaurant detail
        </a>
        . See the{" "}
        <Link href={restaurantHref(restaurant.slug)} className="font-semibold text-jade hover:text-forest">
          Eat Real Food NYC listing
        </Link>
        , other{" "}
        <Link
          href={neighborhoodHref(restaurant.borough, restaurant.neighborhood)}
          className="font-semibold text-jade hover:text-forest"
        >
          healthy restaurants in {restaurant.neighborhood}
        </Link>
        , and the{" "}
        <Link href={boroughHref(restaurant.borough)} className="font-semibold text-jade hover:text-forest">
          {restaurant.borough} healthy restaurants
        </Link>{" "}
        hub.
        {restaurant.dietaryTags.includes("vegan") ? (
          <>
            {" "}
            The listing carries the vegan tag, so it also appears with{" "}
            <Link href="/healthy-restaurants/vegan" className="font-semibold text-jade hover:text-forest">
              vegan restaurants in NYC
            </Link>
            .
          </>
        ) : null}
        {restaurant.dietaryTags.includes("vegetarian") ? (
          <>
            {" "}
            The listing carries the vegetarian tag, so it also appears with{" "}
            <Link href="/healthy-restaurants/vegetarian" className="font-semibold text-jade hover:text-forest">
              vegetarian restaurants in NYC
            </Link>
            .
          </>
        ) : null}
        {restaurant.slug === "city-island-lobster-house" ? (
          <>
            {" "}
            Seafood listings are also covered in{" "}
            <Link href="/guides/seafood-healthy-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              healthy seafood restaurants in NYC
            </Link>
            .
          </>
        ) : null}
      </p>
      <GuideYoutubeShort
        slug={restaurant.slug}
        restaurantName={restaurant.name}
        inspectionDateIso={restaurant.latestDate}
        inspectionDateLabel={restaurant.latestDateLabel}
        publicTitle={ungraded ? `${restaurant.name} YouTube Short` : undefined}
      />
      <ClaimListing restaurantSlug={restaurant.slug} restaurantName={restaurant.name} showBadge={restaurant.currentGradeA} />
    </li>
  )
}

export const metadata: Metadata = {
  title: GRADE_A_BOROUGH_TITLE,
  description: GRADE_A_BOROUGH_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(GRADE_A_BOROUGH_PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: GRADE_A_BOROUGH_TITLE,
    description: GRADE_A_BOROUGH_DESCRIPTION,
    type: "article",
    url: `${siteUrl}${GRADE_A_BOROUGH_PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: GRADE_A_BOROUGH_TITLE }],
  },
}

export default function GradeARestaurantsByBoroughNyc() {
  const matches = currentGradeARestaurants()
  const ungraded = ungradedRestaurants()

  return (
    <GuideLayout guide={guide}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            articleSchema(siteUrl),
            itemListSchema(siteUrl),
            faqPageSchema(),
            organizationSchema(siteUrl),
          ]),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle="Five recent YouTube Shorts, checked against the live directory and the latest NYC Health Department inspection. Three latest inspections are a Grade A and match the listing. Two latest inspections are not yet graded."
        stats={[
          { label: "Kitchens checked", stat: String(GRADE_A_BOROUGH_RESTAURANTS.length) },
          { label: "Current Grade A matches", stat: String(matches.length) },
          { label: "Records verified", stat: GRADE_A_BOROUGH_VERIFIED_ON },
        ]}
        note={`Source: NYC DOHMH Open Data dataset ${DOHMH_DATASET_ID}, compared with the published listing on ${GRADE_A_BOROUGH_VERIFIED_ON}. A current match means the latest city grade, score, and date equal the listing, and the grade is A.`}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#what-we-checked", label: "What we checked" },
            { href: "#grade-a-matches", label: "Grade A matches" },
            ...matches.map((restaurant) => ({
              href: `#${restaurant.slug}`,
              label: restaurant.name,
            })),
            { href: "#not-yet-graded", label: "Latest inspection not yet graded" },
            ...ungraded.map((restaurant) => ({
              href: `#${restaurant.slug}`,
              label: restaurant.name,
            })),
            { href: "#how-we-checked", label: "How we checked" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="what-we-checked" className="mb-16 scroll-mt-24">
          <p className="text-lg leading-relaxed text-gray-700">{GRADE_A_BOROUGH_INTRO}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-700">
            Letter grades and scores come from the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Department of Health and Mental Hygiene Restaurant Inspection Results
            </a>{" "}
            (dataset {DOHMH_DATASET_ID}). The rules for the 0 to 13, 14 to 27, and 28-or-more bands are in{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC health grades explained
            </Link>
            . The same match rule, applied to a ranked Italian list, is on{" "}
            <Link href="/guides/best-italian-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              best Italian restaurants in NYC
            </Link>
            . Browse every published{" "}
            <Link href="/healthy-restaurants/grade-a" className="font-semibold text-jade hover:text-forest">
              Grade A restaurant in the directory
            </Link>
            , or start from the{" "}
            <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>
            ,{" "}
            <Link href="/nyc/brooklyn/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Brooklyn
            </Link>
            ,{" "}
            <Link href="/nyc/queens/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Queens
            </Link>
            ,{" "}
            <Link href="/nyc/bronx/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Bronx
            </Link>
            , or{" "}
            <Link href="/nyc/staten-island/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Staten Island
            </Link>{" "}
            hub.
          </p>
        </section>

        <section id="grade-a-matches" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Grade A matches
          </h2>
          <ol className="space-y-14">
            {matches.map((restaurant) => (
              <KitchenEntry key={restaurant.slug} restaurant={restaurant} />
            ))}
          </ol>
        </section>

        <section id="not-yet-graded" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Latest inspection not yet graded
          </h2>
          <p className="mb-8 text-base leading-relaxed text-gray-700">
            NYC Open Data dataset {DOHMH_DATASET_ID} records a latest inspection for each kitchen below. The grade
            field on that row is blank. The date and score shown here are that row, checked on {GRADE_A_BOROUGH_VERIFIED_ON}.
          </p>
          <ol className="space-y-14">
            {ungraded.map((restaurant) => (
              <KitchenEntry key={restaurant.slug} restaurant={restaurant} />
            ))}
          </ol>
        </section>

        <section id="how-we-checked" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we checked
          </h2>
          {GRADE_A_BOROUGH_HOW.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mb-5 text-base leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
          <p className="text-base leading-relaxed text-gray-700">
            The city file is public at the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Open Data dataset {DOHMH_DATASET_ID}
            </a>
            . How a letter is assigned is in{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC health grades explained
            </Link>{" "}
            and{" "}
            <Link href="/guides/nyc-restaurant-inspection-process" className="font-semibold text-jade hover:text-forest">
              how NYC restaurant inspections work
            </Link>
            . Method notes are on{" "}
            <Link href="/about/our-data" className="font-semibold text-jade hover:text-forest">
              About our data
            </Link>
            , and citywide rates are in the{" "}
            <Link href="/data/nyc-restaurant-health-grade-report" className="font-semibold text-jade hover:text-forest">
              NYC restaurant health grade report
            </Link>
            .
          </p>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {GRADE_A_BOROUGH_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === GRADE_A_BOROUGH_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="See every published Grade A listing"
          body="This page checks five kitchens, one in each borough. The directory also lists Grade A restaurants across neighborhoods and dietary tags. Owners can claim a listing without changing the inspection record."
          primaryLabel="Browse Grade A restaurants"
          primaryHref="/healthy-restaurants/grade-a"
          secondaryLabel="How NYC grades work"
          secondaryHref="/guides/nyc-health-grades-explained"
        />
      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
