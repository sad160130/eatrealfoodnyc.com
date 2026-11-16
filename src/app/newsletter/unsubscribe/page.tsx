import Link from "next/link"
import { GENERAL_CONTACT_EMAIL } from "@/config/contact"
import { pageMeta } from "@/lib/page-meta"
import { unsubscribeNewsletterSubscriber } from "@/lib/newsletter-subscribers"
import { verifyNewsletterToken } from "@/lib/newsletter-token"
import NewsletterStatus from "@/components/newsletter-status"

export const dynamic = "force-dynamic"

export const metadata = pageMeta({
  path: "/newsletter/unsubscribe",
  title: "Unsubscribe",
  description: "Unsubscribe from Grade A Eats This Week.",
  index: false,
})

function oneToken(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

const linkStyle = { color: "var(--color-jade)" } as const

export default async function UnsubscribeNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const query = await searchParams
  const verified = verifyNewsletterToken(oneToken(query.token), { purpose: "unsubscribe" })

  if (!verified.ok) {
    return (
      <NewsletterStatus eyebrow="Weekly email" title="That unsubscribe link is not valid">
        <p>
          Open the unsubscribe link from a Grade A Eats This Week email, or write to{" "}
          <a href={`mailto:${GENERAL_CONTACT_EMAIL}`} className="underline underline-offset-4" style={linkStyle}>
            {GENERAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </NewsletterStatus>
    )
  }

  const result = await unsubscribeNewsletterSubscriber(verified.email)
  if (result === "error") {
    return (
      <NewsletterStatus eyebrow="Weekly email" title="We could not unsubscribe that address">
        <p>
          Please try the link again in a few minutes, or write to{" "}
          <a href={`mailto:${GENERAL_CONTACT_EMAIL}`} className="underline underline-offset-4" style={linkStyle}>
            {GENERAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </NewsletterStatus>
    )
  }

  return (
    <NewsletterStatus eyebrow="Weekly email" title="You're unsubscribed">
      <p>That address is off Grade A Eats This Week. We will not send the weekly email.</p>
      <p>
        <Link href="/" className="underline underline-offset-4" style={linkStyle}>
          Back to the directory
        </Link>
      </p>
    </NewsletterStatus>
  )
}
