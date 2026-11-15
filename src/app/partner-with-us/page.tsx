import type { Metadata } from "next"
import Link from "next/link"
import { getCanonicalUrl } from "@/config/seo"
import { getPublishedDirectoryCounts } from "@/lib/directory-stats"
import { PARTNER_INQUIRY_EMAIL, PARTNER_INQUIRY_PATH } from "@/config/contact"
import PartnerLabel from "@/components/partner-label"
import PartnerTierCards from "@/components/partner-tier-cards"
import { PartnerCta } from "@/components/tracked-external-link"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

export const metadata: Metadata = {
  title: "Partner with Us — Eat Real Food NYC",
  description:
    "Featured is $49 a month, Spotlight is $149 a month, and Neighborhood Sponsor is $299 a month. Listing stays free. Payment never changes a grade or a ranking.",
  alternates: { canonical: getCanonicalUrl("/partner-with-us") },
  robots: { index: true, follow: true },
}

export const revalidate = 3600

const FAQ = [
  {
    q: "Is this advertising?",
    a: "Yes. It is a paid, labeled placement. It is not an editorial endorsement and it is not a health-grade endorsement.",
  },
  {
    q: "Can I pay to be listed?",
    a: "No. Listing is free if you meet the directory’s inclusion rules. You can only pay for a labeled Partner or sponsor placement on top of an eligible listing.",
  },
  {
    q: "Can I pay to raise my grade, Health Score, or organic rank?",
    a: "No. Those are never for sale. If a sales conversation starts to sound like that, the answer is no.",
  },
  {
    q: "Who is eligible?",
    a: "You need a current Grade A, or no current grade and no current violations, and you need to fit a healthy-restaurant directory under our tagging and inclusion rules. If your grade later drops, the Partner placement is paused until you are eligible again. The official grade stays on the page either way.",
  },
  {
    q: "Will diners know I paid?",
    a: "Yes. That is required. We use the words Partner or Sponsored (or Presented by on a sponsor unit), on the placement itself.",
  },
  {
    q: "Do you guarantee traffic, bookings, or search rankings?",
    a: "No. No honest directory can. Until our analytics are connected, we will not quote visit numbers at all. What we do guarantee is the placement, the label, and that your official data will be treated like everyone else’s.",
  },
  {
    q: "How is this different from a Yelp ad?",
    a: "Yelp sells promoted results in a general review marketplace. We sell a labeled placement in a narrower directory: official NYC grades, dietary filters, and neighborhood pages, with a public rule that grades and default rankings cannot be bought.",
  },
  {
    q: "How long does setup take?",
    a: "After we confirm eligibility and you send photos and a short description, the aim is a few business days, not a long creative process.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Partner Listings are month to month after any introductory period. Exclusive page sponsorships may have a minimum term. Cancel before the next bill and the label comes off when the paid period ends.",
  },
  {
    q: "What if you decline or end the partnership?",
    a: "If we decline because of eligibility or policy, or we end a live partnership for a policy reason, we refund unused prepaid time.",
  },
  {
    q: "Who is this for?",
    a: "Independent NYC restaurants that already take food quality and food safety seriously, and a small number of category or homepage sponsors that fit the same standard. It is not a mass display-ad network.",
  },
]

