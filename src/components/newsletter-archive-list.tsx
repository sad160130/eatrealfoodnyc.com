import Link from "next/link"
import type { NewsletterArchiveEntry } from "@/lib/newsletter-issue"

function gradeASummary(count: number): string {
  if (count === 0) return "No new Grade A listings in this window."
  if (count === 1) return "1 new Grade A listing."
  return `${count} new Grade A listings.`
}

function IssueList({ issues }: { issues: NewsletterArchiveEntry[] }) {
  return (
    <ul className="mt-6 space-y-6">
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
            {gradeASummary(issue.gradeACount)}
            {issue.neighborhood && issue.borough
              ? ` Neighborhood pick: ${issue.neighborhood}, ${issue.borough}.`
              : ""}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default function NewsletterArchiveList({
  recent,
  older,
}: {
  recent: NewsletterArchiveEntry[]
  older: NewsletterArchiveEntry[]
}) {
  return (
    <>
      <h2 className="h2-serif mt-10">Recent weeks</h2>
      <IssueList issues={recent} />
      {older.length > 0 ? (
        <details open className="mt-14">
          <summary className="cursor-pointer">
            <h2 className="h2-serif inline">Older weekly roundups</h2>
          </summary>
          <IssueList issues={older} />
        </details>
      ) : null}
    </>
  )
}
