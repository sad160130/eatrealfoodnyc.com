import Link from "next/link"
import { pageMeta } from "@/lib/page-meta"
import { buildPipeTitle } from "@/lib/seo-titles"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

const title = buildPipeTitle("Free Grade A badge", null)

export const metadata = pageMeta({
  path: "/badge",
  title,
  description:
    "A free badge for a restaurant that currently holds a Grade A. It shows the official NYC grade and updates when the grade does.",
})

export default function BadgeIndexPage() {
  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Grade A badge", path: "/badge" }]} />
      <header className="border-b" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-10">
          <p className="eyebrow">For restaurants</p>
          <h1 className="display-2 mt-3">Free Grade A badge</h1>
          <p className="dek mt-4">
            The badge is free. A restaurant that currently holds a Grade A can embed it. It shows the official NYC Department of Health and Mental Hygiene grade and updates when the grade does.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-10 text-base leading-relaxed text-gray-700">
        <p>
          If the restaurant does not currently hold a Grade A, the badge does not claim a grade. It says the restaurant is listed here.
        </p>
        <p>
          Claim the listing first. On that restaurant’s page, the link is “Get a free badge.” Claiming does not change a grade or a place in the directory.
        </p>
        <p>
          <Link href="/claim" className="font-semibold text-jade hover:text-forest">
            Claim your free listing
          </Link>
        </p>
      </div>
    </div>
  )
}
