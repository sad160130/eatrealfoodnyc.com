"use client"

import { useEffect } from "react"
import { track } from "@vercel/analytics"

export default function BadgeReferral() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")
    if (ref === "badge") track("badge_referral", { path: window.location.pathname })
  }, [])
  return null
}
