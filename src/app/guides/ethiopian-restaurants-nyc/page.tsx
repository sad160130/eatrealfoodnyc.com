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
import GuideYoutubeShort from "@/components/guide-youtube-short"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import {
  AWASH_CAMIS,
  AWASH_SLUG,
  DOHMH_DATASET_ID,
  DOHMH_DATASET_URL,
  DOHMH_FILE_ROWS,
  DOHMH_NEWEST_INSPECTION_LABEL,
  DOHMH_RECORD_DATE,
  DOHMH_RECORD_DATE_LABEL,
  ETHIOPIAN_DESCRIPTION,
  ETHIOPIAN_BOROUGH_ONLY,
  ETHIOPIAN_ESTABLISHMENT_COUNT,
  ETHIOPIAN_EXCEPTIONS,
  ETHIOPIAN_FAQS,
  ETHIOPIAN_GRADE_A_COUNT,
  ETHIOPIAN_INTRO,
  ETHIOPIAN_NOT_YET_INSPECTED_COUNT,
  ETHIOPIAN_PATH,
  ETHIOPIAN_PULLED_ON_LABEL,
  ETHIOPIAN_RESTAURANTS,
  ETHIOPIAN_ROW_COUNT,
  ETHIOPIAN_TITLE,
  articleSchema,
  camisUrl,
  faqPageSchema,
  organizationSchema,
  restaurantHref,
} from "@/data/ethiopian-restaurants-nyc"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("ethiopian-restaurants-nyc")!
const awash = ETHIOPIAN_RESTAURANTS.find((row) => row.camis === AWASH_CAMIS)!

