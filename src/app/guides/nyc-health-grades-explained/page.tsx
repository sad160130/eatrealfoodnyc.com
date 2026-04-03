import type { Metadata } from "next"
import Link from "next/link"
import FAQSchema from "@/components/faq-schema"
import { getCanonicalUrl } from "@/config/seo"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import GuideCTA from "@/components/guide-cta"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("nyc-health-grades-explained")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description:
    "The complete guide to NYC restaurant health inspection grades. What Grade A, B, and C mean, how the inspection process works, and what diners should know before eating out.",
  alternates: { canonical: `${siteUrl}/guides/nyc-health-grades-explained` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" as const },
  },
  openGraph: {
    title: "NYC Restaurant Health Grades Explained — The Complete Guide",
    description:
      "Everything NYC diners need to know about restaurant health inspection grades — what A, B, and C really mean.",
    type: "article",
    url: `${siteUrl}/guides/nyc-health-grades-explained`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NYC Restaurant Health Grades Explained" }],
  },
}

const GUIDE_FAQS = [
  {
    question: "What does a Grade A mean for a NYC restaurant?",
    answer:
      "A Grade A means the restaurant scored 0 to 13 points during its NYC Health Department inspection. Lower scores are better. Grade A restaurants have very good food safety practices and are the safest choice for diners. Approximately 90% of inspected NYC restaurants earn a Grade A.",
  },
  {
    question: "What does a Grade B mean for a NYC restaurant?",
    answer:
      "A Grade B means the restaurant scored 14 to 27 points during its inspection. This indicates some food safety violations were found but the restaurant is still permitted to operate. Grade B restaurants must post their grade card prominently. They are re-inspected within 30 to 45 days.",
  },
  {
    question: "What does a Grade C mean for a NYC restaurant?",
    answer:
      "A Grade C means the restaurant scored 28 or more points. This indicates serious food safety violations. The restaurant may be closed immediately if violations pose an imminent health hazard. Otherwise it is re-inspected quickly. Grade C restaurants represent a small minority of NYC establishments.",
  },
  {
    question: "How often are NYC restaurants inspected?",
    answer:
      "NYC restaurants are inspected at least once per year by the Department of Health and Mental Hygiene (DOHMH). Restaurants that score poorly are re-inspected more frequently. New restaurants are inspected within their first year of operation.",
  },
  {
    question: "What happens if a restaurant fails its NYC health inspection?",
    answer:
      "If a restaurant scores 14 or more points it receives a Grade Pending card instead of a letter grade and is re-inspected within 30 to 45 days. If it scores 28 or more points it may be closed immediately or required to fix violations before re-inspection. The restaurant can appeal its score.",
  },
  {
    question: "Can a restaurant be open with a Grade B or C?",
    answer:
      "Yes — restaurants can operate with a Grade B or Grade C unless the violations pose an immediate danger to public health. In those cases the Health Department can order immediate closure. Restaurants with Grade B or C are re-inspected quickly and have the opportunity to improve their score.",
  },
  {
    question: "Where can I look up a NYC restaurant health inspection record?",
    answer:
      "You can look up any NYC restaurant inspection record through the NYC Open Data portal at data.cityofnewyork.us. Our directory also shows the current grade, inspection date, and score for thousands of NYC restaurants directly on each listing page.",
  },
  {
    question: "What do inspectors actually check during a NYC restaurant inspection?",
    answer:
      "NYC health inspectors check food temperatures, food handling procedures, pest evidence, personal hygiene of staff, facility conditions, and proper labeling of food. Each violation is assigned a point value. Minor violations are worth fewer points than critical violations.",
  },
]

