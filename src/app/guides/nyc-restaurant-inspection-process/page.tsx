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
const guide = getGuideBySlug("nyc-restaurant-inspection-process")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  { question: "Who inspects NYC restaurants?", answer: "The NYC Department of Health and Mental Hygiene (DOHMH) employs trained health inspectors who conduct unannounced visits to every food service establishment in the city. Inspectors are public health professionals trained to evaluate food safety across dozens of specific criteria." },
  { question: "How often are NYC restaurants inspected?", answer: "All NYC restaurants are inspected at least once per year. Restaurants that receive a Grade B or C are re-inspected within 30 to 45 days. New restaurants receive their first inspection within their first year of operation. High-risk establishments may be inspected more frequently." },
  { question: "What is the difference between critical and general violations?", answer: "Critical violations are practices that directly contribute to foodborne illness — such as improper food temperatures, evidence of pests, or bare-hand contact with ready-to-eat food. General violations relate to facility maintenance and conditions that could contribute to illness if not corrected. Critical violations carry higher point values." },
  { question: "Can a restaurant appeal its inspection grade?", answer: "Yes. Restaurants can request a hearing at the Office of Administrative Trials and Hearings (OATH) to contest their inspection results. During the appeal, the restaurant displays a Grade Pending sign. If the appeal is successful, the grade is adjusted accordingly." },
  { question: "What does Grade Pending mean?", answer: "Grade Pending means the restaurant has been inspected but has not yet received its final letter grade. This happens when a restaurant scores 14 or more points on its initial inspection and is awaiting re-inspection, or when a restaurant has filed an appeal of its grade." },
  { question: "How can I look up a restaurant's inspection history?", answer: "Every NYC restaurant inspection record is public data. You can search by restaurant name on the NYC Open Data portal at data.cityofnewyork.us. Our directory also shows the current grade, score, and inspection date for every listed restaurant." },
]

