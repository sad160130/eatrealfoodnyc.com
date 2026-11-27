import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import BadgeSnippet from "@/components/badge-snippet"
import { badgeKind, badgeSnippet, inspectionLabel } from "@/lib/badge"

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, is_published: true },
    select: { name: true, inspection_grade: true },
  })
  if (!restaurant) return {}
  const kind = badgeKind(restaurant.inspection_grade)
  const title = buildPipeTitle(kind === "grade-a" ? `Grade A badge for ${restaurant.name}` : `Listing badge for ${restaurant.name}`, null)
  return pageMeta({
    path: `/restaurants/${slug}`,
    title,
    description: kind === "grade-a"
      ? `Free Grade A badge for ${restaurant.name}. It shows the official NYC grade and updates when the grade does.`
      : `${restaurant.name} is listed on Eat Real Food NYC. This badge does not claim a Grade A.`,
  })
}

export default async function BadgePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, is_published: true },
    select: { slug: true, name: true, inspection_grade: true, inspection_date: true },
  })
  if (!restaurant) notFound()
  const kind = badgeKind(restaurant.inspection_grade)
  const inspected = kind === "grade-a" ? inspectionLabel(restaurant.inspection_date) : null
  const snippet = badgeSnippet(restaurant.slug, kind)

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: restaurant.name, path: `/restaurants/${restaurant.slug}` }, { name: "Badge", path: `/restaurants/${restaurant.slug}/badge` }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-10">
          <p className="eyebrow">Free badge</p>
          <h1 className="display-2 mt-3">{kind === "grade-a" ? `Grade A badge for ${restaurant.name}` : `Listing badge for ${restaurant.name}`}</h1>
          <p className="dek mt-4">
            {kind === "grade-a"
              ? "This restaurant currently holds a Grade A. The badge is free. It reflects the official NYC grade and updates when the grade does."
              : "This restaurant is listed here, and it does not currently hold a Grade A. The badge below does not claim a grade."}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex flex-wrap items-end gap-6">
          <figure>
            <img src={`/badge/${restaurant.slug}.svg`} alt={kind === "grade-a" ? "Grade A on Eat Real Food NYC" : "Listed on Eat Real Food NYC"} width={180} height={60} />
            <figcaption className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>Light{inspected ? ` · ${inspected}` : ""}</figcaption>
          </figure>
          <figure className="bg-forest p-3">
            <img src={`/badge/${restaurant.slug}.svg?theme=dark`} alt="" width={180} height={60} />
            <figcaption className="mt-2 text-xs text-cream/70">Dark</figcaption>
          </figure>
        </div>
        <BadgeSnippet snippet={snippet} />
      </div>
    </div>
  )
}
