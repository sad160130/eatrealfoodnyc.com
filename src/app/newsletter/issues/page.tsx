import NewsletterSignup from "@/components/newsletter-signup"
import NewsletterArchiveList from "@/components/newsletter-archive-list"
import AboutThisData from "@/components/about-this-data"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"
import { pageMeta } from "@/lib/page-meta"
import { archivePageDescription, newsletterWebPageSchema, partitionNewsletterArchive } from "@/lib/newsletter-issue"
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
  const { recent, older } = partitionNewsletterArchive(await loadNewsletterArchive())
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
        <p className="eyebrow">Weekly roundup</p>
        <h1 className="display-2 mt-4">Grade A Eats Archive</h1>
        <p className="dek mt-4">{DESCRIPTION}</p>
        <NewsletterArchiveList recent={recent} older={older} />
        <div className="mt-12">
          <NewsletterSignup sourcePath="/newsletter/issues" />
        </div>
        <AboutThisData variant="hub" />
      </div>
    </div>
  )
}
