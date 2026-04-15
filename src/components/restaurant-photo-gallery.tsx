"use client"

import { useState } from "react"
import Image from "next/image"

interface Props {
  photo: string | null
  name: string
  alt: string
  neighborhood: string | null
  borough: string | null
  type: string | null
}

export default function RestaurantPhotoGallery({ photo, name, alt, neighborhood, borough, type }: Props) {
  const [mainError, setMainError] = useState(false)
  const [secondaryError, setSecondaryError] = useState(false)

  const showMain = photo && !mainError
  const showSecondary = photo && !secondaryError

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid h-96 grid-cols-2 gap-2">
        {/* Left — main photo */}
        <div className="relative col-span-1 overflow-hidden rounded-2xl">
          {showMain ? (
            <Image
              src={photo}
              alt={alt}
              fill
              className="object-cover"
              priority
              unoptimized
              sizes="100vw"
              onError={() => setMainError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-forest to-jade">
              <span className="font-serif text-6xl font-bold text-white">
                {name.charAt(0)}
              </span>
              {type && (
                <span className="mt-2 text-xs font-medium uppercase tracking-widest text-white/70">
                  {type}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right — two stacked cells */}
        <div className="col-span-1 grid grid-rows-2 gap-2">
          {/* Top cell — same photo, different crop */}
          <div className="relative overflow-hidden rounded-2xl">
            {showSecondary ? (
              <Image
                src={photo}
                alt={`${name} interior — ${neighborhood ?? "NYC"}`}
                fill
                className="object-cover object-top"
                unoptimized
                onError={() => setSecondaryError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-forest/80" />
            )}
          </div>

          {/* Bottom cell — neighborhood label */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-forest">
            <div className="text-center">
              {neighborhood && (
                <p className="font-serif text-xl font-bold text-white">{neighborhood}</p>
              )}
              <p className="mt-1 text-xs uppercase tracking-widest text-white/50">{borough}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
