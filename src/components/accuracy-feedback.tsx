"use client"

import { useState } from "react"

interface AccuracyFeedbackProps {
  restaurantSlug: string
}

export default function AccuracyFeedback({ restaurantSlug }: AccuracyFeedbackProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null)
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle")

  const handleVote = async (vote: "up" | "down") => {
    if (voted || status !== "idle") return
    setVoted(vote)
    setStatus("submitting")

    try {
      await fetch("/api/submit-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          restaurantName: "",
          content: `accuracy_vote:${vote}`,
        }),
      })
    } catch {
      // Silent fail — feedback is best-effort
    }

    setStatus("done")
  }

  return (
    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        Was the health and dietary information on this page accurate?
      </p>
      <div className="flex items-center gap-2">
        {status === "done" ? (
          <span className="text-xs font-medium text-jade">Thanks for your feedback ✓</span>
        ) : (
          <>
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                voted === "up"
                  ? "border-sage bg-sage/20 text-jade"
                  : "border-gray-200 text-gray-500 hover:border-sage hover:text-jade"
              }`}
            >
              👍 Yes
            </button>
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                voted === "down"
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
              }`}
            >
              👎 Needs update
            </button>
          </>
        )}
      </div>
    </div>
  )
}
