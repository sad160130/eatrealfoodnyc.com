export default function NewsletterStatus({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-2 mt-4">{title}</h1>
        <div className="mt-6 max-w-[62ch] space-y-4 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
