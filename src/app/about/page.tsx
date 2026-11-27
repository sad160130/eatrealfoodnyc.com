import type { Metadata } from "next"
import Link from "next/link"
import { pageMeta } from "@/lib/page-meta"
import { dataAsOfSentence, getSiteStats } from "@/lib/site-stats"
import { ORGANIZATION_SCHEMA } from "@/lib/schema"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

export const metadata: Metadata = pageMeta({
  path: "/about",
  title: "About — NYC Healthy Restaurant Directory",
  description:
    "A curated NYC healthy restaurant directory built on real Health Department inspection data. Our mission, methodology, and team.",
})

export const revalidate = 3600

export default async function AboutPage() {
  const stats = await getSiteStats()

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "About", path: "/about" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", ...ORGANIZATION_SCHEMA }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            url: "https://www.eatrealfoodnyc.com/about",
            dateModified: "2026-11-26",
          }),
        }}
      />

      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">About</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">OUR STORY</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            We believe eating well<br />
            <span className="text-sage">should be effortless</span><br />
            in New York City.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Eat Real Food NYC was built by Rohan Kadam out of a genuine frustration.
            Finding a truly healthy restaurant in New York City — one you could trust
            for both food quality and food safety — required stitching together five
            different apps, reading hundreds of reviews, and still feeling unsure. He
            decided to fix that. Snket Desai is a co-founder of Eat Real Food NYC, with Rohan Kadam.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {[
            { stat: stats.publishedListings.toLocaleString(), label: "Published listings", icon: "🍽️" },
            { stat: stats.neighborhoods.toLocaleString(), label: "Neighborhoods with a published listing", icon: "📍" },
            { stat: stats.gradeAListings.toLocaleString(), label: "Grade A among published listings", icon: "⭐" },
            { stat: stats.restaurantsTracked.toLocaleString(), label: "Restaurant rows tracked, including unpublished", icon: "🗂️" },
            { stat: "5", label: "NYC boroughs fully covered", icon: "🗺️" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="mb-1 text-3xl">{item.icon}</p>
              <p className="text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.stat}</p>
              <p className="mt-1 text-xs leading-tight" style={{ color: "var(--color-muted)" }}>{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-5xl text-center text-sm" style={{ color: "var(--color-muted)" }}>
          {dataAsOfSentence(stats.dataAsOfLabel)} Published listings are operational restaurants on this site. Restaurant rows tracked include unpublished rows.
        </p>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* The problem we solve */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">WHY WE EXIST</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            The problem with finding healthy food in NYC
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City has more restaurants per square mile than almost any city on earth. It also has one of the most rigorous restaurant health inspection systems in the country — the NYC Department of Health inspects every restaurant at least once per year and assigns a public letter grade. But that critical health data is buried in a government database most diners never see.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            At the same time, the platforms people actually use to find restaurants — Yelp, Google Maps, TripAdvisor — are built around reviews and paid promotion. The health-conscious diner who needs to know whether a restaurant is genuinely halal-certified, operates a gluten-free kitchen, or has maintained a Grade A health inspection for the past two years has no good tool designed for them.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Eat Real Food NYC is that tool. We built it by pulling the NYC Health Department inspection database directly, enriching it with verified dietary information, and layering in a neighborhood-level curation system that surfaces the best healthy restaurants in every corner of the city — not the most promoted ones. The source file is the{" "}
            <Link href="https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j" className="font-semibold text-jade hover:text-forest">
              DOHMH New York City Restaurant Inspection Results
            </Link>
            .
          </p>
        </section>

        {/* What makes us different */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">WHAT MAKES US DIFFERENT</p>
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Not another restaurant review site
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { icon: "🏥", title: "Health Department data, not opinions", body: "Every restaurant in our directory shows the actual NYC DOHMH inspection grade, score, and date — pulled directly from the city's open data portal. Not a summary. Not a badge. The real grade the inspector assigned." },
              { icon: "🏷️", title: "Verified dietary tags, not guesswork", body: "Our 12 dietary tags — from vegan and halal to gluten-free and kosher — are applied conservatively. We only tag a restaurant when it genuinely specializes in or is certified for that dietary need." },
              { icon: "💎", title: "Hidden gems, not paid rankings", body: "We identify hidden gem restaurants algorithmically — high ratings, lower review counts, currently operating. No restaurant pays to appear in our directory, and no restaurant can pay for hidden-gem status or a higher place in our default rankings. Some eligible restaurants may choose a clearly labeled Partner placement. Those placements are disclosed, optional, and kept separate from organic results. They never change a health grade, a Health Score, or a dietary tag." },
              { icon: "📊", title: "Neighborhood-level health data", body: "We are the only NYC restaurant directory that lets you compare neighborhoods by health inspection grade rates, dietary diversity, and restaurant quality." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mb-2 mt-3 text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our commitment */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">OUR COMMITMENT</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What we promise our users
          </h2>
          <div className="space-y-4">
            {[
              { promise: "Rankings and grades are never for sale", detail: "Our default rankings are determined by data — health scores, ratings, and dietary relevance. Health grades come from official NYC Department of Health records. Partner and sponsor placements, when we offer them, are clearly labeled and do not affect grades or organic rankings." },
              { promise: "No fake reviews or fabricated content", detail: "The only reviews on our site come from real diners who submit through our experience form and are manually reviewed before publishing." },
              { promise: "Data sourced from official government records", detail: "Our health inspection data is sourced directly from the NYC DOHMH Open Data portal. We only show verified official records." },
              { promise: "Regular data updates", detail: "We refresh our health inspection data regularly to reflect the latest NYC DOHMH records." },
              { promise: "Advertising is labeled, never hidden", detail: "Eat Real Food NYC does not sell our recommendations, our Health Scores, or our official inspection data. When we accept a Partner listing or a sponsorship, we mark it clearly as Partner or Sponsored and keep it out of unlabeled organic results. Payment never buys a better grade or a quieter violation record." },
            ].map((item) => (
              <div key={item.promise} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="mt-0.5 flex-shrink-0 text-lg text-sage">✓</span>
                <div>
                  <p className="text-base font-semibold text-forest">{item.promise}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-gray-600">
            Paid Partner and sponsor placements are clearly labeled. They never change a health grade,
            a Health Score, or our default rankings. Read the{" "}
            <Link href="/about/editorial-standards#editorial-partnership-policy" className="font-semibold text-jade hover:text-forest">
              Editorial &amp; Partnership Policy
            </Link>
            .
          </p>
        </section>

        {/* Navigation to sub-pages */}
        <section className="mb-16">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-sage">LEARN MORE</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { href: "/about/our-data", title: "Our Data & Methodology", desc: "How we source, verify, and maintain the restaurant data.", icon: "📊" },
              { href: "/about/editorial-standards", title: "Editorial Standards", desc: "The principles guiding how we curate and present information.", icon: "📋" },
              { href: "/about/team", title: "Meet the Team", desc: "Meet co-founders Snket Desai and Rohan Kadam.", icon: "👋" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-sage/30 hover:shadow-md">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 text-base font-bold text-forest transition-colors group-hover:text-jade" style={{ fontFamily: "Georgia, serif" }}>{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{item.desc}</p>
                <p className="mt-3 text-xs font-semibold text-jade">Read more →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Questions, corrections, or press inquiries?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            Rohan reads every message. If you find an error in our data, want to suggest a restaurant, or need information for a press piece, reach out.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact" className="rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest">Contact us →</Link>
            <Link href="/press" className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20">Press & media kit</Link>
            <Link href="/partner-with-us" className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20">Partner with us</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