export default async function PartnerWithUsPage() {
  const counts = await getPublishedDirectoryCounts()

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Partner with us", path: "/partner-with-us" }]} />
      <div className="bg-forest px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/80">Partner with us</span>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">FOR RESTAURANTS</p>
          <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            Partner with<br />
            <span className="text-sage">Eat Real Food NYC</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            A labeled placement for restaurants that already belong in the directory.
            Listing stays free. Grades and default rankings stay unpaid.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-sm text-white/70">Diners see</span>
            <PartnerLabel kind="partner" tone="on-dark" />
            <span className="text-sm text-white/50">or</span>
            <PartnerLabel kind="sponsored" tone="on-dark" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">THE DIRECTORY</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Why this directory
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">
              Eat Real Food NYC helps health-conscious diners find restaurants in New York City using
              official NYC Department of Health and Mental Hygiene inspection grades, conservative dietary
              tags across 12 categories, and neighborhood-level pages. We currently publish{" "}
              <span className="font-semibold text-forest">
                {counts.restaurants.toLocaleString()} {counts.restaurants === 1 ? "restaurant listing" : "restaurant listings"}
              </span>{" "}
              across{" "}
              <span className="font-semibold text-forest">
                {counts.neighborhoods.toLocaleString()} {counts.neighborhoods === 1 ? "neighborhood" : "neighborhoods"}
              </span>, in all five boroughs.
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Those counts are published, operational listings — the same set as the public directory
              and the sitemap — not the full inspection dataset.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              Diners come to us when they need something other platforms are weak at: a current official
              grade, a serious dietary filter (vegan, halal, kosher, gluten-free, and eight others), or a
              neighborhood view that is not bought and paid for.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              A listing in the directory is free. A Partner placement is optional. It is clearly labeled,
              and it never changes a health grade, a Health Score, a dietary tag, or our default rankings.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              We do not quote traffic, search-click, or subscriber figures. Those numbers will be added
              only after analytics and, if relevant, a newsletter list are in place and can be shown from
              a current report.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">AUDIENCE</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Who we reach
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">
              People who are already trying to eat well in New York:
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700">
              {[
                "Diners who want a Grade A kitchen, not just a good photo",
                "People searching by diet — including vegan, vegetarian, halal, kosher, and gluten-free",
                "Neighborhood-first visitors comparing options in a specific part of the city",
                "Readers and AI-assisted search tools looking for a source that cites official inspection data",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="flex-shrink-0 text-sage" aria-hidden="true">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              This is a fit-and-trust pitch. If you need a guaranteed impression buy, this is not the right product yet.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">THE OFFER</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What you can buy
          </h2>
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-base leading-relaxed text-gray-700">
              Three paid tiers are for sale. Featured is $49 a month, Spotlight is $149 a month, and Neighborhood Sponsor is $299 a month. Payment never changes an official grade, a Health Score, a dietary tag, or a ranking. Listing in the directory stays free.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              On a diner-facing page the words are Partner or Sponsored. Featured and Spotlight are the names of these paid products. They are not an editorial pick. The{" "}
              <Link href="/about/editorial-standards#editorial-partnership-policy" className="font-semibold text-jade hover:text-forest">
                Editorial &amp; Partnership Policy
              </Link>{" "}
              is the rule. Eligibility is still required: current Grade A, or no current grade and no current violations, plus a genuine fit with this directory.
            </p>
          </div>
          <PartnerTierCards />
          <p className="mt-6 text-sm leading-relaxed text-gray-700">
            Stripe Payment Links are not connected yet. Each button emails {PARTNER_INQUIRY_EMAIL} with the tier in the subject until a link is set on that tier.
          </p>
        </section>

        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">ON THE PAGE</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How a Partner appears to a diner
          </h2>
          <div className="space-y-3">
            {[
              "The diner still sees the official grade, score, and date exactly as the Health Department published them.",
              "If they sort or browse the ordinary neighborhood or diet list, the order is still the organic order.",
              "If they see your restaurant in a Partner module, the module is marked Partner or Sponsored.",
              "On your listing page, a short line states that you are a current Partner. It does not claim we recommend you because you paid.",
            ].map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">FAQ</p>
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Questions restaurants ask
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-forest p-10 text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Ask about eligibility
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/60">
            The three prices are above. Partnership questions still go to {PARTNER_INQUIRY_EMAIL}. The full rules
            live in the Editorial &amp; Partnership Policy. This page does not override that policy.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <PartnerCta
              tier="inquiry"
              href={PARTNER_INQUIRY_PATH}
              className="rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
            >
              Ask about eligibility
            </PartnerCta>
            <PartnerCta
              tier="inquiry"
              href={`mailto:${PARTNER_INQUIRY_EMAIL}?subject=Partnership%20inquiry`}
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
            >
              {PARTNER_INQUIRY_EMAIL}
            </PartnerCta>
          </div>
          <p className="mt-6 text-sm text-white/50">
            <Link href="/about/editorial-standards#editorial-partnership-policy" className="underline decoration-white/30 underline-offset-4 hover:text-white">
              Read the Editorial &amp; Partnership Policy
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
