interface TOCItem {
  href: string
  label: string
}

interface GuideTOCProps {
  items: TOCItem[]
}

export default function GuideTOC({ items }: GuideTOCProps) {
  return (
    <nav
      aria-label="In this guide"
      className="mb-12 border p-6"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "var(--hairline)",
        borderRadius: "4px",
      }}
    >
      <p className="eyebrow mb-4" style={{ color: "var(--color-muted)" }}>
        In this guide
      </p>
      <ol className="space-y-2.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={item.href} className="flex items-baseline gap-3">
            <span
              className="tabular flex-shrink-0"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "var(--color-muted)",
                width: "1.5rem",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <a
              href={item.href}
              className="flex-1 transition-colors hover:underline"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "var(--color-forest)",
                textUnderlineOffset: "2px",
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
