"use client"

import { useState } from "react"

interface FAQItemProps {
  question: string
  answer: string
  isFirst: boolean
  isLast: boolean
}

export default function FAQItem({ question, answer, isFirst, isLast }: FAQItemProps) {
  const [open, setOpen] = useState(isFirst)

  return (
    <div className={`border-b border-gray-100 ${isLast ? "border-b-0" : ""}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50"
        aria-expanded={open}
      >
        <span
          className="pr-4 text-base font-semibold text-forest"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {question}
        </span>
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-sage text-sage transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6">
          <p className="text-base leading-relaxed text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}
