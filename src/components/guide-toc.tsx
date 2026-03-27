interface TOCItem {
  href: string
  label: string
}

interface GuideTOCProps {
  items: TOCItem[]
}

export default function GuideTOC({ items }: GuideTOCProps) {
  return (
    <div className="mb-12 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
        IN THIS GUIDE
      </p>
      <nav className="space-y-2">
        {items.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 py-1 text-sm text-jade transition-colors hover:text-forest"
          >
            <span className="text-sage">{i + 1}.</span>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
