"use client"

import { useRef, useState, type FormEvent } from "react"
import { track } from "@vercel/analytics"
import {
  DATA_SAMPLE_BUTTON,
  DATA_SAMPLE_MESSAGES,
  DATA_SAMPLE_NOTE,
  type DataSampleSource,
} from "@/lib/data-sample-copy"

const fieldClass = "h-11 rounded-md border bg-white px-3 font-normal"

export default function DataSampleForm({
  source,
  idPrefix,
  variant = "compact",
  embedded = false,
}: {
  source: DataSampleSource
  idPrefix: string
  variant?: "full" | "compact"
  embedded?: boolean
}) {
  const pending = useRef(false)
  const [phase, setPhase] = useState<"idle" | "submitting" | "sent" | "duplicate" | "error">("idle")
  const [error, setError] = useState("")
  const noteId = `${idPrefix}-note`
  const statusId = `${idPrefix}-status`
  const emailId = `${idPrefix}-email`
  const companyId = `${idPrefix}-company`
  const sellsId = `${idPrefix}-sells`
  const message =
    phase === "submitting"
      ? DATA_SAMPLE_MESSAGES.sending
      : phase === "sent"
        ? DATA_SAMPLE_MESSAGES.sent
        : phase === "duplicate"
          ? DATA_SAMPLE_MESSAGES.duplicate
          : phase === "error"
            ? error
            : ""

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true
    setPhase("submitting")
    setError("")
    try {
      const response = await fetch("/api/data-sample", {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
      })
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; sample?: string; error?: string } | null
      if (!response.ok || !payload || payload.ok !== true) {
        setError(payload && typeof payload.error === "string" ? payload.error : DATA_SAMPLE_MESSAGES.failed)
        setPhase("error")
        return
      }
      if (payload.sample === "duplicate") setPhase("duplicate")
      else setPhase("sent")
      if (payload.sample === "sent" || payload.sample === "duplicate") {
        try {
          track("data_sample_request", { source })
        } catch {
          // Analytics must not turn a saved request into an error.
        }
      }
    } catch {
      setError(DATA_SAMPLE_MESSAGES.failed)
      setPhase("error")
    } finally {
      pending.current = false
    }
  }

  return (
    <div
      className={embedded ? "mt-4" : "border p-5"}
      style={embedded ? undefined : { borderColor: "var(--hairline)", backgroundColor: "#fff" }}
    >
      {variant === "full" ? <p className="eyebrow">Free sample</p> : null}
      <p
        id={noteId}
        className={variant === "full" ? "mt-2 text-sm leading-relaxed" : "text-sm leading-relaxed"}
        style={{ color: "var(--color-muted)" }}
      >
        {DATA_SAMPLE_NOTE}
      </p>
      <form
        action="/api/data-sample"
        method="post"
        className="relative mt-4 grid gap-3"
        onSubmit={onSubmit}
        aria-busy={phase === "submitting"}
        aria-describedby={`${noteId} ${statusId}`}
      >
        <input type="hidden" name="source" value={source} />
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 overflow-hidden"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor={emailId} className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
            Email
            <input
              id={emailId}
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
              aria-invalid={phase === "error" && error === DATA_SAMPLE_MESSAGES.invalid}
              className={fieldClass}
              style={{ borderColor: "var(--hairline-strong)" }}
            />
          </label>
          <label htmlFor={companyId} className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
            Company (optional)
            <input
              id={companyId}
              name="company"
              type="text"
              maxLength={120}
              autoComplete="organization"
              className={fieldClass}
              style={{ borderColor: "var(--hairline-strong)" }}
            />
          </label>
        </div>
        <label htmlFor={sellsId} className="grid gap-1 text-sm font-medium" style={{ color: "var(--color-forest)" }}>
          What do you sell to restaurants? (optional)
          <input
            id={sellsId}
            name="sells"
            type="text"
            maxLength={160}
            autoComplete="off"
            className={fieldClass}
            style={{ borderColor: "var(--hairline-strong)" }}
          />
        </label>
        <button
          type="submit"
          disabled={phase === "submitting"}
          className="h-11 w-fit rounded-md bg-forest px-5 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {DATA_SAMPLE_BUTTON}
        </button>
        <p
          id={statusId}
          role={phase === "error" ? "alert" : "status"}
          aria-live={phase === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          className="min-h-16 text-sm leading-relaxed"
          style={{ color: phase === "error" ? "var(--color-forest)" : "var(--color-jade)" }}
        >
          {message || "\u00a0"}
        </p>
      </form>
    </div>
  )
}
