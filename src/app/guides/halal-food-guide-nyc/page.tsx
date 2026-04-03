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
const guide = getGuideBySlug("halal-food-guide-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "What does halal mean in the context of NYC restaurants?",
    answer: "Halal refers to food that is permissible under Islamic dietary law. In NYC restaurants, this typically means meat that has been slaughtered according to Islamic guidelines, no pork or pork-derived ingredients, and no alcohol used in cooking. Many NYC halal restaurants also avoid cross-contamination between halal and non-halal items.",
  },
  {
    question: "How can I verify if a restaurant is truly halal-certified?",
    answer: "Look for certification from recognized bodies such as the Islamic Food and Nutrition Council of America (IFANCA), the Islamic Services of America (ISA), or local mosque-affiliated certifiers. Many NYC restaurants display their halal certification prominently near the entrance or register. You can also ask to see their certificate, which should include an expiration date and the certifying organization.",
  },
  {
    question: "Are halal restaurants in NYC more expensive than non-halal options?",
    answer: "Not necessarily. While certified halal meat can cost more at the wholesale level, NYC has an enormous range of halal dining options from $5 street cart plates to upscale restaurants charging $40+ per entree. Queens and the Bronx tend to offer the most affordable halal options, while Manhattan fine-dining halal restaurants command higher prices.",
  },
  {
    question: "Which NYC borough has the most halal restaurants?",
    answer: "Queens leads NYC in halal restaurant density, particularly in neighborhoods like Jackson Heights, Astoria, and Jamaica. Brooklyn follows closely with strong halal scenes in Bay Ridge, Midwood, and Flatbush. Manhattan has a high concentration along certain corridors, especially in Midtown around the famous halal carts.",
  },
  {
    question: "Can halal food also be healthy?",
    answer: "Absolutely. Halal food encompasses every cuisine and cooking style — it simply refers to how the food is sourced and prepared according to Islamic law. Many halal restaurants in NYC specialize in Mediterranean, Middle Eastern, and South Asian cuisines that emphasize grilled proteins, fresh vegetables, whole grains, and legumes. Our directory lets you filter for halal restaurants that also meet other dietary needs like low-calorie or whole-foods focused.",
  },
  {
    question: "Is halal the same as kosher?",
    answer: "While halal and kosher share some similarities — both prohibit pork and require specific slaughter methods — they differ in important ways. Kosher law prohibits mixing meat and dairy, requires separate kitchen equipment, and has specific rules about shellfish. Halal law prohibits alcohol but does not restrict mixing meat and dairy. Some items are acceptable under one system but not the other, so the two are not interchangeable.",
  },
]

