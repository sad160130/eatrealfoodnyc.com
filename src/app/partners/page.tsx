import type { Metadata } from "next"
import Link from "next/link"
import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import { partnerTierCta, partnerTierHref, PARTNER_TIERS } from "@/config/partner-tiers"
import { pageMeta } from "@/lib/page-meta"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

const TITLE = "Paid partner tiers"
const DESCRIPTION =
  "Featured is $49 a month, Spotlight is $149 a month, and Neighborhood Sponsor is $299 a month. Payment never changes a grade or a ranking."

export const metadata: Metadata = pageMeta({
  path: "/partners",
  title: TITLE,
  description: DESCRIPTION,
})

export default function PartnersPage() {
  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Partners", path: "/partners" }]} />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="eyebrow">Paid placements</p>
        <h1 className="display-2 mt-4 max-w-[18ch]">Three ways to be labeled, not ranked.</h1>
        <p className="dek mt-6 max-w-[62ch]">
          These are advertising prices. Paying does not change an official NYC DOHMH grade, a Health Score, a dietary tag, a hidden-gem mark, or the organic order of any list. A listing in the directory stays free.
        </p>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
          On the restaurant page, diners see the words Partner or Sponsored. Featured and Spotlight are the names of the paid products on this page. They are not an editorial pick. The rules are in the{" "}
          <Link
            href="/about/editorial-standards#editorial-partnership-policy"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-jade)" }}
          >
            Editorial &amp; Partnership Policy
          </Link>
          .
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PARTNER_TIERS.map((tier) => (
            <article
              key={tier.id}
              className="flex flex-col rounded-md border bg-white p-6"
              style={{ borderColor: "var(--hairline)" }}
            >
              <p className="eyebrow">Paid</p>
              <h2 className="h2-serif mt-3 text-3xl">{tier.name}</h2>
              <p className="mt-4 text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-forest)" }}>
                ${tier.priceMonthlyUsd}
                <span className="ml-1 text-base font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--color-muted)" }}>
                  /month
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                {tier.summary}
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                {tier.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href={partnerTierHref(tier)}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-forest px-5 text-sm font-semibold text-cream transition-colors hover:bg-jade"
              >
                {partnerTierCta(tier)}
              </a>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {tier.stripePaymentLink
                  ? "Opens a Stripe Payment Link."
                  : `Email ${PARTNER_INQUIRY_EMAIL}. The subject line is “${tier.name} partnership”.`}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-[62ch] text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Stripe Payment Links are not connected yet. Each button is a mailto until a link is added in the tier config. Questions about eligibility still go through the{" "}
          <Link href="/partner-with-us" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
            partner overview
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
