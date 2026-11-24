"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { track } from "@vercel/analytics"

export default function HomeHeroCta({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        try {
          track("home_hero_cta_click")
        } catch {
          // Analytics must not block the navigation.
        }
      }}
      className="inline-flex h-14 w-full items-center justify-center rounded-md bg-forest px-8 text-base font-semibold text-cream transition-colors hover:bg-jade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade sm:w-auto"
    >
      {children}
    </Link>
  )
}
