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
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import { boroughToSlug } from "@/lib/utils"
import {
  BAGEL_ANSWER,
  BAGEL_BOROUGHS,
  BAGEL_CUISINE_COUNT,
  BAGEL_DESCRIPTION,
  BAGEL_ESTABLISHMENT_COUNT,
  BAGEL_FAQS,
  BAGEL_GRADE_A_COUNT,
  BAGEL_LINKED_COUNT,
  BAGEL_NAME_ONLY_COUNT,
  BAGEL_PATH,
  BAGEL_PULLED_ON_LABEL,
  BAGEL_ROW_COUNT,
  BAGEL_TITLE,
  BAGEL_UNMATCHED,
  DOHMH_DATASET_ID,
  DOHMH_DATASET_URL,
  DOHMH_FILE_ROWS,
  DOHMH_NEWEST_INSPECTION_LABEL,
  DOHMH_RECORD_DATE,
  DOHMH_RECORD_DATE_LABEL,
  articleSchema,
  camisUrl,
  faqPageSchema,
  itemListSchema,
  organizationSchema,
  restaurantHref,
} from "@/data/best-bagels-nyc"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("best-bagels-nyc")!

export const metadata: Metadata = {
  title: BAGEL_TITLE,
  description: BAGEL_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(BAGEL_PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: BAGEL_TITLE,
    description: BAGEL_DESCRIPTION,
    type: "article",
    url: `${siteUrl}${BAGEL_PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: BAGEL_TITLE }],
  },
}

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`
}

export default function BestBagelsNyc() {
  return (
    <GuideLayout guide={guide}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            articleSchema(siteUrl),
            faqPageSchema(),
            itemListSchema(siteUrl),
            organizationSchema(siteUrl),
          ]),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle={BAGEL_ANSWER}
        stats={[
          { label: "Establishments", stat: BAGEL_ESTABLISHMENT_COUNT.toLocaleString("en-US") },
          { label: "Grade A", stat: BAGEL_GRADE_A_COUNT.toLocaleString("en-US") },
          { label: "Record date", stat: DOHMH_RECORD_DATE_LABEL },
        ]}
        note={`Dataset record_date ${DOHMH_RECORD_DATE_LABEL}, stored as ${DOHMH_RECORD_DATE}. Newest inspection_date in the file: ${DOHMH_NEWEST_INSPECTION_LABEL}. Source: NYC DOHMH Open Data dataset ${DOHMH_DATASET_ID}.`}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#how-many", label: "How many, and how many hold an A" },
            ...BAGEL_BOROUGHS.map((group) => ({ href: `#${boroughToSlug(group.borough)}`, label: group.borough })),
            { href: "#method", label: "How this list was ranked" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="how-many" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How many bagel shops are in the city file, and how many hold an A?
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">{BAGEL_ANSWER}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-700">
            {countPhrase(BAGEL_CUISINE_COUNT, "establishment uses", "establishments use")} the city cuisine Bagels/Pretzels.{" "}
            {countPhrase(BAGEL_NAME_ONLY_COUNT, "has", "have")} bagel in the name and a different cuisine description.
            Together that is {BAGEL_ESTABLISHMENT_COUNT.toLocaleString("en-US")} distinct CAMIS values.{" "}
            {BAGEL_GRADE_A_COUNT.toLocaleString("en-US")} hold a Grade A on the latest inspection that has a letter or a score.{" "}
            {FOOD_SAFETY_SENTENCE} It is not a taste claim.
          </p>
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
            . Early openings are a separate list on{" "}
            <Link href="/guides/healthy-breakfast-nyc" className="font-semibold text-jade hover:text-forest">
              healthy breakfast in NYC
            </Link>
            .
          </p>
        </section>

        {BAGEL_BOROUGHS.map((group) => (
          <section key={group.borough} id={boroughToSlug(group.borough)} className="mb-16 scroll-mt-24">
            <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              {group.borough}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-700">
              {group.borough} has {group.shops.length.toLocaleString("en-US")} of these establishments.{" "}
              {group.gradeA.toLocaleString("en-US")} hold a Grade A. Within {group.borough}, Grade A is first, then the
              lowest score, then Google rating and review count when a published listing matched.{" "}
              {FOOD_SAFETY_SENTENCE} It is not a taste claim. Browse{" "}
              <Link href={group.href} className="font-semibold text-jade hover:text-forest">
                healthy restaurants in {group.borough === "Bronx" ? "the Bronx" : group.borough}
              </Link>
              .
            </p>
            <div className="overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  {group.borough} establishments with cuisine Bagels/Pretzels or bagel in the name, ranked by latest
                  inspection grade, then lowest score.
                </caption>
                <thead>
                  <tr style={{ color: "var(--color-muted)" }}>
                    <th scope="col" className="px-3 py-2 font-medium">#</th>
                    <th scope="col" className="px-3 py-2 font-medium">Name</th>
                    <th scope="col" className="px-3 py-2 font-medium">Cuisine</th>
                    <th scope="col" className="px-3 py-2 font-medium">Grade</th>
                    <th scope="col" className="px-3 py-2 font-medium">Score</th>
                    <th scope="col" className="px-3 py-2 font-medium">Inspected</th>
                  </tr>
                </thead>
                <tbody>
                  {group.shops.map((shop) => (
                    <tr key={shop.camis} id={`camis-${shop.camis}`} className="border-t scroll-mt-24" style={{ borderColor: "var(--hairline)" }}>
                      <td className="px-3 py-3 tabular text-gray-700">{shop.rank}</td>
                      <th scope="row" className="px-3 py-3 font-semibold text-forest">
                        {shop.slug ? (
                          <Link href={restaurantHref(shop.slug)} className="hover:text-jade">
                            {shop.name}
                          </Link>
                        ) : (
                          shop.name
                        )}
                      </th>
                      <td className="px-3 py-3 text-gray-700">{shop.cuisine}</td>
                      <td className="px-3 py-3 text-gray-700">{shop.gradeLabel}</td>
                      <td className="px-3 py-3 tabular text-gray-700">{shop.score == null ? "—" : shop.score}</td>
                      <td className="px-3 py-3 text-gray-700">
                        {shop.inspectionDate && shop.inspectionDateLabel ? (
                          <time dateTime={shop.inspectionDate}>{shop.inspectionDateLabel}</time>
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

        <section id="method" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How this list was ranked
          </h2>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Source file: NYC DOHMH Restaurant Inspection Results, Socrata id {DOHMH_DATASET_ID}. Pulled{" "}
            {BAGEL_PULLED_ON_LABEL}, America/New_York. The dataset record_date is {DOHMH_RECORD_DATE_LABEL}, stored as{" "}
            {DOHMH_RECORD_DATE}. The newest inspection_date in the file is {DOHMH_NEWEST_INSPECTION_LABEL}. The file had{" "}
            {DOHMH_FILE_ROWS.toLocaleString("en-US")} rows. The bagel extract is {BAGEL_ROW_COUNT.toLocaleString("en-US")}{" "}
            rows and {BAGEL_ESTABLISHMENT_COUNT.toLocaleString("en-US")} distinct CAMIS values. The filter is cuisine
            description equal to Bagels/Pretzels, or a DBA containing bagel.
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            One establishment is one CAMIS. Rows dated before 1901 are the January 1, 1900 placeholder. For every other
            establishment, the row in the table is the newest inspection date that has a grade code or a score. Violation
            lines on that date are one inspection. A later visit with a score and no letter is not replaced by an older
            letter. {FOOD_SAFETY_SENTENCE} It is not a taste claim.
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Inside each borough, Grade A rows are first, then the lowest score, then the higher Google rating, then the
            higher review count. Rating and review count are shown only when a published, operational listing matched
            that CAMIS on normalized name and building number. {BAGEL_LINKED_COUNT.toLocaleString("en-US")} names link to
            a listing. The other names are plain text. A name that adds a neighborhood after the city DBA can still match.
            A shared phone number does not.
          </p>
          {BAGEL_UNMATCHED.length > 0 ? (
            <p className="mb-5 text-base leading-relaxed text-gray-700">
              {BAGEL_UNMATCHED.length.toLocaleString("en-US")} published listings with bagel in the name did not match a
              city record on name and building number, so they are not in the tables:{" "}
              {BAGEL_UNMATCHED.map((listing, index) => (
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
            {BAGEL_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === BAGEL_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Browse the borough hubs"
          body="The tables are every matching establishment in the city inspection file. The directory publishes a subset, and a name is linked only when the listing matched."
          primaryLabel="Healthy restaurants in Manhattan"
          primaryHref="/nyc/manhattan/healthy-restaurants"
          secondaryLabel="Healthy breakfast in NYC"
          secondaryHref="/guides/healthy-breakfast-nyc"
        />
      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
