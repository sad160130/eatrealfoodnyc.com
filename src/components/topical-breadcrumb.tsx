import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopicalBreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function TopicalBreadcrumb({ items }: TopicalBreadcrumbProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const allItems = [{ label: "Eat Real Food NYC", href: "/" }, ...items]

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href && { item: `${siteUrl}${item.href}` }),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
        {allItems.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">/</span>}
            {item.href ? (
              <Link href={item.href} className="font-medium transition-colors hover:text-jade">{item.label}</Link>
            ) : (
              <span className="font-semibold text-forest">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
