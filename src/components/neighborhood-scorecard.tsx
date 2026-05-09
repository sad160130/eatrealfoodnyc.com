import Link from "next/link"
import { boroughToSlug, neighborhoodToSlug } from "@/lib/utils"
import type { NeighborhoodScore } from "@/data/neighborhood-scorecards"

interface NeighborhoodScorecardProps {
  borough: string
  neighborhoods: NeighborhoodScore[]
}

export default function NeighborhoodScorecard({
  borough,
  neighborhoods,
}: NeighborhoodScorecardProps) {
  if (neighborhoods.length === 0) return null

  const boroughSlug = boroughToSlug(borough)
  const sorted = [...neighborhoods].sort((a, b) => b.total - a.total)

  const gradeALeader = [...neighborhoods].sort((a, b) => b.gradeARate - a.gradeARate)[0]
  const gemLeader = [...neighborhoods].sort((a, b) => b.hiddenGems - a.hiddenGems)[0]
  const totalRestaurants = neighborhoods.reduce((sum, n) => sum + n.total, 0)
  const avgGradeARate = Math.round(
    neighborhoods.reduce((sum, n) => sum + n.gradeARate, 0) / neighborhoods.length
  )

  const quickStats = [
    {
      stat: neighborhoods.length.toString(),
      label: "Neighborhoods tracked",
      sub: `across ${borough}`,
    },
    {
      stat: `${gradeALeader?.gradeARate ?? 0}%`,
      label: "Highest Grade A rate",
      sub: gradeALeader?.neighborhood ?? "",
    },
    {
      stat: (gemLeader?.hiddenGems ?? 0).toString(),
      label: "Most hidden gems",
      sub: gemLeader?.neighborhood ?? "",
    },
    {
      stat: `${avgGradeARate}%`,
      label: `${borough} avg Grade A rate`,
      sub: "Borough average",
    },
  ]

  return (
    <section
      className="my-12"
      aria-labelledby={`scorecard-heading-${boroughSlug}`}
    >
      {/* Section heading */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="mb-1 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            PROPRIETARY DATA — EAT REAL FOOD NYC
          </p>
          <h2
            id={`scorecard-heading-${boroughSlug}`}
            className="text-2xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {borough} Neighborhood Health Scorecard
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            {neighborhoods.length} neighborhoods · {totalRestaurants.toLocaleString()} restaurants ·{" "}
            {avgGradeARate}% average Grade A rate
          </p>
        </div>
        <Link
          href="/nyc/compare"
          className="flex-shrink-0 rounded-xl border border-sage/30 px-4 py-2 text-xs font-semibold text-jade transition-colors hover:border-jade"
        >
          Compare all neighborhoods →
        </Link>
      </div>

      {/* Quick stats row */}
      <dl className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickStats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm"
          >
            <dt className="sr-only">{item.label}</dt>
            <dd
              className="text-2xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {item.stat}
            </dd>
            <p
              className="mt-1 text-xs leading-tight"
              style={{ color: "var(--color-muted)" }}
            >
              {item.label}
            </p>
            <p className="mt-0.5 text-xs font-medium text-sage">{item.sub}</p>
          </div>
        ))}
      </dl>

      {/* Scorecard table */}
      <div
        role="region"
        aria-label={`${borough} neighborhood scorecard table`}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <table className="w-full text-sm">
          <caption className="sr-only">
            {borough} neighborhoods ranked by restaurant count, with Grade A rate, hidden gem
            count, and top dietary tag for each.
          </caption>
          <thead>
            <tr className="grid grid-cols-12 bg-forest px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/70">
              <th scope="col" className="col-span-4 text-left">
                Neighborhood
              </th>
              <th scope="col" className="col-span-2 hidden text-center sm:block">
                Restaurants
              </th>
              <th scope="col" className="col-span-2 text-center">
                Grade A %
              </th>
              <th scope="col" className="col-span-2 hidden text-center md:block">
                Hidden Gems
              </th>
              <th scope="col" className="col-span-2 hidden text-center lg:block">
                Top Diet
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((n, i) => {
              const hoodSlug = neighborhoodToSlug(n.neighborhood)
              const gradeColor =
                n.gradeARate >= 70
                  ? "text-green-600 bg-green-50"
                  : n.gradeARate >= 50
                    ? "text-jade bg-sage/10"
                    : n.gradeARate >= 30
                      ? "text-amber-600 bg-amber-50"
                      : "text-gray-500 bg-gray-50"

              return (
                <tr
                  key={n.neighborhood}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 transition-colors hover:bg-gray-50/50 ${
                    i % 2 === 0 ? "" : "bg-gray-50/30"
                  }`}
                >
                  {/* Neighborhood name */}
                  <th
                    scope="row"
                    className="col-span-4 flex min-w-0 items-center gap-2 text-left font-normal"
                  >
                    <span
                      aria-hidden="true"
                      className="hidden w-5 flex-shrink-0 text-xs sm:block"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {i + 1}
                    </span>
                    <Link
                      href={`/nyc/${boroughSlug}/${hoodSlug}/healthy-restaurants`}
                      className="truncate text-sm font-semibold text-forest transition-colors hover:text-jade"
                    >
                      {n.neighborhood}
                    </Link>
                  </th>

                  <td className="col-span-2 hidden text-center sm:block">
                    <span className="text-sm font-medium text-gray-700">
                      {n.total.toLocaleString()}
                    </span>
                  </td>

                  <td className="col-span-2 text-center">
                    {n.gradeA > 0 ? (
                      <span
                        aria-label={`${n.gradeARate} percent Grade A — ${n.gradeA} of ${n.total} restaurants`}
                        className={`rounded-full px-2 py-1 text-xs font-bold ${gradeColor}`}
                      >
                        {n.gradeARate}%
                      </span>
                    ) : (
                      <span aria-label="No Grade A data" className="text-xs text-gray-300">
                        —
                      </span>
                    )}
                  </td>

                  <td className="col-span-2 hidden text-center md:block">
                    {n.hiddenGems > 0 ? (
                      <span
                        aria-label={`${n.hiddenGems} hidden gems`}
                        className="text-sm font-medium text-amber-500"
                      >
                        <span aria-hidden="true">💎</span> {n.hiddenGems}
                      </span>
                    ) : (
                      <span aria-label="No hidden gems" className="text-xs text-gray-300">
                        —
                      </span>
                    )}
                  </td>

                  <td className="col-span-2 hidden text-center lg:block">
                    {n.topDietaryLabel ? (
                      <span
                        aria-label={`Top dietary tag: ${n.topDietaryLabel} (${n.topDietaryCount} restaurants)`}
                        className="rounded-full bg-sage/10 px-2 py-1 text-xs font-medium text-jade"
                      >
                        {n.topDietaryLabel}
                      </span>
                    ) : (
                      <span aria-label="No dietary data" className="text-xs text-gray-300">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Table footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-4">
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Data: Eat Real Food NYC + NYC DOHMH Open Data. Updated quarterly. Grade A % shown only
            for restaurants with verified inspection records.
          </p>
          <Link
            href={`/nyc/${boroughSlug}/healthy-restaurants`}
            className="text-xs font-semibold text-jade transition-colors hover:text-forest"
          >
            View all {borough} restaurants →
          </Link>
        </div>
      </div>
    </section>
  )
}
