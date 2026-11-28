import type { ReactNode } from "react"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

export function HtmlSitemapShell({
  crumb,
  path,
  title,
  lede,
  children,
}: {
  crumb: string
  path: string
  title: string
  lede: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: crumb, path }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-8">
          <p className="eyebrow">Site index</p>
          <h1 className="display-1 mt-3">{title}</h1>
          <p className="dek mt-4" style={{ maxWidth: "62ch" }}>{lede}</p>
          {path !== "/sitemap" ? (
            <p className="mt-4 text-sm">
              <a href="/sitemap" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                All sections
              </a>
            </p>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">{children}</div>
    </div>
  )
}

export function SitemapLinkList({
  links,
}: {
  links: Array<{ href: string; label: string }>
}) {
  return (
    <ul className="mt-4 columns-1 sm:columns-2 lg:columns-3">
      {links.map((link) => (
        <li key={link.href} className="py-1" style={{ breakInside: "avoid" }}>
          <a href={link.href} className="text-sm underline-offset-4 hover:underline" style={{ color: "var(--color-forest)" }}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
