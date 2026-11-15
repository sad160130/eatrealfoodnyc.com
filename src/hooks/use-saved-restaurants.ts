"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const STORAGE_KEY = "nyc-healthy-saved-restaurants"

export interface SavedRestaurant {
  slug: string
  name: string
  neighborhood: string | null
  borough: string | null
  rating: number | null
  inspection_grade: string | null
  dietary_tags: string | null
  photo: string | null
  is_hidden_gem: boolean
  savedAt: string
}

export function useSavedRestaurants() {
  const [saved, setSaved] = useState<SavedRestaurant[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const snapshot = useRef<string | null>(null)
  const canPersist = useRef(true)

  useEffect(() => {
    // iOS private mode throws QuotaExceededError on localStorage access.
    // Writing the empty list on every mount used to hit that on each card.
    // Read once. Write only after the list actually changes, and stop
    // writing if storage is unavailable.
    try {
      snapshot.current = localStorage.getItem(STORAGE_KEY)
      if (snapshot.current) setSaved(JSON.parse(snapshot.current))
    } catch {
      canPersist.current = false
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded || !canPersist.current) return
    const next = JSON.stringify(saved)
    if (next === (snapshot.current ?? "[]")) return
    try {
      localStorage.setItem(STORAGE_KEY, next)
      snapshot.current = next
    } catch {
      canPersist.current = false
    }
  }, [saved, isLoaded])

  const isSaved = useCallback(
    (slug: string) => saved.some((r) => r.slug === slug),
    [saved]
  )

  const toggleSave = useCallback((restaurant: SavedRestaurant) => {
    setSaved((prev) => {
      const exists = prev.some((r) => r.slug === restaurant.slug)
      if (exists) {
        return prev.filter((r) => r.slug !== restaurant.slug)
      } else {
        return [{ ...restaurant, savedAt: new Date().toISOString() }, ...prev]
      }
    })
  }, [])

  const clearAll = useCallback(() => {
    setSaved([])
  }, [])

  const getSavedSlugs = useCallback(() => saved.map((r) => r.slug), [saved])

  return {
    saved,
    isSaved,
    toggleSave,
    clearAll,
    getSavedSlugs,
    count: saved.length,
    isLoaded,
  }
}
