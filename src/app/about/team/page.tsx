import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Our Team — Eat Real Food NYC Healthy Restaurant Directory",
  description:
    "Meet Snket Desai, the founder of Eat Real Food NYC, and learn about the data verification process behind NYC's most trusted healthy restaurant directory.",
  alternates: { canonical: getCanonicalUrl("/about/team") },
  robots: { index: true, follow: true },
}

export default function TeamPage() {
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
            <span className="text-white/80">Team</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">THE PEOPLE</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Meet the<br />
            <span className="text-sage">Team</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Eat Real Food NYC was built by someone who spent years eating in New York City and
            got tired of guessing which restaurants were actually healthy and safe.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Founder Section */}
        <section className="mb-16">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-shrink-0">
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-forest text-5xl text-white">
                  SD
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sage">FOUNDER & EDITOR-IN-CHIEF</p>
                <h2 className="text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                  Snket Desai
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                  Charlotte, NC (previously New York City)
                </p>

                <div className="mt-6 space-y-4">
                  <p className="text-base leading-relaxed text-gray-700">
                    Sanket is a Senior SEO Manager with deep experience building and scaling data-driven digital
                    products. At CoinDesk, he helped grow organic traffic to over 15 million monthly visitors and
                    a Domain Rating of 90, working across technical SEO, content strategy, and programmatic page
                    generation at scale. At Capital One Shopping, he contributed to growing organic sessions to
                    7.4 million, focusing on the intersection of data engineering and search visibility.
                  </p>
                  <p className="text-base leading-relaxed text-gray-700">
                    Eat Real Food NYC was born from a personal need. After years of living in New York City and
                    spending too much time cross-referencing Yelp reviews, Google Maps ratings, and the NYC Health
                    Department inspection database just to find a restaurant that was both healthy and clean, Sanket
                    decided to build the tool he wished existed. The result is a directory that combines official
                    government health data with verified dietary information in a way that no other NYC restaurant
                    resource does.
                  </p>
                  <p className="text-base leading-relaxed text-gray-700">
                    The technical architecture behind Eat Real Food NYC — from the data pipeline that ingests and
                    cross-references three separate data sources, to the programmatic SEO layer that generates
                    optimized pages for every borough, neighborhood, and diet type combination — reflects the same
                    approach to data-driven product building that Sanket has applied throughout his career.
                  </p>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">EXPERTISE</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Technical SEO",
                      "Data journalism",
                      "NYC food scene",
                      "Health food",
                      "Digital product building",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-forest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="https://sanketdesai.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-jade transition-colors hover:text-forest"
                  >
                    View full portfolio at sanketdesai.info
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Verification Process */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">VERIFICATION PROCESS</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How our data gets verified
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            Eat Real Food NYC does not rely on a single data source. Every restaurant listing in our
            directory is built from three independent data layers that cross-reference and validate
            each other.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Government records",
                body: "The NYC Department of Health and Mental Hygiene provides the foundational layer: inspection grades, scores, dates, and violation records. This is the only source of official food safety data in New York City, and we pull it directly from the NYC Open Data portal.",
              },
              {
                step: "02",
                title: "Business listings",
                body: "Google Maps Platform provides business-level data: verified addresses, operating hours, phone numbers, user ratings, and review volumes. This layer confirms that a restaurant exists, is currently operational, and gives us the user sentiment data that feeds into our Health Score.",
              },
              {
                step: "03",
                title: "AI-assisted analysis",
                body: "Our dietary tagging pipeline uses Claude AI to analyze each restaurant's cuisine type, public menu data, and business description to assign dietary tags. Every tag is subject to the conservative tagging policy described in our editorial standards, and spot-check reviews are conducted regularly.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Help Us Improve CTA */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Help us improve
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            Eat Real Food NYC is a living project. If you have local knowledge about a restaurant
            in our directory — a dietary tag we missed, a grade that has changed, a restaurant that
            has closed — your input directly improves the resource for everyone.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
            >
              Submit a correction →
            </Link>
            <Link
              href="/about/our-data"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
            >
              View our methodology
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