export default function InspectionProcessGuide() {
  return (
    <GuideLayout guide={guide}>
      <FAQSchema faqs={GUIDE_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "Article",
            headline: guide.title, description: guide.description,
            author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            datePublished: guide.publishedDate,
            dateModified: new Date().toISOString().split("T")[0],
            mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/guides/${guide.slug}` },
          }),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle="A step-by-step breakdown of how NYC restaurants are inspected, what happens when they fail, and how to read an inspection report."
        stats={[
          { stat: "~27,000", label: "Restaurants inspected/year" },
          { stat: "2 chances", label: "To earn a Grade A" },
          { stat: "1-3 hours", label: "Per inspection" },
          { stat: "28+ pts", label: "Triggers Grade C" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC items={[
          { href: "#who-inspects", label: "Who conducts NYC restaurant inspections" },
          { href: "#inspection-frequency", label: "How often restaurants are inspected" },
          { href: "#what-happens", label: "What happens during an inspection" },
          { href: "#violation-types", label: "Critical vs general violations" },
          { href: "#scoring-system", label: "How the point scoring system works" },
          { href: "#after-inspection", label: "What happens after a bad score" },
          { href: "#appeal-process", label: "Can restaurants appeal their grade?" },
          { href: "#faq", label: "Frequently asked questions" },
        ]} />

        <section id="who-inspects" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Who conducts NYC restaurant inspections</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">The New York City Department of Health and Mental Hygiene (DOHMH) is responsible for inspecting every restaurant, food cart, cafeteria, and food service establishment in the five boroughs. The agency employs hundreds of trained health inspectors who conduct unannounced visits throughout the year.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Each inspector undergoes extensive training in food safety science, microbiology, and NYC health code regulations before being assigned to field work. They carry official identification and have the legal authority to enter any food service establishment during operating hours without prior notice. The unannounced nature of inspections is critical — it ensures that inspectors see the restaurant as it actually operates, not as it might perform when expecting a visit.</p>
          <p className="text-lg leading-relaxed text-gray-700">The DOHMH inspection program is one of the most comprehensive municipal food safety systems in the United States. To understand what the grades they assign actually mean, read our companion guide on <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">NYC restaurant health grades explained</Link>.</p>
        </section>

        <section id="inspection-frequency" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>How often restaurants are inspected</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Every NYC restaurant is inspected at least once per inspection cycle, which runs approximately 12 months. However, the actual frequency depends on the restaurant&apos;s recent performance. Grade A restaurants are typically re-inspected once per year. Restaurants that scored 14 or more points — meaning they did not earn a Grade A — are scheduled for re-inspection within 30 to 45 days.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">New restaurants receive their first inspection within their first year of operation. Complaints from the public can also trigger additional inspections outside the normal cycle. The DOHMH prioritizes inspections based on risk factors including cuisine type, previous violation history, and the nature of any complaints received.</p>
          <p className="text-lg leading-relaxed text-gray-700">You can see which restaurants in any NYC neighborhood currently hold a Grade A using our <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">neighborhood health comparison tool</Link>.</p>
        </section>

        <section id="what-happens" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>What happens during an inspection</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">A typical restaurant inspection takes between one and three hours. The inspector arrives unannounced and begins a systematic evaluation of the entire food service operation. The inspection covers food storage, food preparation, cooking temperatures, holding temperatures, employee hygiene, facility cleanliness, pest control, and proper documentation.</p>
          <div className="my-8 space-y-4">
            {[
              { step: "1", title: "Identification and walkthrough", desc: "The inspector presents credentials and conducts an initial walkthrough of the kitchen, storage areas, and dining room to identify obvious issues." },
              { step: "2", title: "Temperature checks", desc: "Food temperatures are measured with calibrated thermometers. Hot food must be at or above 140°F. Cold food must be at or below 41°F. This is the most common source of critical violations." },
              { step: "3", title: "Food handling observation", desc: "The inspector watches how staff handle food — including handwashing, glove usage, cross-contamination prevention, and proper use of utensils." },
              { step: "4", title: "Facility and equipment review", desc: "All surfaces, equipment, plumbing, ventilation, and waste disposal systems are examined. The inspector checks for evidence of pests including droppings, nesting, and live insects." },
              { step: "5", title: "Documentation and exit conference", desc: "The inspector documents all violations found, assigns point values, calculates the total score, and discusses findings with the restaurant operator." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">{item.step}</div>
                <div>
                  <h3 className="font-bold text-forest">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="violation-types" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Critical vs general violations</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">NYC health code violations fall into two categories: critical violations and general violations. Understanding the difference is key to reading an inspection report intelligently.</p>
          <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <h3 className="text-lg font-bold text-red-800" style={{ fontFamily: "Georgia, serif" }}>Critical Violations</h3>
              <p className="mt-2 text-sm text-red-700">Practices that directly contribute to foodborne illness. These carry higher point values — typically 5 to 28 points per violation.</p>
              <ul className="mt-3 space-y-1 text-sm text-red-600">
                <li>• Improper food holding temperatures</li>
                <li>• Evidence of mice, rats, or roaches</li>
                <li>• Bare-hand contact with ready-to-eat food</li>
                <li>• Inadequate handwashing facilities</li>
                <li>• Cross-contamination risks</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6">
              <h3 className="text-lg font-bold text-yellow-800" style={{ fontFamily: "Georgia, serif" }}>General Violations</h3>
              <p className="mt-2 text-sm text-yellow-700">Conditions that could contribute to illness if not corrected. These carry lower point values — typically 2 to 5 points per violation.</p>
              <ul className="mt-3 space-y-1 text-sm text-yellow-600">
                <li>• Damaged or unclean facility surfaces</li>
                <li>• Improperly labeled food containers</li>
                <li>• Missing or broken equipment</li>
                <li>• Inadequate ventilation</li>
                <li>• Minor plumbing issues</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="scoring-system" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>How the point scoring system works</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">The NYC inspection scoring system is additive — the inspector starts at zero and adds points for each violation found. A lower score is better. The total score determines the letter grade, which is the public-facing result that must be posted in the restaurant&apos;s window.</p>
          <div className="my-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {[
              { grade: "A", range: "0 – 13 points", color: "bg-green-50 text-green-800 border-green-100", desc: "Excellent food safety. The restaurant passed with minimal violations." },
              { grade: "B", range: "14 – 27 points", color: "bg-yellow-50 text-yellow-800 border-yellow-100", desc: "Good but violations noted. Re-inspection scheduled within 30-45 days." },
              { grade: "C", range: "28+ points", color: "bg-orange-50 text-orange-800 border-orange-100", desc: "Serious violations found. May face closure if imminent health hazard exists." },
            ].map((item) => (
              <div key={item.grade} className={`flex items-center gap-4 border-b p-5 ${item.color}`}>
                <span className="text-3xl font-bold">{item.grade}</span>
                <div>
                  <p className="font-semibold">{item.range}</p>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-lg leading-relaxed text-gray-700">You can <Link href="/search?grade=A" className="font-semibold text-jade hover:text-forest">browse all Grade A restaurants</Link> in our directory or see them on our <Link href="/map" className="font-semibold text-jade hover:text-forest">interactive health grade map</Link>.</p>
        </section>

        <section id="after-inspection" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>What happens after a bad score</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">If a restaurant scores 14 or more points on its initial inspection, it does not receive a letter grade immediately. Instead, it receives a &quot;Grade Pending&quot; card and is scheduled for a re-inspection within 30 to 45 days. This gives the restaurant an opportunity to correct the violations found.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">At the re-inspection, the restaurant is scored again from scratch. The restaurant&apos;s final grade is based on the better of its two scores — the initial inspection or the re-inspection. This two-chance system is one of the fairest aspects of the NYC inspection program.</p>
          <p className="text-lg leading-relaxed text-gray-700">However, if violations found during any inspection pose an imminent danger to public health — such as a severe pest infestation or sewage backup — the DOHMH has the authority to order an immediate closure. The restaurant cannot reopen until the hazard is resolved and the department approves reopening.</p>
        </section>

        <section id="appeal-process" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Can restaurants appeal their grade?</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Yes. NYC restaurants have the right to contest their inspection results through a formal hearing at the Office of Administrative Trials and Hearings (OATH). During the appeal process, the restaurant displays a &quot;Grade Pending&quot; sign rather than its letter grade.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">At the OATH hearing, an administrative law judge reviews the inspection report and hears testimony from both the health inspector and the restaurant operator. The judge can dismiss violations, reduce point values, or uphold the original findings. If the appeal results in a lower total score, the restaurant&apos;s grade is adjusted accordingly.</p>
          <p className="text-lg leading-relaxed text-gray-700">The appeals process is an important safeguard that ensures restaurants have due process. However, it is worth noting that the majority of inspected restaurants — approximately 90% — earn a Grade A without needing to appeal.</p>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Frequently asked questions</h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {GUIDE_FAQS.map((faq, i) => (
              <div key={i} className={`border-b border-gray-100 ${i === GUIDE_FAQS.length - 1 ? "border-b-0" : ""}`}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 hover:bg-gray-50">
                    <span className="pr-4 text-base font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>{faq.question}</span>
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-sage text-sage group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-6"><p className="text-base leading-relaxed text-gray-600">{faq.answer}</p></div>
                </details>
              </div>
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Find Grade A restaurants near you"
          body="Every restaurant in our directory shows its current health inspection grade, score, and date."
          primaryLabel="Browse Grade A restaurants →"
          primaryHref="/search?grade=A"
          secondaryLabel="View on map"
          secondaryHref="/map"
        />
      </div>
    </GuideLayout>
  )
}
