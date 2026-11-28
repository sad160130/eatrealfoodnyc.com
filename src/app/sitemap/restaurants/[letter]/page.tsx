import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCanonicalUrl } from "@/config/seo"
import { LetterList } from "@/components/sitemap-letter-list"
import { letterFromSlug, letterPath } from "@/lib/html-sitemap"
import { buildPipeTitle, withBrand } from "@/lib/seo-titles"

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letter: string }>
}): Promise<Metadata> {
  const { letter: slug } = await params
  const letter = letterFromSlug(slug)
  if (!letter) return { title: "Not Found" }
  const label = letter === "0" ? "0–9" : letter
  const title = buildPipeTitle(`Restaurants ${label}`, null)
  return {
    title,
    description: `Published restaurants on Eat Real Food NYC whose names start with ${label}.`,
    alternates: { canonical: getCanonicalUrl(letterPath(letter)) },
    openGraph: { title: withBrand(title), type: "website" },
    robots: { index: true, follow: true },
  }
}

export default async function LetterSitemapPage({
  params,
}: {
  params: Promise<{ letter: string }>
}) {
  const { letter: slug } = await params
  const letter = letterFromSlug(slug)
  if (!letter) notFound()
  return <LetterList letter={letter} page={1} />
}
