interface DataPoint {
  stat: string
  label: string
  source?: string
}

interface DataCalloutProps {
  heading: string
  intro?: string
  dataPoints: DataPoint[]
  sourceNote?: string
  variant?: "green" | "amber" | "forest"
}

export default function DataCallout({
  heading,
  intro,
  dataPoints,
  sourceNote,
  variant = "green",
}: DataCalloutProps) {
  const palette = {
    green: {
      border: "border-sage/30",
      bg: "bg-sage/5",
      heading: "text-jade",
      source: "text-sage/80",
    },
    amber: {
      border: "border-amber/30",
      bg: "bg-amber/5",
      heading: "text-amber",
      source: "text-amber/80",
    },
    forest: {
      border: "border-forest/20",
      bg: "bg-forest/5",
      heading: "text-forest",
      source: "text-forest/70",
    },
  }[variant]

  const gridCols =
    dataPoints.length === 2
      ? "grid-cols-2"
      : dataPoints.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : dataPoints.length >= 4
          ? "grid-cols-2 md:grid-cols-4"
          : "grid-cols-1"

  return (
    <aside
      role="region"
      aria-label={heading}
      className={`my-8 rounded-2xl border ${palette.border} ${palette.bg} p-6`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span aria-hidden="true" className="text-lg">
          📊
        </span>
        <p
          className={`text-xs font-bold uppercase tracking-widest ${palette.heading}`}
        >
          {heading}
        </p>
      </div>

      {/* Optional intro */}
      {intro && (
        <p className="mb-5 text-sm leading-relaxed text-gray-700">{intro}</p>
      )}

      {/* Data points grid */}
      <dl className={`grid gap-3 ${gridCols}`}>
        {dataPoints.map((point, i) => (
          <div
            key={i}
            className="rounded-xl border border-white bg-white p-4 text-center shadow-sm"
          >
            <dt className="sr-only">{point.label}</dt>
            <dd
              className={`text-2xl font-bold ${palette.heading}`}
              style={{ fontFamily: "Georgia, serif" }}
            >
              {point.stat}
            </dd>
            <p
              className="mt-1 text-xs leading-tight"
              style={{ color: "var(--color-muted)" }}
            >
              {point.label}
            </p>
            {point.source && (
              <p className={`mt-1 text-xs ${palette.source}`}>{point.source}</p>
            )}
          </div>
        ))}
      </dl>

      {/* Source note */}
      {sourceNote && (
        <p
          className={`mt-4 border-t border-current/10 pt-3 text-xs leading-relaxed ${palette.source}`}
        >
          {sourceNote}
        </p>
      )}
    </aside>
  )
}
