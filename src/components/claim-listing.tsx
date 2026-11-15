"use client"

import { useId, useState } from "react"
import { track } from "@vercel/analytics"

interface ClaimListingProps {
  restaurantSlug: string
  restaurantName: string
}

export default function ClaimListing({ restaurantSlug, restaurantName }: ClaimListingProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const baseId = useId()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus("submitting")
    setErrorMsg("")
    try {
      const response = await fetch("/api/claim-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          name,
          role,
          email,
          phone,
        }),
      })
      if (response.ok) {
        setStatus("success")
        return
      }
      const data = await response.json().catch(() => ({}))
      setErrorMsg(typeof data.error === "string" ? data.error : "Something went wrong")
      setStatus("error")
    } catch {
      setErrorMsg("Failed to submit. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        className="eyebrow transition-colors"
        style={{ color: "var(--color-jade)" }}
        aria-expanded={open}
        onClick={() => {
          track("claim_listing_click")
          setOpen((value) => !value)
        }}
      >
        Claim this listing
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-lg rounded-md border bg-white p-5"
          style={{ borderColor: "var(--hairline)" }}
          aria-label={`Claim the listing for ${restaurantName}`}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
            Tell us you operate {restaurantName}. A person reviews every claim. Claiming a listing does not change its grade or its place in the directory.
          </p>
          {status === "success" ? (
            <p role="status" className="mt-4 text-sm font-medium" style={{ color: "var(--color-jade)" }}>
              We received your claim and will review it.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm" style={{ color: "var(--color-text)" }}>
                Name
                <input
                  id={`${baseId}-name`}
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="h-11 rounded-md border bg-white px-3 text-base outline-none focus:border-jade"
                  style={{ borderColor: "var(--hairline-strong)" }}
                  disabled={status === "submitting"}
                />
              </label>
              <label className="grid gap-1 text-sm" style={{ color: "var(--color-text)" }}>
                Role
                <input
                  id={`${baseId}-role`}
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                  maxLength={80}
                  placeholder="Owner, manager, or chef"
                  className="h-11 rounded-md border bg-white px-3 text-base outline-none focus:border-jade"
                  style={{ borderColor: "var(--hairline-strong)" }}
                  disabled={status === "submitting"}
                />
              </label>
              <label className="grid gap-1 text-sm" style={{ color: "var(--color-text)" }}>
                Email
                <input
                  id={`${baseId}-email`}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={200}
                  autoComplete="email"
                  className="h-11 rounded-md border bg-white px-3 text-base outline-none focus:border-jade"
                  style={{ borderColor: "var(--hairline-strong)" }}
                  disabled={status === "submitting"}
                />
              </label>
              <label className="grid gap-1 text-sm" style={{ color: "var(--color-text)" }}>
                Phone
                <input
                  id={`${baseId}-phone`}
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  maxLength={40}
                  autoComplete="tel"
                  className="h-11 rounded-md border bg-white px-3 text-base outline-none focus:border-jade"
                  style={{ borderColor: "var(--hairline-strong)" }}
                  disabled={status === "submitting"}
                />
              </label>
              <label className="grid gap-1 text-sm" style={{ color: "var(--color-text)" }}>
                Restaurant slug
                <input
                  name="restaurantSlug"
                  value={restaurantSlug}
                  readOnly
                  className="h-11 rounded-md border bg-cream px-3 text-base"
                  style={{ borderColor: "var(--hairline)", color: "var(--color-muted)" }}
                />
              </label>
              {status === "error" && (
                <p role="alert" className="text-sm font-medium" style={{ color: "var(--color-forest)" }}>
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 h-11 rounded-md bg-forest px-5 text-sm font-semibold text-cream transition-colors hover:bg-jade disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Submit claim"}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
