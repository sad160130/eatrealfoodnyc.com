"use client"

import { useState } from "react"
import { CLAIM_DIET_TAGS, CLAIM_FIXES } from "@/lib/claim-submission"

type Match = { slug: string; name: string; neighborhood: string | null }

export default function ClaimForm({
  restaurantSlug = "",
  restaurantName = "",
}: {
  restaurantSlug?: string
  restaurantName?: string
}) {
  const [slug, setSlug] = useState(restaurantSlug)
  const [pickedName, setPickedName] = useState(restaurantName)
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function search(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
    const data = await response.json().catch(() => ({}))
    const rows = Array.isArray(data.restaurants) ? data.restaurants : []
    setMatches(rows.map((row: Match) => ({ slug: row.slug, name: row.name, neighborhood: row.neighborhood ?? null })))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setErrorMsg("")
    const form = new FormData(event.currentTarget)
    const fixes = CLAIM_FIXES.filter((fix) => form.get(`fix_${fix}`) === "yes")
    const dietTags = CLAIM_DIET_TAGS.filter((tag) => form.get(`diet_${tag}`) === "yes")
    const response = await fetch("/api/claim-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantSlug: slug,
        name: String(form.get("name") ?? ""),
        role: String(form.get("role") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        notes: String(form.get("notes") ?? ""),
        company_website: String(form.get("company_website") ?? ""),
        fixes,
        dietTags,
      }),
    })
    if (response.ok) {
      setStatus("success")
      return
    }
    const data = await response.json().catch(() => ({}))
    setErrorMsg(typeof data.error === "string" ? data.error : "Something went wrong")
    setStatus("error")
  }

  if (status === "success") {
    return (
      <p role="status" className="text-base font-medium" style={{ color: "var(--color-jade)" }}>
        We received your claim. A person reviews every claim. Claiming does not change your grade or your place in the directory.
      </p>
    )
  }

  return (
    <div>
      {slug ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Listing: <span style={{ color: "var(--color-forest)" }}>{pickedName || slug}</span>
        </p>
      ) : (
        <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
            Find the restaurant
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-md border bg-white px-3 font-normal" style={{ borderColor: "var(--hairline-strong)" }} />
          </label>
          <button type="submit" className="h-11 rounded-md border px-4 text-sm font-semibold" style={{ borderColor: "var(--hairline-strong)" }}>Search</button>
        </form>
      )}
      {matches.length > 0 && !slug ? (
        <ul className="mt-3 divide-y border" style={{ borderColor: "var(--hairline)" }}>
          {matches.map((match) => (
            <li key={match.slug}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm"
                onClick={() => {
                  setSlug(match.slug)
                  setPickedName(match.name)
                }}
              >
                {match.name}{match.neighborhood ? ` · ${match.neighborhood}` : ""}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="absolute h-0 w-0 overflow-hidden" aria-hidden="true" />
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Role" name="role" required placeholder="Owner, manager, or chef" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
        <fieldset>
          <legend className="text-sm font-medium" style={{ color: "var(--color-forest)" }}>What should we fix?</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {CLAIM_FIXES.map((fix) => (
              <label key={fix} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={`fix_${fix}`} value="yes" />
                {fix}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium" style={{ color: "var(--color-forest)" }}>Diet tags that apply</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {CLAIM_DIET_TAGS.map((tag) => (
              <label key={tag} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={`diet_${tag}`} value="yes" />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
          Notes
          <textarea name="notes" rows={4} maxLength={2000} className="rounded-md border bg-white px-3 py-2 font-normal" style={{ borderColor: "var(--hairline-strong)" }} />
        </label>
        {errorMsg ? <p role="alert" className="text-sm">{errorMsg}</p> : null}
        <button type="submit" disabled={status === "submitting" || !slug} className="h-11 w-fit rounded-md bg-forest px-5 text-sm font-semibold text-cream disabled:opacity-60">
          {status === "submitting" ? "Sending…" : "Submit claim"}
        </button>
      </form>
    </div>
  )
}

function Field({ label, name, type = "text", required, autoComplete, placeholder }: { label: string; name: string; type?: string; required?: boolean; autoComplete?: string; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
      {label}
      <input name={name} type={type} required={required} autoComplete={autoComplete} placeholder={placeholder} className="h-11 rounded-md border bg-white px-3 font-normal" style={{ borderColor: "var(--hairline-strong)" }} />
    </label>
  )
}
