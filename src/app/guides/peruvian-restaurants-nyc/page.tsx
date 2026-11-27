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
import { boroughToSlug } from "@/lib/utils"
import {
  DOHMH_DATASET_ID,
  DOHMH_DATASET_URL,
  DOHMH_FILE_ROWS,
  DOHMH_NEWEST_INSPECTION_LABEL,
  DOHMH_RECORD_DATE,
  DOHMH_RECORD_DATE_LABEL,
  JORA,
  JORA_SLUG,
  LIC_HUB,
  PERUVIAN_BOROUGHS,
  PERUVIAN_BOROUGH_ONLY,
  PERUVIAN_DESCRIPTION,
  PERUVIAN_ESTABLISHMENT_COUNT,
  PERUVIAN_EXCEPTIONS,
  PERUVIAN_FAQS,
  PERUVIAN_GRADE_A_COUNT,
  PERUVIAN_INSPECTED_COUNT,
  PERUVIAN_INTRO,
  PERUVIAN_LINKED_COUNT,
  PERUVIAN_NOT_YET_INSPECTED_COUNT,
  PERUVIAN_PATH,
  PERUVIAN_PLACEHOLDER_ROW_COUNT,
  PERUVIAN_PULLED_ON_LABEL,
  PERUVIAN_ROW_COUNT,
  PERUVIAN_TITLE,
  PERUVIAN_UNMATCHED,
  QUEENS_HUB,
  articleSchema,
  camisUrl,
  faqPageSchema,
  organizationSchema,
  restaurantHref,
} from "@/data/peruvian-restaurants-nyc"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("peruvian-restaurants-nyc")!

