import FAQItem from "@/components/faq-item"

interface FaqAccordionProps {
  faqs: Array<{ question: string; answer: string }>
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {faqs.map((faq, i) => (
        <FAQItem
          key={i}
          question={faq.question}
          answer={faq.answer}
          isLast={i === faqs.length - 1}
        />
      ))}
    </div>
  )
}
