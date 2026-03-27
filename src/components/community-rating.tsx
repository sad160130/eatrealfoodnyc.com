import Link from "next/link"

interface CommunityRatingProps {
  rating: number | null
  reviews: number
  restaurantName: string
  latitude: number | null
  longitude: number | null
  address: string
}

export default function CommunityRating({
  rating,
  reviews,
  restaurantName,
  latitude,
  longitude,
  address,
}: CommunityRatingProps) {
  if (!rating) return null

  const googleMapsUrl =
    latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantName + " " + address)}`

  const yelpSearchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(restaurantName)}&find_loc=New+York+NY`

  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <section className="mt-10 border-t border-gray-100 pt-10">
      <h2 className="mb-6 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        Community Rating
      </h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          {/* Big rating number */}
          <div className="text-center">
            <p className="text-6xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              {rating.toFixed(1)}
            </p>
            <div className="mt-2 flex items-center justify-center gap-0.5">
              {Array.from({ length: fullStars }).map((_, i) => (
                <span key={`full-${i}`} className="text-xl text-amber-500">★</span>
              ))}
              {hasHalf && <span className="text-xl text-amber-500">½</span>}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <span key={`empty-${i}`} className="text-xl text-gray-200">★</span>
              ))}
            </div>
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>out of 5</p>
          </div>

          <div className="hidden h-16 w-px bg-gray-100 sm:block" />

          {/* Review count and context */}
          <div className="flex-1">
            <p className="text-lg font-semibold text-forest">
              {reviews.toLocaleString()} community reviews
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Rating aggregated from community reviews across platforms.
              Read full reviews on Google or Yelp for detailed diner experiences.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                Community-sourced rating
              </span>
            </div>
          </div>
        </div>

        {/* Read reviews links */}
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2">
          <Link
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 transition-all hover:border-blue-300 hover:shadow-sm"
          >
            <span className="text-xl">🗺️</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700 transition-colors group-hover:text-blue-600">
                Read Google Reviews
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                See all {reviews.toLocaleString()} reviews
              </p>
            </div>
            <span className="ml-auto text-gray-400 transition-colors group-hover:text-blue-500">→</span>
          </Link>

          <Link
            href={yelpSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 transition-all hover:border-red-300 hover:shadow-sm"
          >
            <span className="text-xl">⭐</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700 transition-colors group-hover:text-red-600">
                Find on Yelp
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Detailed diner reviews
              </p>
            </div>
            <span className="ml-auto text-gray-400 transition-colors group-hover:text-red-500">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