export default function HalalFoodGuide() {
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
        subtitle="Where to find the best halal restaurants in NYC, which neighborhoods have the highest concentration, and what to know about halal certification."
        stats={[
          { label: "Halal restaurants", stat: "524" },
          { label: "All 5 boroughs", stat: "5" },
          { label: "Certified + self-identified", stat: "Mixed" },
          { label: "Health graded", stat: "Yes" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#what-is-halal", label: "What is halal?" },
            { href: "#nyc-halal-scene", label: "The NYC halal scene" },
            { href: "#best-neighborhoods", label: "Best neighborhoods" },
            { href: "#cuisines", label: "Cuisines to explore" },
            { href: "#certification", label: "Halal certification" },
            { href: "#halal-vs-kosher", label: "Halal vs. kosher" },
            { href: "#price-guide", label: "Price guide" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="what-is-halal" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What is halal?
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Halal is an Arabic word meaning &quot;permissible&quot; and refers to food and drink that adheres to Islamic dietary law as defined in the Quran. For meat to be considered halal, the animal must be healthy at the time of slaughter, a prayer must be spoken, and the blood must be fully drained. Pork and its by-products are strictly prohibited, as is any food prepared with alcohol.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Beyond the slaughter method, halal principles extend to the entire supply chain. Ingredients must be free from non-halal additives — this includes certain emulsifiers, gelatin derived from pork, and flavorings that contain alcohol. For NYC diners, understanding these basics helps when evaluating whether a restaurant genuinely meets halal standards or is simply using the label for marketing purposes.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            It&apos;s worth noting that halal is not a cuisine — it&apos;s a preparation standard. Halal restaurants in NYC serve everything from Bangladeshi biryanis to Turkish kebabs to West African jollof rice. The common thread is the sourcing and handling of ingredients, not the flavors on the plate. Our directory tracks{" "}
            <Link href="/healthy-restaurants/halal" className="font-semibold text-jade hover:text-forest">
              over 500 halal-friendly restaurants
            </Link>{" "}
            across every type of cuisine imaginable.
          </p>
        </section>

        <section id="nyc-halal-scene" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            The NYC halal scene
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City is home to one of the largest and most diverse Muslim populations in the United States, and the halal food scene reflects that diversity. From the iconic halal carts that line Midtown Manhattan to sit-down restaurants in every borough, halal dining in NYC has evolved far beyond the chicken-over-rice stereotype. The city&apos;s halal restaurants now span fine dining, fast casual, and everything in between.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The growth of halal dining in NYC has been remarkable. What was once a niche market serving primarily Muslim communities has become mainstream, attracting diners of all backgrounds who appreciate the quality and flavor of halal-prepared food. This growth has been driven in part by the increasing awareness that halal standards often align with broader concerns about ethical sourcing and animal welfare.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            NYC&apos;s halal restaurants collectively represent dozens of culinary traditions. You&apos;ll find Yemeni, Egyptian, Pakistani, Bangladeshi, Turkish, Moroccan, Senegalese, Indonesian, and Afghan restaurants — all operating under halal guidelines. This incredible diversity means that eating halal in NYC is not a limitation but an invitation to explore the world&apos;s cuisines. Check the{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC health grades guide
            </Link>{" "}
            to understand how these restaurants perform on city inspections.
          </p>
        </section>

        <section id="best-neighborhoods" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best neighborhoods for halal dining
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/queens/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Queens
            </Link>{" "}
            is the undisputed capital of halal dining in NYC. Jackson Heights alone offers a staggering concentration of Bangladeshi, Pakistani, and Indian halal restaurants along a few-block stretch of 73rd Street and Roosevelt Avenue. Astoria adds Greek-halal and Egyptian options, while Jamaica and Richmond Hill bring Caribbean-Muslim and Indo-Guyanese halal cuisine to the mix.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Brooklyn&apos;s Bay Ridge neighborhood is home to a thriving Arab-American community, and its halal restaurant scene reflects deep roots in Levantine and Egyptian cooking. Fifth Avenue between 65th and 85th Streets is sometimes called &quot;Little Palestine,&quot; and the halal options here range from casual shawarma shops to upscale Lebanese restaurants. Midwood and Flatbush add Uzbek and West African halal options respectively.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The{" "}
            <Link href="/nyc/bronx/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Bronx
            </Link>{" "}
            is an underrated halal destination. Neighborhoods like Fordham, Morris Park, and Parkchester have growing West African and Bangladeshi halal restaurant scenes. Prices in the Bronx tend to be the most affordable in the city, making it an excellent borough for budget-conscious halal diners. Manhattan&apos;s halal options are more scattered but include notable clusters in the East Village, Murray Hill, and of course the famous Midtown cart corridor.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Use our{" "}
            <Link href="/nyc/compare" className="font-semibold text-jade hover:text-forest">
              neighborhood comparison tool
            </Link>{" "}
            to see how these areas stack up on restaurant density, average ratings, and health inspection scores.
          </p>
        </section>

        <section id="cuisines" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Cuisines to explore
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            South Asian halal restaurants dominate the NYC landscape in sheer numbers. Pakistani and Bangladeshi restaurants serve hearty biryanis, tandoori meats, and curry dishes that are often remarkably affordable. Indian halal restaurants — distinct from vegetarian Indian spots — offer kebabs, nihari, and haleem that represent the Mughlai culinary tradition. For health-conscious diners, look for tandoori-grilled options and dal-based dishes that pack protein without excessive oil.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Middle Eastern and Mediterranean halal cuisine is arguably the most health-friendly category. Grilled chicken and lamb, fresh salads, hummus, baba ghanoush, tabbouleh, and whole-grain pita are staples. Turkish halal restaurants offer excellent grilled meats and vegetable-forward mezes, while Lebanese spots excel at fresh, herb-heavy preparations. Egyptian koshari — a vegan street food of lentils, rice, and pasta — is naturally halal and extremely budget-friendly.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            West African halal cuisine is one of NYC&apos;s best-kept secrets. Senegalese restaurants serve thieboudienne (fish and rice) and yassa poulet (lemony grilled chicken) that are both flavorful and nutritious. Nigerian suya — grilled, spiced meat skewers — is a high-protein snack found at several Bronx and Brooklyn halal spots. These cuisines emphasize whole ingredients, slow cooking, and bold spice blends that make healthy eating genuinely exciting.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Afghan cuisine deserves special mention. NYC&apos;s Afghan halal restaurants, concentrated in Flushing and parts of Brooklyn, serve outstanding kabuli pulao (lamb and rice), mantu (dumplings), and bolani (stuffed flatbread). The emphasis on slow-cooked meats, fresh herbs, and yogurt-based sauces makes Afghan food a natural fit for health-conscious diners seeking halal options.
          </p>
        </section>

        <section id="certification" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Understanding halal certification
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Halal certification in the United States is not regulated by the federal government, which means there is no single standard. Instead, private certification bodies inspect restaurants and food suppliers to verify compliance with Islamic dietary law. The most recognized national certifiers include the Islamic Food and Nutrition Council of America (IFANCA) and the Islamic Services of America (ISA).
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            In NYC, many restaurants are certified by local mosque-affiliated organizations or community-based certifiers. Some restaurants are owned and operated by observant Muslims who follow halal guidelines without seeking formal third-party certification. This creates a spectrum: on one end, you have restaurants with prominent certification from recognized bodies; on the other, you have establishments that self-identify as halal based on the owner&apos;s personal adherence to Islamic dietary law.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For diners who require strict halal compliance — for example, those who need assurance about the specific slaughter method (zabiha) or who want to verify that no alcohol is used in any sauces or marinades — asking directly is always the best approach. Most NYC halal restaurant owners are happy to discuss their sourcing and preparation methods. Don&apos;t hesitate to ask where they source their meat, whether they use a certified halal supplier, and whether their kitchen handles any non-halal items.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Our directory includes both certified and self-identified halal restaurants. We note this distinction where possible so that diners can make informed decisions based on their own level of observance.
          </p>
        </section>

        <section id="halal-vs-kosher" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Halal vs. kosher: key differences
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Halal and kosher dietary laws share a common Abrahamic origin and overlap in several areas — both prohibit pork, both require specific slaughter methods, and both emphasize the humane treatment of animals. However, the differences are significant enough that the two systems are not interchangeable for observant diners.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The most notable difference involves dairy and meat. Kosher law strictly prohibits mixing meat and dairy products, requiring separate cookware, utensils, and even sinks for each category. Halal law has no such restriction — a halal cheeseburger is perfectly permissible. Another key difference: kosher law prohibits shellfish entirely, while halal law permits most seafood (though there is scholarly debate about certain species like crab and lobster in some Islamic traditions).
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Alcohol is prohibited in halal cooking but is permissible in kosher food preparation — kosher wine is even a ceremonial staple. This matters when evaluating sauces, marinades, and desserts, where wine or liquor might be used as an ingredient. For diners navigating both systems, our{" "}
            <Link href="/guides/kosher-dining-nyc-guide" className="font-semibold text-jade hover:text-forest">
              kosher dining guide
            </Link>{" "}
            offers a complementary perspective on the NYC scene.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            NYC is one of the few cities in the world where halal and kosher restaurants exist in such close proximity, and some neighborhoods — particularly in Brooklyn — have both types within the same block. For diners with friends or family who follow different dietary laws, finding a restaurant that satisfies both groups requires careful planning, and our directory can help with that.
          </p>
        </section>

        <section id="price-guide" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Price guide for halal dining in NYC
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            One of the great advantages of halal dining in NYC is the range of price points available. At the budget end, street carts and counter-service spots in Queens and the Bronx serve complete meals for $6 to $10. A generous chicken-over-rice platter, a lamb gyro, or a plate of biryani can easily feed one person for under $10 in neighborhoods like Jackson Heights or Fordham.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Mid-range halal dining — sit-down restaurants with table service — typically runs $15 to $30 per person in outer boroughs and $20 to $40 in Manhattan. This category includes the majority of NYC&apos;s halal restaurants: Turkish grills, Pakistani buffets, Egyptian full-service spots, and Afghan family restaurants. Many offer lunch specials that bring per-person costs down significantly.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            At the high end, NYC has a growing number of upscale halal restaurants where you can expect to spend $50 or more per person. These include contemporary Middle Eastern restaurants in Manhattan, upscale Turkish steakhouses, and modern South Asian fine-dining concepts. While these represent a small fraction of the overall halal scene, they demonstrate how far halal dining has come in NYC — from utilitarian to aspirational.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For more tips on stretching your budget while eating well, see our guide on{" "}
            <Link href="/guides/how-eat-healthy-nyc-15-dollars" className="font-semibold text-jade hover:text-forest">
              how to eat healthy in NYC for under $15
            </Link>.
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
          heading="Browse every halal restaurant in NYC"
          body="Search 524 halal-friendly restaurants across all five boroughs. Filter by neighborhood, cuisine, health grade, and price range."
          primaryLabel="Browse halal →"
          primaryHref="/healthy-restaurants/halal"
          secondaryLabel="Halal in Queens"
          secondaryHref="/nyc/queens/healthy-restaurants"
        />
      </div>
    </GuideLayout>
  )
}
