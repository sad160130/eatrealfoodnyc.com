import type { ReactNode } from "react"
import Link from "next/link"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { FOOD_SAFETY_SENTENCE } from "@/lib/nta-grade-share"
import { dataPageIndex } from "@/lib/data-pages"

const SITE = "https://www.eatrealfoodnyc.com"

export function researchJsonLd(input: {
  path: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  csvPath: string
  datasetUrl: string
  datasetId: string
}) {
  const url = `${SITE}${input.path}`
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: input.title,
      datePublished: input.datePublished,
      dateModified: input.dateModified,
      author: { "@type": "Organization", name: "Eat Real Food NYC", url: SITE },
      publisher: { "@id": `${SITE}/#organization` },
      mainEntityOfPage: url,
      isBasedOn: input.datasetUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: input.title,
      description: input.description,
      url,
      dateModified: input.dateModified,
      creator: { "@type": "Organization", name: "Eat Real Food NYC", url: SITE },
      license: "https://creativecommons.org/licenses/by/4.0/",
      isBasedOn: {
        "@type": "Dataset",
        name: "DOHMH New York City Restaurant Inspection Results",
        identifier: input.datasetId,
        url: input.datasetUrl,
        publisher: { "@type": "GovernmentOrganization", name: "NYC Department of Health and Mental Hygiene" },
      },
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${SITE}${input.csvPath}`,
      },
    },
  ]
}

export function OriginalResearch({
  path,
  crumb,
  title,
  jsonLd,
  children,
}: {
  path: string
  crumb: string
  title: string
  jsonLd: unknown
  children: ReactNode
}) {
  const others = dataPageIndex().filter((page) => page.href !== path)
  return (
    <article style={{ backgroundColor: "var(--color-cream)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd items={[{ name: crumb, path }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-10">
          <p className="eyebrow">Original research · dated extract</p>
          <h1 className="display-2 mt-3">{title}</h1>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        {children}
        <h2 className="h2-serif mt-12">Other data pages</h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed">
          {others.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function ResearchDownload({
  csvPath,
  datasetId,
  cite,
}: {
  csvPath: string
  datasetId: string
  cite: string
}) {
  return (
    <>
      <h2 className="h2-serif mt-12">Download and how to cite</h2>
      <p className="mt-3 text-base leading-relaxed">
        <a href={csvPath} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>Download the aggregate CSV</a>
        . It is licensed <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>CC BY 4.0</a>. Attribute the NYC Department of Health and Mental Hygiene via NYC Open Data dataset {datasetId}, and Eat Real Food NYC for this aggregation. The city file has its own terms. {FOOD_SAFETY_SENTENCE}
      </p>
      <p className="mt-3 text-base leading-relaxed">{cite}</p>
    </>
  )
}
