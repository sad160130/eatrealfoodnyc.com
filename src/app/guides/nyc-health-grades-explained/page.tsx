import { guideAuthors } from "@/lib/founders"
import type { Metadata } from "next"
import Link from "next/link"
import FAQSchema from "@/components/faq-schema"
import FAQItem from "@/components/faq-item"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import GuideCTA from "@/components/guide-cta"
import AboutThisData from "@/components/about-this-data"
import DataCallout from "@/components/data-callout"
import GuideLinkIndex from "@/components/guide-link-index"
import { getLiveGuideStats } from "@/lib/live-guide-stats"
import GradeHubLinks from "@/components/grade-hub-links"
import { pageMeta } from "@/lib/page-meta"
import { healthGradesGuideDescription, healthGradesGuideTitle } from "@/lib/seo-titles"
import { HEALTH_GRADE_FAQS, HEALTH_GRADES_LEDE } from "@/content/health-grade-faqs"
import { CITYWIDE_RESTAURANT_GRADES } from "@/data/citywide-restaurant-grades"
import { percentOneDecimal } from "@/lib/citywide-grades"
import { ClaimListingCta, InspectionLeadsCta } from "@/components/product-ctas"
import DataSampleForm from "@/components/data-sample-form"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("nyc-health-grades-explained")!

export async function generateMetadata(): Promise<Metadata> {
  const meta = pageMeta({
    path: "/guides/nyc-health-grades-explained",
    title: healthGradesGuideTitle(),
    description: healthGradesGuideDescription(),
    type: "article",
    brand: false,
  })
  return {
    ...meta,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" as const },
    },
  }
}

