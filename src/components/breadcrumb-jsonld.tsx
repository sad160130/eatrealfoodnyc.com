import { buildBreadcrumbList } from "@/lib/schema"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"

export default function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; path?: string }>
}) {
  const schema = buildBreadcrumbList(
    [{ name: "Eat Real Food NYC", path: "/" }, ...items],
    SITE_URL
  )
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
