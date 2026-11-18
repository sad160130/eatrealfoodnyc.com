"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { track } from "@vercel/analytics"

const linkClass = "font-semibold text-jade underline underline-offset-4 hover:text-forest"

export function ClaimListingCta({
  source,
  className = linkClass,
  children,
}: {
  source: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link href="/claim" className={className} onClick={() => track("claim_listing_click", { source })}>
      {children}
    </Link>
  )
}

export function InspectionLeadsCta({
  source,
  className = linkClass,
  children,
}: {
  source: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link href="/data" className={className} onClick={() => track("data_cta_click", { source })}>
      {children}
    </Link>
  )
}
