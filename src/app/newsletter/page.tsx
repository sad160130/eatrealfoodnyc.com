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
    "A weekly email of Grade A picks, new openings, and diet-friendly finds in NYC. Confirm by email. Unsubscribe anytime.",
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
            One email a week from Eat Real Food NYC. It is a short list drawn from restaurants already in this directory, not a review we invented.
          </p>
          <p>Each edition covers three things:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Grade A picks: published restaurants that currently hold an official NYC DOHMH Grade A.</li>
            <li>New openings: listings that were published recently.</li>
            <li>Diet-friendly finds: places tagged for a specific diet, such as vegan, halal, kosher, or gluten-free, using the same conservative tags as the site.</li>
          </ul>
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
