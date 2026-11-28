import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCanonicalUrl } from "@/config/seo"
import { BOROUGH_MAP } from "@/config/boroughs"
import { HtmlSitemapShell, SitemapLinkList } from "@/components/html-sitemap-shell"
import { prisma } from "@/lib/db"
import { PUBLISHED_LISTING_WHERE } from "@/lib/directory-stats"
import { NEIGHBORHOOD_HUB_MIN_RESTAURANTS } from "@/lib/neighborhood-hubs"
import { boroughSitemapPath, neighborhoodHubPath } from "@/lib/html-sitemap"
import { buildPipeTitle, withBrand } from "@/lib/seo-titles"

export const revalidate = 86400

export function generateStaticParams() {
  return Object.keys(BOROUGH_MAP).map((borough) => ({ borough }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string }>
}): Promise<Metadata> {
  const { borough } = await params
  const name = BOROUGH_MAP[borough]
  if (!name) return { title: "Not Found" }
  const title = buildPipeTitle(`${name} neighborhoods`, null)
  const path = boroughSitemapPath(name)
  return {
    title,
    description: `Neighborhood hubs in ${name}, linked from the Eat Real Food NYC site index.`,
    alternates: { canonical: getCanonicalUrl(path) },
    openGraph: { title: withBrand(title), type: "website" },
    robots: { index: true, follow: true },
  }
}

export default async function BoroughSitemapPage({
  params,
}: {
  params: Promise<{ borough: string }>
}) {
  const { borough } = await params
  const name = BOROUGH_MAP[borough]
  if (!name) notFound()

  const groups = await prisma.restaurant.groupBy({
    by: ["neighborhood"],
    where: {
      ...PUBLISHED_LISTING_WHERE,
      borough: name,
      neighborhood: { not: null },
    },
    _count: { id: true },
  })
  const neighborhoods = groups
    .filter((row) => row.neighborhood && row._count.id >= NEIGHBORHOOD_HUB_MIN_RESTAURANTS)
    .map((row) => row.neighborhood as string)
    .sort((a, b) => a.localeCompare(b))

  return (
    <HtmlSitemapShell
      crumb={name}
      path={boroughSitemapPath(name)}
      title={`${name} neighborhoods`}
      lede={`Neighborhood hubs in ${name}. Each link is the healthy-restaurants page for that neighborhood.`}
    >
      <section>
        <h2 className="h2-serif">Borough hub</h2>
        <p className="mt-3">
          <a
            href={`/nyc/${borough}/healthy-restaurants`}
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--color-jade)" }}
          >
            Healthy restaurants in {name}
          </a>
        </p>
      </section>
      <section>
        <h2 className="h2-serif">Neighborhoods</h2>
        <SitemapLinkList
          links={neighborhoods.map((neighborhood) => ({
            href: neighborhoodHubPath(name, neighborhood),
            label: neighborhood,
          }))}
        />
      </section>
    </HtmlSitemapShell>
  )
}