export default function NYCHealthGradesGuide() {
  return (
    <GuideLayout guide={guide}>
      {/* JSON-LD schemas */}
      <FAQSchema faqs={GUIDE_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "NYC Restaurant Health Grades Explained — A Complete Guide",
            description:
              "The complete guide to NYC restaurant health inspection grades. What Grade A, B, and C mean and how the inspection process works.",
            author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            datePublished: "2026-01-15",
            dateModified: new Date().toISOString().split("T")[0],
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/guides/nyc-health-grades-explained`,
            },
          }),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle="What Grade A, B, and C really mean, how the NYC inspection process works, and what every diner should know before eating out in New York City."
        stats={[
          { stat: "~27,000", label: "Restaurants inspected yearly" },
          { stat: "~90%", label: "Earn a Grade A" },
          { stat: "1x/year", label: "Minimum inspection frequency" },
          { stat: "0-13", label: "Points for Grade A" },
        ]}
      />

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#what-is-a-health-grade", label: "What is a NYC restaurant health grade?" },
            { href: "#grade-breakdown", label: "Grade A, B, and C — what each means" },
            { href: "#how-inspection-works", label: "How the inspection process works" },
            { href: "#what-inspectors-check", label: "What inspectors actually look for" },
            { href: "#what-to-do", label: "What to do if your restaurant has a B or C" },
            { href: "#find-grades", label: "How to find a restaurant's grade in NYC" },
            { href: "#faq", label: "Frequently asked questions" },
          ]}
        />

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
            visible from the street. This transparency requirement was introduced in 2010 and has
            since become one of the most recognized food safety systems in the United States.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            The grade is determined by a point score. Inspectors assign points for each violation
            found — and crucially, a lower score is better. A restaurant that receives fewer than
            14 points earns a Grade A. A restaurant with 14 to 27 points earns a Grade B. A
            restaurant with 28 or more points receives a Grade C.
          </p>
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
                  <p className="text-2xl font-bold text-green-700">~90%</p>
                  <p className="text-xs text-green-600">of NYC restaurants</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="leading-relaxed text-gray-700">
                  A Grade A restaurant has demonstrated very good food safety practices during its
                  most recent inspection. With a score of 13 points or fewer, the restaurant may
                  have minor violations but nothing that poses a significant risk to diners. The vast
                  majority of NYC restaurants — approximately 90% — earn a Grade A.
                </p>
                <p className="mt-3 leading-relaxed text-gray-700">
                  For diners, a Grade A is the clearest signal that a restaurant takes food safety
                  seriously. All restaurants in our directory that carry a Grade A label have been
                  verified against the NYC DOHMH database.
                </p>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <Link
                    href="/search?grade=A"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-jade transition-colors hover:text-forest"
                  >
                    Browse all Grade A restaurants in NYC →
                  </Link>
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
                  <p className="text-2xl font-bold text-yellow-700">~8%</p>
                  <p className="text-xs text-yellow-600">of NYC restaurants</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="leading-relaxed text-gray-700">
                  A Grade B indicates that the restaurant had some food safety violations during its
                  inspection that were significant enough to push the score above 13 points. The
                  restaurant is still permitted to operate but is required to display its Grade B
                  card prominently and will be re-inspected within 30 to 45 days.
                </p>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Many Grade B restaurants go on to earn a Grade A at their next inspection after
                  addressing the violations found. A Grade B does not necessarily mean a restaurant
                  is unsafe — it means there are areas that need improvement.
                </p>
              </div>
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
                  <p className="text-2xl font-bold text-orange-700">~2%</p>
                  <p className="text-xs text-orange-600">of NYC restaurants</p>
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
                  "If the restaurant scores 0 to 13 points, it receives a Grade A immediately. If it scores 14 or more points, it receives a Grade Pending card and is scheduled for a re-inspection. At the re-inspection, the restaurant is scored again and receives its final letter grade based on the better of the two scores.",
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

        {/* Section 4 */}
        <section id="what-inspectors-check" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What NYC inspectors actually look for
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            NYC health inspectors evaluate restaurants across several categories. Each violation
            carries a specific point value — critical violations are worth more points than general
            violations.
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
              { method: "Search our directory", detail: "We display the current NYC health inspection grade on every restaurant listing page in our directory — alongside the inspection date and score. We pull this data directly from the NYC DOHMH Open Data database.", cta: { label: "Search our directory →", href: "/search?grade=A" }, icon: "🔍" },
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

        {/* Section 7 — FAQ */}
        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {GUIDE_FAQS.map((faq, index) => (
              <div key={index} className={`border-b border-gray-100 ${index === GUIDE_FAQS.length - 1 ? "border-b-0" : ""}`}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 transition-colors hover:bg-gray-50">
                    <span className="pr-4 text-base font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                      {faq.question}
                    </span>
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-sage text-sage transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-base leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Browse only Grade A restaurants in NYC"
          body="Our directory shows the NYC health inspection grade on every listing. Filter to Grade A only across all 5 boroughs and every dietary need."
          primaryLabel="Browse Grade A restaurants →"
          primaryHref="/search?grade=A"
          secondaryLabel="View health grade map"
          secondaryHref="/map"
        />
      </div>
    </GuideLayout>
  )
}
