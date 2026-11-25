"use client"

import type { ReactNode } from "react"
import { track } from "@vercel/analytics"

export default function HolidayHeroCta({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      onClick={() => {
        try {
          track("catering_hero_cta_click")
        } catch {
          // Analytics must not block the scroll to the form.
        }
      }}
      className="inline-flex h-14 w-full items-center justify-center rounded-md bg-forest px-8 text-base font-semibold text-cream transition-colors hover:bg-jade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade sm:w-auto"
    >
      {children}
    </a>
  )
}
