import FAQSchema from "@/components/faq-schema"
import FAQItem from "@/components/faq-item"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  heading?: string
  subheading?: string
}

export default function FAQSection({
  faqs,
  heading = "Frequently Asked Questions",
  subheading,
}: FAQSectionProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <FAQSchema faqs={faqs} />

        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">FAQ</p>
          <h2
            className="text-3xl font-bold text-forest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
              {subheading}
            </p>
          )}
        </div>

        <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isFirst={index === 0}
              isLast={index === faqs.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
