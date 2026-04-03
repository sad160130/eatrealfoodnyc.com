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
const guide = getGuideBySlug("kosher-dining-nyc-guide")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "What does kosher mean in practical terms for a restaurant?",
    answer: "A kosher restaurant follows Jewish dietary law (kashrut). In practical terms, this means: no pork or shellfish, no mixing of meat and dairy (including separate cookware and dishes for each), only meat from animals slaughtered by a trained shochet according to specific guidelines, and supervision by a rabbi or kosher certification agency. Kosher restaurants are typically categorized as meat (fleishig), dairy (milchig), or pareve (neither meat nor dairy).",
  },
  {
    question: "How do I know if a restaurant is genuinely kosher-certified?",
    answer: "Look for a kosher certification symbol (hechsher) displayed prominently, usually near the entrance or on the menu. The most common certifications in NYC come from the Orthodox Union (OU), OK Kosher, Star-K, and local rabbinical councils. Each has a distinct symbol. You can also check with the certifying agency directly, as most maintain searchable databases of currently certified establishments.",
  },
  {
    question: "Are kosher restaurants more expensive?",
    answer: "Generally yes, though the premium varies. Kosher meat is more expensive to produce due to the specialized slaughter and inspection process, and kosher certification itself involves ongoing fees for rabbinical supervision. However, kosher dairy and pareve restaurants can be quite affordable. Pizza shops, falafel stands, and bakeries operating under kosher certification often have prices comparable to their non-kosher counterparts.",
  },
  {
    question: "Can I eat at a kosher restaurant if I am not Jewish?",
    answer: "Absolutely. Kosher restaurants welcome all diners. Many non-Jewish New Yorkers eat at kosher restaurants regularly because the food is excellent, the dietary standards provide a level of quality assurance, and some of NYC's best restaurants in certain cuisines happen to be kosher. You do not need to follow any particular customs to dine at a kosher restaurant.",
  },
  {
    question: "What happens at a kosher restaurant on Shabbat?",
    answer: "Most kosher restaurants close for Shabbat, which runs from Friday evening (approximately sunset) through Saturday evening. This means many kosher restaurants are closed Friday night and all day Saturday. Some reopen Saturday night after sundown. A few kosher restaurants in tourist-heavy areas remain open on Shabbat but may operate under different supervision arrangements. Always check hours before visiting on Fridays or Saturdays.",
  },
  {
    question: "Is kosher food healthy?",
    answer: "Kosher standards govern food sourcing and preparation according to religious law — they do not specifically address nutrition. A kosher restaurant can serve both healthy and unhealthy food. However, certain kosher principles align with healthy eating: the separation of meat and dairy can reduce overall calorie intake per meal, the prohibition on certain animal fats removes some high-cholesterol ingredients, and the emphasis on freshness in kosher food handling supports quality ingredients.",
  },
]

