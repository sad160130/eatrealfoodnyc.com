"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode, useEffect, useRef, useState } from "react"

const MapEmbed = dynamic(() => import("@/components/map-embed"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-gradient-to-br from-sage/10 to-jade/5">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading map...</p>
    </div>
  ),
})

interface MapWrapperProps {
  lat: number
  lng: number
  name: string
}

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
          Map could not be loaded
        </div>
      )
    }
    return this.props.children
  }
}

function LazyMap({ lat, lng, name }: MapWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-[300px] w-full overflow-hidden rounded-xl">
      {showMap ? (
        <MapEmbed lat={lat} lng={lng} name={name} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-sage/10 to-jade/5">
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Map loading...</p>
        </div>
      )}
    </div>
  )
}

export default function MapWrapper({ lat, lng, name }: MapWrapperProps) {
  return (
    <MapErrorBoundary>
      <LazyMap lat={lat} lng={lng} name={name} />
    </MapErrorBoundary>
  )
}
