import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"

export const metadata: Metadata = {
  title: "Privacy Policy — Eat Real Food NYC",
  description:
    "Eat Real Food NYC privacy policy: what data we collect, what we do not collect, how we use cookies, and your rights. Effective March 2026.",
  alternates: { canonical: getCanonicalUrl("/privacy") },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Hero */}
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">Privacy Policy</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">YOUR PRIVACY</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Privacy<br />
            <span className="text-sage">Policy</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            We built Eat Real Food NYC to be a useful public resource, not a data collection tool.
            Here is exactly what we collect, what we do not collect, and why.
          </p>
          <p className="mt-4 text-sm text-white/40">
            Effective date: March 1, 2026 | Last updated: March 2026
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* What We Collect */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 1</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What data we collect
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Anonymous usage analytics</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                We collect anonymous, aggregated analytics data to understand how visitors use our site. This includes
                page views, general geographic region (city-level, not precise location), device type (mobile/desktop),
                browser type, and referral source. This data is collected in aggregate and cannot be used to identify
                individual users. We use this information solely to improve the site experience — for example,
                understanding which neighborhoods are most searched helps us prioritize data quality efforts.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Experience form submissions</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                When you submit a restaurant experience report or a data correction through our on-site forms,
                we collect the information you voluntarily provide: your name (if given), email address (if given),
                the restaurant name, and the content of your submission. This information is used solely to process
                your submission and, if applicable, to follow up with you about the correction. We do not use
                submission email addresses for marketing purposes.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do NOT Collect */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 2</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What we do NOT collect
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Eat Real Food NYC is designed to minimize data collection. We explicitly do not collect:
            </p>
            <div className="space-y-3">
              {[
                "No account creation required. Eat Real Food NYC does not have user accounts, logins, passwords, or registration of any kind. You can use every feature of our site without creating an account.",
                "No personal data beyond voluntary submissions. We do not collect your name, email address, phone number, or any other personal information unless you choose to submit it through our contact or experience forms.",
                "No precise location data. We do not request or collect your GPS location, IP-based precise geolocation, or any other fine-grained location data.",
                "No tracking across other websites. We do not use cross-site tracking pixels, retargeting cookies, or any technology that follows your activity outside of eatrealfoodnyc.com.",
                "No data sold to third parties. We do not sell, rent, or share any user data with advertisers, data brokers, or any third party for commercial purposes.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">✓</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 3</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Cookies
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-forest">Essential cookies</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  We use a small number of essential cookies that are required for the site to function correctly.
                  These include cookies for maintaining your session state (e.g., saved restaurant preferences) and
                  cookies required by our hosting infrastructure (Vercel). These cookies do not track your behavior
                  and cannot be used to identify you.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold text-forest">Analytics cookies</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  We use privacy-respecting analytics to collect aggregate usage data. These cookies help us understand
                  overall traffic patterns but do not create individual user profiles. We do not use Google Analytics
                  or any analytics tool that shares data with advertising networks.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold text-forest">No advertising or tracking cookies</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  Eat Real Food NYC does not use advertising cookies, retargeting cookies, social media tracking
                  pixels, or any third-party cookies designed to track your behavior for advertising purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 4</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Third-party services
          </h2>
          <div className="space-y-4">
            {[
              {
                service: "Supabase",
                purpose: "Database hosting and data storage",
                detail: "Our restaurant data (inspection grades, dietary tags, listings) is stored in a PostgreSQL database hosted by Supabase. Supabase does not have access to user data beyond what is stored in our database. User-submitted form data (corrections, experience reports) is also stored in Supabase.",
              },
              {
                service: "Vercel",
                purpose: "Website hosting and deployment",
                detail: "Our website is hosted on Vercel. Vercel processes web requests and may log IP addresses and request metadata as part of standard web server operations. Vercel's privacy policy governs their handling of this infrastructure-level data.",
              },
              {
                service: "OpenStreetMap",
                purpose: "Map tiles and geographic data",
                detail: "We use OpenStreetMap via Leaflet.js to display restaurant locations on maps. When you view a map on our site, your browser loads map tile images from OpenStreetMap's servers. OpenStreetMap may log requests in accordance with their privacy policy. We chose OpenStreetMap specifically because it does not require user tracking or API keys tied to user accounts.",
              },
            ].map((item) => (
              <div key={item.service} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 rounded-lg bg-sage/10 px-3 py-1 text-xs font-bold uppercase text-forest">
                    {item.service}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest">{item.purpose}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 5</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Data retention
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-gray-700">
                <span className="font-semibold text-forest">Analytics data</span> is retained in aggregate form
                indefinitely. Because it is anonymous and aggregated, it cannot be attributed to individuals and
                therefore poses no privacy risk.
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                <span className="font-semibold text-forest">Form submissions</span> (corrections, experience reports,
                contact messages) are retained for as long as they are operationally useful. If you would like us
                to delete a submission you made, contact us at hello@eatrealfoodnyc.com and we will process the
                deletion within 30 days.
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                <span className="font-semibold text-forest">Saved preferences</span> (such as saved restaurants)
                are stored locally in your browser and are never transmitted to our servers. Clearing your browser
                data will remove these preferences.
              </p>
            </div>
          </div>
        </section>

        {/* User Rights */}
        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">SECTION 6</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Your rights
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Because we collect minimal data, there is very little personal information we hold. However,
              you have the following rights:
            </p>
            <div className="space-y-3">
              {[
                "Right to access: You can request a copy of any personal data we hold about you (typically limited to any form submissions you have made).",
                "Right to deletion: You can request that we delete any personal data associated with form submissions you have made.",
                "Right to correction: You can request that we correct any inaccurate personal data we hold.",
                "Right to object: You can object to our processing of your data. Given our minimal collection, this primarily applies to analytics.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-sage">-</span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-700">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@eatrealfoodnyc.com" className="font-semibold text-jade hover:text-forest">
                hello@eatrealfoodnyc.com
              </a>{" "}
              with the subject line &quot;Privacy Request.&quot; We will respond within 30 days.
            </p>
          </div>
        </section>

        {/* Contact for Privacy */}
        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Questions about your privacy?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            If you have any questions or concerns about this privacy policy or how we handle data,
            reach out to us.
          </p>
          <a
            href="mailto:hello@eatrealfoodnyc.com"
            className="mt-8 inline-block rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
          >
            hello@eatrealfoodnyc.com →
          </a>
        </section>
      </div>
    </div>
  )
}