export default function KosherGuide() {
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
        subtitle="Where to find kosher restaurants across NYC, how certification works, and which neighborhoods have the strongest kosher scenes."
        stats={[
          { label: "Kosher restaurants", stat: "195" },
          { label: "Manhattan + Brooklyn", stat: "Top boroughs" },
          { label: "Certified + observant", stat: "Mixed" },
          { label: "Health graded", stat: "Yes" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#what-is-kosher", label: "What is kosher?" },
            { href: "#nyc-kosher-scene", label: "NYC's kosher scene" },
            { href: "#best-neighborhoods", label: "Best neighborhoods" },
            { href: "#certification-bodies", label: "Certification bodies" },
            { href: "#cuisines", label: "Cuisines to explore" },
            { href: "#kosher-vs-halal", label: "Kosher vs. halal" },
            { href: "#price-guide", label: "Price guide" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="what-is-kosher" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What is kosher?
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Kosher (from the Hebrew &quot;kasher,&quot; meaning fit or proper) refers to food that conforms to the dietary regulations of Jewish law, known as kashrut. These laws are derived from the Torah and have been elaborated through centuries of rabbinical interpretation. For a restaurant to be kosher, it must follow rules governing which animals may be eaten, how they are slaughtered, how food is prepared, and which foods may be combined in the same meal.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The foundational principles are: only meat from animals with split hooves that chew their cud (beef, lamb, goat — but not pork), only fish with fins and scales (salmon, tuna — but not shellfish, catfish, or swordfish), poultry that is not a bird of prey, and all meat must be slaughtered by a trained shochet using a specific method designed to minimize the animal&apos;s suffering. Blood must be fully drained from the meat before cooking, typically through salting.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The separation of meat and dairy is perhaps the most distinctive kosher requirement. A kosher restaurant that serves meat cannot serve any dairy products — no butter, cheese, cream, or milk — and must use separate dishes, pots, utensils, and washing facilities. Similarly, a dairy kosher restaurant serves no meat. A third category, pareve, includes foods that are neither meat nor dairy (fish, eggs, fruits, vegetables, grains) and can be served with either. Browse all{" "}
            <Link href="/healthy-restaurants/kosher" className="font-semibold text-jade hover:text-forest">
              kosher restaurants in our directory
            </Link>{" "}
            to start exploring.
          </p>
        </section>

        <section id="nyc-kosher-scene" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            The NYC kosher scene
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City has the largest Jewish population of any city outside of Israel, and its kosher dining scene is the most extensive and diverse in the Western Hemisphere. NYC&apos;s kosher restaurants span the full range of dining experiences — from $1 pizza slices in Brooklyn to $100-per-person steakhouses in Manhattan, from traditional Ashkenazi delis to contemporary sushi bars, from Sephardic bakeries to vegan cafes.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The evolution of kosher dining in NYC over the past two decades has been dramatic. Where kosher restaurants were once limited primarily to traditional Jewish cuisine — deli sandwiches, bagels, kugel, cholent — the modern kosher scene includes Italian, Japanese, Mexican, Thai, Indian, and fusion concepts. This expansion has been driven by a younger generation of observant Jews who want the same culinary variety as their non-observant peers, and by chefs who see kosher constraints as creative challenges rather than limitations.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The city&apos;s kosher infrastructure is also unmatched. NYC has kosher catering companies, kosher food trucks, kosher wine bars, and kosher delivery services. Multiple kosher food courts exist in Manhattan and Brooklyn, and several supermarket chains carry extensive kosher product lines. For observant Jews visiting or living in NYC, the depth of kosher dining options is a genuine quality-of-life advantage that few other cities can match.
          </p>
        </section>

        <section id="best-neighborhoods" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best neighborhoods for kosher dining
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/brooklyn/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Brooklyn
            </Link>{" "}
            is the epicenter of kosher dining in NYC. Borough Park has the highest concentration of kosher restaurants in the city, serving the neighborhood&apos;s large Orthodox and Hasidic communities. Along 13th Avenue and surrounding streets, you&apos;ll find kosher pizza shops, bakeries, falafel stands, and sit-down restaurants offering everything from traditional Ashkenazi fare to Israeli-style cuisine. Prices here tend to be moderate, reflecting a community-oriented rather than tourist-oriented market.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Flatbush, Crown Heights, and Williamsburg add depth to Brooklyn&apos;s kosher scene. Crown Heights is home to the Lubavitch community and has a distinctive restaurant scene that blends Eastern European Jewish traditions with modern influences. Williamsburg&apos;s Hasidic community supports a separate cluster of kosher establishments, particularly bakeries and takeout shops. Flatbush brings Sephardic and Mizrahi kosher options, reflecting the neighborhood&apos;s Syrian Jewish community.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>&apos;s kosher scene is more upscale and geographically dispersed. The Upper West Side has a strong cluster of kosher restaurants catering to the neighborhood&apos;s significant Modern Orthodox population. Midtown has kosher steakhouses and business-lunch spots. The Lower East Side, historically the heart of Jewish New York, retains a few iconic kosher establishments alongside newer additions. Chelsea and the Flatiron District have seen kosher restaurant growth driven by the broader kosher-curious market.
          </p>
        </section>

        <section id="certification-bodies" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Kosher certification bodies
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Kosher certification (hashgacha) is the process by which a rabbi or rabbinical organization verifies that a restaurant or food product meets the standards of kashrut. Unlike halal certification, which has no centralized authority in the US, kosher certification in NYC operates through a well-established network of recognized agencies, each with its own symbol (hechsher) and standards.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The Orthodox Union (OU) is the largest kosher certification agency in the world and certifies thousands of products and hundreds of restaurants. Its circled-U symbol is the most widely recognized hechsher globally. In NYC, the OU certifies restaurants across all boroughs. OK Kosher Certification and the Star-K are two other major national agencies with significant NYC presence. Each maintains rigorous inspection protocols and employs trained mashgichim (kosher supervisors) who may be present in the restaurant during all operating hours.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Local rabbinical councils and individual community rabbis also provide kosher certification in NYC. These local certifications are common in Borough Park, Crown Heights, and Williamsburg, where community trust in a specific rabbi may carry as much weight as a national agency&apos;s symbol. For visitors unfamiliar with local certifications, national hechshers provide the most portable assurance. For details on how to verify any restaurant&apos;s food safety alongside its kosher status, see our{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC health grades guide
            </Link>.
          </p>
        </section>

        <section id="cuisines" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Cuisines to explore
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Traditional Ashkenazi cuisine — the food of Eastern European Jewry — remains a cornerstone of NYC&apos;s kosher scene. Delis serving pastrami, corned beef, matzo ball soup, and knishes are iconic. However, much of this food is heavy on sodium, fat, and processed meat, making it a less ideal choice for health-conscious diners. The exceptions are lighter preparations like baked fish, vegetable soups, and fresh-made salads that many modern delis now offer alongside their classic menus.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Israeli and Middle Eastern kosher cuisine offers the best balance of flavor and nutrition in the kosher world. Grilled meats, fresh vegetable salads, hummus, tahini, and herb-heavy preparations are hallmarks of this category. Many of NYC&apos;s best kosher restaurants draw from this tradition, serving food that appeals to health-conscious diners while maintaining strict kashrut standards. Shakshuka, grilled kebabs, falafel plates, and Israeli chopped salads are all excellent options.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Sephardic and Mizrahi cuisines — the food traditions of Jewish communities from Spain, North Africa, and the Middle East — are represented in NYC primarily through Syrian Jewish restaurants in Flatbush. These cuisines feature kibbeh, sambusak, rice-based dishes, and spice-forward preparations that are distinct from both Ashkenazi and modern Israeli food. For health-conscious diners, the emphasis on grilled meats, rice, and vegetable-forward cooking makes Sephardic food an appealing choice.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The most exciting trend in NYC kosher dining is the emergence of global cuisines under kosher supervision. Kosher sushi restaurants, kosher Thai restaurants, kosher Italian pasta bars, and even kosher Mexican spots now operate in Manhattan and Brooklyn. These establishments prove that kosher dining is no longer limited to a specific culinary tradition — if you can eat it in NYC, there&apos;s likely a kosher version somewhere in the city.
          </p>
        </section>

        <section id="kosher-vs-halal" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Kosher vs. halal: understanding the differences
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Kosher and halal dietary laws share Abrahamic origins and several surface-level similarities — both prohibit pork and both require specific slaughter methods. However, the systems differ in important ways that matter for diners navigating between them. Understanding these differences is particularly relevant in NYC, where kosher and halal restaurants often operate in close proximity.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The most significant practical difference is the meat-dairy separation. Kosher law strictly prohibits consuming meat and dairy together — not just in the same dish, but in the same meal, and observant Jews wait several hours between eating meat and dairy. This means a kosher meat restaurant will never serve cheese, cream, butter, or milk. Halal law has no such restriction, so a halal restaurant can freely combine meat and dairy.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Alcohol presents another difference. Kosher law permits alcohol — in fact, wine plays a ceremonial role in Jewish practice — though kosher wine must be produced under rabbinical supervision. Halal law prohibits all alcohol, both as a beverage and as a cooking ingredient. Shellfish is prohibited under kosher law but generally permitted under halal law. For a detailed look at the halal perspective, see our{" "}
            <Link href="/guides/halal-food-guide-nyc" className="font-semibold text-jade hover:text-forest">
              halal food guide
            </Link>.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For mixed groups — say, a Jewish diner and a Muslim diner eating together — a vegetarian or vegan restaurant may be the simplest solution, as plant-based food is generally acceptable under both systems. Alternatively, a kosher fish restaurant (which avoids the meat-dairy issue) or a halal restaurant that does not serve alcohol can work for many cross-dietary situations, depending on the individuals&apos; level of observance.
          </p>
        </section>

        <section id="price-guide" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Price guide for kosher dining in NYC
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Kosher dining in NYC comes with a price premium compared to non-kosher equivalents, but the range is wide enough that budget-conscious diners have options. At the most affordable end, kosher pizza shops in Brooklyn serve slices for $3 to $4 — among the cheapest meals in the city. Falafel stands and bakeries offer lunch for $8 to $12. These dairy and pareve establishments avoid the cost of kosher meat, keeping prices accessible.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Mid-range kosher dining — sit-down restaurants with table service — runs $20 to $40 per person in Brooklyn and $30 to $50 in Manhattan. Kosher meat adds a significant premium: the specialized slaughter process, additional inspection requirements, and rabbinical supervision all contribute to higher wholesale costs. A kosher steak dinner can easily cost 30-50% more than a comparable non-kosher meal. Dairy restaurants in this range are more affordable since they avoid these meat-specific costs.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            At the high end, Manhattan&apos;s kosher steakhouses and upscale restaurants charge $60 to $120 or more per person. These establishments cater to observant diners who want fine-dining experiences without compromising on kashrut. The quality at this level is generally excellent — the premium reflects both the cost of kosher meat and the overhead of maintaining strict kosher standards in a high-end kitchen. For those seeking to dine well on less, Brooklyn&apos;s community-oriented kosher restaurants consistently offer better value.
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
          heading="Browse every kosher restaurant in NYC"
          body="Search 195 kosher restaurants across NYC. Filter by neighborhood, cuisine type, certification, health grade, and price range."
          primaryLabel="Browse kosher →"
          primaryHref="/healthy-restaurants/kosher"
          secondaryLabel="Manhattan kosher"
          secondaryHref="/nyc/manhattan/healthy-restaurants"
        />
      </div>
    </GuideLayout>
  )
}
