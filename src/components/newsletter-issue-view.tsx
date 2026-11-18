import Link from "next/link"
import {
  NEWSLETTER_SPONSOR_LABEL,
  type NewsletterIssue,
} from "@/lib/newsletter-issue"

function placeLine(neighborhood: string | null, borough: string | null): string | null {
  if (neighborhood && borough) return `${neighborhood}, ${borough}`
  return neighborhood ?? borough
}

export default function NewsletterIssueView({ issue }: { issue: NewsletterIssue }) {
  const pick = issue.neighborhoodPick
  const listingLabel = issue.gradeA.length === 1 ? "listing" : "listings"

  return (
    <article>
      <p className="eyebrow">Grade A Eats This Week</p>
      <h1 className="display-2 mt-4">Week ending {issue.issueDateLabel}</h1>
      <p className="mt-4 max-w-[62ch] text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
        Published restaurants whose current NYC DOHMH grade is A and whose inspection date falls in the seven days ending {issue.issueDateLabel}. Grades and dates are the current NYC Department of Health and Mental Hygiene record on each listing.
      </p>

      {issue.gradeA.length > 0 ? (
        <section className="mt-12" aria-labelledby="new-grade-a">
          <h2 id="new-grade-a" className="h2-serif">New Grade A</h2>
          <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
            {issue.gradeA.length} {listingLabel} in {issue.windowLabel}.
          </p>
          <ul className="mt-6">
            {issue.gradeA.map((item) => {
              const place = placeLine(item.neighborhood, item.borough)
              return (
                <li key={item.slug} className="flex gap-4 border-b border-hairline py-5">
                  <span className="plaque shrink-0" data-grade="A" aria-hidden="true">A</span>
                  <div>
                    <Link
                      href={item.path}
                      className="text-lg font-semibold underline-offset-4 hover:underline"
                      style={{ fontFamily: "Georgia, serif", color: "var(--color-jade)" }}
                    >
                      {item.name}
                    </Link>
                    {place ? (
                      <p className="mt-1 text-sm" style={{ color: "var(--color-text)" }}>{place}</p>
                    ) : null}
                    <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                      Inspected {item.inspectionDateLabel}
                      {item.inspectionScore != null ? ` · inspection score ${item.inspectionScore}` : ""}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <p className="mt-10 max-w-[62ch] text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
          No published restaurant has a current NYC DOHMH Grade A inspection date in this seven-day window.
        </p>
      )}

      {pick ? (
        <section className="mt-12" aria-labelledby="neighborhood-pick">
          <h2 id="neighborhood-pick" className="h2-serif">Neighborhood pick</h2>
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
            The neighborhood with the most new Grade A listings this week is {pick.neighborhood}, {pick.borough}: {pick.count === 1 ? "1 new Grade A listing" : `${pick.count} new Grade A listings`}.
          </p>
          <p className="mt-3">
            <Link href={pick.path} className="underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
              {pick.anchor}
            </Link>
          </p>
        </section>
      ) : null}

      <aside aria-label="Sponsored" className="mt-12 border border-hairline-strong p-6">
        <p className="eyebrow">{NEWSLETTER_SPONSOR_LABEL}</p>
        <p className="mt-3 text-xl leading-snug" style={{ fontFamily: "Georgia, serif" }}>
          <Link href={issue.sponsored.path} className="underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
            {issue.sponsored.text}
          </Link>
        </p>
      </aside>
    </article>
  )
}
