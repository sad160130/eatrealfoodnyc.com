import type { Metadata } from "next"
import { GUIDES } from "@/config/guides"
import { DIET_CONFIG } from "@/config/dietary-tags"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP } from "@/config/boroughs"
import { HtmlSitemapShell, SitemapLinkList } from "@/components/html-sitemap-shell"
import { dataPageIndex } from "@/lib/data-pages"
import { buildPipeTitle, withBrand } from "@/lib/seo-titles"
import {
  boroughSitemapPath,
  groupNamesByLetter,
  letterPath,
  sitemapPageCount,
} from "@/lib/html-sitemap"
import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"

const title = buildPipeTitle("Site index", null)

export const metadata: Metadata = {
  title,
  description: "Boroughs, neighborhoods, restaurants, guides, data pages, and diet hubs on Eat Real Food NYC.",
  alternates: { canonical: getCanonicalUrl("/sitemap") },
  openGraph: { title: withBrand(title), type: "website" },
  robots: { index: true, follow: true },
}

export const revalidate = 86400

const BOROUGH_NAMES = Object.values(BOROUGH_MAP)

export default async function HtmlSitemapHub() {
  const rows = await prisma.restaurant.findMany({
    where: PUBLISHED_LISTING_WHERE,
    select: { name: true },
    orderBy: { name: "asc" },
  })
  const letters = [...groupNamesByLetter(rows.map((row) => row.name)).entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <HtmlSitemapShell
      crumb="Site index"
      path="/sitemap"
      title="Site index"
      lede="Boroughs, then neighborhoods. Restaurants are listed A to Z on their own pages. Guides, data pages, and diet hubs are linked here."
    >
      <section>
        <h2 className="h2-serif">Boroughs</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Each borough page links to that borough’s neighborhood hubs.
        </p>
        <SitemapLinkList
          links={BOROUGH_NAMES.map((borough) => ({
            href: boroughSitemapPath(borough),
            label: borough,
          }))}
        />
      </section>

      <section>
        <h2 className="h2-serif">Restaurants</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Alphabetical lists of published restaurants. A letter with more than one page links every page from here.
        </p>
        <ul className="mt-4 space-y-3">
          {letters.map(([letter, count]) => {
            const pages = sitemapPageCount(count)
            return (
              <li key={letter}>
                <a href={letterPath(letter)} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                  {letter === "0" ? "0–9" : letter}
                </a>
                <span className="ml-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  {Array.from({ length: pages }, (_, index) => (
                    <a
                      key={index + 1}
                      href={letterPath(letter, index + 1)}
                      className="mr-2 underline"
                      style={{ color: "var(--color-jade)" }}
                    >
                      Page {index + 1}
                    </a>
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2 className="h2-serif">Guides</h2>
        <SitemapLinkList
          links={[
            { href: "/guides", label: "All guides" },
            ...GUIDES.map((guide) => ({ href: `/guides/${guide.slug}`, label: guide.title })),
          ]}
        />
      </section>

      <section>
        <h2 className="h2-serif">Data pages</h2>
        <SitemapLinkList
          links={[
            { href: "/data", label: "NYC restaurant data" },
            ...dataPageIndex().map((page) => ({ href: page.href, label: page.title })),
          ]}
        />
      </section>

      <section>
        <h2 className="h2-serif">Diet hubs</h2>
        <SitemapLinkList
          links={[
            { href: "/healthy-restaurants", label: "Healthy restaurants in NYC" },
            { href: "/healthy-restaurants/grade-a", label: "Grade A restaurants in NYC" },
            ...Object.entries(DIET_CONFIG).map(([tag, config]) => ({
              href: `/healthy-restaurants/${tag}`,
              label: `${config.label} restaurants in NYC`,
            })),
          ]}
        />
      </section>
    </HtmlSitemapShell>
  )
}
