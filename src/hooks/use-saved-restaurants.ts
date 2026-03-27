"use client"

import { useState, useEffect, useCallback } from "react"

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSaved(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load saved restaurants", e)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch (e) {
      console.error("Failed to save restaurants", e)
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