export const metadata: Metadata = {
  title: PERUVIAN_TITLE,
  description: PERUVIAN_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(PERUVIAN_PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: PERUVIAN_TITLE,
    description: PERUVIAN_DESCRIPTION,
    type: "article",
    url: `${siteUrl}${PERUVIAN_PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: PERUVIAN_TITLE }],
  },
}

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`
}

export default function PeruvianRestaurantsNyc() {
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
        subtitle={`${PERUVIAN_ESTABLISHMENT_COUNT.toLocaleString("en-US")} Peruvian restaurants are in the NYC inspection file. ${PERUVIAN_GRADE_A_COUNT.toLocaleString("en-US")} hold a Grade A. Each borough table ranks Grade A first, then the lowest score.`}
        stats={[
          { label: "Establishments", stat: PERUVIAN_ESTABLISHMENT_COUNT.toLocaleString("en-US") },
          { label: "Inspected", stat: PERUVIAN_INSPECTED_COUNT.toLocaleString("en-US") },
          { label: "Grade A", stat: PERUVIAN_GRADE_A_COUNT.toLocaleString("en-US") },
          { label: "Record date", stat: DOHMH_RECORD_DATE_LABEL },
        ]}
        note={`Dataset record_date ${DOHMH_RECORD_DATE_LABEL}, stored as ${DOHMH_RECORD_DATE}. Newest inspection_date in the file: ${DOHMH_NEWEST_INSPECTION_LABEL}. Inspected counts skip the January 1, 1900 placeholder. Source: NYC DOHMH Open Data dataset ${DOHMH_DATASET_ID}.`}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#how-many", label: "How many, and how many hold an A" },
            ...PERUVIAN_BOROUGHS.map((group) => ({ href: `#${boroughToSlug(group.borough)}`, label: group.borough })),
            { href: "#jora", label: "Jora in Long Island City" },
            { href: "#method", label: "Method and source" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="how-many" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How many Peruvian restaurants are in the city file?
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">{PERUVIAN_INTRO}</p>
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
            .{" "}
            <Link href={QUEENS_HUB} className="font-semibold text-jade hover:text-forest">
              Healthy restaurants in Queens
            </Link>{" "}
            is the borough hub. Jora&apos;s neighborhood page is{" "}
            <Link href={LIC_HUB} className="font-semibold text-jade hover:text-forest">
              healthy restaurants in Long Island City
            </Link>
            .
          </p>
        </section>

        {PERUVIAN_BOROUGHS.map((group) => (
          <section key={group.borough} id={boroughToSlug(group.borough)} className="mb-16 scroll-mt-24">
            <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              {group.borough}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-700">
              {group.borough} has {group.restaurants.length.toLocaleString("en-US")} of these establishments.{" "}
              {group.gradeA.toLocaleString("en-US")} hold a Grade A. {group.inspected.toLocaleString("en-US")} have an
              inspection date after the January 1, 1900 placeholder. Within {group.borough}, Grade A is first, then the
              lowest score, then the newer inspection date. {FOOD_SAFETY_SENTENCE} Browse{" "}
              <Link href={group.href} className="font-semibold text-jade hover:text-forest">
                healthy restaurants in {group.borough === "Bronx" ? "the Bronx" : group.borough}
              </Link>
              .
            </p>
            <div className="overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  {group.borough} establishments with cuisine description Peruvian, ranked by latest inspection grade,
                  then lowest score.
                </caption>
                <thead>
                  <tr style={{ color: "var(--color-muted)" }}>
                    <th scope="col" className="px-3 py-2 font-medium">
                      #
                    </th>
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
                  {group.restaurants.map((row) => (
                    <tr key={row.camis} id={`camis-${row.camis}`} className="border-t scroll-mt-24" style={{ borderColor: "var(--hairline)" }}>
                      <td className="px-3 py-3 tabular text-gray-700">{row.rank}</td>
                      <th scope="row" className="px-3 py-3 font-semibold text-forest">
                        {row.slug ? (
                          <Link href={restaurantHref(row.slug)} className="hover:text-jade">
                            {row.name}
                          </Link>
                        ) : (
                          row.name
                        )}
                      </th>
                      <td className="px-3 py-3 text-gray-700">{row.neighborhood ?? "—"}</td>
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
          </section>
        ))}

        <section id="jora" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Jora in Long Island City
          </h2>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            An inspection score is a total of violation points. A score of 0 to 13 is the Grade A band. A score of 13 is
            the last point of the A band. A score of 14 starts the B band. {FOOD_SAFETY_SENTENCE} The letter rules are
            in{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC restaurant grades
            </Link>
            .
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            <Link href={`#camis-${JORA.camis}`} className="font-semibold text-jade hover:text-forest">
              {JORA.name}
            </Link>{" "}
            in {JORA.place} scored {JORA.score} on {JORA.inspectionDateLabel}. The letter on that inspection is{" "}
            {JORA.gradeCode}. The address on the city record is {JORA.address}. CAMIS {JORA.camis}. {JORA.factualLine}{" "}
            The November 26, 2026 YouTube Short describes that record. A grade is a sanitary score, not a taste score.
          </p>
          <p className="mb-5 text-sm leading-relaxed text-gray-600">
            <a href={camisUrl(JORA.camis)} className="font-semibold text-jade hover:text-forest">
              DOHMH inspection record
            </a>
            {" · "}
            <Link href={restaurantHref(JORA_SLUG)} className="font-semibold text-jade hover:text-forest">
              Jora listing
            </Link>
            {" · "}
            <Link href={LIC_HUB} className="font-semibold text-jade hover:text-forest">
              healthy restaurants in Long Island City
            </Link>
          </p>
          <GuideYoutubeShort
            slug={JORA_SLUG}
            restaurantName="Jora"
            inspectionDateIso={JORA.inspectionDate ?? ""}
            inspectionDateLabel={JORA.inspectionDateLabel ?? ""}
          />
        </section>

        <section id="method" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Method and source
          </h2>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Source file: NYC DOHMH Restaurant Inspection Results, Socrata id {DOHMH_DATASET_ID}. Pulled{" "}
            {PERUVIAN_PULLED_ON_LABEL}, America/New_York. The dataset record_date is {DOHMH_RECORD_DATE_LABEL}, stored as{" "}
            {DOHMH_RECORD_DATE}. The newest inspection_date in the file is {DOHMH_NEWEST_INSPECTION_LABEL}. The file had{" "}
            {DOHMH_FILE_ROWS.toLocaleString("en-US")} rows. The Peruvian extract is {PERUVIAN_ROW_COUNT.toLocaleString("en-US")}{" "}
            rows and {PERUVIAN_ESTABLISHMENT_COUNT.toLocaleString("en-US")} distinct CAMIS values, filtered where
            cuisine_description contains Peruvian. Every row in the extract has cuisine description Peruvian.
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            One establishment is one CAMIS. Rows dated before 1901 are the January 1, 1900 placeholder. An establishment
            whose only dates are that placeholder is not yet inspected, and those dates are left out of the inspected
            count. This extract has {PERUVIAN_PLACEHOLDER_ROW_COUNT.toLocaleString("en-US")} placeholder rows.{" "}
            {countPhrase(PERUVIAN_NOT_YET_INSPECTED_COUNT, "establishment is", "establishments are")} in that group.{" "}
            {countPhrase(PERUVIAN_INSPECTED_COUNT, "establishment has", "establishments have")} an inspection date after
            the placeholder. For every inspected establishment, the row in the table is the newest inspection date that
            has a grade code or a score. Violation lines on that date are one inspection. A blank grade beside a letter
            is not a second grade. Z and P are shown as Grade Pending. N and a blank letter are shown as Not Yet Graded.
            A later visit with a score and no letter is not replaced by an older letter. An administrative row with
            neither a grade nor a score is skipped.
          </p>
          {PERUVIAN_EXCEPTIONS.length > 0 ? (
            <ul className="mb-5 list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-700">
              {PERUVIAN_EXCEPTIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Inside each borough, Grade A rows are first, then the lowest score, then the newer inspection date, then
            the name. Place is the published listing neighborhood when a listing is linked. Otherwise it is the 2010
            Neighborhood Tabulation Area name from our neighborhood file, plus the borough.{" "}
            {PERUVIAN_BOROUGH_ONLY.length === 0
              ? "Every row has a neighborhood."
              : PERUVIAN_BOROUGH_ONLY.length === 1
                ? `${PERUVIAN_BOROUGH_ONLY[0].name} has no NTA code on the city record, so the place is the borough only.`
                : `${PERUVIAN_BOROUGH_ONLY.map((row) => row.name).join(", ")} have no NTA code on the city record, so the place is the borough only.`}
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            {PERUVIAN_LINKED_COUNT.toLocaleString("en-US")} names link to a published, operational listing that matched
            that CAMIS on normalized name and building number in the same borough. The match was checked on{" "}
            {PERUVIAN_PULLED_ON_LABEL}. A listing name that adds words after the city DBA can still match. A shared phone
            number does not. Jora at 47-46 11th Street is the{" "}
            <Link href={restaurantHref(JORA_SLUG)} className="font-semibold text-jade hover:text-forest">
              Jora listing
            </Link>
            . The factual line for a linked name is the directory type, neighborhood, rating, and review count. This
            page does not add dishes, prices, hours, or quotes.
          </p>
          {PERUVIAN_UNMATCHED.length > 0 ? (
            <p className="mb-5 text-base leading-relaxed text-gray-700">
              {PERUVIAN_UNMATCHED.length.toLocaleString("en-US")} published listings with Peruvian in the name or type
              did not match a city Peruvian CAMIS on name and building number, so they are not in the tables:{" "}
              {PERUVIAN_UNMATCHED.map((listing, index) => (
                <span key={listing.slug}>
                  {index > 0 ? ", " : ""}
                  <Link href={restaurantHref(listing.slug)} className="font-semibold text-jade hover:text-forest">
                    {listing.name}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : null}
          <p className="text-base leading-relaxed text-gray-700">
            The city file is public at the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Open Data dataset {DOHMH_DATASET_ID}
            </a>
            . Method notes for the directory are on{" "}
            <Link href="/about/our-data" className="font-semibold text-jade hover:text-forest">
              About our data
            </Link>
            .
          </p>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {PERUVIAN_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === PERUVIAN_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Browse Queens and Long Island City"
          body="The tables are every establishment with cuisine description Peruvian in the city inspection file. The directory publishes a subset, and a name is linked only when the listing matched."
          primaryLabel="Healthy restaurants in Queens"
          primaryHref={QUEENS_HUB}
          secondaryLabel="Healthy restaurants in Long Island City"
          secondaryHref={LIC_HUB}
        />
      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
