"use client"

import Link from "next/link"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { track } from "@vercel/analytics"

type PartnerTier = string

function onTrack(name: "outbound_website_click" | "directions_click" | "claim_listing_click"): () => void
function onTrack(name: "partner_cta_click", tier: PartnerTier): () => void
function onTrack(name: "outbound_website_click" | "directions_click" | "claim_listing_click" | "partner_cta_click", tier?: PartnerTier) {
  return () => {
    if (name === "partner_cta_click") {
      track(name, { tier: tier ?? "inquiry" })
      return
    }
    track(name)
  }
}

export function OutboundWebsiteLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        onTrack("outbound_website_click")()
      }}
    />
  )
}

export function DirectionsLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        onTrack("directions_click")()
      }}
    />
  )
}

export function PartnerCta({
  tier,
  href,
  className,
  children,
}: {
  tier: string
  href: string
  className?: string
  children: ReactNode
}) {
  const trackClick = onTrack("partner_cta_click", tier)
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} onClick={trackClick}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className} onClick={trackClick}>
      {children}
    </a>
  )
}
