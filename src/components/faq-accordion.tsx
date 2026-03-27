"use client"

import { useState } from "react"

interface FaqAccordionProps {
  faqs: Array<{ question: string; answer: string }>
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y rounded-xl border">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-gray-50"
          >
            <span>{faq.question}</span>
            <span className="ml-2 shrink-0 text-gray-400">
              {openIndex === i ? "−" : "+"}
            </span>
          </button>
          {openIndex === i && (
            <div className="px-4 pb-3 text-sm leading-relaxed text-gray-600">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
