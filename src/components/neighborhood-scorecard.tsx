import type { ReactNode } from "react"
import Link from "next/link"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import {
  MIN_GRADED_LISTINGS_FOR_RATE_LEADER,
  type BoroughScorecard,
  type NeighborhoodScore,
} from "@/lib/neighborhood-scorecard"

interface NeighborhoodScorecardProps {
  borough: string
  scorecard: BoroughScorecard
  /**
   * Hub keys ("borough-slug/neighborhood-slug") that were actually built.
   * Passed as a plain string[] rather than a Set: this crosses a component
   * boundary and an array is unambiguous if this ever becomes client-side.
   */
  validHubSlugs: string[]
}

function n(value: number) {
  return value.toLocaleString("en-US")
}

function rateLabel(rate: number | null) {
  return rate == null ? "—" : `${rate}%`
}

export default function NeighborhoodScorecard({
  borough,
  scorecard,
  validHubSlugs,
}: NeighborhoodScorecardProps) {
  if (scorecard.neighborhoods.length === 0) return null

  const boroughSlug = boroughToSlug(borough)
  const validHubs = new Set(validHubSlugs)
  const leader = scorecard.gradeALeader
  const gemLeader = scorecard.gemLeader
  const minGraded = MIN_GRADED_LISTINGS_FOR_RATE_LEADER

  return (
    <section className="my-12" aria-labelledby={`scorecard-heading-${boroughSlug}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow" style={{ color: "var(--color-muted)" }}>
            Published listings on this page
          </p>
          <h2 id={`scorecard-heading-${boroughSlug}`} className="h2-serif mt-2">
            {borough} Neighborhood Health Scorecard
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text)", maxWidth: "68ch" }}>
            {n(scorecard.neighborhoods.length)} neighborhoods · {n(scorecard.totalRestaurants)} restaurants
            {scorecard.graded > 0 ? (
              <>
                {" "}
                · {n(scorecard.gradeA)} of {n(scorecard.graded)} graded listings hold Grade A (
                {rateLabel(scorecard.gradeARate)})
              </>
            ) : (
              <> · no listings with an A, B, or C</>
            )}
          </p>
        </div>
        <Link
          href="/nyc/compare"
          className="eyebrow inline-flex flex-shrink-0 items-center gap-1.5"
          style={{ color: "var(--color-jade)" }}
        >
          Compare neighborhoods
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <dl className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Neighborhoods">
          <p
            className="tabular mt-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.75rem",
              lineHeight: 1,
              color: "var(--color-forest)",
            }}
          >
            {n(scorecard.neighborhoods.length)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
            in {borough}
          </p>
        </StatTile>

        <StatTile label="Highest Grade A rate">
          {leader ? (
            <>
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  lineHeight: 1.2,
                  color: "var(--color-forest)",
                }}
              >
                {leader.neighborhood}
              </p>
              <p
                className="tabular mt-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.75rem",
                  lineHeight: 1,
                  color: "var(--color-jade)",
                }}
              >
                {leader.gradeARate}%
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
                {n(leader.gradeA)} of {n(leader.graded)} graded listings. Neighborhoods with at least{" "}
                {minGraded} graded listings.
              </p>
            </>
          ) : (
            <>
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.75rem",
                  lineHeight: 1,
                  color: "var(--color-forest)",
                }}
              >
                —
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
                No neighborhood has {minGraded} graded listings.
              </p>
            </>
          )}
        </StatTile>

        <StatTile label="Most hidden gems">
          {gemLeader ? (
            <>
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  lineHeight: 1.2,
                  color: "var(--color-forest)",
                }}
              >
                {gemLeader.neighborhood}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>
                <span className="gem-mark" aria-hidden="true">
                  ✦
                </span>{" "}
                <span className="tabular">{n(gemLeader.hiddenGems)}</span> hidden{" "}
                {gemLeader.hiddenGems === 1 ? "gem" : "gems"}
              </p>
            </>
          ) : (
            <>
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.75rem",
                  lineHeight: 1,
                  color: "var(--color-forest)",
                }}
              >
                —
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
                No hidden gems in {borough}.
              </p>
            </>
          )}
        </StatTile>

        <StatTile label="Grade A of graded listings">
          <p
            className="tabular mt-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.75rem",
              lineHeight: 1,
              color: "var(--color-forest)",
            }}
          >
            {rateLabel(scorecard.gradeARate)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
            {scorecard.graded > 0
              ? `${n(scorecard.gradeA)} of ${n(scorecard.graded)} with an A, B, or C.`
              : "No listings with an A, B, or C."}
          </p>
        </StatTile>
      </dl>

      <div
        className="overflow-x-auto border"
        style={{
          borderColor: "var(--hairline)",
          borderRadius: "4px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption
            className="px-5 py-4 text-left text-xs"
            style={{ captionSide: "bottom", color: "var(--color-muted)" }}
          >
            {borough} neighborhoods ranked by published listing count. Grade A rate is Grade A divided
            by listings with an A, B, or C — the same ratio as the introduction on this page. A dash
            means that neighborhood has no graded listings. Highest Grade A rate includes only
            neighborhoods with at least {minGraded} graded listings. Hidden gems are published listings
            rated 4.5 or higher with fewer than 200 reviews. Top diet is the canonical tag on the most
            listings. Grades are the latest matched NYC DOHMH record.
          </caption>
          <thead>
            <tr style={{ backgroundColor: "var(--color-cream)" }}>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                <span className="sr-only">Rank</span>
                <span aria-hidden="true">#</span>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                Neighborhood
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                Restaurants
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                Grade A rate
                <span className="mt-0.5 block font-normal normal-case tracking-normal">of A, B, or C</span>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                Hidden gems
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                Top diet
              </th>
            </tr>
          </thead>
          <tbody>
            {scorecard.neighborhoods.map((row, index) => (
              <ScorecardRow
                key={row.neighborhood}
                row={row}
                rank={index + 1}
                boroughSlug={boroughSlug}
                linked={validHubs.has(`${boroughSlug}/${neighborhoodToSlug(row.neighborhood)}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="border p-4"
      style={{
        borderColor: "var(--hairline)",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <dt className="eyebrow" style={{ color: "var(--color-muted)" }}>
        {label}
      </dt>
      <dd className="m-0">{children}</dd>
    </div>
  )
}

function ScorecardRow({
  row,
  rank,
  boroughSlug,
  linked,
}: {
  row: NeighborhoodScore
  rank: number
  boroughSlug: string
  linked: boolean
}) {
  const hoodSlug = neighborhoodToSlug(row.neighborhood)
  const rateText =
    row.gradeARate == null
      ? "No graded listings"
      : `${row.gradeARate}% Grade A, ${row.gradeA} of ${row.graded} graded listings`

  return (
    <tr style={{ borderTop: "1px solid var(--hairline)" }}>
      <td className="tabular px-3 py-3 text-xs" style={{ color: "var(--color-muted)" }}>
        {rank}
      </td>
      <th scope="row" className="px-3 py-3 text-left font-normal">
        {linked ? (
          <Link
            href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
            className="text-sm font-semibold"
            style={{ color: "var(--color-forest)" }}
          >
            {row.neighborhood}
          </Link>
        ) : (
          <span className="text-sm font-semibold" style={{ color: "var(--color-forest)" }}>
            {row.neighborhood}
          </span>
        )}
      </th>
      <td className="tabular px-3 py-3 text-right" style={{ color: "var(--color-text)" }}>
        {n(row.total)}
      </td>
      <td className="px-3 py-3 text-right">
        {row.gradeARate == null ? (
          <span aria-label={`${row.neighborhood}: no graded listings`}>—</span>
        ) : (
          <span aria-label={`${row.neighborhood}: ${rateText}`}>
            <span className="tabular font-semibold" style={{ color: "var(--color-forest)" }}>
              {row.gradeARate}%
            </span>
            <span className="mt-0.5 block text-xs tabular" style={{ color: "var(--color-muted)" }}>
              {n(row.gradeA)} of {n(row.graded)}
            </span>
          </span>
        )}
      </td>
      <td className="tabular px-3 py-3 text-right" style={{ color: "var(--color-text)" }}>
        {row.hiddenGems > 0 ? (
          <span
            aria-label={`${n(row.hiddenGems)} hidden ${row.hiddenGems === 1 ? "gem" : "gems"} in ${row.neighborhood}`}
          >
            <span className="gem-mark" aria-hidden="true">
              ✦
            </span>{" "}
            {n(row.hiddenGems)}
          </span>
        ) : (
          <span aria-label={`No hidden gems in ${row.neighborhood}`}>—</span>
        )}
      </td>
      <td className="px-3 py-3 text-left">
        {row.topDietaryTag && row.topDietaryLabel ? (
          <Link
            href={`/healthy-restaurants/${row.topDietaryTag}`}
            aria-label={`Top dietary tag in ${row.neighborhood}: ${row.topDietaryLabel}, ${n(row.topDietaryCount)} ${row.topDietaryCount === 1 ? "listing" : "listings"}`}
            className="text-sm"
            style={{ color: "var(--color-jade)" }}
          >
            {row.topDietaryLabel}
          </Link>
        ) : (
          <span aria-label={`No dietary tag in ${row.neighborhood}`}>—</span>
        )}
      </td>
    </tr>
  )
}
