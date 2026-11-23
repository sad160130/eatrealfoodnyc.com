import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import FAQSchema from "@/components/faq-schema"
import FAQItem from "@/components/faq-item"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import AboutThisData from "@/components/about-this-data"
import { getBreakfastGuideData, type BreakfastBorough, type BreakfastGuideData } from "@/lib/breakfast-guide"
import { pageMeta } from "@/lib/page-meta"
import { breakfastGuideDescription, breakfastGuideTitle } from "@/lib/seo-titles"
import { buildArticleSchema, buildHubItemList } from "@/lib/schema"
import { presentGrade } from "@/lib/grade-display"
import { boroughToSlug } from "@/lib/utils"
import { ClaimListingCta } from "@/components/product-ctas"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("healthy-breakfast-nyc")!

export const revalidate = 86400

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`
}

function boroughIn(borough: string): string {
  return borough === "Bronx" ? "the Bronx" : borough
}

function boroughSubject(borough: string): string {
  return borough === "Bronx" ? "The Bronx" : borough
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ""
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
}

function lede(data: BreakfastGuideData): string {
  const first = `${countPhrase(data.earlyOpeners, "listing opens", "listings open")} by 8 AM on weekdays; ${countPhrase(data.gradeA, "holds", "hold")} a current Grade A from the NYC Health Department.`
  const second = data.newestInspectionLabel
    ? `Newest inspection on file: ${data.newestInspectionLabel}.`
    : "No inspection date is stored for these listings."
  return `${first} ${second}`
}

function mostBoroughAnswer(boroughs: BreakfastBorough[]): string {
  const max = boroughs.reduce((highest, borough) => Math.max(highest, borough.gradeA), 0)
  if (max === 0) {
    return "No borough has a published Grade A restaurant that opens by 8 AM on weekdays."
  }
  const leaders = boroughs.filter((borough) => borough.gradeA === max)
  if (leaders.length === 1) {
    const leader = leaders[0]
    return `${boroughSubject(leader.borough)} has the most: ${countPhrase(leader.gradeA, "Grade A restaurant", "Grade A restaurants")} open by 8 AM on weekdays, out of ${countPhrase(leader.earlyOpeners, "early opener", "early openers")} there.`
  }
  return `${joinNames(leaders.map((borough) => boroughSubject(borough.borough)))} are tied for the most, with ${countPhrase(max, "Grade A restaurant", "Grade A restaurants")} that open by 8 AM on weekdays.`
}

function newestStat(date: Date | null): { stat: string; label: string } {
  if (!date) return { stat: "None", label: "Newest inspection" }
  return {
    stat: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date),
    label: `Newest inspection, ${date.getUTCFullYear()}`,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBreakfastGuideData()
  return pageMeta({
    path: `/guides/${guide.slug}`,
    title: breakfastGuideTitle(data.gradeA),
    description: breakfastGuideDescription({ earlyOpeners: data.earlyOpeners, gradeA: data.gradeA }),
    type: "article",
    brand: false,
  })
}

const linkClass = "font-medium text-jade underline underline-offset-2 hover:text-forest"

export default async function HealthyBreakfastGuide() {
  const data = await getBreakfastGuideData()
  const description = breakfastGuideDescription({ earlyOpeners: data.earlyOpeners, gradeA: data.gradeA })
  const gradeExplanation = presentGrade("A").explanation
  const gradeHref = "/guides/nyc-health-grades-explained"
  const faqs: Array<{ question: string; answer: string; answerNode?: ReactNode }> = [
    {
      question: "How many NYC restaurants open by 8 AM hold Grade A?",
      answer: `${countPhrase(data.gradeA, "published restaurant opens", "published restaurants open")} by 8 AM on weekdays and ${data.gradeA === 1 ? "holds" : "hold"} Grade A. ${countPhrase(data.earlyOpeners, "published listing opens", "published listings open")} that early in total.`,
    },
    {
      question: "Which borough has the most Grade A restaurants open by 8 AM?",
      answer: mostBoroughAnswer(data.boroughs),
    },
    {
      question: "What does Grade A mean?",
      answer: `${gradeExplanation} NYC health grades explained (${siteUrl}${gradeHref}) covers how the city scores A, B, and C.`,
      answerNode: (
        <>
          {gradeExplanation}{" "}
          <Link href={gradeHref} className={linkClass}>
            NYC health grades explained
          </Link>{" "}
          covers how the city scores A, B, and C.
        </>
      ),
    },
  ]
  const inspection = newestStat(data.newestInspection)
  const article = {
    "@context": "https://schema.org",
    ...buildArticleSchema({
      title: guide.title,
      slug: guide.slug,
      description,
      publishedDate: guide.publishedDate,
      dateModified: guide.updatedDate,
    }),
  }
  const itemList = data.listed.length > 0
    ? buildHubItemList({
        name: "Grade A restaurants open by 8 AM in NYC",
        description: `${data.listed.length} published Grade A restaurants that open by 8 AM on weekdays, up to 10 per borough.`,
        siteUrl,
        restaurants: data.listed.map((spot) => ({
          name: spot.name,
          slug: spot.slug,
          rating: spot.rating,
          reviews: spot.reviews,
        })),
      })
    : null

  return (
    <GuideLayout guide={guide}>
      <FAQSchema faqs={faqs.map(({ question, answer }) => ({ question, answer }))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      {itemList ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      ) : null}

      <GuideHero
        guide={guide}
        subtitle={lede(data)}
        stats={[
          { stat: data.earlyOpeners.toLocaleString("en-US"), label: "Open by 8 AM on weekdays" },
          { stat: data.gradeA.toLocaleString("en-US"), label: "Grade A among them" },
          inspection,
          { stat: "5", label: "Boroughs" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#by-borough", label: "Grade A breakfast spots by borough" },
            { href: "#what-to-look-for", label: "What to look for" },
            { href: "#faq", label: "Frequently asked questions" },
          ]}
        />

        <section id="by-borough" className="mb-16 scroll-mt-24">
          <h2 className="h2-serif">Grade A breakfast spots by borough</h2>
          <p className="dek mt-4">
            Counts include every published operational restaurant that is open by 8:00 AM every weekday. Open 24 hours counts. A missing weekday does not. Each borough then lists up to 10 Grade A restaurants from that count.{" "}
            <Link href="/healthy-restaurants/whole-foods" className={linkClass}>Whole-foods</Link>,{" "}
            <Link href="/healthy-restaurants/vegan" className={linkClass}>vegan</Link>,{" "}
            <Link href="/healthy-restaurants/vegetarian" className={linkClass}>vegetarian</Link>,{" "}
            <Link href="/healthy-restaurants/gluten-free" className={linkClass}>gluten-free</Link>, and{" "}
            <Link href="/healthy-restaurants/dairy-free" className={linkClass}>dairy-free</Link>{" "}
            tags come first, then rating. The hours, grade, score, and inspection date are the values stored on the listing.
          </p>

          <div className="mt-10 space-y-12">
            {data.boroughs.map((borough) => (
              <section key={borough.borough} aria-labelledby={`breakfast-${boroughToSlug(borough.borough)}`}>
                <h3 id={`breakfast-${boroughToSlug(borough.borough)}`} className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: "var(--color-forest)" }}>
                  <Link href={borough.href} className="underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
                    Healthy restaurants in {boroughIn(borough.borough)}
                  </Link>
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>
                  {countPhrase(borough.earlyOpeners, "listing opens", "listings open")} by 8 AM on weekdays. {countPhrase(borough.gradeA, "holds", "hold")} Grade A.
                </p>
                {borough.shown.length === 0 ? (
                  <p className="mt-4 text-base" style={{ color: "var(--color-text)" }}>
                    {borough.earlyOpeners === 0
                      ? `No published listing in ${boroughIn(borough.borough)} is open by 8 AM on weekdays.`
                      : `None of the early openers in ${boroughIn(borough.borough)} hold Grade A.`}
                  </p>
                ) : (
                  <>
                    <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
                      {borough.shown.length === borough.gradeA
                        ? `All ${countPhrase(borough.gradeA, "Grade A restaurant", "Grade A restaurants")} open by 8 AM on weekdays in ${boroughIn(borough.borough)}.`
                        : `Showing ${borough.shown.length} of ${borough.gradeA.toLocaleString("en-US")} Grade A restaurants. Tags come first, then rating.`}
                    </p>
                    <ul className="mt-3 divide-y" style={{ borderColor: "var(--hairline)" }}>
                      {borough.shown.map((spot) => (
                        <li key={spot.slug} className="flex gap-3 border-b py-4" style={{ borderColor: "var(--hairline)" }}>
                          <span className="plaque shrink-0" data-grade="A" aria-label="NYC Department of Health inspection grade A">
                            <span aria-hidden="true">A</span>
                          </span>
                          <div className="min-w-0">
                            <Link href={`/restaurants/${spot.slug}`} className="font-semibold underline-offset-4 hover:underline" style={{ color: "var(--color-jade)" }}>
                              {spot.name}
                            </Link>
                            <p className="mt-1 text-sm" style={{ color: "var(--color-text)" }} title={spot.weekdayOpenDetail}>
                              {spot.neighborhood ?? "Neighborhood not on file"}
                              {" · "}
                              {spot.weekdayOpenLabel === "Open 24 hours" ? "Open 24 hours" : `Weekdays ${spot.weekdayOpenLabel}`}
                            </p>
                            <p className="mt-1 text-sm tabular" style={{ color: "var(--color-muted)" }}>
                              Grade A
                              {" · "}
                              {spot.inspectionScore != null ? `Score ${spot.inspectionScore}` : "Score not on file"}
                              {" · "}
                              Inspected {spot.inspectionDateLabel}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            ))}
          </div>
          {data.unassignedEarlyOpeners > 0 ? (
            <p className="mt-8 text-sm" style={{ color: "var(--color-muted)" }}>
              {countPhrase(data.unassignedEarlyOpeners, "published early opener has", "published early openers have")} no borough on file and {data.unassignedEarlyOpeners === 1 ? "is" : "are"} not listed under a borough.
              {data.unassignedGradeA > 0 ? ` ${countPhrase(data.unassignedGradeA, "of them holds", "of them hold")} Grade A.` : ""}
            </p>
          ) : null}
        </section>

        <section id="what-to-look-for" className="mb-16 scroll-mt-24">
          <h2 className="h2-serif">What to look for</h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed" style={{ color: "var(--color-text)" }}>
            <p>
              Open by 8:00 AM means the stored hours cover 8:00 AM on Monday, Tuesday, Wednesday, Thursday, and Friday. A restaurant that opens at 6:00 AM and closes at 7:00 AM is not included. Open 24 hours is included.
            </p>
            <p>
              {gradeExplanation} The score and date on each row are the NYC Health Department record matched to that listing.{" "}
              <Link href={gradeHref} className={linkClass}>NYC health grades explained</Link> is the longer account of how A, B, and C are scored.
            </p>
            <p>
              A dietary tag is on a listing only when the restaurant identifies that way or has substantial menu coverage. A restaurant without a tag is not labeled healthy by inference.
            </p>
          </div>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="h2-serif">Frequently asked questions</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answerNode ?? faq.answer}
                isLast={index === faqs.length - 1}
              />
            ))}
          </div>
        </section>

        <p className="text-lg" style={{ color: "var(--color-text)" }}>
          <ClaimListingCta source="breakfast_guide">
            Own a Grade A breakfast spot? Claim your free listing
          </ClaimListingCta>
        </p>
      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
