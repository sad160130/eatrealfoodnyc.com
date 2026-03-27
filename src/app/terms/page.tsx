import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Terms of Service — Eat Real Food NYC",
  description:
    "Terms of Service for Eat Real Food NYC: service description, data accuracy disclaimer, user content, intellectual property, and governing law. Effective March 2026.",
  alternates: { canonical: getCanonicalUrl("/terms") },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">Terms of Service</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">LEGAL</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Terms of<br />
            <span className="text-sage">Service</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Please read these terms carefully before using Eat Real Food NYC. By accessing or using
            our website, you agree to be bound by these terms.
          </p>
          <p className="mt-4 text-sm text-white/40">
            Effective date: March 1, 2026 | Last updated: March 2026
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Acceptance */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 1</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Acceptance of Terms
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700">
              By accessing or using eatrealfoodnyc.com (the &quot;Site&quot;), you agree to be bound by these Terms
              of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Site.
              These Terms constitute a legally binding agreement between you and Eat Real Food NYC
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We reserve the right to update these Terms at any time, and your
              continued use of the Site following any changes constitutes acceptance of those changes.
            </p>
          </div>
        </section>

        {/* Service Description */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 2</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Service Description
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Eat Real Food NYC is a free, publicly accessible restaurant directory focused on healthy dining
              options in New York City. The Site provides:
            </p>
            <div className="space-y-2">
              {[
                "Listings for restaurants across all five NYC boroughs, including addresses, contact information, and operating hours.",
                "NYC Department of Health and Mental Hygiene (DOHMH) inspection grades, scores, and dates sourced from official public records.",
                "Dietary tags (vegan, halal, kosher, gluten-free, and others) based on our data analysis pipeline.",
                "A proprietary Health Score calculated from inspection data, dietary information, ratings, and other factors.",
                "Neighborhood-level and borough-level aggregation pages for discovering restaurants by location.",
                "Map-based restaurant discovery using OpenStreetMap.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">-</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-700">
              The Site is provided free of charge. No account creation or registration is required to access
              any feature. We reserve the right to modify, suspend, or discontinue any aspect of the Service
              at any time without prior notice.
            </p>
          </div>
        </section>

        {/* User-Submitted Content */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 3</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            User-Submitted Content
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              The Site allows users to submit content including restaurant experience reports, data corrections,
              and feedback (&quot;User Content&quot;). By submitting User Content, you:
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Grant us a non-exclusive, royalty-free, perpetual, worldwide license to use, display, modify, and incorporate your User Content into our directory and related services.",
                "Represent that your User Content is truthful, based on your genuine experience, and does not infringe on any third-party rights.",
                "Acknowledge that we may edit, reject, or remove User Content at our sole discretion, including for reasons of accuracy, relevance, or compliance with our editorial standards.",
                "Understand that submission of User Content does not guarantee publication. All submissions are reviewed against our editorial standards before being incorporated into the directory.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">-</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              We reserve the right to moderate all User Content. Content that is defamatory, fraudulent,
              misleading, or that violates any applicable law will be removed. We do not publish User Content
              in real-time — all submissions undergo review before publication.
            </p>
          </div>
        </section>

        {/* Data Accuracy Disclaimer */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 4</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Data Accuracy Disclaimer
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              We strive to provide accurate, current, and comprehensive restaurant data. However, we cannot
              guarantee 100% accuracy at all times. Specifically:
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Inspection grades reflect the most recent data available from the NYC DOHMH open data portal. There may be a delay between an inspection occurring and the data appearing in our system.",
                "Restaurant operating status (open/closed), hours, and contact information may change without notice. We update this data regularly but cannot monitor every restaurant in real-time.",
                "Dietary tags are based on our best analysis of available information and are not a substitute for confirming directly with the restaurant, especially for severe allergies, celiac disease, or strict religious dietary requirements.",
                "Our Health Score is a proprietary metric designed to be useful, but it is not an official rating and should not be treated as a guarantee of food safety or quality.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">-</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              You use the information on this Site at your own discretion. We encourage you to verify
              critical information (allergies, dietary restrictions, operating hours) directly with the
              restaurant before visiting.
            </p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 5</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Intellectual Property
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              The Site and its original content (excluding User Content and public government data) are
              the intellectual property of Eat Real Food NYC and are protected by applicable copyright,
              trademark, and other intellectual property laws. This includes:
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Our proprietary Health Score algorithm and methodology.",
                "The site design, layout, graphics, and branding.",
                "Original editorial content, descriptions, and guide articles.",
                "Our curated data compilations and the specific way we organize and present restaurant information.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">-</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              You may not reproduce, distribute, modify, or create derivative works from our content
              without prior written permission. Linking to our pages is permitted and encouraged.
              Scraping, bulk downloading, or automated access to our data is prohibited without explicit
              written authorization.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 6</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Limitation of Liability
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              To the fullest extent permitted by applicable law, Eat Real Food NYC and its founder, team
              members, and contributors shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from:
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Your use of or inability to use the Site.",
                "Any errors, inaccuracies, or omissions in our data, including inspection grades, dietary tags, or Health Scores.",
                "Any decisions you make based on information provided on the Site, including dining decisions that result in adverse health outcomes.",
                "Any unauthorized access to or alteration of your data or submissions.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">-</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express
              or implied, including but not limited to implied warranties of merchantability, fitness for a
              particular purpose, or non-infringement.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 7</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Governing Law
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State
              of New York, without regard to its conflict of law provisions. Any disputes arising under
              or in connection with these Terms shall be subject to the exclusive jurisdiction of the
              courts located in New York County, New York. You consent to the personal jurisdiction of
              such courts and waive any objections to venue.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 8</p>
          <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Changes to These Terms
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700">
              We reserve the right to modify these Terms at any time. When we make changes, we will update
              the &quot;Last updated&quot; date at the top of this page. Material changes will be noted prominently on
              the Site. Your continued use of the Site after any changes constitutes acceptance of the revised
              Terms. If you do not agree with the updated Terms, you should discontinue your use of the Site.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Questions about these terms?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            If you have any questions or concerns about these Terms of Service, please contact us.
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