export default async function NYCHealthGradesGuide() {
  const stats = await getLiveGuideStats()
  const description = healthGradesGuideDescription()
  const citywide = CITYWIDE_RESTAURANT_GRADES
  const grades = stats.grades
  const count = (value: number) => value.toLocaleString("en-US")
  const graded = stats.global.totalWithGrade
  const shareOfGraded = (count: number) => (graded > 0 ? Math.round((count / graded) * 100) : 0)
  const gradeAShare = shareOfGraded(stats.letters.A)
  const gradeBShare = shareOfGraded(stats.letters.B)
  const gradeCShare = shareOfGraded(stats.letters.C)
  const boroughTotal = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].reduce(
    (sum, name) => sum + (stats.global.boroughs[name]?.total ?? 0),
    0
  )
  return (
    <GuideLayout guide={guide}>
      {/* JSON-LD schemas */}
      <FAQSchema faqs={[...HEALTH_GRADE_FAQS]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description,
            author: guideAuthors(),
            publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            datePublished: "2026-01-15",
            dateModified: citywide.pulledOn,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/guides/nyc-health-grades-explained`,
            },
          }),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle={HEALTH_GRADES_LEDE}
        note={`Last updated ${citywide.pulledOnLabel}. Directory figures on this page are published listings. The citywide section is the DOHMH inspection file.`}
        stats={[
          { stat: count(grades.published), label: "Published listings" },
          { stat: `${grades.gradeAShareOfPublished}%`, label: "Grade A of published listings" },
          { stat: count(grades.pending), label: "Grade Pending (Z or P)" },
          { stat: grades.latestInspectionLabel ?? "None on file", label: "Newest inspection on file" },
        ]}
      />

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#grades-at-a-glance", label: "NYC restaurant grades at a glance" },
            { href: "#what-grade-a-means", label: "What a Grade A means" },
            { href: "#what-a-b-rating-means", label: "What a B rating means" },
            { href: "#what-a-c-rating-means", label: "What a C rating means" },
            { href: "#grade-pending", label: "What Grade Pending means" },
            { href: "#grade-z", label: "What Z means in the inspection data" },
            { href: "#how-scoring-works", label: "How the scoring works" },
            { href: "#citywide-file", label: "Citywide grades in the DOHMH file" },
            { href: "#look-up-by-borough", label: "Look up a grade by borough" },
            { href: "#what-is-a-health-grade", label: "What is a NYC restaurant health grade?" },
            { href: "#grade-breakdown", label: "Grade A, B, and C — what each means" },
            { href: "#how-inspection-works", label: "How the inspection process works" },
            { href: "#what-inspectors-check", label: "What inspectors actually look for" },
            { href: "#what-to-do", label: "What to do if your restaurant has a B or C" },
            { href: "#find-grades", label: "How to find a restaurant's grade in NYC" },
            { href: "#faq", label: "Frequently asked questions" },
          ]}
        />

        <section id="grades-at-a-glance" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            NYC restaurant grades at a glance
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            A NYC restaurant grade is a letter the Department of Health and Mental Hygiene assigns from a sanitary inspection score. Fewer points is a better grade. Since 2010, restaurants required to post a grade must put the card where people passing by can see it. The cutoffs below are from Health Code Chapter 23.
          </p>
          <div className="space-y-6">
            <div id="what-grade-a-means" className="scroll-mt-24">
              <h3 className="mb-2 text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                What a Grade A means
              </h3>
              <p className="leading-relaxed text-gray-700">
                A Grade A is a score of fewer than 14 points, which is 0 to 13, on the initial inspection or the reinspection in that cycle. The restaurant receives an A card and posts it immediately.
              </p>
              <p className="mt-4 leading-relaxed text-gray-700">
                A Grade A is an inspection letter, not a catering menu. For an office party or Thanksgiving week,{" "}
                <Link href="/catering/holiday-party-catering-nyc" className="font-semibold text-jade hover:text-forest">
                  holiday party catering in NYC from Grade A restaurants
                </Link>{" "}
                lists published Grade A restaurants for group orders. The request is free, and the page does not quote restaurant prices.
              </p>
            </div>
            <div id="what-a-b-rating-means" className="scroll-mt-24">
              <h3 className="mb-2 text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                What a B rating means
              </h3>
              <p className="leading-relaxed text-gray-700">
                A B rating is a reinspection score of 14 to 27 points. The Department does not issue a B on the first inspection of a cycle. A first-visit score of 14 or more is ungraded, and the reinspection is scheduled no sooner than 7 days later.
              </p>
            </div>
            <div id="what-a-c-rating-means" className="scroll-mt-24">
              <h3 className="mb-2 text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                What a C rating means
              </h3>
              <p className="leading-relaxed text-gray-700">
                A C rating is a reinspection score of 28 or more points. After a score of 28 or more, the Department may also conduct a compliance inspection. The score on that compliance inspection does not change the letter grade for the cycle.
              </p>
            </div>
            <div id="grade-pending" className="scroll-mt-24">
              <h3 className="mb-2 text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                What Grade Pending means
              </h3>
              <p className="leading-relaxed text-gray-700">
                Grade Pending means the letter grade for the current cycle is still being determined. When a reinspection scores 14 or more and the restaurant is not closed, it receives both the letter-grade card for that score and a Grade Pending card. It posts one of those cards until it has a chance to be heard at the OATH Health Tribunal. A first inspection of 14 or more does not itself issue a Grade Pending card: the restaurant keeps its previous grade card, or posts nothing if it has never had one, until the reinspection.
              </p>
            </div>
            <div id="grade-z" className="scroll-mt-24">
              <h3 className="mb-2 text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                What Z means in the inspection data
              </h3>
              <p className="leading-relaxed text-gray-700">
                Z is not a fourth letter in the window. In the DOHMH open dataset of restaurant inspection results, the grade field uses Z for Grade Pending. P means Grade Pending issued on re-opening following an initial inspection that resulted in a closure. N means Not Yet Graded. A, B, and C are the letter grades.
              </p>
            </div>
          </div>
        </section>

        <section id="how-scoring-works" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How the scoring works
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            Inspectors assign points for sanitary violations. Fewer points is a better grade. The letter cutoffs are in Health Code Chapter 23. A B or a C is issued on the reinspection, not on the first visit of the cycle. Z and P are Grade Pending codes in the city dataset, not letters in the window. The Health Department explains A, B, C, and Grade Pending on its{" "}
            <Link href="https://www.nyc.gov/site/doh/business/food-operators/letter-grading-for-restaurants.page" className="font-semibold text-jade hover:text-forest">
              letter-grading page
            </Link>
            .
          </p>
          <div className="my-6 overflow-hidden border" style={{ borderColor: "var(--hairline)", borderRadius: "4px", backgroundColor: "#fff" }}>
            <table className="w-full text-sm">
              <caption className="sr-only">How NYC inspection scores map to grades, with published listing counts</caption>
              <thead>
                <tr style={{ color: "var(--color-muted)" }}>
                  <th className="px-4 py-3 text-left font-medium">On file</th>
                  <th className="px-4 py-3 text-left font-medium">What the city uses</th>
                  <th className="px-4 py-3 text-right font-medium">Published listings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["A", "0–13 points, on the initial inspection or the reinspection", count(grades.A)],
                  ["B", "14–27 points on a reinspection", count(grades.B)],
                  ["C", "28 or more points on a reinspection", count(grades.C)],
                  ["Z / P", "Grade Pending. Z is pending. P is pending on re-opening after a closure.", `${count(grades.pending)} (${count(grades.pendingZ)} Z, ${count(grades.pendingP)} P)`],
                ].map((row) => (
                  <tr key={row[0]} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                    <td className="px-4 py-3 font-bold text-jade" style={{ fontFamily: "Georgia, serif" }}>{row[0]}</td>
                    <td className="px-4 py-3 text-gray-700">{row[1]}</td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-forest">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-lg leading-relaxed text-gray-700">
            Among {count(grades.published)} published listings, Grade A is {grades.gradeAShareOfPublished}% ({count(grades.A)} of {count(grades.published)}). {count(grades.ungraded)} have no A, B, C, Z, or P on file.{grades.latestInspectionLabel ? ` The newest inspection date on file is ${grades.latestInspectionLabel}.` : ""} These counts are this directory, not the citywide inspection file. The Monday file of inspection leads is{" "}
            <Link href="/data" className="font-semibold text-jade hover:text-forest">NYC Restaurant Compliance Weekly</Link>.
            A restaurant that wants a labeled placement, which does not change a grade, starts at{" "}
            <Link href="/partner-with-us" className="font-semibold text-jade hover:text-forest">partner with us</Link>.
          </p>
          <aside
            id="free-sample"
            className="mt-6 scroll-mt-24 border p-4"
            style={{ borderColor: "var(--hairline)", borderRadius: "4px", backgroundColor: "#fff" }}
          >
            <p className="eyebrow" style={{ color: "var(--color-jade)" }}>For vendors</p>
            <p className="mt-2 text-sm leading-relaxed">
              Sell to restaurants?{" "}
              <InspectionLeadsCta source="grades_guide">
                NYC Restaurant Compliance Weekly
              </InspectionLeadsCta>{" "}
              is the Monday file of inspection leads.
            </p>
            <DataSampleForm source="grades_guide" variant="compact" embedded idPrefix="grades-sample" />
          </aside>
        </section>

        <DataCallout
          heading="NYC Health Grade Data — Eat Real Food NYC Directory"
          intro={`Of the ${count(grades.published)} published listings in this directory, ${count(grades.A)} (${grades.gradeAShareOfPublished}%) hold a NYC DOHMH Grade A, ${count(grades.B)} hold a Grade B, and ${count(grades.C)} hold a Grade C. ${count(grades.pending)} are Grade Pending (${count(grades.pendingZ)} coded Z and ${count(grades.pendingP)} coded P). ${count(grades.ungraded)} have no A, B, C, Z, or P on file.${grades.latestInspectionLabel ? ` The newest inspection date on file is ${grades.latestInspectionLabel}.` : ""} Borough counts below cover all five boroughs and add up to ${boroughTotal.toLocaleString()} published listings${stats.global.unassignedBorough > 0 ? `; ${stats.global.unassignedBorough.toLocaleString()} published listings have no borough on file` : ""}.`}
          dataPoints={["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].map((name) => {
            const borough = stats.global.boroughs[name]
            return {
              stat: `${borough?.rate ?? 0}%`,
              label: `${name} restaurants with Grade A`,
              source: `${(borough?.gradeA ?? 0).toLocaleString()} Grade A of ${(borough?.total ?? 0).toLocaleString()} published`,
            }
          })}
          sourceNote="Counts are published listings in this directory. Grade A share is Grade A divided by published listings in that borough, not the citywide inspection rate. Each grade is the latest matched NYC DOHMH record."
          variant="green"
        />

        <section id="citywide-file" className="mb-16 scroll-mt-24">
          <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Citywide NYC restaurant grades
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            This section is the citywide DOHMH file, dataset {citywide.datasetId}, pulled on {citywide.pulledOnLabel}. It is not the directory counts above. For each CAMIS, the letter is the newest inspection whose grade is A, B, or C. {count(citywide.a)} are A ({percentOneDecimal(citywide.a, citywide.letterGraded)}), {count(citywide.b)} are B ({percentOneDecimal(citywide.b, citywide.letterGraded)}), and {count(citywide.c)} are C ({percentOneDecimal(citywide.c, citywide.letterGraded)}), out of {count(citywide.letterGraded)} establishments. {citywide.letterTies === 0 ? "None had two different letters on that date." : `${count(citywide.letterTies)} had two different letters on that date and are left out of these counts.`} {count(citywide.boroughUnassigned)} have no single borough on the row, so the borough table sums to {count(citywide.letterGraded - citywide.boroughUnassigned)}.
          </p>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            Separately, {count(citywide.pending)} establishments have a newest inspection row of grade Z or P: {count(citywide.pendingZ)} are Z and {count(citywide.pendingP)} are P. A blank grade on the same date as Z or P still counts as that code. {citywide.pendingAmbiguous > 0 ? `${count(citywide.pendingAmbiguous)} had more than one grade code on the newest date and are not in that pending count. ` : ""}A restaurant can be in the letter counts and in this pending count when a newer row is Grade Pending. The newest inspection_date in the file is {citywide.newestInspectionLabel}.
          </p>
          <div className="my-6 overflow-x-auto border" style={{ borderColor: "var(--hairline)", borderRadius: "4px", backgroundColor: "#fff" }}>
            <table className="w-full text-sm">
              <caption className="sr-only">Citywide count and share of latest A, B, and C grades in the DOHMH file</caption>
              <thead>
                <tr style={{ color: "var(--color-muted)" }}>
                  <th className="px-4 py-3 text-left font-medium">Latest letter</th>
                  <th className="px-4 py-3 text-right font-medium">Establishments</th>
                  <th className="px-4 py-3 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["A", citywide.a],
                    ["B", citywide.b],
                    ["C", citywide.c],
                  ] as const
                ).map((row) => (
                  <tr key={row[0]} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                    <td className="px-4 py-3 font-bold text-jade" style={{ fontFamily: "Georgia, serif" }}>{row[0]}</td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-forest">{count(row[1])}</td>
                    <td className="px-4 py-3 text-right tabular text-forest">{percentOneDecimal(row[1], citywide.letterGraded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="my-6 overflow-x-auto border" style={{ borderColor: "var(--hairline)", borderRadius: "4px", backgroundColor: "#fff" }}>
            <table className="w-full text-sm">
              <caption className="sr-only">Grade A share by borough in the citywide DOHMH file</caption>
              <thead>
                <tr style={{ color: "var(--color-muted)" }}>
                  <th className="px-4 py-3 text-left font-medium">Borough</th>
                  <th className="px-4 py-3 text-right font-medium">Grade A</th>
                  <th className="px-4 py-3 text-right font-medium">Latest letter</th>
                  <th className="px-4 py-3 text-right font-medium">Grade A share</th>
                </tr>
              </thead>
              <tbody>
                {citywide.boroughs.map((borough) => (
                  <tr key={borough.borough} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                    <td className="px-4 py-3 font-semibold text-forest">{borough.borough}</td>
                    <td className="px-4 py-3 text-right tabular text-forest">{count(borough.a)}</td>
                    <td className="px-4 py-3 text-right tabular text-forest">{count(borough.letterGraded)}</td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-forest">{percentOneDecimal(borough.a, borough.letterGraded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Source:{" "}
            <a href={citywide.datasetUrl} className="font-semibold text-jade hover:text-forest" target="_blank" rel="noopener noreferrer">
              NYC Open Data dataset {citywide.datasetId}
            </a>
            , pulled {citywide.pulledOnLabel} ({citywide.timezone}). A separate check of five kitchens is in{" "}
            <Link href="/guides/grade-a-restaurants-by-borough-nyc" className="font-semibold text-jade hover:text-forest">
              Grade A restaurants by borough
            </Link>
            . The same letter rules rank{" "}
            <Link href="/guides/best-pizza-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              best pizza restaurants in NYC
            </Link>{" "}
            and{" "}
            <Link href="/guides/best-italian-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              best Italian restaurants in NYC
            </Link>
            . The same file, limited to cuisine description Ethiopian, is on{" "}
            <Link href="/guides/ethiopian-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              Ethiopian restaurants NYC
            </Link>
            .
          </p>
        </section>

        <div className="-mt-4 mb-8 rounded-xl border border-forest/10 bg-forest/5 px-5 py-4">
          <p className="text-sm text-gray-700">
            <strong className="text-forest">Want the full data?</strong>{" "}
            We have published a complete breakdown of NYC restaurant health grades by borough,
            neighborhood, and cuisine type.{" "}
            <Link
              href="/data/nyc-restaurant-health-grade-report"
              className="font-medium text-jade underline underline-offset-2 hover:text-forest"
            >
              Read the Fall 2026 NYC inspection report
            </Link>
          </p>
        </div>

        <GradeHubLinks />

        {/* Section 1 */}
        <section id="what-is-a-health-grade" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What is a NYC restaurant health grade?
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            A NYC restaurant health grade is a letter — A, B, or C — assigned by the New York City
            Department of Health and Mental Hygiene (DOHMH) after a routine inspection of a food
            service establishment. The grade reflects how well the restaurant follows food safety
            rules designed to protect diners from foodborne illness.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Every restaurant, food cart, and food service establishment that is open to the public
            in New York City is required to be inspected and to post its grade card in a window
            visible from the street. This has been the law since 2010. The visit itself, from the
            first inspection through a reinspection, is the{" "}
            <Link href="/guides/nyc-restaurant-inspection-process" className="font-semibold text-jade hover:text-forest">
              NYC restaurant inspection process
            </Link>
            .
          </p>

          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <a
              href="https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
              className="font-medium text-jade underline underline-offset-2 hover:text-forest"
              target="_blank"
              rel="noopener noreferrer"
            >
              Official NYC DOHMH inspection grade
            </a>{" "}
            letters on this site come from NYC Open Data dataset 43nn-pn8j. A restaurant page links to that dataset filtered by the restaurant name, or by CAMIS when an id is stored.
          </p>

          {/* Quick reference table — breaks the paragraph pattern */}
          <div className="my-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-forest text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Grade</th>
                  <th className="px-4 py-3 text-left font-semibold">Score Range</th>
                  <th className="px-4 py-3 text-left font-semibold">What It Means</th>
                  <th className="px-4 py-3 text-right font-semibold">% of graded listings here</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-green-50/50">
                  <td className="px-4 py-3 text-lg font-bold text-green-700">A</td>
                  <td className="px-4 py-3 text-gray-700">0 – 13 points</td>
                  <td className="px-4 py-3 text-gray-700">Excellent food safety</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{gradeAShare}%</td>
                </tr>
                <tr className="border-b border-gray-100 bg-yellow-50/50">
                  <td className="px-4 py-3 text-lg font-bold text-yellow-700">B</td>
                  <td className="px-4 py-3 text-gray-700">14 – 27 points</td>
                  <td className="px-4 py-3 text-gray-700">Some violations found</td>
                  <td className="px-4 py-3 text-right font-semibold text-yellow-700">{gradeBShare}%</td>
                </tr>
                <tr className="bg-orange-50/50">
                  <td className="px-4 py-3 text-lg font-bold text-orange-700">C</td>
                  <td className="px-4 py-3 text-gray-700">28+ points</td>
                  <td className="px-4 py-3 text-gray-700">Serious violations</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-700">{gradeCShare}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Lower score = better. A restaurant that receives fewer than 14 points earns a Grade A.
            Between 14 and 27? Grade B. At 28 or above, that&apos;s a C.
          </p>

          {/* Conversational aside — tone shift */}
          <div className="my-6 border-l-4 border-sage pl-5">
            <p className="text-base italic text-gray-600">
              In this directory, {gradeAShare}% of listings that have a letter grade are Grade A
              ({stats.letters.A.toLocaleString()} of {graded.toLocaleString()}). That is our matched
              records, not a citywide inspection rate.
            </p>
          </div>
        </section>

        {/* Section 2 — Grade breakdown cards */}
        <section id="grade-breakdown" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Grade A, B, and C — what each one means
          </h2>

          <div className="space-y-6">
            {/* Grade A */}
            <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-green-100 bg-green-50 px-6 py-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white shadow-sm">
                  A
                </span>
                <div>
                  <h3 className="text-xl font-bold text-green-800" style={{ fontFamily: "Georgia, serif" }}>
                    Grade A — Excellent food safety
                  </h3>
                  <p className="text-sm text-green-600">Score of 0 to 13 points</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-green-700">{gradeAShare}%</p>
                  <p className="text-xs text-green-600">of graded listings here</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="leading-relaxed text-gray-700">
                  A Grade A restaurant has demonstrated very good food safety practices during its
                  most recent inspection. With a score of 13 points or fewer, the restaurant may
                  have minor violations but nothing that poses a significant risk to diners. In this
                  directory, {gradeAShare}% of letter-graded listings are Grade A
                  ({stats.letters.A.toLocaleString()} of {graded.toLocaleString()}).
                </p>
                <p className="mt-3 leading-relaxed text-gray-700">
                  For diners, a Grade A is the clearest signal that a restaurant takes food safety
                  seriously. All restaurants in our directory that carry a Grade A label have been
                  verified against the NYC DOHMH database.
                </p>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <Link
                    href="/nyc/manhattan/healthy-restaurants"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-jade transition-colors hover:text-forest"
                  >
                    Healthy restaurants in Manhattan
                  </Link>
                  <p className="mt-3 text-sm leading-relaxed">
                    <ClaimListingCta source="grades_guide">
                      Own a Grade A restaurant? Claim your free listing and get the free Grade A badge
                    </ClaimListingCta>
                  </p>
                </div>
              </div>
            </div>

            {/* Grade B */}
            <div className="overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-yellow-100 bg-yellow-50 px-6 py-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-white shadow-sm">
                  B
                </span>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800" style={{ fontFamily: "Georgia, serif" }}>
                    Grade B — Good, with violations noted
                  </h3>
                  <p className="text-sm text-yellow-600">Score of 14 to 27 points</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-yellow-700">{gradeBShare}%</p>
                  <p className="text-xs text-yellow-600">of graded listings here</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="leading-relaxed text-gray-700">
                  A Grade B is issued on the reinspection, not the first visit of the cycle, when
                  that reinspection scores 14 to 27 points. The restaurant posts the B card, or the
                  Grade Pending card it receives at the same time, until it has a chance to be heard
                  at OATH.
                </p>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Many Grade B restaurants go on to earn a Grade A at their next inspection after
                  addressing the violations found. A Grade B does not necessarily mean a restaurant
                  is unsafe — it means there are areas that need improvement.
                </p>
              </div>
            </div>

            {/* Real talk aside — breaks the card rhythm */}
            <div className="rounded-xl bg-gray-50 px-6 py-4">
              <p className="text-sm leading-relaxed text-gray-600">
                <strong className="text-forest">Honest take:</strong> A Grade B isn&apos;t the end of the world. Plenty of beloved NYC spots
                have had a B at some point — kitchens are chaotic environments and inspectors are thorough.
                What matters more is the <em>trend</em>. A restaurant that bounces between A and B is very
                different from one that&apos;s been sitting on a C for months.
              </p>
            </div>

            {/* Grade C */}
            <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-orange-100 bg-orange-50 px-6 py-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white shadow-sm">
                  C
                </span>
                <div>
                  <h3 className="text-xl font-bold text-orange-800" style={{ fontFamily: "Georgia, serif" }}>
                    Grade C — Serious violations found
                  </h3>
                  <p className="text-sm text-orange-600">Score of 28 or more points</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-orange-700">{gradeCShare}%</p>
                  <p className="text-xs text-orange-600">of graded listings here</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="leading-relaxed text-gray-700">
                  A Grade C represents significant food safety violations. The restaurant scored 28
                  or more points, indicating problems that need to be addressed urgently. If
                  violations pose an imminent danger to public health, the DOHMH can order an
                  immediate closure. Grade C restaurants are re-inspected quickly and must address
                  all critical violations.
                </p>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Grade C restaurants make up a very small percentage of NYC establishments. As a
                  diner, a Grade C card in the window is a clear signal to seek your meal elsewhere
                  until the restaurant addresses its violations and improves its score.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="how-inspection-works" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How the NYC restaurant inspection process works
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Unannounced initial inspection",
                content:
                  "Inspections are conducted without advance notice. An inspector from the NYC Department of Health visits the restaurant during operating hours and conducts a comprehensive evaluation of food safety practices, facility conditions, and staff hygiene. The inspection typically takes one to three hours.",
              },
              {
                step: "2",
                title: "Points are assigned for violations",
                content:
                  "Each violation found during the inspection is assigned a point value based on its severity. Critical violations — such as improper food temperatures, evidence of pests, or contamination — carry more points than general violations. The inspector documents every violation found.",
              },
              {
                step: "3",
                title: "Score determines the grade",
                content:
                  "Fewer than 14 points on the initial inspection or the reinspection is a Grade A. A first inspection of 14 or more does not produce a letter grade. The reinspection, scheduled no sooner than 7 days later, is the visit that issues a B for 14 to 27 points or a C for 28 or more.",
              },
              {
                step: "4",
                title: "Grade card must be posted",
                content:
                  "The restaurant is required by law to post its grade card in a window or door visible from the street. Failing to post the grade card is itself a violation. The grade card shows the letter grade, the score, and the inspection date.",
              },
              {
                step: "5",
                title: "Annual re-inspection cycle",
                content:
                  "Grade A restaurants are re-inspected approximately once per year. Restaurants that earned lower grades or had recent violations are inspected more frequently. The inspection record for every NYC restaurant is public data available through NYC Open Data.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-gray-700">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conversational break between sections */}
        <div className="mb-16 border-l-4 border-amber pl-5">
          <p className="text-base text-gray-600">
            <strong>One thing that surprises people:</strong> the initial inspection is completely unannounced.
            No phone call, no scheduling. An inspector just walks in during service. That&apos;s
            intentional — the city wants to see what a normal day looks like, not a performance.
          </p>
        </div>

        {/* Section 4 */}
        <section id="what-inspectors-check" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What NYC inspectors actually look for
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            NYC health inspectors evaluate restaurants across several categories. Each violation
            carries a specific point value — critical violations are worth more points than general
            violations. Here&apos;s a breakdown:
          </p>
          <p className="mb-8 text-sm text-gray-500">
            (The distinction between &ldquo;critical&rdquo; and &ldquo;general&rdquo; matters a lot. A single critical
            violation can push a restaurant from A territory into B range.)
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { category: "🌡️ Food temperatures", description: "Hot food must be kept above 140°F. Cold food must be kept below 41°F. Improper temperatures are one of the most common critical violations.", severity: "Critical", color: "red" },
              { category: "🐀 Pest evidence", description: "Evidence of mice, rats, cockroaches, or flies in food preparation areas is a critical violation that can result in immediate closure.", severity: "Critical", color: "red" },
              { category: "🧼 Personal hygiene", description: "Food workers must wash hands properly and frequently. Improper hand hygiene is a common and serious violation.", severity: "Critical", color: "red" },
              { category: "🏗️ Facility conditions", description: "Walls, floors, ceilings, and equipment must be clean and in good repair. Facility condition violations are typically general rather than critical.", severity: "General", color: "yellow" },
              { category: "📦 Food storage", description: "Food must be stored properly to prevent contamination. Raw meat must be stored below ready-to-eat foods. Improper storage is a frequent violation.", severity: "Critical", color: "red" },
              { category: "🏷️ Food labeling", description: "Food must be properly labeled with contents and dates. Unlabeled food or food past its use-by date is a violation.", severity: "General", color: "yellow" },
            ].map((item) => (
              <div key={item.category} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-base font-semibold text-forest">{item.category}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.color === "red" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section id="what-to-do" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What to do if your favorite restaurant has a B or C grade
          </h2>
          <div className="mb-6 rounded-2xl border border-sage/20 bg-sage/10 p-8">
            <p className="mb-4 text-lg leading-relaxed text-gray-700">
              Finding out that a restaurant you love has a Grade B or C can be unsettling. Here is
              what to consider:
            </p>
            <div className="space-y-4">
              {[
                { title: "Check the inspection date", body: "A Grade B from two years ago is very different from a Grade B last month. Restaurants improve. Look at when the grade was issued and whether a re-inspection has happened since." },
                { title: "Look at the specific violations", body: "The NYC Open Data portal shows the specific violations found. A Grade B from a facility condition issue is less concerning than a Grade B from a food temperature or pest violation." },
                { title: "Check if a re-inspection is pending", body: 'A "Grade Pending" sign means the restaurant is waiting for its re-inspection score. This is not the same as a permanent grade and the restaurant may well earn an A at the follow-up.' },
                { title: "Consider the restaurant's history", body: "A restaurant that has earned Grade A consistently for years and recently received a B is different from one with a pattern of poor scores. Consistency matters." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-1 flex-shrink-0 text-sage">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-forest">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="find-grades" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How to find a NYC restaurant health grade
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            There are three ways to find the health inspection grade for any NYC restaurant:
          </p>
          <div className="space-y-4">
            {[
              { method: "Look in the restaurant window", detail: "Every NYC restaurant is legally required to post its grade card in a window visible from the street. The grade card shows the letter grade, inspection score, and date.", cta: null, icon: "🪟" },
              { method: "Open a listing in this directory", detail: "Each published restaurant page shows the grade, inspection date, and score we have from the NYC DOHMH open dataset. Borough hubs below link to the listings.", cta: { label: "Healthy restaurants in Brooklyn", href: "/nyc/brooklyn/healthy-restaurants" }, icon: "🔍" },
              { method: "NYC Open Data portal", detail: "The complete inspection history for every NYC restaurant is available at data.cityofnewyork.us. You can search by restaurant name and see every past inspection, including the specific violations found at each visit.", cta: null, icon: "📊" },
            ].map((item) => (
              <div key={item.method} className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="flex-shrink-0 text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {item.method}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">{item.detail}</p>
                  {item.cta && (
                    <Link href={item.cta.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-jade transition-colors hover:text-forest">
                      {item.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <GuideLinkIndex
          heading="Grade A listings in the directory"
          intro="These are published listings that currently show a Grade A. The grade on the listing is the inspection record we have matched, not a promise about the next visit."
          groups={[
            {
              title: "Borough hubs",
              links: [
                { href: "/nyc/manhattan/healthy-restaurants", label: "Healthy restaurants in Manhattan" },
                { href: "/nyc/brooklyn/healthy-restaurants", label: "Healthy restaurants in Brooklyn" },
                { href: "/nyc/queens/healthy-restaurants", label: "Healthy restaurants in Queens" },
                { href: "/nyc/bronx/healthy-restaurants", label: "Healthy restaurants in the Bronx" },
                { href: "/nyc/staten-island/healthy-restaurants", label: "Healthy restaurants in Staten Island" },
              ],
            },
            {
              title: "Grade A restaurant pages",
              links: [
                { href: "/restaurants/power-bowls", label: "Power Bowls in the Financial District — Grade A Korean restaurant" },
                { href: "/restaurants/little-collins", label: "Little Collins in Midtown East — Grade A" },
                { href: "/restaurants/cava-gramercy", label: "CAVA in Gramercy Park — Grade A Mediterranean restaurant" },
                { href: "/restaurants/la-sova", label: "La Sova in Kensington — Grade A kosher restaurant" },
                { href: "/restaurants/the-common", label: "The Common in Bay Ridge — Grade A breakfast restaurant" },
                { href: "/restaurants/787-coffee-mott", label: "787 Coffee in Mott Haven — Grade A coffee shop" },
                { href: "/restaurants/marthas-country-bakery-astoria", label: "Martha's Country Bakery in Astoria — Grade A bakery" },
                { href: "/restaurants/gan-hoo-bbq", label: "GAN-HOO BBQ in Flushing — Grade A barbecue restaurant" },
                { href: "/restaurants/bloom-cafe", label: "Bloom Cafe in Rosebank — Grade A cafe" },
              ],
            },
            {
              title: "Related pages",
              links: [
                { href: "/guides/healthy-breakfast-nyc", label: "healthy breakfast in NYC" },
                { href: "/guides/ethiopian-restaurants-nyc", label: "Ethiopian restaurants NYC" },
                { href: "/catering/holiday-party-catering-nyc", label: "Holiday party catering in NYC from Grade A restaurants" },
                { href: "/guides/nyc-restaurant-inspection-process", label: "How NYC restaurant inspections work" },
                { href: "/data", label: "NYC Restaurant Compliance Weekly" },
                { href: "/partner-with-us", label: "Partner with Eat Real Food NYC" },
                { href: "/data/nyc-restaurant-health-grade-report", label: "Fall 2026 NYC inspection report" },
                { href: "/healthy-restaurants/low-calorie", label: "Low-calorie restaurants in NYC" },
                { href: "/healthy-restaurants/vegan", label: "Vegan restaurants in NYC" },
              ],
            },
          ]}
        />

        {/* Section 7 — FAQ */}
        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {HEALTH_GRADE_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === HEALTH_GRADE_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="See grades on restaurant listings"
          body="Every published listing shows the NYC health inspection grade, score, and date we have on file. Start with a borough hub."
          primaryLabel="Healthy restaurants in Manhattan"
          primaryHref="/nyc/manhattan/healthy-restaurants"
          secondaryLabel="NYC health grade map"
          secondaryHref="/map"
        />
      </div>
        <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
