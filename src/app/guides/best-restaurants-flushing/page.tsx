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
import {
  DOHMH_DATASET_ID,
  DOHMH_DATASET_URL,
  DOHMH_FILE_ROWS,
  DOHMH_NEWEST_INSPECTION_LABEL,
  DOHMH_RECORD_DATE,
  DOHMH_RECORD_DATE_LABEL,
  FLUSHING_ANSWER,
  FLUSHING_CITYWIDE,
  FLUSHING_CUISINE_PICKS,
  FLUSHING_DESCRIPTION,
  FLUSHING_ESTABLISHMENT_COUNT,
  FLUSHING_FAQS,
  FLUSHING_GRADE_A_LINKED,
  FLUSHING_LETTER_TIES,
  FLUSHING_NOT_GRADE_A,
  FLUSHING_NTA,
  FLUSHING_NTA_COUNT,
  FLUSHING_PATH,
  FLUSHING_PULLED_ON_LABEL,
  FLUSHING_SHARE,
  FLUSHING_TITLE,
  PRIOR_FLUSHING,
  PRIOR_RECORD_DATE_LABEL,
  QUEENS_HUB,
  REPORT_NEIGHBORHOODS,
  articleSchema,
  camisUrl,
  faqPageSchema,
  itemListSchema,
  organizationSchema,
  restaurantHref,
} from "@/data/best-restaurants-flushing"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("best-restaurants-flushing")!

