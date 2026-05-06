"use client"

import { useId, useState } from "react"

interface FaqAccordionProps {
  faqs: Array<{ question: string; answer: string }>
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const baseId = useId()

  return (
    <div className="divide-y rounded-xl border">
      {faqs.map((faq, i) => {
        const open = openIndex === i
        const questionId = `${baseId}-q-${i}`
        const answerId = `${baseId}-a-${i}`
        return (
          <div key={i}>
            <button
              type="button"
              id={questionId}
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              aria-controls={answerId}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 cursor-pointer"
            >
              <span>{faq.question}</span>
              <span aria-hidden="true" className="ml-2 shrink-0 text-gray-400">
                {open ? "−" : "+"}
              </span>
            </button>
            <div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              hidden={!open}
              className="px-4 pb-3 text-sm leading-relaxed text-gray-600"
            >
              {faq.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
