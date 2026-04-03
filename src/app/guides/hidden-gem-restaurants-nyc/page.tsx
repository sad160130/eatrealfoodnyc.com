import type { Metadata } from "next"
import Link from "next/link"
import FAQSchema from "@/components/faq-schema"
import { getCanonicalUrl } from "@/config/seo"
import { getGuideBySlug } from "@/config/guides"
import GuideLayout from "@/components/guide-layout"
import GuideHero from "@/components/guide-hero"
import GuideTOC from "@/components/guide-toc"
import GuideCTA from "@/components/guide-cta"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const guide = getGuideBySlug("hidden-gem-restaurants-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "What qualifies as a hidden gem in your directory?",
    answer: "A hidden gem is a restaurant with a high customer rating (typically 4.4 stars or above) but a relatively low number of reviews (generally under 200). This combination suggests a restaurant that consistently delivers quality food and service but has not yet gained widespread visibility. Our algorithm weighs both factors along with health inspection performance to identify the strongest candidates.",
  },
  {
    question: "Why would a great restaurant have few reviews?",
    answer: "Several factors contribute. The restaurant may be in a residential neighborhood with less foot traffic. It may cater primarily to a specific ethnic community and not market itself to a broader audience. It may be relatively new and still building its customer base. Or it may simply not have an active social media presence. None of these factors reflect food quality — they reflect marketing and location, which are separate from what happens in the kitchen.",
  },
  {
    question: "How many hidden gems are in each borough?",
    answer: "Queens and Brooklyn have the highest absolute numbers of hidden gems, followed by Manhattan, the Bronx, and Staten Island. However, the Bronx has the highest hidden gem density — meaning the highest percentage of its total restaurants qualify as hidden gems. This makes the Bronx the single best borough for discovery-oriented diners.",
  },
  {
    question: "Are hidden gems safe to eat at?",
    answer: "Hidden gem status is independent of health inspection performance. We include NYC Department of Health inspection grades for every restaurant in our directory, including hidden gems. Many hidden gems have A grades, but we recommend checking the inspection grade before visiting any restaurant. Our guide to NYC health grades explains what each grade means and how inspections work.",
  },
  {
    question: "Do hidden gems stay hidden?",
    answer: "Not always. Some hidden gems eventually gain wider recognition through word-of-mouth, social media, or press coverage, at which point their review count rises and they may no longer meet our hidden gem criteria. This is actually a positive outcome — it means the restaurant is thriving. Our directory updates regularly, so the hidden gems list always reflects current data rather than historical status.",
  },
]

