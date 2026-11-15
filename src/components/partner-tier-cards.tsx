import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import { partnerTierCta, partnerTierHref, PARTNER_TIERS } from "@/config/partner-tiers"

export default function PartnerTierCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PARTNER_TIERS.map((tier) => (
        <article
          key={tier.id}
          className="flex flex-col rounded-md border bg-white p-6"
          style={{ borderColor: "var(--hairline)" }}
        >
          <p className="eyebrow">Paid</p>
          <h3 className="mt-3 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            {tier.name}
          </h3>
          <p className="mt-4 text-4xl font-bold" style={{ fontFamily: "Georgia, serif", color: "var(--color-forest)" }}>
            ${tier.priceMonthlyUsd}
            <span className="ml-1 text-base font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--color-muted)" }}>
              /month
            </span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{tier.summary}</p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700">
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
  )
}
