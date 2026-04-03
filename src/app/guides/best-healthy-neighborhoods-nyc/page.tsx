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
const guide = getGuideBySlug("best-healthy-neighborhoods-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "How do you rank neighborhoods for healthy dining?",
    answer: "We use a composite score based on four factors: total number of healthy restaurants, average restaurant rating, average NYC health inspection score, and dietary diversity (how many different dietary categories are represented). Neighborhoods are compared within their borough first, then across the city. Data comes from our directory of 8,835 restaurants and live NYC Department of Health inspection records.",
  },
  {
    question: "Which borough has the healthiest restaurants overall?",
    answer: "It depends on the metric. Manhattan has the most dedicated health-focused restaurants and the greatest dietary diversity. Queens has the highest average restaurant rating (4.3 stars) and the best value. Brooklyn balances variety and quality. The Bronx and Staten Island have fewer total options but include standout neighborhoods with excellent health scores. Our compare tool lets you weigh the factors that matter most to you.",
  },
  {
    question: "Are health inspection grades a good proxy for food quality?",
    answer: "Health inspection grades measure sanitation and food safety compliance — not taste, nutrition, or ingredient quality. An A-grade restaurant follows proper food handling, temperature control, and pest management practices. This is important for food safety but tells you nothing about whether the food is nutritious or well-prepared. We recommend using health grades as a minimum safety threshold, not a quality indicator.",
  },
  {
    question: "Why are outer-borough neighborhoods underrated?",
    answer: "Media coverage of NYC dining skews heavily toward Manhattan and parts of Brooklyn, creating a visibility gap. Neighborhoods in Queens, the Bronx, and Staten Island often have excellent restaurants that never receive press attention simply because food writers do not visit them regularly. Our data-driven approach surfaces these neighborhoods based on actual restaurant performance rather than media buzz.",
  },
  {
    question: "How often is the neighborhood data updated?",
    answer: "Restaurant listings and ratings are updated regularly as we receive new data. NYC health inspection grades are sourced from the NYC Department of Health and Mental Hygiene open data feed and reflect the most recent inspection results. Neighborhood rankings are recalculated periodically to account for new restaurant openings, closures, and updated inspection scores.",
  },
]