export const metadata: Metadata = {
  title: FLUSHING_TITLE,
  description: FLUSHING_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(FLUSHING_PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: FLUSHING_TITLE,
    description: FLUSHING_DESCRIPTION,
    type: "article",
    url: `${siteUrl}${FLUSHING_PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: FLUSHING_TITLE }],
  },
}

export default function BestRestaurantsFlushing() {
  const toc = [
    { href: "#share", label: "Flushing's Grade A share" },
    ...(FLUSHING_CUISINE_PICKS.length > 0 ? [{ href: "#picks", label: "Grade A picks by cuisine" }] : []),
    ...(FLUSHING_NOT_GRADE_A.length > 0 ? [{ href: "#not-grade-a", label: "Matched listings that are not Grade A" }] : []),
    { href: "#method", label: "How the share was counted" },
    { href: "#faq", label: "FAQ" },
  ]

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
        subtitle={FLUSHING_ANSWER}
        stats={[
          { label: "Grade A share", stat: FLUSHING_SHARE.share },
          { label: "Letter-graded", stat: FLUSHING_SHARE.letterGraded.toLocaleString("en-US") },
          { label: "Record date", stat: DOHMH_RECORD_DATE_LABEL },
        ]}
        note={`NTA ${FLUSHING_NTA}. Dataset record_date ${DOHMH_RECORD_DATE_LABEL}, stored as ${DOHMH_RECORD_DATE}. Newest inspection_date in the file: ${DOHMH_NEWEST_INSPECTION_LABEL}. Source: NYC DOHMH Open Data dataset ${DOHMH_DATASET_ID}.`}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC items={toc} />

        <section id="share" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What share of Flushing restaurants hold a Grade A?
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">{FLUSHING_ANSWER}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-700">
            {FOOD_SAFETY_SENTENCE} It is not a taste claim. The share is {FLUSHING_SHARE.a.toLocaleString("en-US")} Grade
            A restaurants out of {FLUSHING_SHARE.letterGraded.toLocaleString("en-US")} whose latest letter is A, B, or C.
            Flushing is Neighborhood Tabulation Area {FLUSHING_NTA}. Citywide, the same rule puts Grade A at{" "}
            {FLUSHING_CITYWIDE.share} ({FLUSHING_CITYWIDE.a.toLocaleString("en-US")} of{" "}
            {FLUSHING_CITYWIDE.letterGraded.toLocaleString("en-US")}). The{" "}
            <Link href={REPORT_NEIGHBORHOODS} className="font-semibold text-jade hover:text-forest">
              NYC restaurant health grade report
            </Link>{" "}
            listed Flushing at {PRIOR_FLUSHING.share} ({PRIOR_FLUSHING.a.toLocaleString("en-US")} of{" "}
            {PRIOR_FLUSHING.letterGraded.toLocaleString("en-US")}) in the {PRIOR_RECORD_DATE_LABEL} extract. On the{" "}
            {DOHMH_RECORD_DATE_LABEL} file the share is {FLUSHING_SHARE.share}.
            {FLUSHING_SHARE.uniqueLowest
              ? ` Flushing is still the lowest of ${FLUSHING_NTA_COUNT.toLocaleString("en-US")} NTAs with at least 80 letter-graded restaurants.`
              : ""}
          </p>
          <p className="mt-6 text-base leading-relaxed text-gray-700">
            The file has {FLUSHING_ESTABLISHMENT_COUNT.toLocaleString("en-US")} establishments in this NTA. That count
            includes kitchens that are not letter-graded. The neighborhood directory is{" "}
            <Link href="/nyc/queens/flushing/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              healthy restaurants in Flushing
            </Link>
            , and the borough hub is{" "}
            <Link href={QUEENS_HUB} className="font-semibold text-jade hover:text-forest">
              healthy restaurants in Queens
            </Link>
            .
          </p>
        </section>

        {FLUSHING_CUISINE_PICKS.length > 0 ? (
          <section id="picks" className="mb-16 scroll-mt-24">
            <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              Grade A picks by city cuisine
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-700">
              {FLUSHING_GRADE_A_LINKED.length.toLocaleString("en-US")} published listings matched a Flushing CAMIS on
              name and building number and hold a Grade A on the latest inspection that has a letter or a score. Each
              cuisine below shows up to three, lowest score first, then Google rating and review count.{" "}
              {FOOD_SAFETY_SENTENCE} It is not a taste claim.
            </p>
            <div className="space-y-12">
              {FLUSHING_CUISINE_PICKS.map((group) => (
                <div key={group.cuisine}>
                  <h3 className="text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {group.cuisine}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-700">
                    {group.picks.length === group.gradeALinked
                      ? `${group.gradeALinked.toLocaleString("en-US")} published Grade A ${group.gradeALinked === 1 ? "listing matches" : "listings match"} city cuisine ${group.cuisine} in NTA ${FLUSHING_NTA}.`
                      : `Showing ${group.picks.length} of ${group.gradeALinked.toLocaleString("en-US")} published Grade A listings with city cuisine ${group.cuisine} in NTA ${FLUSHING_NTA}.`}
                  </p>
                  <div className="mt-6 space-y-8">
                    {group.picks.map((row) => (
                      <div key={row.camis}>
                        <h4 className="text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                          <Link href={restaurantHref(row.slug)} className="hover:text-jade">
                            {row.name}
                          </Link>
                        </h4>
                        <p className="mt-2 text-base leading-relaxed text-gray-700">{row.factualLine}</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {row.gradeLabel}
                          {row.score == null ? "" : `, score ${row.score}`}
                          {row.inspectionDateLabel ? `, ${row.inspectionDateLabel}` : ""}. Address: {row.address}. City
                          cuisine: {row.cuisine}. CAMIS {row.camis}.{" "}
                          <a href={camisUrl(row.camis)} className="font-semibold text-jade hover:text-forest">
                            DOHMH inspection record
                          </a>
                          .{" "}
                          <Link href={restaurantHref(row.slug)} className="font-semibold text-jade hover:text-forest">
                            Eat Real Food NYC listing
                          </Link>
                          .
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {FLUSHING_NOT_GRADE_A.length > 0 ? (
          <section id="not-grade-a" className="mb-16 scroll-mt-24">
            <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              Matched listings whose latest inspection is not Grade A
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-700">
              {FLUSHING_NOT_GRADE_A.length.toLocaleString("en-US")} published listings matched a Flushing CAMIS and do
              not hold a Grade A on the latest inspection that has a letter or a score. A later visit with a score and
              no letter is not shown as an older A. {FOOD_SAFETY_SENTENCE} It is not a taste claim.
            </p>
            <div className="overflow-x-auto border" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Published Flushing listings whose latest inspection is not Grade A
                </caption>
                <thead>
                  <tr style={{ color: "var(--color-muted)" }}>
                    <th scope="col" className="px-3 py-2 font-medium">Name</th>
                    <th scope="col" className="px-3 py-2 font-medium">Cuisine</th>
                    <th scope="col" className="px-3 py-2 font-medium">Grade</th>
                    <th scope="col" className="px-3 py-2 font-medium">Score</th>
                    <th scope="col" className="px-3 py-2 font-medium">Inspected</th>
                  </tr>
                </thead>
                <tbody>
                  {FLUSHING_NOT_GRADE_A.map((row) => (
                    <tr key={row.camis} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                      <th scope="row" className="px-3 py-3 font-semibold text-forest">
                        <Link href={restaurantHref(row.slug)} className="hover:text-jade">
                          {row.name}
                        </Link>
                      </th>
                      <td className="px-3 py-3 text-gray-700">{row.cuisine}</td>
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
        ) : null}

        <section id="method" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How the share was counted
          </h2>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            Source file: NYC DOHMH Restaurant Inspection Results, Socrata id {DOHMH_DATASET_ID}. Pulled{" "}
            {FLUSHING_PULLED_ON_LABEL}, America/New_York. The dataset record_date is {DOHMH_RECORD_DATE_LABEL}, stored as{" "}
            {DOHMH_RECORD_DATE}. The newest inspection_date in the file is {DOHMH_NEWEST_INSPECTION_LABEL}. The file had{" "}
            {DOHMH_FILE_ROWS.toLocaleString("en-US")} rows. Flushing in this page is NTA {FLUSHING_NTA}, the same code the
            directory uses for the Flushing neighborhood in Queens.
          </p>
          <p className="mb-5 text-base leading-relaxed text-gray-700">
            The share uses one latest A, B, or C per CAMIS. The date is grade_date.{" "}
            {FLUSHING_LETTER_TIES === 0
              ? "No CAMIS had two different letters on that date."
              : `${FLUSHING_LETTER_TIES.toLocaleString("en-US")} CAMIS values had two different letters on that date and are left out.`}{" "}
            NTAs need at least 80 letter-graded restaurants.
            Names are 2010 Neighborhood Tabulation Area names. {FLUSHING_NTA_COUNT.toLocaleString("en-US")} NTAs met the
            cutoff. {FOOD_SAFETY_SENTENCE} It is not a taste claim.
          </p>
          <p className="text-base leading-relaxed text-gray-700">
            The picks use a different row: the newest inspection that has a letter or a score, not an older letter hiding
            behind a later ungraded visit. A listing is linked only when the published name and building number match the
            city record. The city file is public at the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Open Data dataset {DOHMH_DATASET_ID}
            </a>
            . Borough context is on{" "}
            <Link href={QUEENS_HUB} className="font-semibold text-jade hover:text-forest">
              healthy restaurants in Queens
            </Link>
            .
          </p>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {FLUSHING_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === FLUSHING_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Browse Queens"
          body="Flushing is one neighborhood in the Queens directory. The borough hub lists published restaurants across Queens with the grade stored on each listing."
          primaryLabel="Healthy restaurants in Queens"
          primaryHref={QUEENS_HUB}
          secondaryLabel="Healthy restaurants in Flushing"
          secondaryHref="/nyc/queens/flushing/healthy-restaurants"
        />
      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
