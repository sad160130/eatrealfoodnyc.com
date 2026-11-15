"use client"

import { useEffect, useState } from "react"
import { track } from "@vercel/analytics"

export default function BadgeSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    track("badge_page_view", { path: window.location.pathname })
  }, [])

  async function copy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    track("badge_snippet_copy", { path: window.location.pathname })
  }

  return (
    <div className="mt-6">
      <button type="button" onClick={copy} className="h-11 rounded-md bg-forest px-5 text-sm font-semibold text-cream">
        {copied ? "Copied" : "Copy embed code"}
      </button>
      <pre className="mt-4 overflow-x-auto border p-4 text-xs leading-relaxed" style={{ borderColor: "var(--hairline)" }}>
        {snippet}
      </pre>
    </div>
  )
}
