import { notFound } from "next/navigation"
import { HtmlSitemapShell, SitemapLinkList } from "@/components/html-sitemap-shell"
import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import {
  HTML_SITEMAP_PAGE_SIZE,
  letterPath,
  restaurantLetter,
  sitemapPageCount,
} from "@/lib/html-sitemap"

export async function LetterList({ letter, page }: { letter: string; page: number }) {
  const rows = await prisma.restaurant.findMany({
    where: PUBLISHED_LISTING_WHERE,
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })
  const matched = rows.filter((row) => restaurantLetter(row.name) === letter)
  const pages = sitemapPageCount(matched.length)
  if (matched.length === 0 || page > pages) notFound()
  const slice = matched.slice((page - 1) * HTML_SITEMAP_PAGE_SIZE, page * HTML_SITEMAP_PAGE_SIZE)
  const label = letter === "0" ? "0–9" : letter
  return (
    <HtmlSitemapShell
      crumb={page > 1 ? `${label}, page ${page}` : label}
      path={letterPath(letter, page)}
      title={page > 1 ? `Restaurants ${label}, page ${page}` : `Restaurants ${label}`}
      lede={`Published restaurants whose names start with ${label}. Page ${page} of ${pages}.`}
    >
      <section>
        <h2 className="h2-serif">Restaurants</h2>
        <SitemapLinkList
          links={slice.map((row) => ({
            href: `/restaurants/${row.slug}`,
            label: row.name,
          }))}
        />
        {pages > 1 ? (
          <p className="mt-6 text-sm">
            {Array.from({ length: pages }, (_, index) => (
              <a
                key={index + 1}
                href={letterPath(letter, index + 1)}
                className="mr-3 underline"
                style={{ color: "var(--color-jade)" }}
                aria-current={index + 1 === page ? "page" : undefined}
              >
                Page {index + 1}
              </a>
            ))}
          </p>
        ) : null}
      </section>
    </HtmlSitemapShell>
  )
}
