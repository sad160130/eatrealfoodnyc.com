import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCanonicalUrl } from "@/config/seo"
import { letterFromSlug, letterPath } from "@/lib/html-sitemap"
import { buildPipeTitle, withBrand } from "@/lib/seo-titles"
import { LetterList } from "@/components/sitemap-letter-list"

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letter: string; page: string }>
}): Promise<Metadata> {
  const { letter: slug, page } = await params
  const letter = letterFromSlug(slug)
  const pageNumber = Number(page)
  if (!letter || !Number.isInteger(pageNumber) || pageNumber < 2) return { title: "Not Found" }
  const label = letter === "0" ? "0–9" : letter
  const title = buildPipeTitle(`Restaurants ${label}`, `Page ${pageNumber}`)
  return {
    title,
    description: `Published restaurants on Eat Real Food NYC whose names start with ${label}. Page ${pageNumber}.`,
    alternates: { canonical: getCanonicalUrl(letterPath(letter, pageNumber)) },
    openGraph: { title: withBrand(title), type: "website" },
    robots: { index: true, follow: true },
  }
}

export default async function LetterSitemapPaged({
  params,
}: {
  params: Promise<{ letter: string; page: string }>
}) {
  const { letter: slug, page } = await params
  const letter = letterFromSlug(slug)
  const pageNumber = Number(page)
  if (!letter || !Number.isInteger(pageNumber) || pageNumber < 2) notFound()
  return <LetterList letter={letter} page={pageNumber} />
}
