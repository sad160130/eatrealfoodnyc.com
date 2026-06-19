import type { ReviewsSummary } from "@/lib/reviews"

/**
 * Reviews display. Information architecture from the spec:
 *   - Summary header (average + breakdown bars)
 *   - Individual review cards (avatar, header, stars, text, owner response)
 *   - Attribution at the bottom
 *
 * Design tokens align with the v3 placard/type system in CLAUDE.md §11:
 *   - 5-color palette only (forest, jade, sage, cream, amber)
 *   - Georgia for display, DM Sans for body, eyebrow for labels
 *   - Hairline borders, 4px radius, no gray utilities, no emoji
 *   - Reviewer avatar = mini-plaque echoing the brand signature
 */

function StarRow({ stars }: { stars: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${stars} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            color: i <= stars ? "var(--color-amber)" : "var(--hairline-strong)",
            fontSize: "0.95em",
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  )
}

function initials(name: string | null): string {
  if (!name) return "G"
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ""
  const second = parts[1]?.[0] || ""
  return ((first + second).toUpperCase() || "G").slice(0, 2)
}

export default function ReviewsSection({
  summary,
  restaurantName,
}: {
  summary: ReviewsSummary
  restaurantName: string
}) {
  if (!summary.hasReviews) return null

  const {
    reviews,
    totalCount,
    averageStars,
    starBreakdown,
    ownerResponseCount,
  } = summary
  const maxBar = Math.max(...Object.values(starBreakdown), 1)

  return (
    <section
      id="reviews"
      className="my-12 scroll-mt-24"
      aria-label={`Reviews for ${restaurantName}`}
    >
      <p className="eyebrow">What diners say</p>
      <h2 className="h2-serif mt-2">Reviews of {restaurantName}</h2>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--color-muted)" }}
      >
        <span className="tabular">{totalCount}</span> verified Google review
        {totalCount !== 1 ? "s" : ""}
        {ownerResponseCount > 0 && (
          <>
            {" · "}
            <span className="tabular">{ownerResponseCount}</span> with owner response
            {ownerResponseCount !== 1 ? "s" : ""}
          </>
        )}
      </p>

      {/* ─── Summary header — average + breakdown bars ─── */}
      <div
        className="mt-6 border p-6 md:p-7"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "var(--hairline)",
          borderRadius: "4px",
        }}
      >
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-stretch">
          {/* Average display */}
          <div className="flex flex-shrink-0 flex-col items-start">
            <p
              className="tabular"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "3.5rem",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--color-forest)",
              }}
            >
              {averageStars?.toFixed(1)}
            </p>
            <span className="mt-3">
              <StarRow stars={Math.round(averageStars || 0)} />
            </span>
            <p
              className="eyebrow mt-3"
              style={{ color: "var(--color-muted)" }}
            >
              <span className="tabular">{totalCount}</span> reviews
            </p>
          </div>

          {/* Hairline divider on desktop */}
          <div
            aria-hidden="true"
            className="hidden md:block"
            style={{
              width: "1px",
              backgroundColor: "var(--hairline)",
              alignSelf: "stretch",
            }}
          />

          {/* Breakdown bars */}
          <dl className="w-full flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starBreakdown[star] || 0
              const pct = (count / maxBar) * 100
              return (
                <div
                  key={star}
                  className="flex items-center gap-3 text-xs"
                >
                  <dt
                    className="tabular flex-shrink-0"
                    style={{
                      color: "var(--color-muted)",
                      width: "1.5rem",
                      letterSpacing: 0,
                    }}
                  >
                    {star}★
                  </dt>
                  <div
                    className="flex-1 overflow-hidden"
                    style={{
                      height: "0.5rem",
                      backgroundColor: "var(--hairline)",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: "var(--color-jade)",
                        borderRadius: "2px",
                        transition: "width 300ms ease",
                      }}
                    />
                  </div>
                  <dd
                    className="tabular flex-shrink-0 text-right"
                    style={{
                      color: "var(--color-muted)",
                      width: "2.5rem",
                    }}
                  >
                    {count}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </div>

      {/* ─── Individual reviews ─── */}
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="border p-5 md:p-6"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "var(--hairline)",
              borderRadius: "4px",
            }}
          >
            <div className="flex items-start gap-4">
              {/* Avatar — mini-plaque echoing the brand signature */}
              <span
                aria-hidden="true"
                className="flex flex-shrink-0 items-center justify-center"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: "var(--color-cream)",
                  border: "1px solid var(--hairline-strong)",
                  borderRadius: "3px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  letterSpacing: "-0.01em",
                  color: "var(--color-jade)",
                }}
              >
                {initials(review.reviewerName)}
              </span>

              <div className="min-w-0 flex-1">
                {/* Header — name + local guide */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-forest)" }}
                  >
                    {review.reviewerName || "Google user"}
                  </span>
                  {review.isLocalGuide && (
                    <span
                      className="eyebrow"
                      style={{ color: "var(--color-jade)" }}
                    >
                      Local guide
                    </span>
                  )}
                </div>

                {/* Stars + date */}
                <div className="mt-1 flex items-center gap-2.5">
                  <StarRow stars={review.stars} />
                  {review.publishedAgo && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {review.publishedAgo}
                    </span>
                  )}
                </div>

                {/* Text */}
                <p
                  className="mt-3 text-sm"
                  style={{
                    color: "var(--color-text)",
                    lineHeight: 1.6,
                  }}
                >
                  {review.text}
                </p>

                {/* Likes */}
                {review.likesCount > 0 && (
                  <p
                    className="mt-2 text-xs"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <span className="tabular">{review.likesCount}</span>{" "}
                    {review.likesCount === 1
                      ? "person found this helpful"
                      : "people found this helpful"}
                  </p>
                )}

                {/* Owner response — hairline pull, jade label, forest text */}
                {review.ownerResponse && (
                  <div
                    className="mt-4 border-l py-1 pl-4"
                    style={{
                      borderLeftWidth: "2px",
                      borderLeftColor: "var(--color-jade)",
                    }}
                  >
                    <p
                      className="eyebrow"
                      style={{ color: "var(--color-jade)" }}
                    >
                      Response from the owner
                    </p>
                    <p
                      className="mt-1.5 text-sm"
                      style={{
                        color: "var(--color-text)",
                        lineHeight: 1.55,
                      }}
                    >
                      {review.ownerResponse}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Attribution */}
      <p
        className="mt-6 text-xs"
        style={{ color: "var(--color-muted)", lineHeight: 1.55 }}
      >
        Reviews sourced from Google. Displayed for informational purposes.
        Ratings reflect reviewer opinions at the time of posting.
      </p>
    </section>
  )
}
