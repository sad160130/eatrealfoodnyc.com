"use client"

import { useState } from "react"

interface ShareExperienceProps {
  restaurantSlug: string
  restaurantName: string
}

export default function ShareExperience({ restaurantSlug, restaurantName }: ShareExperienceProps) {
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length < 10) return

    setStatus("submitting")
    try {
      const res = await fetch("/api/submit-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantSlug, restaurantName, content: content.trim() }),
      })

      if (res.ok) {
        setStatus("success")
        setContent("")
      } else {
        const data = await res.json()
        setErrorMsg(data.error || "Something went wrong")
        setStatus("error")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Failed to submit. Please try again.")
    }
  }

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-gray-100 p-6" style={{ backgroundColor: "var(--color-cream)" }}>
        <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
          Been here? Share one sentence.
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          No account needed. One honest sentence about your experience. All submissions are reviewed before publishing.
        </p>

        {status === "success" ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-sage/20 bg-sage/10 p-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-jade">Thank you — your experience has been submitted.</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                We review all submissions before publishing. Yours will appear soon if approved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 280))}
                placeholder={`In one sentence, what makes ${restaurantName} worth visiting?`}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-jade focus:outline-none"
                disabled={status === "submitting"}
              />
              <span className="absolute bottom-3 right-3 text-xs" style={{ color: "var(--color-muted)" }}>
                {content.length}/280
              </span>
            </div>

            {status === "error" && <p className="mt-2 text-xs text-red-500">{errorMsg}</p>}

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                🔒 Anonymous · Reviewed before publishing
              </p>
              <button
                type="submit"
                disabled={content.trim().length < 10 || status === "submitting"}
                className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-jade disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Submitting..." : "Share experience →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