export const metadata: Metadata = {
  title: ETHIOPIAN_TITLE,
  description: ETHIOPIAN_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(ETHIOPIAN_PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: ETHIOPIAN_TITLE,
    description: ETHIOPIAN_DESCRIPTION,
    type: "article",
    url: `${siteUrl}${ETHIOPIAN_PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ETHIOPIAN_TITLE }],
  },
}

export default function EthiopianRestaurantsNyc() {
  return (
    <GuideLayout guide={guide}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema(siteUrl), faqPageSchema(), organizationSchema(siteUrl)]),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle={`${ETHIOPIAN_ESTABLISHMENT_COUNT} Ethiopian restaurants are in the NYC inspection file. ${ETHIOPIAN_GRADE_A_COUNT} hold a Grade A. The table ranks Grade A first, lowest score first.`}
        stats={[
          { label: "Establishments", stat: String(ETHIOPIAN_ESTABLISHMENT_COUNT) },
          { label: "Grade A", stat: String(ETHIOPIAN_GRADE_A_COUNT) },
          { label: "Record date", stat: DOHMH_RECORD_DATE_LABEL },
        ]}
        note={`Dataset record_date ${DOHMH_RECORD_DATE_LABEL}, stored as ${DOHMH_RECORD_DATE}. Newest inspection_date in the file: ${DOHMH_NEWEST_INSPECTION_LABEL}. Source: NYC DOHMH Open Data dataset ${DOHMH_DATASET_ID}.`}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#the-list", label: "The 19 establishments" },
            { href: "#how-to-read", label: "How to read an inspection record" },
            { href: "#method", label: "Method and source" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="what-this-list-is" className="mb-16 scroll-mt-24">
          <p className="text-lg leading-relaxed text-gray-700">{ETHIOPIAN_INTRO}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-700">
            Letter grades and scores come from the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Department of Health and Mental Hygiene Restaurant Inspection Results
            </a>{" "}
            (dataset {DOHMH_DATASET_ID}). The dataset record_date on this pull is {DOHMH_RECORD_DATE_LABEL}, stored as{" "}
            {DOHMH_RECORD_DATE}. The newest inspection_date in that file is {DOHMH_NEWEST_INSPECTION_LABEL}. For the
            rules behind A, B, C, and Grade Pending, see{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC restaurant grades
            </Link>
            . The citywide count of scores 12, 13, and 14 is in{" "}
            <Link href="/data/nyc-restaurant-score-13-cliff" className="font-semibold text-jade hover:text-forest">
              the score 13 cliff
            </Link>
            . Borough rates are in the{" "}
            <Link href="/data/nyc-restaurant-health-grade-report" className="font-semibold text-jade hover:text-forest">
              NYC restaurant health grade report
            </Link>
            . Start from the{" "}
            <Link href="/nyc/brooklyn/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Brooklyn
            </Link>{" "}
            and{" "}
            <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>{" "}
            hubs. One establishment in this file is in{" "}
            <Link href="/nyc/queens/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Queens
            </Link>
            .
          </p>
        </section>

        <section id="the-list" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Ethiopian restaurants in the city file
          </h2>
          <p className="mb-8 text-base leading-relaxed text-gray-700">
            Grade A is first, ordered by lowest score, then newer inspection date. A name links to a published listing
            only when one matched. The other names are plain text.
          </p>
          <div className="overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Ethiopian restaurants in the NYC inspection file, with neighborhood, latest letter grade, score, and
                inspection date. Grade A is ranked first by lowest score.
              </caption>
              <thead>
                <tr style={{ color: "var(--color-muted)" }}>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Neighborhood
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Grade
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Score
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Inspected
                  </th>
                </tr>
              </thead>
              <tbody>
                {ETHIOPIAN_RESTAURANTS.map((row) => (
                  <tr key={row.camis} id={`camis-${row.camis}`} className="border-t scroll-mt-24" style={{ borderColor: "var(--hairline)" }}>
                    <th scope="row" className="px-3 py-3 font-semibold text-forest">
                      {row.slug ? (
                        <Link href={restaurantHref(row.slug)} className="hover:text-jade">
                          {row.name}
                        </Link>
                      ) : (
                        row.name
                      )}
                    </th>
                    <td className="px-3 py-3 text-gray-700">{row.place}</td>
                    <td className="px-3 py-3 text-gray-700">{row.gradeLabel}</td>
                    <td className="px-3 py-3 tabular text-gray-700">{row.score == null ? "—" : row.score}</td>
                    <td className="px-3 py-3 text-gray-700">
                      {row.inspectionDate && row.inspectionDateLabel ? (
                        <time dateTime={row.inspectionDate}>{row.inspectionDateLabel}</time>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10 space-y-8">
            {ETHIOPIAN_RESTAURANTS.map((row) => (
              <div key={`${row.camis}-note`}>
                <h3 className="text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                  {row.rank}. {row.slug ? (
                    <Link href={restaurantHref(row.slug)} className="hover:text-jade">
                      {row.name}
                    </Link>
                  ) : (
                    row.name
                  )}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-700">{row.factualLine}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {row.gradeLabel}
                  {row.score == null ? "" : `, score ${row.score}`}
                  {row.inspectionDateLabel ? `, ${row.inspectionDateLabel}` : ""}. Address: {row.address}. CAMIS{" "}
                  {row.camis}
                  {row.officialDba.toUpperCase() !== row.name.toUpperCase() ? `, filed as ${row.officialDba}` : ""}.{" "}
                  <a href={camisUrl(row.camis)} className="font-semibold text-jade hover:text-forest">
                    City restaurant detail
                  </a>
                  .
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-to-read" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How to read an inspection record
          </h2>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            An inspection score is a total of violation points. A score of 0 to 13 is the Grade A band. A score of 13 is
            the last point of the A band. A score of 14 starts the B band. {FOOD_SAFETY_SENTENCE} The letter rules are
            in{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC restaurant grades
            </Link>
            , and the count of 2026 initial inspections at 13 and 14 is in{" "}
            <Link href="/data/nyc-restaurant-score-13-cliff" className="font-semibold text-jade hover:text-forest">
              the score 13 cliff
            </Link>
            .
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            <Link href={`#camis-${awash.camis}`} className="font-semibold text-jade hover:text-forest">
              {awash.name}
            </Link>{" "}
            in Cobble Hill, Brooklyn, scored {awash.score} on {awash.inspectionDateLabel}. The letter on that inspection
            is {awash.gradeCode}. The November 24, 2026 YouTube Short walks through that record. A grade is a sanitary
            score, not a taste score.
          </p>
          <GuideYoutubeShort
            slug={AWASH_SLUG}
            restaurantName="Awash"
            inspectionDateIso={awash.inspectionDate ?? ""}
            inspectionDateLabel={awash.inspectionDateLabel ?? ""}
          />
        </section>

        <section id="method" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Method and source
          </h2>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Source file: NYC DOHMH Restaurant Inspection Results, Socrata id {DOHMH_DATASET_ID}. Pulled{" "}
            {ETHIOPIAN_PULLED_ON_LABEL}, America/New_York. The dataset record_date is {DOHMH_RECORD_DATE_LABEL}, stored
            as {DOHMH_RECORD_DATE}. The newest inspection_date in the file is {DOHMH_NEWEST_INSPECTION_LABEL}. The file
            had {DOHMH_FILE_ROWS.toLocaleString("en-US")} rows. The Ethiopian extract is {ETHIOPIAN_ROW_COUNT} rows and{" "}
            {ETHIOPIAN_ESTABLISHMENT_COUNT} distinct CAMIS values, filtered with cuisine_description equal to Ethiopian.
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            One establishment is one CAMIS. Rows dated before 1901 are the January 1, 1900 placeholder. An establishment
            whose only dates are that placeholder is not yet inspected. {ETHIOPIAN_NOT_YET_INSPECTED_COUNT} of these{" "}
            {ETHIOPIAN_ESTABLISHMENT_COUNT} were in that group. For every other establishment, the row in the table is
            the newest inspection date that has a grade code or a score. Violation lines on that date are one
            inspection. A blank grade beside a letter is not a second grade. Z and P are shown as Grade Pending. N and a
            blank letter are shown as Not Yet Graded. A later visit with a score and no letter is not replaced by an
            older letter. An administrative row with neither a grade nor a score is skipped.
          </p>
          {ETHIOPIAN_EXCEPTIONS.map((line) => (
            <p key={line} className="mb-5 text-base leading-relaxed text-gray-700">
              {line}
            </p>
          ))}
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Grade A rows are ranked first, by lowest score, then by newer inspection date, then by name. Place is the
            published listing neighborhood when a listing is linked. Otherwise it is the 2010 Neighborhood Tabulation
            Area name from our neighborhood file, plus the borough.{" "}
            {ETHIOPIAN_BOROUGH_ONLY.length === 0
              ? "Every row has a neighborhood."
              : `${ETHIOPIAN_BOROUGH_ONLY.map((row) => row.name).join(" and ")} have no NTA code on the city record, so the place is the borough only.`}{" "}
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            A name links to /restaurants/ only when a published, operational listing matched that CAMIS on name and
            address, or on the same street number and phone when the city DBA spelling differs. Awash at 242 Court
            Street is the{" "}
            <Link href={restaurantHref(AWASH_SLUG)} className="font-semibold text-jade hover:text-forest">
              Awash listing
            </Link>
            . Awash at 338 East 6 Street is a different CAMIS and is not linked. The factual line under each name is the
            directory type, neighborhood, rating, and review count when a listing matched, or the city cuisine
            description when it did not. This page does not add dishes, prices, hours, or quotes.
          </p>
          <p className="text-base leading-relaxed text-gray-700">
            The city file is public at the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Open Data dataset {DOHMH_DATASET_ID}
            </a>
            . Method notes for the directory are on{" "}
            <Link href="/about/our-data" className="font-semibold text-jade hover:text-forest">
              About our data
            </Link>
            . Citywide rates are in the{" "}
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
            {ETHIOPIAN_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === ETHIOPIAN_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Browse the borough hubs"
          body="This table is every Ethiopian establishment in the city inspection file. The directory publishes a subset of NYC restaurants, with the grade that is stored on each listing."
          primaryLabel="Healthy restaurants in Brooklyn"
          primaryHref="/nyc/brooklyn/healthy-restaurants"
          secondaryLabel="Healthy restaurants in Manhattan"
          secondaryHref="/nyc/manhattan/healthy-restaurants"
        />
      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
