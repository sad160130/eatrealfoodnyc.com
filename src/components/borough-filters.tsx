"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const PRICE_OPTIONS = [
  { label: "$", value: "1" },
  { label: "$$", value: "2" },
  { label: "$$$", value: "3" },
  { label: "$$$$", value: "4" },
]

interface BoroughFiltersProps {
  boroughSlug: string
  boroughName: string
}

export default function BoroughFilters({ boroughSlug, boroughName }: BoroughFiltersProps) {
  const router = useRouter()
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [gradeA, setGradeA] = useState(false)
  const [gradeBC, setGradeBC] = useState(false)
  const [dietGluten, setDietGluten] = useState(false)
  const [dietVegan, setDietVegan] = useState(false)
  const [dietKeto, setDietKeto] = useState(false)

  function applyFilters(newPrice: string | null) {
    const params = new URLSearchParams()
    params.set("borough", boroughSlug)
    if (newPrice) params.set("price", newPrice)
    if (gradeA) params.set("grade", "A")
    router.push(`/search?${params.toString()}`)
  }

  function handlePriceClick(value: string) {
    const next = selectedPrice === value ? null : value
    setSelectedPrice(next)
    applyFilters(next)
  }

  return (
    <aside className="w-64 flex-shrink-0 self-start rounded-2xl border border-gray-100 bg-white p-6 sticky top-24">
      {/* Heading */}
      <div className="flex items-center gap-2">
        <span className="text-lg">≡</span>
        <h3 className="font-serif text-lg font-bold text-forest">Refine Search</h3>
      </div>

      {/* Price Range */}
      <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        PRICE RANGE
      </p>
      <div className="flex gap-2">
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handlePriceClick(opt.value)}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              selectedPrice === opt.value
                ? "border-forest bg-forest text-white"
                : "border-gray-200 text-gray-600 hover:border-jade"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Health Grade */}
      <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        HEALTH GRADE
      </p>
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={gradeA}
            onChange={(e) => setGradeA(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-jade accent-jade"
          />
          <span className="text-sm text-gray-700">Grade A Certified</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={gradeBC}
            onChange={(e) => setGradeBC(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-jade accent-jade"
          />
          <span className="text-sm text-gray-700">Under Review</span>
        </label>
      </div>

      {/* Dietary Needs */}
      <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        DIETARY NEEDS
      </p>
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={dietGluten}
            onChange={(e) => setDietGluten(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-jade accent-jade"
          />
          <span className="text-sm text-gray-700">Gluten-Free Friendly</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={dietVegan}
            onChange={(e) => setDietVegan(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-jade accent-jade"
          />
          <span className="text-sm text-gray-700">Plant-Based / Vegan</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={dietKeto}
            onChange={(e) => setDietKeto(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-jade accent-jade"
          />
          <span className="text-sm text-gray-700">Keto &amp; Paleo Options</span>
        </label>
      </div>

      {/* Mini map placeholder */}
      <div
        className="mt-6 flex items-end rounded-xl p-3"
        style={{ height: "192px", backgroundColor: "rgba(27,58,45,0.1)" }}
      >
        <button
          onClick={() => router.push(`/search?borough=${boroughSlug}`)}
          className="text-xs font-bold uppercase tracking-widest text-forest hover:text-jade transition-colors"
        >
          EXPAND INTERACTIVE MAP
        </button>
      </div>
    </aside>
  )
}
