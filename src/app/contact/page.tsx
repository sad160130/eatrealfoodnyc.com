import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Contact Us — Eat Real Food NYC",
  description:
    "Get in touch with the Eat Real Food NYC team for data corrections, restaurant submissions, press inquiries, or general feedback. We respond within 48 hours.",
  alternates: { canonical: getCanonicalUrl("/contact") },
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">Contact</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">GET IN TOUCH</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Contact<br />
            <span className="text-sage">Us</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            Whether you have spotted an error in our data, want to suggest a restaurant, or have
            a press inquiry, we read every message and respond within 48 hours.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Email and Response Time */}
        <section className="mb-16">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">EMAIL US</p>
            <a
              href="mailto:hello@eatrealfoodnyc.com"
              className="text-3xl font-bold text-forest transition-colors hover:text-jade"
              style={{ fontFamily: "Georgia, serif" }}
            >
              hello@eatrealfoodnyc.com
            </a>
            <p className="mt-4 text-base" style={{ color: "var(--color-muted)" }}>
              We respond within 48 hours. For urgent data corrections, please include the restaurant
              name and the specific issue in your subject line.
            </p>
          </div>
        </section>

        {/* Contact Categories */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">HOW CAN WE HELP?</p>
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Choose the category that fits your inquiry
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                icon: "📊",
                category: "Data Corrections",
                description: "Found an incorrect inspection grade, a wrong address, a missing dietary tag, or a restaurant that has closed? Data corrections are our highest priority. Include the restaurant name, what is wrong, and what the correct information should be.",
                email: "hello@eatrealfoodnyc.com",
                subject: "Subject: Data Correction — [Restaurant Name]",
              },
              {
                icon: "🍽️",
                category: "Restaurant Submissions",
                description: "Know a healthy restaurant in NYC that is not in our directory? We welcome submissions. Please include the restaurant name, address, borough, and why you think it belongs in Eat Real Food NYC. We will verify it against our data sources and add it if it meets our criteria.",
                email: "hello@eatrealfoodnyc.com",
                subject: "Subject: Restaurant Submission — [Restaurant Name]",
              },
              {
                icon: "📰",
                category: "Press Inquiries",
                description: "Journalists, bloggers, and media professionals looking for information about Eat Real Food NYC, our data, or our methodology should reach out to our dedicated press email. We provide data, quotes, and background on NYC healthy dining trends.",
                email: "press@eatrealfoodnyc.com",
                subject: "Subject: Press Inquiry — [Publication Name]",
              },
              {
                icon: "💬",
                category: "General Feedback",
                description: "Have a feature suggestion, a question about how we calculate our Health Score, or just want to share your experience using the site? We genuinely appreciate hearing from our users. Your feedback directly shapes our product roadmap.",
                email: "hello@eatrealfoodnyc.com",
                subject: "Subject: Feedback — [Topic]",
              },
            ].map((item) => (
              <div key={item.category} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.category}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.description}</p>
                <div className="mt-4 rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-forest">{item.email}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>{item.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Response Time */}
        <section className="mb-16">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              What to expect
            </h2>
            <div className="space-y-4">
              {[
                { time: "Within 48 hours", detail: "We acknowledge every message within two business days. Most inquiries receive a full response in this window." },
                { time: "Data corrections", detail: "Verified corrections are applied to the database within 48 hours of confirmation. Complex cases (e.g., disputed grades, certification verification) may take up to one week." },
                { time: "Restaurant submissions", detail: "New restaurant submissions are processed within 7 business days. We verify the listing against the DOHMH database, Google Maps, and our dietary tagging pipeline before adding it to the directory." },
                { time: "Press inquiries", detail: "Press requests receive priority handling. We can typically provide data, quotes, or background information within 24 hours for journalists on deadline." },
              ].map((item) => (
                <div key={item.time} className="flex gap-4">
                  <span className="flex-shrink-0 rounded-lg bg-sage/10 px-3 py-1 text-xs font-bold text-forest">
                    {item.time}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-700">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurant Owners Section */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">FOR RESTAURANT OWNERS</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Own a restaurant in our directory?
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">
              If your restaurant is listed on Eat Real Food NYC and you believe any information is inaccurate —
              your inspection grade has been updated, your dietary offerings have changed, your hours are wrong,
              or you have recently obtained a halal or kosher certification — we want to know.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              Every restaurant listing page includes an accuracy feedback option that allows you to flag specific
              data points for review. You can also email us directly at{" "}
              <a href="mailto:hello@eatrealfoodnyc.com" className="font-semibold text-jade hover:text-forest">
                hello@eatrealfoodnyc.com
              </a>{" "}
              with the subject line &quot;Restaurant Owner — [Your Restaurant Name].&quot;
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Please note: we do not offer paid listing upgrades, promoted placements, or score modifications.
              All listings are determined by our data pipeline and editorial standards. We are happy to correct
              factual errors but cannot modify our Health Score methodology for individual restaurants.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Not sure which category?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            Just send your message to hello@eatrealfoodnyc.com and we will route it to the right person.
          </p>
          <a
            href="mailto:hello@eatrealfoodnyc.com"
            className="mt-8 inline-block rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
          >
            Email us →
          </a>
        </section>
      </div>
    </div>
  )
}