export default function HealthyNeighborhoodsGuide() {
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
        subtitle="Data-driven rankings of NYC neighborhoods for healthy dining across all five boroughs."
        stats={[
          { label: "Neighborhoods", stat: "116" },
          { label: "Boroughs", stat: "5" },
          { label: "Health scores computed", stat: "Yes" },
          { label: "Live DOHMH data", stat: "Yes" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#how-we-rank", label: "How we rank" },
            { href: "#top-manhattan", label: "Top Manhattan neighborhoods" },
            { href: "#top-brooklyn", label: "Top Brooklyn neighborhoods" },
            { href: "#top-queens", label: "Top Queens neighborhoods" },
            { href: "#bronx-staten-island", label: "Bronx & Staten Island" },
            { href: "#dietary-diversity", label: "Dietary diversity" },
            { href: "#hidden-gem-density", label: "Hidden gem density" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="how-we-rank" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How we rank neighborhoods
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Ranking neighborhoods for healthy dining requires more than just counting restaurants. A neighborhood with 200 restaurants but mediocre health inspection scores and limited dietary options is not necessarily better than a neighborhood with 40 excellent, diverse, and well-inspected establishments. Our ranking methodology accounts for this complexity by using a composite score built from four weighted factors.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The four factors are: restaurant density (number of healthy restaurants per square mile), average customer rating (based on aggregated review data), average{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC health inspection performance
            </Link>{" "}
            (lower violation scores are better), and dietary diversity (how many of the 12 dietary categories are represented). Each factor is normalized on a 0-to-100 scale, and the final score is a weighted average that emphasizes rating and health inspection performance slightly more than raw density.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            This approach reveals some surprises. Neighborhoods that are famous for dining — Times Square, for example — often score lower than expected because high volume does not equal high quality. Meanwhile, residential neighborhoods with smaller but carefully curated restaurant scenes can score higher than their reputations suggest. Use our{" "}
            <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">
              neighborhood comparison tool
            </Link>{" "}
            to explore the data yourself and adjust the weighting based on what matters most to you.
          </p>
        </section>

        <section id="top-manhattan" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Top Manhattan neighborhoods
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>{" "}
            dominates in sheer density of healthy dining options, and several neighborhoods stand out. The West Village scores consistently high across all four metrics: it has a strong concentration of health-conscious restaurants, excellent average ratings, strong inspection scores, and representation across nearly all 12 dietary categories. The neighborhood&apos;s walkability and concentration of independently owned restaurants contribute to its top ranking.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The Upper West Side is another Manhattan standout, particularly for families and everyday dining. The neighborhood has a mature restaurant scene that balances trendy newcomers with decades-old establishments, and its health inspection average is among the best in the borough. Dietary diversity is excellent, with strong vegan, gluten-free, and kosher representation reflecting the neighborhood&apos;s demographics.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Somewhat surprisingly, the Lower East Side and East Village score highly despite their reputation for nightlife over nutrition. These neighborhoods have seen an influx of health-forward restaurants in recent years — juice bars, plant-based cafes, organic bistros — without losing their existing base of affordable ethnic restaurants. The combination produces both dietary diversity and a wide price range, making these neighborhoods accessible to budget-conscious and high-end diners alike.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Midtown, despite having the highest raw restaurant count, scores lower on average ratings and dietary diversity. The area&apos;s reliance on tourist-oriented and office-lunch-focused restaurants drags down the quality metrics. However, pockets within Midtown — particularly around Koreatown and Murray Hill — offer excellent healthy options that buck the neighborhood&apos;s overall trend.
          </p>
        </section>

        <section id="top-brooklyn" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Top Brooklyn neighborhoods
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/brooklyn/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Brooklyn
            </Link>{" "}
            has emerged as NYC&apos;s most dynamic borough for healthy dining, and several neighborhoods compete for the top spot. Park Slope leads on most metrics, combining a dense concentration of health-conscious restaurants with strong inspection scores and excellent dietary diversity. The neighborhood&apos;s family-oriented demographics have driven demand for restaurants that serve both adults and children healthy, appealing food.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Williamsburg scores highest on dietary diversity, reflecting its role as a laboratory for NYC food trends. The neighborhood was among the first to embrace plant-based dining, grain bowls, and functional food concepts, and its restaurant scene continues to innovate. Vegan, raw-food, and whole-foods categories are particularly well-represented. The main drawback is price — Williamsburg&apos;s healthy restaurants tend to charge Manhattan-level prices.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For value-oriented healthy dining, Brooklyn&apos;s Sunset Park and Bay Ridge neighborhoods deserve attention. Sunset Park&apos;s Chinatown (along 8th Avenue) offers steamed, stir-fried, and soup-based dishes at prices well below the borough average. Bay Ridge&apos;s Middle Eastern restaurant scene provides grilled meats, fresh salads, and hummus-centric meals that are both nutritious and affordable. These neighborhoods may not have the cachet of Williamsburg, but they score well on the metrics that matter.
          </p>
        </section>

        <section id="top-queens" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Top Queens neighborhoods
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/queens/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Queens
            </Link>{" "}
            is the most ethnically diverse county in the United States, and its restaurant scene reflects this. The borough has the highest average restaurant rating in our directory at 4.3 stars, suggesting that competition among its many immigrant-run restaurants drives quality upward. Three neighborhoods stand out consistently in our rankings.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Flushing is a powerhouse. Its massive Chinatown — the largest in NYC — offers an extraordinary range of Chinese regional cuisines, many of which emphasize steaming, braising, and other health-friendly cooking methods. Beyond Chinese food, Flushing has strong Korean, Malaysian, and South Asian restaurant scenes. The neighborhood&apos;s food courts and hawker-style markets make it possible to assemble a varied, nutritious meal from multiple vendors for under $12.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Jackson Heights is the most culinarily diverse neighborhood in the entire city. Within a few blocks, you can find Tibetan momos, Colombian arepas, Indian chaat, Nepali thali, and Mexican tacos — all prepared by cooks from those traditions. The neighborhood&apos;s healthy dining options span multiple dietary categories, and prices are among the lowest in the five boroughs. For sheer variety and value, Jackson Heights is hard to beat.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Astoria earns its spot through consistency. The neighborhood&apos;s restaurant scene is diverse — Greek, Egyptian, Brazilian, Czech, Japanese — and maintains strong average ratings and inspection scores. Astoria also has an advantage in accessibility, with excellent subway connections that make it an easy trip from Manhattan. It&apos;s the Queens neighborhood that most consistently converts first-time visitors into regulars.
          </p>
        </section>

        <section id="bronx-staten-island" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Bronx and Staten Island
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The Bronx and Staten Island are the two boroughs that most often get overlooked in NYC dining coverage, and both have more to offer than their reputations suggest. The Bronx has pockets of excellent healthy dining, particularly along Arthur Avenue (the city&apos;s real Little Italy, where Italian restaurants use higher-quality ingredients than their tourist-oriented counterparts in Manhattan) and in neighborhoods with growing West African and South Asian communities.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Belmont, centered around Arthur Avenue, scores surprisingly well on health inspection metrics and dietary diversity. The neighborhood&apos;s Italian restaurants emphasize fresh pasta, grilled seafood, and vegetable antipasti — a Mediterranean approach that aligns naturally with healthy eating principles. Prices are moderate, and the quality of ingredients noticeably exceeds what you&apos;ll find at comparably priced Manhattan Italian restaurants.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Staten Island&apos;s healthy dining scene is the smallest of the five boroughs but is growing. The St. George and Tompkinsville neighborhoods near the ferry terminal have seen an influx of new restaurants, including several health-focused concepts. The Sri Lankan restaurant scene along Victory Boulevard is a hidden gem for diners seeking naturally healthy, vegetable-forward cuisine at very affordable prices. For more on lesser-known finds, check our{" "}
            <Link href="/guides/hidden-gem-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              hidden gems guide
            </Link>.
          </p>
        </section>

        <section id="dietary-diversity" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Dietary diversity by neighborhood
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Dietary diversity measures how many of the 12 dietary categories in our directory — vegan, vegetarian, gluten-free, keto, paleo, halal, kosher, dairy-free, nut-free, raw-food, whole-foods, and low-calorie — are represented in a given neighborhood. A neighborhood that covers all 12 categories offers something for virtually every diner, regardless of their dietary requirements. This metric is especially important for groups dining together where members have different needs.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Manhattan&apos;s West Village, Greenwich Village, and Upper West Side score highest on dietary diversity, each covering 11 or 12 of the 12 categories. Brooklyn&apos;s Williamsburg and Park Slope are close behind. In Queens, Jackson Heights scores well due to its sheer variety of cuisines, though some niche categories like raw-food and keto are underrepresented.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Neighborhoods with lower dietary diversity are not necessarily worse for healthy dining — they may simply specialize. Bay Ridge excels at halal. Williamsburg South is strong on kosher. Flushing dominates whole-foods and low-calorie options through its focus on steamed and braised cooking. The{" "}
            <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">
              compare tool
            </Link>{" "}
            lets you filter neighborhoods by specific dietary categories to find the best match for your needs.
          </p>
        </section>

        <section id="hidden-gem-density" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Hidden gem density
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Hidden gem density — the percentage of a neighborhood&apos;s restaurants that qualify as hidden gems (high ratings, low review counts) — reveals which areas are ripe for culinary discovery. Neighborhoods with high hidden gem density tend to be residential, ethnically diverse, and underserved by food media. They represent the best opportunities for adventurous diners who want to find great food before everyone else does.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The Bronx leads all boroughs in hidden gem density. Neighborhoods like Kingsbridge, Morris Park, and Pelham Bay have restaurants that consistently earn 4.5+ stars from their (relatively small) customer base but remain virtually unknown outside their immediate communities. Queens neighborhoods like Elmhurst, Corona, and Rego Park also score high on this metric, with immigrant-run restaurants that deliver exceptional quality without the marketing machinery to attract citywide attention.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Manhattan and well-trafficked parts of Brooklyn have the lowest hidden gem density, which makes sense — any good restaurant in the West Village or Williamsburg is quickly discovered, reviewed, and publicized. This doesn&apos;t mean there are no hidden gems in these areas, just fewer of them as a proportion of total restaurants. For a deep dive into how we identify hidden gems and why they tend to be excellent, see our{" "}
            <Link href="/guides/hidden-gem-restaurants-nyc" className="font-semibold text-jade hover:text-forest">
              hidden gem restaurant guide
            </Link>. You can also explore the{" "}
            <Link href="/map" className="font-semibold text-jade hover:text-forest">
              full map view
            </Link>{" "}
            to visualize hidden gem distribution across the city.
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
          heading="Compare every NYC neighborhood"
          body="Use our interactive comparison tool to rank 116 neighborhoods across all five boroughs by the metrics that matter to you: restaurant density, ratings, health scores, and dietary diversity."
          primaryLabel="Compare neighborhoods →"
          primaryHref="/nyc/compare"
          secondaryLabel="View map"
          secondaryHref="/map"
        />
      </div>
    </GuideLayout>
  )
}
