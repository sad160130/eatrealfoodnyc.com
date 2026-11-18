"use client"

import { useId, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { subscribeNewsletter } from "@/app/actions/newsletter"

export default function NewsletterSignup({
  tone = "light",
  sourcePath,
}: {
  tone?: "light" | "dark"
  sourcePath?: string
}) {
  const pathname = usePathname()
  const source = sourcePath ?? pathname ?? "/"
  const headingId = useId()
  const [status, setStatus] = useState<"idle" | "submitting" | "confirm" | "already" | "error">("idle")
  const [error, setError] = useState("")
  const dark = tone === "dark"
  const text = dark ? "rgba(248, 246, 241, 0.82)" : "var(--color-text)"
  const muted = dark ? "rgba(248, 246, 241, 0.62)" : "var(--color-muted)"

  async function onSubmit(formData: FormData) {
    setStatus("submitting")
    setError("")
    const result = await subscribeNewsletter(formData)
    if (!result.ok) {
      setError(result.error)
      setStatus("error")
      return
    }
    if (result.status === "confirm") track("newsletter_signup", { source_path: source })
    setStatus(result.status)
  }

  return (
    <section aria-labelledby={headingId} className="max-w-xl">
      <p className="eyebrow" style={{ color: dark ? "var(--color-sage)" : "var(--color-jade)" }}>
        Weekly email
      </p>
      <h2
        id={headingId}
        className="mt-2 text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)", color: dark ? "var(--color-cream)" : "var(--color-forest)" }}
      >
        Grade A Eats This Week
      </h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: muted }}>
        New Grade A listings and the neighborhood with the most of them. One email a week, after you confirm. Unsubscribe anytime.{" "}
        <Link href="/newsletter" className="underline underline-offset-4" style={{ color: dark ? "var(--color-sage)" : "var(--color-jade)" }}>
          What you get
        </Link>
      </p>
      {status === "confirm" || status === "already" ? (
        <p role="status" className="mt-4 text-sm font-medium" style={{ color: dark ? "var(--color-sage)" : "var(--color-jade)" }}>
          {status === "already"
            ? "That email is already confirmed for Grade A Eats This Week."
            : "Check your email for a confirmation link. It expires in 7 days."}
        </p>
      ) : (
        <form action={onSubmit} className="mt-4">
          <input type="hidden" name="source_path" value={source} />
          <label className="grid gap-1 text-sm" style={{ color: text }}>
            Email
            <input
              type="email"
              name="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11 rounded-md border px-3 text-base outline-none"
              style={{
                borderColor: dark ? "rgba(248, 246, 241, 0.28)" : "var(--hairline-strong)",
                backgroundColor: dark ? "rgba(248, 246, 241, 0.08)" : "#fff",
                color: dark ? "var(--color-cream)" : "var(--color-text)",
              }}
              disabled={status === "submitting"}
            />
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm leading-relaxed" style={{ color: muted }}>
            <input type="checkbox" name="consent" value="yes" required className="mt-1" disabled={status === "submitting"} />
            <span>I agree to receive the weekly Grade A Eats This Week email.</span>
          </label>
          {status === "error" && (
            <p role="alert" className="mt-2 text-sm" style={{ color: dark ? "var(--color-cream)" : "var(--color-forest)" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-4 h-11 rounded-md px-5 text-sm font-semibold disabled:opacity-60"
            style={{
              backgroundColor: dark ? "var(--color-cream)" : "var(--color-forest)",
              color: dark ? "var(--color-forest)" : "var(--color-cream)",
            }}
          >
            {status === "submitting" ? "Signing up…" : "Sign up"}
          </button>
        </form>
      )}
    </section>
  )
}
