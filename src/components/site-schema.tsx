import { siteGraph } from "@/lib/schema"

/** Organization and WebSite, on every server-rendered page. */
export default function SiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
    />
  )
}
