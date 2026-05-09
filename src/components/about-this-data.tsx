import Link from "next/link"
import stats from "@/data/guide-stats"

type Variant = "hub" | "guide" | "full"

interface AboutThisDataProps {
  variant?: Variant
  restaurantCount?: number
  gradeACount?: number
  lastRefreshed?: string
  dietaryTag?: string
  dietaryCount?: number
  borough?: string
  className?: string
}

const DOHMH_URL =
  "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"

export default function AboutThisData({
  variant = "hub",
  restaurantCount,
  gradeACount,
  lastRefreshed = "April 2026",
  dietaryTag,
  dietaryCount,
  borough,
  className = "",
}: AboutThisDataProps) {
  // ── HUB VARIANT ───────────────────────────────────────────────
  if (variant === "hub") {
    return (
      <aside
        role="region"
        aria-label="About this data"
        className={`mt-12 border-t border-gray-100 pt-8 ${className}`}
      >
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-0.5 flex-shrink-0 text-lg">
            🔬
          </span>
          <div>
            <p
              className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              ABOUT THIS DATA
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {restaurantCount ? (
                <>
                  This page covers{" "}
                  <strong className="text-gray-700">
                    {restaurantCount.toLocaleString()} active
                    {borough ? ` ${borough}` : " NYC"} restaurants
                  </strong>{" "}
                  from the Eat Real Food NYC directory.{" "}
                </>
              ) : (
                "Restaurant data sourced from the Eat Real Food NYC directory. "
              )}
              {gradeACount ? (
                <>
                  <strong className="text-gray-700">
                    {gradeACount.toLocaleString()} hold a verified Grade A
                  </strong>{" "}
                  health inspection from the NYC Department of Health.{" "}
                </>
              ) : null}
              {dietaryTag && dietaryCount ? (
                <>
                  <strong className="text-gray-700">
                    {dietaryCount.toLocaleString()} carry the {dietaryTag} tag
                  </strong>{" "}
                  — applied only when a restaurant genuinely specialises in this dietary style.{" "}
                </>
              ) : null}
              Health inspection data sourced from the{" "}
              <a
                href={DOHMH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-jade underline underline-offset-2 hover:text-forest"
              >
                NYC DOHMH Open Data portal
              </a>
              , updated quarterly. Last refresh:{" "}
              <strong className="text-gray-700">{lastRefreshed}</strong>.{" "}
              <Link
                href="/about/our-data"
                className="text-jade underline underline-offset-2 hover:text-forest"
              >
                Full methodology →
              </Link>
            </p>
          </div>
        </div>
      </aside>
    )
  }

  // ── GUIDE VARIANT ─────────────────────────────────────────────
  if (variant === "guide") {
    const totalRestaurants = stats.global.totalPublished
    const gradeCoverage = stats.global.gradeACoverage
    const taggedTotal = Object.values(stats.dietary.counts).reduce((a, b) => a + b, 0)
    const tagCoverage = Math.round((taggedTotal / totalRestaurants) * 100)
    const hiddenGemTotal = stats.global.totalHiddenGems

    return (
      <aside
        role="region"
        aria-label="About this data"
        className={`mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="flex-shrink-0 text-xl">
            🔬
          </span>
          <div>
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              ABOUT THIS DATA
            </p>
            <div
              className="space-y-2 text-xs leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              <p>
                <strong className="text-gray-700">Restaurant listings:</strong> Sourced from Google
                Maps Platform for New York City food service establishments. Filtered to operational
                businesses only and deduplicated. Our directory currently covers{" "}
                <strong className="text-gray-700">
                  {(restaurantCount ?? totalRestaurants).toLocaleString()} active NYC restaurants
                </strong>{" "}
                across all five boroughs and {stats.global.totalUniqueNeighborhoods} neighborhoods.
              </p>
              <p>
                <strong className="text-gray-700">Health inspection grades:</strong> Sourced
                directly from the{" "}
                <a
                  href={DOHMH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-jade underline underline-offset-2 hover:text-forest"
                >
                  NYC Department of Health and Mental Hygiene Open Data portal
                </a>
                . We match inspection records to restaurant listings using name and address. Grade
                coverage:{" "}
                <strong className="text-gray-700">{gradeCoverage}%</strong> of our directory has a
                verified inspection grade — the remainder are unmatched or uninspected. Updated
                quarterly.
              </p>
              <p>
                <strong className="text-gray-700">Dietary tags:</strong> Applied conservatively
                using AI-assisted classification reviewed editorially. We only tag a restaurant when
                it genuinely specialises in that dietary style — not because it might theoretically
                have one qualifying item. Tag coverage:{" "}
                <strong className="text-gray-700">{tagCoverage}%</strong> of our directory. Generic
                restaurants correctly have no tags.
              </p>
              <p>
                <strong className="text-gray-700">Hidden gems:</strong> Restaurants with a community
                rating of 4.5 or above and fewer than 200 reviews. Currently{" "}
                <strong className="text-gray-700">
                  {hiddenGemTotal.toLocaleString()} hidden gems
                </strong>{" "}
                across NYC.
              </p>
              <p className="border-t border-gray-200 pt-2">
                Last data refresh: <strong className="text-gray-700">{lastRefreshed}</strong>. Found
                an error?{" "}
                <Link
                  href="/contact"
                  className="text-jade underline underline-offset-2 hover:text-forest"
                >
                  Report it here
                </Link>
                . Full methodology:{" "}
                <Link
                  href="/about/our-data"
                  className="text-jade underline underline-offset-2 hover:text-forest"
                >
                  About Our Data
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  // ── FULL VARIANT (About → Our Data page) ──────────────────────
  const totalRestaurants = stats.global.totalPublished
  const gradeCoverage = stats.global.gradeACoverage
  const taggedTotal = Object.values(stats.dietary.counts).reduce((a, b) => a + b, 0)
  const tagCoverage = Math.round((taggedTotal / totalRestaurants) * 100)

  const sources = [
    {
      source: "NYC Department of Health and Mental Hygiene (DOHMH)",
      icon: "🏥",
      url: DOHMH_URL,
      what: "Health inspection grades (A, B, C), inspection dates, violation scores, and violation records for every inspected NYC restaurant.",
      how: "We pull this data from the NYC Open Data API and join it to our restaurant listings using name and address matching. We keep only the most recent grade per restaurant.",
      coverage: `${gradeCoverage}% of our directory has a verified health inspection grade. The remainder have not been matched or have not yet received a grade.`,
    },
    {
      source: "Google Maps Platform",
      icon: "🗺️",
      url: null as string | null,
      what: "Restaurant names, addresses, coordinates, phone numbers, websites, business hours, ratings, review counts, and photos.",
      how: "Our restaurant listings are sourced from Google Maps data for NYC food service establishments. We filter to operational businesses and run deduplication.",
      coverage: `${totalRestaurants.toLocaleString()} unique active NYC restaurants across all five boroughs.`,
    },
    {
      source: "NYC NTA GeoJSON (Neighborhood Tabulation Areas)",
      icon: "📍",
      url: "https://data.cityofnewyork.us/City-Government/2010-Neighborhood-Tabulation-Areas-NTAs-/cpf4-rkhq",
      what: "Official NYC neighborhood boundary polygons used to assign every restaurant to its correct neighborhood.",
      how: "Point-in-polygon algorithm assigns each restaurant's coordinates to the correct NTA boundary — giving us the official NYC neighborhood name and borough.",
      coverage: `100% of published restaurants have a verified borough and neighborhood (${stats.global.totalUniqueNeighborhoods} unique neighborhoods covered).`,
    },
    {
      source: "AI-assisted dietary classification",
      icon: "🏷️",
      url: null as string | null,
      what: "Dietary tags across 12 categories: vegan, vegetarian, halal, kosher, gluten-free, dairy-free, keto, paleo, whole-foods, low-calorie, raw-food, nut-free.",
      how: "We use Claude (Anthropic) to classify restaurants based on name, type, and description — conservatively. We only tag when a restaurant genuinely specialises in a dietary style.",
      coverage: `${tagCoverage}% of our directory has dietary tags. Generic restaurants correctly have no tags.`,
    },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {sources.map((item) => (
        <article
          key={item.source}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="flex-shrink-0 text-3xl">
              {item.icon}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3
                  className="text-lg font-bold text-forest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {item.source}
                </h3>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-jade transition-colors hover:text-forest"
                  >
                    View source →
                  </a>
                )}
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p
                    className="mb-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-muted)" }}
                  >
                    WHAT WE USE IT FOR
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">{item.what}</p>
                </div>
                <div>
                  <p
                    className="mb-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-muted)" }}
                  >
                    HOW WE PROCESS IT
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">{item.how}</p>
                </div>
                <div className="rounded-xl bg-sage/10 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-jade">
                    COVERAGE
                  </p>
                  <p className="text-sm font-medium text-jade">{item.coverage}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}

      <div className="rounded-2xl border border-forest/10 bg-forest/5 p-5">
        <p
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          DATA REFRESH SCHEDULE
        </p>
        <p className="text-sm leading-relaxed text-gray-700">
          Health inspection grades are refreshed quarterly from the NYC DOHMH Open Data portal.
          Restaurant operational status is verified during each refresh. User-submitted corrections
          are reviewed and applied within 7 days. Last full data refresh:{" "}
          <strong>{lastRefreshed}</strong>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Found incorrect information?{" "}
          <Link
            href="/contact"
            className="font-medium text-jade underline underline-offset-2 hover:text-forest"
          >
            Submit a correction →
          </Link>
        </p>
      </div>
    </div>
  )
}
