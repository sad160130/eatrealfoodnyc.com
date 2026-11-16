interface FAQItemProps {
  question: string
  answer: string
  isLast: boolean
}

export default function FAQItem({ question, answer, isLast }: FAQItemProps) {
  return (
    <div className={`border-b border-gray-100 ${isLast ? "border-b-0" : ""}`}>
      <h3
        className="px-6 py-5 text-base font-semibold text-forest"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {question}
      </h3>
      <p className="px-6 pb-6 text-base leading-relaxed text-gray-600">{answer}</p>
    </div>
  )
}
