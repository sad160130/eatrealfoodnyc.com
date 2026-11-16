import Link from "next/link"
import { PARTNER_INQUIRY_EMAIL } from "@/config/contact"
import {
  partnerInquiryCta,
  partnerInquiryHref,
  partnerTierCta,
  partnerTierHref,
  partnerTierPrice,
  PARTNER_INQUIRY_OFFERS,
  PARTNER_TIERS,
} from "@/config/partner-tiers"
import { PartnerCta } from "@/components/tracked-external-link"

const cardClass = "flex flex-col rounded-md border bg-white p-6"
const cardStyle = { borderColor: "var(--hairline)" } as const
const headingStyle = { fontFamily: "Georgia, serif", color: "var(--color-forest)" } as const

export default function PartnerTierCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PARTNER_TIERS.map((tier) => {
        const price = partnerTierPrice(tier)
        return (
          <article key={tier.id} className={cardClass} style={cardStyle}>
            <p className="eyebrow">Paid</p>
            <h3 className="mt-3 text-3xl font-bold" style={headingStyle}>
              {tier.name}
            </h3>
            <p className="mt-4 text-4xl font-bold tabular" style={headingStyle}>
              {price}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-700">{tier.summary}</p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700">
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <PartnerCta
              tier={tier.name}
              href={partnerTierHref(tier)}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-forest px-5 text-sm font-semibold text-cream transition-colors hover:bg-jade"
            >
              {partnerTierCta(tier)}
            </PartnerCta>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {tier.stripePaymentLink
                ? "Opens a Stripe Payment Link."
                : `Email ${PARTNER_INQUIRY_EMAIL}. The subject line is “${tier.name} partnership”.`}
            </p>
          </article>
        )
      })}
    </div>
  )
}

export function PartnerInquiryCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PARTNER_INQUIRY_OFFERS.map((offer) => (
        <article key={offer.id} className={cardClass} style={cardStyle}>
          <p className="eyebrow">Inquiry</p>
          <h3 className="mt-3 text-2xl font-bold" style={headingStyle}>
            {offer.name}
          </h3>
          <p className="mt-4 text-2xl font-bold tabular" style={headingStyle}>
            {offer.price}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{offer.summary}</p>
          {offer.label ? (
            <p className="mt-3 text-sm font-semibold text-forest">{`Labeled ${offer.label}.`}</p>
          ) : null}
          <p className="mt-3 text-sm leading-relaxed">
            <Link href={offer.href} className="font-semibold text-jade hover:text-forest">
              {offer.hrefLabel}
            </Link>
          </p>
          <PartnerCta
            tier={offer.id}
            href={partnerInquiryHref(offer)}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-forest px-5 text-center text-sm font-semibold text-cream transition-colors hover:bg-jade"
          >
            {partnerInquiryCta(offer)}
          </PartnerCta>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {`Email ${PARTNER_INQUIRY_EMAIL}. The subject line is “${offer.subject}”.`}
          </p>
        </article>
      ))}
    </div>
  )
}
