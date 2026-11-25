import type { Metadata } from "next"
import Link from "next/link"
import FAQItem from "@/components/faq-item"
import { getCanonicalUrl } from "@/config/seo"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import GuideCTA from "@/components/guide-cta"
import AboutThisData from "@/components/about-this-data"
import YoutubeLongformEmbed from "@/components/youtube-longform-embed"
import { bestItalianLongformVideo } from "@/data/youtube-longform"
import {
  BEST_ITALIAN_DESCRIPTION,
  BEST_ITALIAN_FAQS,
  BEST_ITALIAN_FITS,
  BEST_ITALIAN_HOW_WE_PICKED,
  BEST_ITALIAN_INTRO,
  BEST_ITALIAN_PATH,
  BEST_ITALIAN_RESTAURANTS,
  BEST_ITALIAN_TITLE,
  BEST_ITALIAN_VERIFIED_ON,
  BEST_ITALIAN_VIDEO_CHAPTERS,
  DOHMH_DATASET_ID,
  DOHMH_DATASET_URL,
  articleSchema,
  camisUrl,
  faqPageSchema,
  neighborhoodHref,
  organizationSchema,
  restaurantHref,
} from "@/data/best-italian-restaurants-nyc"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("best-italian-restaurants-nyc")!

export const metadata: Metadata = {
  title: BEST_ITALIAN_TITLE,
  description: BEST_ITALIAN_DESCRIPTION,
  alternates: { canonical: getCanonicalUrl(BEST_ITALIAN_PATH) },
  robots: { index: true, follow: true },
  openGraph: {
    title: BEST_ITALIAN_TITLE,
    description: BEST_ITALIAN_DESCRIPTION,
    type: "article",
    url: `${siteUrl}${BEST_ITALIAN_PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: BEST_ITALIAN_TITLE }],
  },
}

export default function BestItalianRestaurantsNyc() {
  return (
    <GuideLayout guide={guide}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            articleSchema(siteUrl),
            faqPageSchema(),
            organizationSchema(siteUrl),
          ]),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle="A ranked list of 10 currently open Italian restaurants, ordered by official NYC Health Department inspection score, then violation count. Every grade, score, and date was matched to NYC Open Data."
        stats={[
          { label: "Restaurants ranked", stat: "10" },
          { label: "All current grades", stat: "A" },
          { label: "Records verified", stat: BEST_ITALIAN_VERIFIED_ON },
        ]}
        note={`Source: NYC DOHMH Open Data dataset ${DOHMH_DATASET_ID}. Ranking method: lowest inspection score, then fewest violations, then most recent inspection date.`}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            ...(bestItalianLongformVideo
              ? [
                  { href: "#video-walkthrough", label: "Video walkthrough" },
                  { href: "#video-chapters", label: "Video chapters" },
                ]
              : []),
            { href: "#the-list", label: "The top 10" },
            { href: "#how-we-picked-them", label: "How we picked them" },
            { href: "#which-one-fits-whom", label: "Which one fits whom" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="what-this-list-is" className="mb-16 scroll-mt-24">
          <p className="text-lg leading-relaxed text-gray-700">{BEST_ITALIAN_INTRO}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-700">
            Official letter grades and scores come from the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Department of Health and Mental Hygiene Restaurant Inspection Results
            </a>{" "}
            (dataset {DOHMH_DATASET_ID}). For the rules behind A, B, C, and Grade Pending, see{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC restaurant grades
            </Link>{" "}
            and{" "}
            <Link href="/guides/nyc-restaurant-inspection-process" className="font-semibold text-jade hover:text-forest">
              how NYC restaurant inspections work
            </Link>
            . You can also browse all{" "}
            <Link href="/healthy-restaurants/grade-a" className="font-semibold text-jade hover:text-forest">
              Grade A restaurants in our directory
            </Link>
            , or start from the{" "}
            <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>
            ,{" "}
            <Link href="/nyc/brooklyn/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Brooklyn
            </Link>
            , or{" "}
            <Link href="/nyc/staten-island/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Staten Island
            </Link>{" "}
            hubs. The same inspection ranking for pizza is{" "}
            <Link href="/guides/best-pizza-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              best pizza restaurants in NYC
            </Link>
            .
          </p>
        </section>

        <YoutubeLongformEmbed video={bestItalianLongformVideo} />

        {bestItalianLongformVideo ? (
          <section id="video-chapters" className="mb-16 scroll-mt-24">
            <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              Video chapters
            </h2>
            <p className="text-base leading-relaxed text-gray-700">
              Chapter titles and timestamps are copied from the YouTube description of{" "}
              <a
                href={bestItalianLongformVideo.watchUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="font-semibold text-jade hover:text-forest"
              >
                {bestItalianLongformVideo.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              . Each link jumps to the matching section of this guide. The ranking in the video is the same sanitary-score order as the list below.
            </p>
            <ol className="mt-6 space-y-2 text-base leading-relaxed text-gray-700" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {BEST_ITALIAN_VIDEO_CHAPTERS.map((chapter) => (
                <li key={chapter.timestamp}>
                  <span className="tabular">{chapter.timestamp}</span>
                  {chapter.href ? (
                    <>
                      {" "}
                      <a href={chapter.href} className="font-semibold text-jade hover:text-forest">
                        {chapter.label}
                      </a>
                    </>
                  ) : (
                    <> {chapter.label}</>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section id="the-list" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            The top 10 ranked Italian restaurants
          </h2>
          <ol className="space-y-14">
            {BEST_ITALIAN_RESTAURANTS.map((restaurant) => (
              <li key={restaurant.slug} id={restaurant.slug} className="scroll-mt-24">
                <p className="eyebrow">
                  #{restaurant.rank} · Grade {restaurant.grade} · {restaurant.score} points · {restaurant.violationCount}{" "}
                  {restaurant.violationCount === 1 ? "violation" : "violations"}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                  <Link href={restaurantHref(restaurant.slug)} className="hover:text-jade">
                    {restaurant.name}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-700">{restaurant.honestLine}</p>
                <p className="mt-4 text-base leading-relaxed text-gray-700">{restaurant.body}</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  Official record: Grade {restaurant.grade}, score {restaurant.score}, {restaurant.violationCount}{" "}
                  {restaurant.violationCount === 1 ? "violation" : "violations"}, {restaurant.inspectionDateLabel} (
                  {restaurant.inspectionType}). Address: {restaurant.address}. CAMIS {restaurant.camis}
                  {restaurant.officialDba !== restaurant.name.toUpperCase()
                    ? `, filed as ${restaurant.officialDba}`
                    : ""}
                  .{" "}
                  <a href={camisUrl(restaurant.camis)} className="font-semibold text-jade hover:text-forest">
                    City restaurant detail
                  </a>
                  . See the{" "}
                  <Link href={restaurantHref(restaurant.slug)} className="font-semibold text-jade hover:text-forest">
                    Eat Real Food NYC listing
                  </Link>{" "}
                  and other{" "}
                  <Link
                    href={neighborhoodHref(restaurant.borough, restaurant.neighborhood)}
                    className="font-semibold text-jade hover:text-forest"
                  >
                    healthy restaurants in {restaurant.neighborhood}
                  </Link>
                  .
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="how-we-picked-them" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we picked them
          </h2>
          {BEST_ITALIAN_HOW_WE_PICKED.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-5 text-base leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
          <p className="text-base leading-relaxed text-gray-700">
            The underlying city file is public at the{" "}
            <a href={DOHMH_DATASET_URL} className="font-semibold text-jade hover:text-forest">
              NYC Open Data dataset {DOHMH_DATASET_ID}
            </a>
            . Our method notes live on{" "}
            <Link href="/about/our-data" className="font-semibold text-jade hover:text-forest">
              About our data
            </Link>
            , and the citywide rates are in the{" "}
            <Link href="/data/nyc-restaurant-health-grade-report" className="font-semibold text-jade hover:text-forest">
              NYC restaurant health grade report
            </Link>
            . Neighborhood context is in the{" "}
            <Link href="/guides/best-healthy-neighborhoods-nyc" className="font-semibold text-jade hover:text-forest">
              best healthy neighborhoods guide
            </Link>{" "}
            and the{" "}
            <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">
              neighborhood comparison
            </Link>
            . The{" "}
            <Link href="/map" className="font-semibold text-jade hover:text-forest">
              map
            </Link>{" "}
            plots published listings. Vendors who need a weekly list of Grade Pending and high-score kitchens can see{" "}
            <Link href="/data" className="font-semibold text-jade hover:text-forest">
              Compliance Weekly
            </Link>
            . Group orders are described on{" "}
            <Link href="/catering" className="font-semibold text-jade hover:text-forest">
              the catering page
            </Link>
            .
          </p>
        </section>

        <section id="which-one-fits-whom" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Which one fits whom
          </h2>
          <p className="mb-8 text-base leading-relaxed text-gray-700">
            Use this section to match a kitchen to a location or a practical need. It does not change the ranking, and it does not add claims we cannot verify from the listing or the official inspection.
          </p>
          {BEST_ITALIAN_FITS.map((group) => (
            <div key={group.heading} className="mb-8">
              <h3 className="text-xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                {group.heading}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-gray-700">{group.body}</p>
              <p className="mt-2 text-sm">
                {group.slugs.map((slug, index) => {
                  const restaurant = BEST_ITALIAN_RESTAURANTS.find((row) => row.slug === slug)!
                  return (
                    <span key={slug}>
                      {index > 0 ? " · " : ""}
                      <Link href={restaurantHref(slug)} className="font-semibold text-jade hover:text-forest">
                        {restaurant.name}
                      </Link>
                    </span>
                  )
                })}
              </p>
            </div>
          ))}
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {BEST_ITALIAN_FAQS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isLast={index === BEST_ITALIAN_FAQS.length - 1}
              />
            ))}
          </div>
        </section>

        <GuideCTA
          heading="See every Grade A listing in the directory"
          body="This top 10 is a verified inspection ranking of Italian restaurants. The directory also has Grade A listings across all five boroughs, plus neighborhood and dietary hubs."
          primaryLabel="Browse Grade A restaurants"
          primaryHref="/healthy-restaurants/grade-a"
          secondaryLabel="Compare neighborhoods"
          secondaryHref="/nyc/compare"
        />

      </div>
      <AboutThisData variant="guide" />
    </GuideLayout>
  )
}
