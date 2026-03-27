"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "nyc-healthy-comparison"
const MAX_COMPARE = 3

export interface CompareRestaurant {
  slug: string
  name: string
  neighborhood: string | null
  borough: string | null
  rating: number | null
  reviews: number | null
  inspection_grade: string | null
  inspection_score: number | null
  dietary_tags: string | null
  photo: string | null
  price_range: number | null
  is_hidden_gem: boolean
  type: string | null
  address: string
  phone: string | null
  website: string | null
  working_hours: string | null
}

export function useComparison() {
  const [compared, setCompared] = useState<CompareRestaurant[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setCompared(JSON.parse(stored))
    } catch {}
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compared))
    } catch {}
  }, [compared, isLoaded])

  const isCompared = useCallback(
    (slug: string) => compared.some((r) => r.slug === slug),
    [compared]
  )

  const canAdd = compared.length < MAX_COMPARE

  const toggleCompare = useCallback((restaurant: CompareRestaurant) => {
    setCompared((prev) => {
      const exists = prev.some((r) => r.slug === restaurant.slug)
      if (exists) return prev.filter((r) => r.slug !== restaurant.slug)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, restaurant]
    })
  }, [])

  const clearAll = useCallback(() => setCompared([]), [])

  const remove = useCallback(
    (slug: string) => setCompared((prev) => prev.filter((r) => r.slug !== slug)),
    []
  )

  return {
    compared,
    isCompared,
    canAdd,
    toggleCompare,
    clearAll,
    remove,
    count: compared.length,
    isLoaded,
  }
}
