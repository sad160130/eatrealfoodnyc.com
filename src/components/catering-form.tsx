"use client"

import { useState } from "react"
import { track } from "@vercel/analytics"
import { submitCateringLead } from "@/app/actions/catering"
import { withCateringSource } from "@/lib/catering-source"

const DIETS = [
  ["vegan", "Vegan"],
  ["vegetarian", "Vegetarian"],
  ["gluten-free", "Gluten-free"],
  ["kosher", "Kosher"],
  ["halal", "Halal"],
  ["nut-free", "Nut-free"],
  ["other", "Other"],
] as const

export default function CateringForm({
  restaurantSlug = "",
  restaurantName = "",
  source = "",
  sourcePath,
  labelledBy,
}: {
  restaurantSlug?: string
  restaurantName?: string
  /** Short token stored on the lead and sent with catering_lead_submit. */
  source?: string
  sourcePath?: string
  labelledBy?: string
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const basePath = sourcePath ?? (restaurantSlug ? `/catering?restaurant=${restaurantSlug}` : "/catering")
  const recordedPath = source ? withCateringSource(basePath, source) : basePath

  async function onSubmit(formData: FormData) {
    setStatus("submitting")
    setError("")
    const result = await submitCateringLead(formData)
    if (!result.ok) {
      setError(result.error)
      setStatus("error")
      return
    }
    track("catering_lead_submit", {
      ...(source ? { source } : {}),
      source_path: recordedPath,
      restaurant_slug: restaurantSlug || "",
    })
    setStatus("success")
  }

  if (status === "success") {
    return (
      <p role="status" className="text-base font-medium" style={{ color: "var(--color-jade)" }}>
        Thanks. We have your catering request.
      </p>
    )
  }

  return (
    <form action={onSubmit} className="grid gap-4" aria-labelledby={labelledBy}>
      <input type="hidden" name="source_path" value={recordedPath} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="restaurant_slug" value={restaurantSlug} />
      {restaurantName ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Preferred restaurant: <span style={{ color: "var(--color-forest)" }}>{restaurantName}</span>
        </p>
      ) : null}
      <Field label="Name" name="name" required autoComplete="name" />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
      <Field label="Event date" name="event_date" type="date" required />
      <Field label="Headcount" name="headcount" type="number" required min={1} max={5000} />
      <Field label="Borough or neighborhood" name="place" required placeholder="Brooklyn, or Williamsburg" />
      <fieldset>
        <legend className="text-sm font-medium" style={{ color: "var(--color-forest)" }}>Dietary needs</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {DIETS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`diet_${value}`} value="yes" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
        Budget
        <select name="budget" className="h-11 rounded-md border bg-white px-3 font-normal" style={{ borderColor: "var(--hairline-strong)" }}>
          <option value="">No budget yet</option>
          <option value="under-250">Under $250</option>
          <option value="250-500">$250–$500</option>
          <option value="500-1000">$500–$1,000</option>
          <option value="1000-plus">$1,000+</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
        Notes
        <textarea name="notes" rows={4} maxLength={2000} className="rounded-md border bg-white px-3 py-2 font-normal" style={{ borderColor: "var(--hairline-strong)" }} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" value="yes" required className="mt-1" />
        <span>I agree that Eat Real Food NYC may share this request with restaurants.</span>
      </label>
      {error ? <p className="text-sm" style={{ color: "var(--color-forest)" }}>{error}</p> : null}
      <button type="submit" disabled={status === "submitting"} className="h-11 w-fit rounded-md bg-forest px-5 text-sm font-semibold text-cream">
        Send the request
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
  min,
  max,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
  min?: number
  max?: number
}) {
  return (
    <label className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={min}
        max={max}
        className="h-11 rounded-md border bg-white px-3 font-normal"
        style={{ borderColor: "var(--hairline-strong)" }}
      />
    </label>
  )
}
