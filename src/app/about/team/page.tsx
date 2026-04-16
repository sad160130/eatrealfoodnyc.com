import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Meet the Team — Eat Real Food NYC",
  description:
    "Meet Rohan Kadam — the founder behind Eat Real Food NYC, NYC's most trusted healthy restaurant directory.",
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
            Meet the Team
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Eat Real Food NYC is built by someone who cares deeply about
            healthy eating, honest data, and making New York City&apos;s best
            restaurants easier to find.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Team */}
        <div className="mb-16 mx-auto max-w-xl">

          {/* Rohan Kadam */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jade to-sage">
                <span className="text-3xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>RK</span>
              </div>
              <div className="min-w-64 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                      Rohan Kadam
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-jade">
                      Founder & Marketing Lead
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                      North York, Ontario, Canada · University of Mumbai
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.linkedin.com/in/rohan-kadam-176922204"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-sage/30 px-3 py-1.5 text-xs font-semibold text-jade transition-colors hover:border-jade"
                    >
                      LinkedIn →
                    </a>
                  </div>
                </div>

                <div className="mt-5 space-y-4 leading-relaxed text-gray-700">
                  <p>
                    Rohan Kadam is a Marketing Leader with a sharp focus on brand
                    positioning, audience growth, and community-led marketing. With a
                    foundation built at the University of Mumbai and honed through
                    hands-on entrepreneurial work, Rohan brings a distinctly
                    user-first perspective to everything Eat Real Food NYC publishes
                    and promotes.
                  </p>
                  <p>
                    At Eat Real Food NYC, Rohan leads all marketing strategy —
                    from how the brand speaks to health-conscious New Yorkers, to
                    the content and community channels that drive awareness across
                    the city&apos;s five boroughs. His work ensures that the directory
                    reaches the people who need it most: diners who care about what
                    they eat and want honest, verified information to guide their
                    choices.
                  </p>
                  <p>
                    Rohan believes that great healthy food should be easy to find
                    for everyone in New York City — not just those who know where
                    to look.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Brand strategy",
                    "Content marketing",
                    "Community growth",
                    "Audience development",
                    "NYC food culture",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-jade"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

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
