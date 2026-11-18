import type { Metadata } from "next"
import { notFound } from "next/navigation"
import NewsletterSignup from "@/components/newsletter-signup"
import NewsletterIssueView from "@/components/newsletter-issue-view"
import AboutThisData from "@/components/about-this-data"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { pageMeta } from "@/lib/page-meta"
import { fitTitle } from "@/lib/seo-titles"
import {
  formatIssueLabel,
  isIssueDate,
  issuePageDescription,
  issuePageTitle,
  newsletterWebPageSchema,
} from "@/lib/newsletter-issue"
import { loadNewsletterIssue } from "@/lib/newsletter-weekly"

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>
}): Promise<Metadata> {
  const { date } = await params
  if (!isIssueDate(date)) {
    return {
      title: { absolute: fitTitle(["Issue not found"], { allowBrand: true }) },
      robots: { index: false, follow: false },
    }
  }
  return pageMeta({
    path: `/newsletter/issues/${date}`,
    title: issuePageTitle(date),
    description: issuePageDescription(date),
  })
}

export default async function NewsletterIssuePage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  const issue = await loadNewsletterIssue(date)
  if (!issue) notFound()

  const description = issuePageDescription(date)
  const schema = newsletterWebPageSchema({
    name: `Grade A Eats This Week: ${issue.issueDateLabel}`,
    description,
    path: `/newsletter/issues/${date}`,
  })

  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Newsletter", path: "/newsletter" },
          { name: "Archive", path: "/newsletter/issues" },
          { name: formatIssueLabel(date), path: `/newsletter/issues/${date}` },
        ]}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <NewsletterIssueView issue={issue} />
        <div className="mt-12">
          <NewsletterSignup sourcePath={`/newsletter/issues/${date}`} />
        </div>
        <AboutThisData variant="hub" lastRefreshed={issue.issueDateLabel} />
      </div>
    </div>
  )
}
