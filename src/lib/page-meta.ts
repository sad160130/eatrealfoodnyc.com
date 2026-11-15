import type { Metadata } from "next"
import { getCanonicalUrl, SEO_CONFIG } from "@/config/seo"
import { fitTitle } from "@/lib/seo-titles"

/**
 * Per-page title, canonical, and social URL.
 * The root layout must not set a canonical or og:url — those inherit onto
 * every route that forgets to override them, including the 404 page.
 * The layout does not append a brand suffix. Pass `brand: false` when the
 * title already includes its own hook and should not add the brand.
 */
export function pageMeta(options: {
  path: string
  title: string
  description: string
  index?: boolean
  type?: "website" | "article"
  brand?: boolean
}): Metadata {
  const url = getCanonicalUrl(options.path)
  const index = options.index !== false
  const absolute = options.title.includes("|")
    ? options.title
    : fitTitle([options.title], { allowBrand: options.brand !== false })
  return {
    title: { absolute },
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title: absolute,
      description: options.description,
      url,
      type: options.type ?? "website",
      siteName: SEO_CONFIG.siteName,
      images: [{ url: SEO_CONFIG.ogImage, width: 1200, height: 630, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: absolute,
      description: options.description,
    },
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true },
    },
  }
}
