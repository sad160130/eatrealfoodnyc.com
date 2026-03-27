"use client"

import { useState, useCallback } from "react"

export interface GeolocationState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
  granted: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: false,
    granted: false,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: "Geolocation is not supported by your browser.",
      }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
          granted: true,
        })
      },
      (error) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. Please enable location access in your browser settings.",
          2: "Location unavailable. Please try again.",
          3: "Location request timed out. Please try again.",
        }
        setState((s) => ({
          ...s,
          error: messages[error.code] || "Failed to get location.",
          loading: false,
          granted: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }, [])

  const clearLocation = useCallback(() => {
    setState({
      lat: null,
      lng: null,
      accuracy: null,
      error: null,
      loading: false,
      granted: false,
    })
  }, [])

  return { ...state, requestLocation, clearLocation }
}
