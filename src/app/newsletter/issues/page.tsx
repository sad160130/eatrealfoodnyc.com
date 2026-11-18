import Link from "next/link"
import NewsletterSignup from "@/components/newsletter-signup"
import AboutThisData from "@/components/about-this-data"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { pageMeta } from "@/lib/page-meta"
import { archivePageDescription, newsletterWebPageSchema } from "@/lib/newsletter-issue"
import { loadNewsletterArchive } from "@/lib/newsletter-weekly"

const TITLE = "Grade A Eats Archive"
const DESCRIPTION = archivePageDescription()

export const revalidate = 86400

export const metadata = pageMeta({
  path: "/newsletter/issues",
  title: TITLE,
  description: DESCRIPTION,
})

export default async function NewsletterIssuesPage() {
  const issues = await loadNewsletterArchive()
  const schema = newsletterWebPageSchema({
    name: TITLE,
    description: DESCRIPTION,
    path: "/newsletter/issues",
  })

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Newsletter", path: "/newsletter" },
          { name: "Archive", path: "/newsletter/issues" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="eyebrow">Weekly email</p>
        <h1 className="display-2 mt-4">Grade A Eats Archive</h1>
        <p className="dek mt-4">
          Past issues, rebuilt from published listings and the NYC DOHMH inspection date stored on each one.
        </p>
        <ul className="mt-10 space-y-6">
          {issues.map((issue) => (
            <li key={issue.date} className="border-b border-hairline pb-6">
              <Link
                href={`/newsletter/issues/${issue.date}`}
                className="text-xl underline-offset-4 hover:underline"
                style={{ fontFamily: "Georgia, serif", color: "var(--color-jade)" }}
              >
                Week ending {issue.label}
              </Link>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                {issue.gradeACount === 0
                  ? "No new Grade A listings in this window."
                  : issue.gradeACount === 1
                    ? "1 new Grade A listing."
                    : `${issue.gradeACount} new Grade A listings.`}
                {issue.neighborhood && issue.borough
                  ? ` Neighborhood pick: ${issue.neighborhood}, ${issue.borough}.`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <NewsletterSignup sourcePath="/newsletter/issues" />
        </div>
        <AboutThisData variant="hub" />
      </div>
    </div>
  )
}
