"use client"

import { useState, useEffect, useCallback, useRef } from "react"

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

  const snapshot = useRef<string | null>(null)
  const canPersist = useRef(true)

  useEffect(() => {
    try {
      snapshot.current = sessionStorage.getItem(STORAGE_KEY)
      if (snapshot.current) setCompared(JSON.parse(snapshot.current))
    } catch {
      canPersist.current = false
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded || !canPersist.current) return
    const next = JSON.stringify(compared)
    if (next === (snapshot.current ?? "[]")) return
    try {
      sessionStorage.setItem(STORAGE_KEY, next)
      snapshot.current = next
    } catch {
      canPersist.current = false
    }
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
