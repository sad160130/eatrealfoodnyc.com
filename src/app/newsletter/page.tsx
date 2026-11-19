import Link from "next/link"
import NewsletterSignup from "@/components/newsletter-signup"
import { GENERAL_CONTACT_EMAIL } from "@/config/contact"
import { pageMeta } from "@/lib/page-meta"
import BreadcrumbJsonLd from "@/components/breadcrumb-jsonld"

const TITLE = "Grade A Eats This Week"

export const metadata = pageMeta({
  path: "/newsletter",
  title: TITLE,
  description:
    "A weekly email of NYC restaurants newly showing a NYC DOHMH Grade A, plus that week's neighborhood. Confirm by email.",
})

export default function NewsletterPage() {
  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <BreadcrumbJsonLd items={[{ name: "Newsletter", path: "/newsletter" }]} />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="eyebrow">Weekly email</p>
        <h1 className="display-2 mt-4">Grade A Eats This Week</h1>
        <div className="mt-6 max-w-[62ch] space-y-4 text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
          <p>
            One email a week from Eat Real Food NYC. The list is drawn from restaurants already in this directory and the NYC DOHMH inspection date stored on each listing.
          </p>
          <p>Each edition covers:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>New Grade A: published restaurants whose current grade is A and whose inspection date falls in that week&apos;s seven days.</li>
            <li>Neighborhood pick: the neighborhood with the most of those listings, linked to its healthy-restaurants page.</li>
            <li>A Sponsored slot. Until a sponsor takes it, the slot is a house ad. The block is labeled Sponsored.</li>
          </ul>
          <p>
            Weekly Grade A roundups are listed in the{" "}
            <Link href="/newsletter/issues" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
              Grade A Eats This Week archive
            </Link>
            . The email edition started in November 2026.
          </p>
          <p>
            Enter your email and tick the consent box. We store the address and the page you signed up from, then send a confirmation link from {GENERAL_CONTACT_EMAIL}. The link expires after 7 days. The weekly email starts after you confirm. Every email has an unsubscribe link, and you can leave the list anytime.
          </p>
          <p>
            If an edition includes a sponsor, that block is labeled Sponsored. Grades, rankings, and which restaurants are listed stay independent of any sponsor.
          </p>
          <p>
            The directory itself stays at{" "}
            <Link href="/" className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
              eatrealfoodnyc.com
            </Link>
            .
          </p>
        </div>
        <div className="mt-10">
          <NewsletterSignup sourcePath="/newsletter" />
        </div>
      </div>
    </div>
  )
}
