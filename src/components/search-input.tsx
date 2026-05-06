"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchInput() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const inputId = useId()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push("/search?q=" + encodeURIComponent(trimmed))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search healthy restaurants in NYC"
      className="flex w-full max-w-[600px] mx-auto"
    >
      <label htmlFor={inputId} className="sr-only">
        Search healthy restaurants in NYC
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        role="searchbox"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search healthy restaurants in NYC..."
        aria-label="Search healthy restaurants in NYC"
        className="flex-1 rounded-l-lg border-0 px-5 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="rounded-r-lg bg-green-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-green-700 cursor-pointer"
      >
        Search
      </button>
    </form>
  )
}
