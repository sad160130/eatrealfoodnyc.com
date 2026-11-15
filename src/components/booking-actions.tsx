"use client"

import { track } from "@vercel/analytics"
import { deliveryLinks, reserveLinks, type BookingLink } from "@/lib/booking-links"

export default function BookingActions({
  slug,
  name,
  address,
}: {
  slug: string
  name: string
  address: string
}) {
  const reserves = reserveLinks(name, address)
  const deliveries = deliveryLinks(name, address)

  function open(kind: "reserve_click" | "delivery_click", link: BookingLink) {
    track(kind, { slug, provider: link.provider })
  }

  return (
    <div className="mt-5">
      <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
        Book or order
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {reserves.map((link) => (
          <a
            key={link.provider}
            href={link.href}
            target="_blank"
            rel="nofollow noopener"
            onClick={() => open("reserve_click", link)}
            className="inline-flex h-10 items-center rounded-md border px-3 text-sm font-semibold transition-colors hover:border-jade"
            style={{ borderColor: "var(--hairline-strong)", color: "var(--color-forest)" }}
          >
            Reserve a table · {link.label}
          </a>
        ))}
        {deliveries.map((link) => (
          <a
            key={link.provider}
            href={link.href}
            target="_blank"
            rel="nofollow noopener"
            onClick={() => open("delivery_click", link)}
            className="inline-flex h-10 items-center rounded-md border px-3 text-sm font-semibold transition-colors hover:border-jade"
            style={{ borderColor: "var(--hairline-strong)", color: "var(--color-forest)" }}
          >
            Order delivery · {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
