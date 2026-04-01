import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Editorial Standards — Eat Real Food NYC Directory",
  description:
    "The editorial principles guiding Eat Real Food NYC: data before opinion, no commercial influence, transparency about limitations, and conservative dietary tagging.",
  alternates: { canonical: getCanonicalUrl("/about/editorial-standards") },
  robots: { index: true, follow: true },
}

export default function EditorialStandardsPage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <span>/</span>
            <span className="text-white/80">Editorial Standards</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">INTEGRITY</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Editorial<br />
            <span className="text-sage">Standards</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Trust is earned through consistency, not claims. These are the principles that govern
            every piece of data, every tag, and every recommendation on Eat Real Food NYC.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Core Principles */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">CORE PRINCIPLES</p>
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Five principles we never compromise on
          </h2>
          <div className="space-y-6">
            {[
              {
                number: "01",
                title: "Data before opinion",
                body: "Every claim we make about a restaurant is grounded in verifiable data. We show the NYC Health Department inspection grade because it is an official government record, not because we think it tells the whole story. We show Google Maps ratings because they represent real aggregate user feedback, not because we endorse every review. When we lack data, we say so openly rather than filling the gap with editorial conjecture. Our directory is a data product first and an editorial product second.",
              },
              {
                number: "02",
                title: "Conservative over generous",
                body: "When there is ambiguity about whether a restaurant qualifies for a dietary tag, a hidden gem designation, or a higher score, we default to the more conservative interpretation. A restaurant that 'probably' serves halal food does not get the halal tag. A restaurant with a 4.4 rating does not get rounded up to hidden gem status. We would rather under-tag than over-tag, because a diner who relies on our data to make a dietary decision deserves accuracy over comprehensiveness.",
              },
              {
                number: "03",
                title: "No commercial influence",
                body: "No restaurant, food brand, delivery service, or advertising partner has any influence over our data, our rankings, our Health Scores, or our editorial decisions. We do not accept payment for placement, reviews, or higher scores. We do not have affiliate relationships with restaurants. Our revenue model is independent of restaurant cooperation. If we ever introduce advertising or partnerships in the future, they will be clearly disclosed and will never affect the data layer.",
              },
              {
                number: "04",
                title: "Transparency about limitations",
                body: "We are open about what our data can and cannot tell you. Inspection grades reflect the conditions observed on a specific inspection date — they do not guarantee food safety on the day you visit. Dietary tags are based on our best analysis of publicly available information — they are not a substitute for confirming with the restaurant directly if you have severe allergies or strict religious dietary requirements. Our Health Score is a useful heuristic, not an absolute measure of quality. We state these limitations on every relevant page.",
              },
              {
                number: "05",
                title: "Corrections welcome",
                body: "We actively encourage users, restaurant owners, and subject matter experts to report errors. Every correction report is reviewed within 48 hours. When we confirm an error, we fix it promptly and do not attempt to obscure that the correction was made. We believe that a directory that corrects itself quickly is more trustworthy than one that claims to be perfect.",
              },
            ].map((item) => (
              <div key={item.number} className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest text-sm font-bold text-white">
                  {item.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dietary Tagging Policy */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">DIETARY TAGGING</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we handle sensitive dietary tags
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            Some dietary categories carry higher stakes than others. A diner looking for vegan options
            faces a different level of risk than someone who requires halal or kosher certification for
            religious observance, or someone with celiac disease who needs a genuinely gluten-free kitchen.
            We apply different evidence thresholds accordingly.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                tag: "Halal",
                policy: "We only apply the halal tag when there is evidence of formal halal certification or when the restaurant explicitly identifies as a halal establishment across multiple public sources. A restaurant that happens to serve chicken and rice is not tagged halal. We acknowledge this means we likely under-count halal-compliant restaurants, but we prioritize accuracy for diners who depend on this designation for religious observance.",
              },
              {
                tag: "Kosher",
                policy: "The kosher tag requires evidence of rabbinical certification or clear public identification as a kosher establishment. Restaurants that serve some kosher-style dishes but are not certified are not tagged. We recognize that kosher certification standards vary among Orthodox, Conservative, and Reform communities, and we do not adjudicate between them — we note the certification where available.",
              },
              {
                tag: "Gluten-Free",
                policy: "We distinguish between restaurants that offer gluten-free menu items and restaurants that operate dedicated gluten-free kitchens or take meaningful cross-contamination precautions. The gluten-free tag is applied to both, but we encourage diners with celiac disease to verify directly with the restaurant. Our tag indicates availability, not clinical safety.",
              },
              {
                tag: "Vegan",
                policy: "The vegan tag is applied to restaurants that are fully vegan or that have a substantial dedicated vegan menu section — not restaurants that merely offer a single salad. We use a threshold of at least 5 clearly identified vegan dishes or a dedicated vegan menu to apply this tag. Fully vegan restaurants are noted as such in their descriptions.",
              },
            ].map((item) => (
              <div key={item.tag} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.tag}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{item.policy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What We Will Never Do */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">OUR COMMITMENTS</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What we will never do
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            These are not aspirational guidelines. They are hard lines we will not cross, regardless
            of business pressure or growth opportunities.
          </p>
          <div className="space-y-3">
            {[
              "Accept payment from restaurants in exchange for listing placement, higher scores, or favorable descriptions.",
              "Publish fake reviews, fabricated testimonials, or AI-generated reviews that impersonate real diners.",
              "Remove or suppress negative inspection data for any restaurant, regardless of the circumstances.",
              "Apply dietary tags without sufficient evidence, even if a restaurant owner requests the tag.",
              "Share or sell user-submitted data (corrections, feedback, experience reports) to third parties.",
              "Present sponsored or paid content without clear and prominent disclosure.",
              "Manipulate our Health Score algorithm to favor or penalize specific restaurants, chains, or cuisine types.",
            ].map((item) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="mt-0.5 flex-shrink-0 text-lg text-red-400">✕</span>
                <p className="text-sm leading-relaxed text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Hold us accountable
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            If you believe we have fallen short of these standards in any way, we want to hear from you.
            Every report is reviewed by our editorial team.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
          >
            Contact us →
          </Link>
        </section>
      </div>
    </div>
  )
}
