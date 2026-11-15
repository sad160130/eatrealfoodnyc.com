"use client"

import { useState } from "react"
import { track } from "@vercel/analytics"
import { DATA_PRODUCT } from "@/config/data-product"
import { joinDataWaitlist } from "@/app/actions/data-waitlist"

function trackCta(plan: "monthly" | "yearly" | "waitlist") {
  track("data_cta_click", { plan })
}

export default function DataProductCta() {
  const monthly = DATA_PRODUCT.stripePaymentLinkMonthly.trim()
  const yearly = DATA_PRODUCT.stripePaymentLinkYearly.trim()
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function onSubmit(formData: FormData) {
    setStatus("submitting")
    setError("")
    trackCta("waitlist")
    const result = await joinDataWaitlist(formData)
    if (!result.ok) {
      setError(result.error)
      setStatus("error")
      return
    }
    setStatus("success")
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <Plan
        name="Monthly"
        price={`$${DATA_PRODUCT.priceMonthlyUsd}/month`}
        href={monthly}
        plan="monthly"
      />
      <Plan
        name="Yearly"
        price={`$${DATA_PRODUCT.priceYearlyUsd}/year`}
        href={yearly}
        plan="yearly"
      />
      {!monthly || !yearly ? (
        <div className="md:col-span-2 border p-5" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
          <p className="eyebrow" style={{ color: "var(--color-jade)" }}>Get early access</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Checkout is not connected yet. Leave an email and we will write when a payment link is live.
          </p>
          {status === "success" ? (
            <p role="status" className="mt-4 text-sm font-medium" style={{ color: "var(--color-jade)" }}>
              Thanks. You are on the early-access list.
            </p>
          ) : (
            <form action={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="grid flex-1 gap-1 text-sm">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  className="h-11 rounded-md border px-3"
                  style={{ borderColor: "var(--hairline-strong)" }}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Plan
                <select name="plan" className="h-11 rounded-md border px-3" style={{ borderColor: "var(--hairline-strong)" }}>
                  <option value="monthly">Monthly, ${DATA_PRODUCT.priceMonthlyUsd}</option>
                  <option value="yearly">Yearly, ${DATA_PRODUCT.priceYearlyUsd}</option>
                </select>
              </label>
              <button type="submit" className="h-11 rounded-md bg-forest px-5 text-sm font-semibold text-cream" disabled={status === "submitting"}>
                Get early access
              </button>
            </form>
          )}
          {error ? <p className="mt-2 text-sm" style={{ color: "var(--color-forest)" }}>{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

function Plan({
  name,
  price,
  href,
  plan,
}: {
  name: string
  price: string
  href: string
  plan: "monthly" | "yearly"
}) {
  return (
    <div className="border p-5" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
      <p className="eyebrow">{name}</p>
      <p className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-forest)" }}>{price}</p>
      {href ? (
        <a
          href={href}
          className="mt-4 inline-flex h-11 items-center rounded-md bg-forest px-5 text-sm font-semibold text-cream"
          onClick={() => trackCta(plan)}
        >
          Continue to payment
        </a>
      ) : (
        <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>Payment link not set.</p>
      )}
    </div>
  )
}
