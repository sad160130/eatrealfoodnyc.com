import Link from "next/link"
import { pageMeta } from "@/lib/page-meta"
import { BOROUGH_MAP } from "@/config/boroughs"
import { gradeABoroughPath, gradeACityPath } from "@/lib/grade-a"
import { confirmNewsletterSubscriber } from "@/lib/newsletter-subscribers"
import { verifyNewsletterToken } from "@/lib/newsletter-token"
import NewsletterStatus from "@/components/newsletter-status"

export const dynamic = "force-dynamic"

export const metadata = pageMeta({
  path: "/newsletter/confirm",
  title: "Confirm your email",
  description: "Confirm Grade A Eats This Week from the link in your email. The link expires after 7 days.",
  index: false,
})

function oneToken(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

const linkStyle = { color: "var(--color-jade)" } as const

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const query = await searchParams
  const verified = verifyNewsletterToken(oneToken(query.token), { purpose: "confirm" })
  const state = verified.ok ? await confirmNewsletterSubscriber(verified.email) : verified.reason

  if (state === "confirmed") {
    return (
      <NewsletterStatus eyebrow="Weekly email" title="You're confirmed">
        <p>
          Grade A Eats This Week will come to the address you signed up with. One email a week. Every message has an unsubscribe link.
        </p>
        <p>Browse Grade A restaurants while you wait for the next edition.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href={gradeACityPath()} className="underline underline-offset-4" style={linkStyle}>
              Grade A restaurants in NYC
            </Link>
          </li>
          {Object.values(BOROUGH_MAP).map((name) => (
            <li key={name}>
              <Link href={gradeABoroughPath(name)} className="underline underline-offset-4" style={linkStyle}>
                Grade A restaurants in {name}
              </Link>
            </li>
          ))}
        </ul>
      </NewsletterStatus>
    )
  }

  if (state === "expired") {
    return (
      <NewsletterStatus eyebrow="Weekly email" title="That confirmation link has expired">
        <p>
          Confirmation links last 7 days.{" "}
          <Link href="/newsletter" className="underline underline-offset-4" style={linkStyle}>
            Sign up again
          </Link>{" "}
          and we will send a new one.
        </p>
      </NewsletterStatus>
    )
  }

  if (state === "missing") {
    return (
      <NewsletterStatus eyebrow="Weekly email" title="We could not find that signup">
        <p>
          That address is not on the list.{" "}
          <Link href="/newsletter" className="underline underline-offset-4" style={linkStyle}>
            Sign up again
          </Link>
          .
        </p>
      </NewsletterStatus>
    )
  }

  if (state === "error") {
    return (
      <NewsletterStatus eyebrow="Weekly email" title="We could not confirm that signup">
        <p>Please try the link again in a few minutes.</p>
      </NewsletterStatus>
    )
  }

  return (
    <NewsletterStatus eyebrow="Weekly email" title="That confirmation link is not valid">
      <p>
        <Link href="/newsletter" className="underline underline-offset-4" style={linkStyle}>
          Sign up
        </Link>{" "}
        to get a new link.
      </p>
    </NewsletterStatus>
  )
}
