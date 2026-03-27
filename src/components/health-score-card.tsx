import type { Restaurant } from "@/types"
import { computeHealthScore } from "@/lib/utils"

interface HealthScoreCardProps {
  restaurant: Restaurant
}

export default function HealthScoreCard({ restaurant }: HealthScoreCardProps) {
  const healthScore = computeHealthScore(restaurant)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          HEALTH SCORE
        </p>
        <div className="text-right">
          <p className="font-serif text-4xl font-bold leading-none" style={{ color: healthScore.color }}>
            {healthScore.score}
            <span className="text-lg font-normal text-gray-300">/100</span>
          </p>
          <span
            className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: healthScore.color + "26",
              color: healthScore.color,
            }}
          >
            {healthScore.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{ width: `${healthScore.score}%`, backgroundColor: healthScore.color }}
        />
      </div>

      {/* Breakdown */}
      <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
        Score breakdown
      </p>
      <div className="space-y-3">
        {healthScore.breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${(item.earned / item.max) * 100}%`,
                    backgroundColor: healthScore.color,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-semibold text-forest">
                {item.earned}/{item.max}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Score based on NYC Health Department grade, dietary transparency, community ratings, and
          review volume. Updated when inspection data refreshes.
        </p>
      </div>
    </div>
  )
}