export default function HiddenGemsGuide() {
  return (
    <GuideLayout guide={guide}>
      <FAQSchema faqs={GUIDE_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl },
            datePublished: guide.publishedDate,
            dateModified: new Date().toISOString().split("T")[0],
            mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/guides/${guide.slug}` },
          }),
        }}
      />

      <GuideHero
        guide={guide}
        subtitle="How we identify underrated restaurants in NYC. Our algorithm, criteria, and why low review counts are sometimes a very good sign."
        stats={[
          { label: "Hidden gems", stat: "984" },
          { label: "Avg rating", stat: "4.6/5" },
          { label: "Avg reviews", stat: "<200" },
          { label: "All 5 boroughs", stat: "Yes" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#what-is-a-hidden-gem", label: "What is a hidden gem?" },
            { href: "#why-low-reviews-are-good", label: "Why low reviews are good" },
            { href: "#our-algorithm", label: "Our algorithm" },
            { href: "#where-to-find-them", label: "Where to find them" },
            { href: "#how-to-evaluate", label: "How to evaluate" },
            { href: "#hidden-gem-health-grades", label: "Health grades" },
            { href: "#examples-by-diet", label: "Examples by diet" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="what-is-a-hidden-gem" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What is a hidden gem?
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            In our directory, a hidden gem is a restaurant that delivers exceptional quality — measured by customer ratings — but has not yet gained widespread visibility — measured by review count. Specifically, we look for restaurants with ratings of 4.4 stars or higher and fewer than 200 total reviews across major review platforms. This combination identifies places that are genuinely loved by the people who know about them but remain undiscovered by the broader public.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The hidden gem concept matters because review platforms have an inherent bias toward visibility. Restaurants in high-traffic locations, restaurants with active social media marketing, and restaurants that have received press coverage accumulate reviews rapidly. A restaurant in a residential corner of the Bronx may serve the best lamb chops in the city, but if only neighborhood regulars know about it, the review count stays low. Low visibility does not mean low quality — and in many cases, it means the opposite.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Our directory currently identifies 984 hidden gems across all five NYC boroughs. These restaurants have an average rating of 4.6 out of 5 — significantly higher than the directory-wide average of 4.2. They span every cuisine and dietary category, from{" "}
            <Link href="/search?hidden_gem=true" className="font-semibold text-jade hover:text-forest">
              vegan hidden gems
            </Link>{" "}
            to halal spots to family-run Italian trattorias. The common denominator is not what they cook but the quality with which they cook it.
          </p>
        </section>

        <section id="why-low-reviews-are-good" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Why low review counts can be a good sign
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            This sounds counterintuitive, so let us explain the data. Restaurants with very high review counts (1,000+) have average ratings of about 4.0 to 4.2 stars. Restaurants with moderate counts (200-999) average about 4.1 to 4.3. But restaurants with fewer than 200 reviews that still manage to maintain a 4.4+ average are doing something special: every single customer matters, and the consistent positive response suggests genuine quality rather than hype or volume.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            High-review-count restaurants face a statistical phenomenon: regression to the mean. As a restaurant becomes popular and serves more diverse customers — tourists, one-time visitors, people with different expectations — its average rating naturally drifts toward the middle. A locally beloved hidden gem, by contrast, serves a self-selected audience of people who sought it out deliberately. These are often repeat customers who know the menu, appreciate the style, and rate accordingly.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            There&apos;s also a quality-of-service argument. A restaurant serving 30 covers a night can deliver more personal, consistent service than one serving 300. The chef can pay closer attention to each dish. The staff knows regulars by name. Ingredients may be sourced more carefully because volumes are lower. These advantages do not guarantee superiority, but they create conditions where excellence is more sustainable.
          </p>
        </section>

        <section id="our-algorithm" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Our hidden gem algorithm
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Identifying hidden gems requires balancing two opposing signals: high quality (measured by ratings) and low visibility (measured by review count). Our algorithm uses a threshold-based approach with additional quality filters to minimize false positives — restaurants that appear to be hidden gems but are actually just new, temporarily inflated, or operating in a niche category.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The primary criteria are straightforward: a minimum rating of 4.4 stars and a maximum review count of 200. But we add several filters on top of this baseline. First, the restaurant must have been open for at least six months — this eliminates the &quot;novelty bump&quot; that new restaurants often receive. Second, the restaurant must have a minimum number of reviews (we use 10 as the floor) to ensure the rating is based on a meaningful sample size rather than a handful of friends-and-family reviews.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            We also incorporate NYC health inspection data as a quality signal. A restaurant that maintains high customer ratings while also performing well on health inspections is demonstrating quality across multiple dimensions. Restaurants with pending violations or grade-pending status are flagged but not automatically excluded, since inspection timing can be irregular. The algorithm is rerun regularly to account for restaurants that gain popularity (and thus graduate out of hidden gem status) or whose ratings change.
          </p>
        </section>

        <section id="where-to-find-them" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Where to find hidden gems
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Hidden gems are not evenly distributed across NYC. They cluster in specific types of neighborhoods, and understanding the pattern helps you find them even without our directory. The highest concentrations are in residential neighborhoods one or two subway stops away from major commercial corridors. Think Kingsbridge rather than Fordham, Sunnyside rather than Long Island City, Bay Ridge rather than downtown Brooklyn.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Borough-wise, the Bronx has the highest hidden gem density — the highest percentage of its total restaurants that qualify. Queens has the highest absolute count. Brooklyn and Manhattan have fewer as a proportion because their restaurant scenes are more thoroughly covered by food media and review culture. Staten Island has a small but notable collection of hidden gems, particularly along the Sri Lankan restaurant strip on Victory Boulevard and in the Italian restaurants of the South Shore.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Immigrant neighborhoods are consistently the richest hunting grounds. When a restaurant primarily serves a specific ethnic community, it often does not invest in English-language marketing, social media, or review platform management. The food, however, is authentic and refined by the standards of its home cuisine. These are the restaurants where you walk in and are the only person not speaking the kitchen&apos;s language — and the food is spectacular. Explore the{" "}
            <Link href="/map" className="font-semibold text-jade hover:text-forest">
              map view
            </Link>{" "}
            to see hidden gem clusters geographically, or browse by neighborhood using our{" "}
            <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">
              comparison tool
            </Link>.
          </p>
        </section>

        <section id="how-to-evaluate" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How to evaluate a hidden gem
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Finding a hidden gem is one thing; deciding whether it&apos;s worth a visit is another. With fewer reviews to guide you, evaluating a hidden gem requires reading reviews more carefully rather than simply counting stars. Look for specifics: do multiple reviewers mention the same standout dish? Do they comment on freshness of ingredients? Do repeat visitors note consistency over time? These qualitative signals are more valuable than the aggregate rating when the sample size is small.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Physical cues matter too. A hidden gem with a line at lunch in a residential neighborhood is a very strong signal — locals who have dozens of options are choosing to wait for this particular restaurant. A clean, well-maintained space (even a modest one) suggests the owner cares about the details. Hand-written menus or menus in a language other than English are not red flags; they&apos;re often indicators of authenticity and low-overhead operations that keep prices down and food quality up.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Finally, check the{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              health inspection grade
            </Link>. A hidden gem with an A grade has been independently verified as meeting NYC&apos;s food safety standards. This does not guarantee great food, but it provides a baseline of kitchen competence and hygiene that you should always verify, especially at lower-profile restaurants that may receive less scrutiny from the dining public.
          </p>
        </section>

        <section id="hidden-gem-health-grades" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Hidden gems and health grades
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            One common concern about lesser-known restaurants is food safety. If a restaurant flies under the radar of food media, does it also fly under the radar of health inspectors? The answer is no. NYC&apos;s Department of Health and Mental Hygiene inspects every restaurant that serves food to the public, regardless of size, visibility, or review count. Hidden gems receive the same inspections on the same schedule as high-profile establishments.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            In fact, our data shows that hidden gems perform slightly better on health inspections than the directory average. The average violation score (lower is better) for hidden gems is about 10% below the overall average. This may be because smaller, owner-operated restaurants — which comprise a large portion of hidden gems — tend to have tighter kitchen control and more personal accountability than larger, high-volume operations.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            That said, we always recommend checking a restaurant&apos;s current grade before visiting, especially for first-time visits. Our directory includes the most recent inspection grade and date for every restaurant, so you can make informed decisions. If a restaurant has a grade pending or a recent B or C, that information is visible on the listing page. Combine this with our{" "}
            <Link href="/guides/best-healthy-neighborhoods-nyc" className="font-semibold text-jade hover:text-forest">
              neighborhood rankings
            </Link>{" "}
            to understand the broader food safety context of the area you&apos;re visiting.
          </p>
        </section>

        <section id="examples-by-diet" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Hidden gems by dietary category
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Hidden gems exist across every dietary category in our directory. For vegan diners, some of the most exciting hidden gems are in outer-borough neighborhoods where plant-based cooking is a cultural tradition rather than a trend — West African restaurants in the Bronx, South Indian vegetarian spots in Flushing, and Ethiopian restaurants in multiple boroughs all have standout hidden gems serving food that happens to be vegan without labeling it as such.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Halal hidden gems are abundant in Queens and Brooklyn, where immigrant communities have established restaurants that serve their neighborhoods with pride and precision. Kosher hidden gems tend to cluster in specific Brooklyn neighborhoods. Gluten-free hidden gems are rarer but exist, particularly in neighborhoods with strong Thai, Vietnamese, and Mexican restaurant scenes where naturally GF dishes are the default rather than the exception.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            To browse hidden gems filtered by your specific dietary need, use the{" "}
            <Link href="/search?hidden_gem=true" className="font-semibold text-jade hover:text-forest">
              hidden gem search filter
            </Link>. You can combine it with any dietary category, borough, neighborhood, or health grade filter to find exactly the type of undiscovered restaurant you&apos;re looking for. The{" "}
            <Link href="/near-me" className="font-semibold text-jade hover:text-forest">
              near-me feature
            </Link>{" "}
            is particularly useful for finding hidden gems in your immediate vicinity — you might be surprised what&apos;s been hiding a few blocks from home.
          </p>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {GUIDE_FAQS.map((faq, i) => (
              <div key={i} className={`border-b border-gray-100 ${i === GUIDE_FAQS.length - 1 ? "border-b-0" : ""}`}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 hover:bg-gray-50">
                    <span className="pr-4 text-base font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                      {faq.question}
                    </span>
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-sage text-sage group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-base leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Discover NYC's hidden gems"
          body="Browse 984 hidden gem restaurants across all five boroughs. High ratings, low review counts, and waiting to be discovered by you."
          primaryLabel="Browse hidden gems →"
          primaryHref="/search?hidden_gem=true"
          secondaryLabel="Near me"
          secondaryHref="/near-me"
        />
      </div>
    </GuideLayout>
  )
}
