import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"
import SocialLinks from "@/components/social-links"

export const metadata: Metadata = {
  title: "Press & Media — Eat Real Food NYC | NYC Restaurant Data",
  description:
    "Press resources for Eat Real Food NYC: quick facts, story angles, media contact, and background on NYC's first directory combining health inspection data with dietary filtering.",
  alternates: { canonical: getCanonicalUrl("/press") },
  robots: { index: true, follow: true },
}

export default function PressPage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">Press & Media</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">PRESS</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Press &<br />
            <span className="text-sage">Media</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Everything journalists, bloggers, and media professionals need to cover Eat Real Food NYC.
            We are happy to provide data, quotes, and background on healthy dining in New York City.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Quick Facts */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">AT A GLANCE</p>
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Quick facts
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { stat: "8,835", label: "Restaurants listed" },
              { stat: "5", label: "NYC boroughs covered" },
              { stat: "12", label: "Dietary filters available" },
              { stat: "Free", label: "No cost to use" },
              { stat: "Zero", label: "Advertising on the site" },
              { stat: "100%", label: "Health-graded listings" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.stat}</p>
                <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What Makes Us Newsworthy */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">THE STORY</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What makes Eat Real Food NYC newsworthy
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">
              Eat Real Food NYC is the first NYC restaurant directory that combines official NYC Department
              of Health and Mental Hygiene (DOHMH) inspection data with dietary filtering across 12 categories.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              While other platforms focus on reviews and paid promotion, we built a directory grounded in
              verifiable government data. Every restaurant listing shows its actual inspection grade, numeric
              score, and inspection date — pulled directly from the city&apos;s open data portal. This is layered
              with AI-assisted dietary tagging that identifies restaurants serving vegan, halal, kosher,
              gluten-free, and eight other dietary categories, applied with conservative evidence thresholds.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              The result is a resource that lets health-conscious NYC diners make decisions based on
              transparent, verified data rather than algorithmic recommendations influenced by advertising spend.
              The directory is entirely free, contains no advertising, and does not accept payment for placement.
            </p>
          </div>
        </section>

        {/* Story Angles */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">STORY IDEAS</p>
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Suggested story angles
          </h2>
          <div className="space-y-4">
            {[
              {
                angle: "NYC food safety transparency",
                detail: "The NYC DOHMH inspection system generates a wealth of public data that most diners never see. Eat Real Food NYC makes this data accessible and searchable at the neighborhood level. Story opportunities include analyzing inspection grade distributions by borough, identifying neighborhoods with the highest and lowest food safety scores, and examining whether popular restaurants maintain their grades over time.",
              },
              {
                angle: "Halal and kosher dining data gaps",
                detail: "There is no centralized, verified database of halal or kosher-certified restaurants in New York City. Eat Real Food NYC's conservative approach to dietary tagging reveals the scope of this data gap — and raises questions about how diners with religious dietary requirements navigate a city with limited verified information. We can provide data on the geographic distribution of tagged halal and kosher restaurants across boroughs and neighborhoods.",
              },
              {
                angle: "Neighborhood health disparities",
                detail: "Our data reveals significant variation in restaurant health inspection grades across NYC neighborhoods. Some neighborhoods have Grade A rates above 90%, while others fall below 70%. This data can be examined alongside socioeconomic data to explore whether food safety correlates with income levels, population density, or other factors — a story with public health implications.",
              },
              {
                angle: "The hidden gems algorithm",
                detail: "Our algorithmic approach to identifying 'hidden gem' restaurants — high ratings, low review counts, currently operational — surfaces restaurants that the major platforms' algorithms tend to bury. We can provide data on hidden gem density by neighborhood and borough, cuisine type distributions among hidden gems, and examples of highly rated restaurants with under 200 reviews that most diners would never find through conventional search.",
              },
            ].map((item) => (
              <div key={item.angle} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.angle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Follow our coverage */}
        <section className="mb-16">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              FOLLOW OUR COVERAGE
            </p>
            <SocialLinks variant="light" showLabels={true} className="flex-col items-start gap-4" />
          </div>
        </section>

        {/* Press Contact */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">CONTACT</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Press contact
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold text-forest">For all press and media inquiries:</p>
                <a
                  href="mailto:press@eatrealfoodnyc.com"
                  className="mt-2 block text-2xl font-bold text-jade transition-colors hover:text-forest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  press@eatrealfoodnyc.com
                </a>
                <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
                  We prioritize press requests and can typically provide data, quotes, or background
                  information within 24 hours for journalists on deadline.
                </p>
              </div>
              <div className="flex-shrink-0 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-forest">We can provide</p>
                <div className="mt-2 space-y-1">
                  {["Data and statistics", "Expert quotes", "Background briefings", "Custom data pulls"].map((item) => (
                    <p key={item} className="text-sm text-gray-700">- {item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">ASSETS</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Media kit
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">
              Our media kit includes the Eat Real Food NYC logo in multiple formats (SVG, PNG, dark and light
              variants), brand colors, approved boilerplate text, and high-resolution screenshots of the
              directory interface.
            </p>
            <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>
              Media kit download coming soon. In the meantime, contact{" "}
              <a href="mailto:press@eatrealfoodnyc.com" className="font-semibold text-jade hover:text-forest">
                press@eatrealfoodnyc.com
              </a>{" "}
              and we will send assets directly.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Want to learn more about how we work?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            Dive into our methodology, editorial standards, and the story behind the directory.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/about"
              className="rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
            >
              About us →
            </Link>
            <Link
              href="/about/our-data"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
            >
              Our data & methodology
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
