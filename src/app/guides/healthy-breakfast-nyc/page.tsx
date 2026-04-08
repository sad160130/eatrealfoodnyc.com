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
const guide = getGuideBySlug("healthy-breakfast-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "What makes a breakfast restaurant healthy in NYC?",
    answer: "Three factors define a genuinely healthy breakfast restaurant: whole ingredient sourcing (oats, nuts, fresh fruit, eggs from known suppliers), minimal processed ingredients (no pre-made mixes, artificial sweeteners, or packaged pastries), and an NYC health inspection grade of A. Restaurants that make their granola, nut milks, and grain bowls in-house from whole ingredients consistently outperform chain alternatives on both taste and nutritional value.",
  },
  {
    question: "Which NYC neighborhoods have the best healthy breakfast spots?",
    answer: "The West Village, Flatiron, and the Upper West Side in Manhattan have the highest density of quality healthy breakfast restaurants. In Brooklyn, Williamsburg, Park Slope, and Cobble Hill have strong whole-food café cultures. The East Village has a concentration of vegan and plant-based breakfast spots. Use our neighborhood comparison tool to compare areas by restaurant health scores.",
  },
  {
    question: "What are the healthiest breakfast choices at NYC restaurants?",
    answer: "Grain-forward breakfasts — granola with whole fruit and non-dairy milk, overnight oats, muesli — provide sustained energy from complex carbohydrates and healthy fats. Protein-forward options like eggs with seasonal vegetables, smoked salmon, and avocado toast on whole grain bread are strong alternatives. The worst choices nutritionally are pastry-heavy menus with refined flour, added sugars, and minimal whole ingredients, which are common at standard NYC coffee chains.",
  },
  {
    question: "Are there dairy-free breakfast options at NYC restaurants?",
    answer: "Yes, extensively. NYC's health food café culture has normalised dairy-free milk alternatives — oat milk, almond milk, cashew milk, and coconut milk are offered at most health-focused breakfast spots. Granola and muesli bowls, açaí bowls, and grain-based breakfasts are often naturally dairy-free. Use the dairy-free filter in our directory to find certified options.",
  },
  {
    question: "What is the difference between muesli and granola at NYC health cafes?",
    answer: "Muesli is typically raw or minimally processed — untoasted oats mixed with nuts, dried fruit, and seeds. It is higher in raw fibre and lower in added sugar than granola. Granola is baked, typically with oil and sweetener, which gives it more crunch but adds calories. Both are nutritionally strong options compared to typical breakfast alternatives. Raw muesli in particular aligns with the raw food philosophy emphasised by many NYC health food restaurants.",
  },
  {
    question: "Can I find organic breakfast options at NYC restaurants?",
    answer: "Many of NYC's health-focused breakfast restaurants use organic ingredients, particularly for items like açaí, oats, and nut milks where the organic certification has the greatest nutritional and sourcing significance. The restaurants most likely to use organic ingredients are those that prominently mention sourcing on their menus and are categorised as whole foods or farm-to-table in our directory.",
  },
]

export default function HealthyBreakfastGuide() {
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
        subtitle="New York City starts early and moves fast. The restaurants and cafes that understand healthy mornings are the ones worth knowing — before the city catches up with them."
        stats={[
          { stat: "8,835", label: "NYC restaurants in our directory" },
          { stat: "984", label: "Hidden gem restaurants identified" },
          { stat: "12", label: "Dietary categories tracked" },
          { stat: "116", label: "NYC neighborhoods covered" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC items={[
          { href: "#why-breakfast", label: "Why healthy breakfast matters in NYC" },
          { href: "#what-to-look-for", label: "What separates a healthy breakfast spot from the rest" },
          { href: "#key-foods", label: "Key whole food breakfast items to look for" },
          { href: "#dairy-free", label: "Nut milks and dairy-free breakfast options" },
          { href: "#by-neighborhood", label: "Best NYC neighborhoods for healthy breakfast" },
          { href: "#budget", label: "Eating a healthy breakfast in NYC on a budget" },
          { href: "#faq", label: "Frequently asked questions" },
        ]} />

        {/* Section 1 */}
        <section id="why-breakfast" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Why healthy breakfast matters in NYC
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City has a breakfast problem. The city that never sleeps also tends not to
            eat well in the morning. The default breakfast infrastructure — bodega coffee and a
            roll, chain coffee shop pastries, street cart bacon-egg-and-cheese sandwiches — is
            not designed for sustained energy or nutritional value.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The corrective to this has been the rise of NYC&apos;s whole food café culture: restaurants
            and cafes that take breakfast and brunch seriously as an opportunity to use quality
            ingredients. Housemade granola with whole oats, nuts, and dried fruit. Raw muesli
            soaked overnight with fresh fruit. Nut milks made from scratch. Açaí bowls with real
            toppings rather than sugar syrup.
          </p>

          {/* Tone shift */}
          <div className="my-6 border-l-4 border-sage pl-5">
            <p className="text-base italic text-gray-600">
              These places exist across all five boroughs — the challenge is finding them reliably.
              A $4 bodega egg sandwich will always be easier to find than a $12 granola bowl made
              with house-toasted oats. But the nutritional gap between the two is enormous.
            </p>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            Our directory tracks the{" "}
            <Link href="/healthy-restaurants/whole-foods" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              whole foods restaurants
            </Link>{" "}
            and{" "}
            <Link href="/healthy-restaurants/vegan" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              vegan restaurants
            </Link>{" "}
            that anchor NYC&apos;s healthy breakfast scene — every listing verified with an official
            NYC Department of Health inspection grade.
          </p>
        </section>

        {/* Section 2 */}
        <section id="what-to-look-for" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What separates a healthy breakfast spot from the rest
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { signal: "Housemade whole-ingredient granola", detail: "Made from oats, nuts, seeds, and natural sweeteners rather than sourced from a commercial supplier. Look for menus that name the ingredients rather than just calling it \"house granola\"." },
              { signal: "Real non-dairy milk options", detail: "Not flavoured coffee syrups or pre-bottled commercial oat milk — but cafes that are deliberate about their milk programme. The best spots offer multiple alternatives and know their sourcing." },
              { signal: "Seasonal fruit", detail: "Breakfast spots that use fresh, seasonal fruit in their granola bowls and smoothies rather than frozen or canned fruit tend to be more committed to whole-ingredient sourcing across the board." },
              { signal: "Grade A health inspection", detail: "A strong breakfast restaurant that handles raw ingredients well should have no problem maintaining a Grade A inspection. We show the grade, score, and date on every listing." },
              { signal: "Complex carbohydrate focus", detail: "Whole grain breads, oats, quinoa, and millet over refined white bread and pastries. Look for menus that distinguish between whole grain and refined options." },
              { signal: "Transparent nutrition language", detail: "Restaurants that talk about their ingredients honestly — naming suppliers, noting that items are raw, gluten-free, or vegan — tend to be more trustworthy than those with vague health claims." },
            ].map(item => (
              <div key={item.signal} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                  {item.signal}
                </h3>
                <p className="text-xs leading-relaxed text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Key foods (topical bridge to expired domain recipe pages) */}
        <section id="key-foods" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Key whole food breakfast items to look for on NYC menus
          </h2>

          <div className="space-y-6">
            {[
              {
                food: "Granola — The Benchmark Dish",
                detail: "A restaurant's granola reveals almost everything about its kitchen philosophy. Housemade granola from whole oats, raw nuts, seeds, and a minimal natural sweetener like maple syrup is a labour-intensive commitment. Restaurants that make their own are signalling care for ingredient quality. The best versions in NYC use locally sourced oats and seasonally appropriate nuts and dried fruits — hazelnut, orange, and cacao combinations are particularly popular at NYC whole food cafes for their mineral density and flavour complexity.",
                tags: ["whole-foods", "vegan", "dairy-free"],
                link: { label: "Whole foods breakfast restaurants in NYC", href: "/healthy-restaurants/whole-foods" },
              },
              {
                food: "Raw Muesli",
                detail: "Raw muesli — untoasted oats soaked overnight in non-dairy milk with nuts, seeds, and fresh fruit — is one of the most nutritionally complete breakfast options available. Unlike granola, it is not baked and does not require added oil or sweetener to be palatable. The soaking process partially breaks down phytic acid in the oats, improving mineral absorption. NYC's raw food and whole food cafes have elevated muesli from health food staple to a genuinely considered menu item.",
                tags: ["raw-food", "whole-foods", "dairy-free", "vegan"],
                link: { label: "Raw food restaurants in NYC", href: "/healthy-restaurants/raw-food" },
              },
              {
                food: "Nut Milks and Plant-Based Milks",
                detail: "Housemade nut milks — almond, cashew, hazelnut — are a signal of commitment to whole ingredient philosophy. Made from raw soaked nuts blended with water and minimal seasoning, they contain no added gums, stabilisers, or sugars. The difference in taste and nutritional value between a housemade nut milk and a commercial alternative is significant. NYC's most committed health cafes make their own, and they are worth seeking out.",
                tags: ["dairy-free", "vegan", "raw-food"],
                link: { label: "Dairy-free restaurants in NYC", href: "/healthy-restaurants/dairy-free" },
              },
              {
                food: "Açaí Bowls",
                detail: "Açaí bowls — frozen açaí blended with banana and topped with granola, fresh fruit, and nut butter — have become NYC's defining healthy breakfast format. At their best they are nutrient-dense, fibre-rich, and satisfying. At their worst they are bowls of commercial açaí blend drowning in sugar and processed toppings. The distinguishing factor is the quality of the base (pure açaí vs flavoured commercial blends), the granola (housemade vs commercial), and the toppings (fresh seasonal fruit vs frozen or syrup-soaked).",
                tags: ["vegan", "whole-foods", "dairy-free"],
                link: { label: "Vegan breakfast restaurants in NYC", href: "/healthy-restaurants/vegan" },
              },
            ].map(item => (
              <div key={item.food} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-forest/5 px-6 py-4">
                  <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {item.food}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <Link key={tag} href={`/healthy-restaurants/${tag}`} className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium capitalize text-jade transition-colors hover:bg-sage/20">
                        {tag.replace("-", " ")}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                  <Link href={item.link.href} className="text-sm font-semibold text-jade transition-colors hover:text-forest">
                    {item.link.label} →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pattern break */}
          <div className="mt-8 rounded-xl bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-600">
              <strong className="text-forest">Why these four items:</strong> Granola, muesli, nut milks,
              and açaí bowls are the dishes where the gap between a good health cafe and a mediocre one
              is most obvious. They&apos;re also the items where &quot;healthy&quot; labelling is most misleading —
              a granola bowl with 40g of added sugar is not a health food, regardless of what the menu says.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="dairy-free" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Nut milks and dairy-free breakfast options in NYC
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            NYC&apos;s dairy-free breakfast scene has matured from a niche dietary requirement into a
            mainstream preference. The city&apos;s best health cafes treat plant-based milks as a
            serious part of their food programme rather than an afterthought.
          </p>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            The shift has been driven both by vegan demand and by the growing number of
            lactose-intolerant diners — particularly in NYC&apos;s diverse communities where
            dairy-free eating has always been more common than standard American food culture
            acknowledges.
          </p>

          {/* Ranked list — format rotation */}
          <div className="mb-6 rounded-2xl border border-sage/10 bg-sage/5 p-6">
            <p className="mb-4 text-base font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              The hierarchy of plant-based milks at NYC health cafes:
            </p>
            <div className="space-y-3">
              {[
                { milk: "Housemade nut milk", notes: "The gold standard. Raw nuts soaked and blended in-house. No additives, maximum flavour. A marker of kitchen commitment." },
                { milk: "Cold-pressed nut milk", notes: "Commercial but minimally processed — typically just nuts and water. Better than standard commercial alternatives." },
                { milk: "Oat milk (barista grade)", notes: "The most popular commercial option. Works well in hot coffee. Look for unsweetened versions without added vegetable oils." },
                { milk: "Standard commercial almond/oat milk", notes: "Common but often contains gums, sunflower oil, and added sugar. Fine for most uses but not the same as whole-ingredient alternatives." },
              ].map((item, i) => (
                <div key={item.milk} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-sm font-bold text-sage">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-semibold text-forest">{item.milk}</p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="leading-relaxed text-gray-700">
            Use our{" "}
            <Link href="/healthy-restaurants/dairy-free" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              dairy-free restaurant filter
            </Link>{" "}
            to find breakfast and brunch spots with strong plant-based milk programmes across
            all five boroughs.
          </p>
        </section>

        {/* Section 5 */}
        <section id="by-neighborhood" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best NYC neighborhoods for healthy breakfast
          </h2>

          {/* Data table — format rotation */}
          <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-forest text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Neighborhood</th>
                  <th className="px-4 py-3 text-left font-semibold">Strength</th>
                  <th className="px-4 py-3 text-left font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold">West Village</td>
                  <td className="px-4 py-3">Highest café density</td>
                  <td className="px-4 py-3">Granola, nut milks</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold">Williamsburg</td>
                  <td className="px-4 py-3">Vegan breakfast hub</td>
                  <td className="px-4 py-3">Açaí, grain bowls</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold">East Village</td>
                  <td className="px-4 py-3">Plant-based specialists</td>
                  <td className="px-4 py-3">Raw muesli, vegan</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold">Park Slope</td>
                  <td className="px-4 py-3">Family-friendly organic</td>
                  <td className="px-4 py-3">Organic, dairy-free</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Astoria</td>
                  <td className="px-4 py-3">Mediterranean breakfast</td>
                  <td className="px-4 py-3">Budget-friendly, whole foods</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            {[
              { neighborhood: "West Village, Manhattan", desc: "The highest concentration of independent health cafes in the city. Strong granola and grain bowl culture. Multiple spots making housemade nut milks.", link: "/nyc/manhattan/healthy-restaurants" },
              { neighborhood: "Williamsburg, Brooklyn", desc: "Brooklyn's health cafe epicentre. Strong vegan breakfast scene alongside whole food grain bowls and açaí. Many spots open from 7am for the commuter market.", link: "/nyc/brooklyn/healthy-restaurants" },
              { neighborhood: "Park Slope, Brooklyn", desc: "Family-oriented healthy breakfast culture. Strong organic sourcing across multiple cafes. Good dairy-free options driven by both vegan and lactose-intolerant demographics.", link: "/nyc/brooklyn/healthy-restaurants" },
              { neighborhood: "East Village, Manhattan", desc: "The heart of NYC's vegan breakfast scene. Multiple dedicated plant-based cafes open early. Strong raw food and muesli options.", link: "/nyc/manhattan/healthy-restaurants" },
              { neighborhood: "Astoria, Queens", desc: "Excellent Mediterranean and Middle Eastern breakfast traditions — olive-oil based preparations, fresh yogurt and fruit, mezze-style spreads. Naturally healthy and significantly more affordable than Manhattan equivalents.", link: "/nyc/queens/healthy-restaurants" },
            ].map(item => (
              <div key={item.neighborhood} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{item.neighborhood}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>{item.desc}</p>
                </div>
                <Link href={item.link} className="flex-shrink-0 text-xs font-semibold text-jade transition-colors hover:text-forest">
                  Browse →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 */}
        <section id="budget" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Eating a healthy breakfast in NYC on a budget
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            NYC&apos;s premium health cafe culture can be expensive. A housemade granola bowl with
            seasonal fruit and nut milk can cost $18-22 at a Manhattan café. But healthy
            breakfast in NYC does not require that price point.
          </p>

          {/* Tone shift — conversational aside */}
          <div className="my-6 border-l-4 border-amber pl-5">
            <p className="text-base text-gray-600">
              <strong>Honest take:</strong> The best-value healthy breakfasts in this city aren&apos;t
              at the places with &quot;wellness&quot; in the name. They&apos;re at Greek cafes in Astoria,
              Dominican spots in the Heights, and Japanese rice-and-egg joints in the East Village.
              These traditions have been cooking healthy morning food for generations — they just
              don&apos;t charge $20 for it.
            </p>
          </div>

          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The best-value healthy breakfasts in the city are found in its ethnic food
            traditions: Greek yogurt and honey at Astoria&apos;s Greek cafes, Middle Eastern
            breakfasts in Bay Ridge, Japanese tamago-kake gohan in the East Village, and
            Dominican mangú in Washington Heights and the Bronx. These are nutritionally
            excellent meals at prices that reflect neighbourhood rather than brand premium.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Our{" "}
            <Link href="/search?hidden_gem=true" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              hidden gem filter
            </Link>{" "}
            surfaces the highest-rated restaurants with fewer reviews — often the best-value
            healthy breakfast spots in the city. See also our full guide to{" "}
            <Link href="/guides/how-eat-healthy-nyc-15-dollars" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              eating healthy in NYC on $15 a day
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked questions
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {GUIDE_FAQS.map((faq, i) => (
              <details key={i} className={`border-b border-gray-100 ${i === GUIDE_FAQS.length - 1 ? "border-b-0" : ""}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 transition-colors hover:bg-gray-50">
                  <span className="pr-4 text-base font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {faq.question}
                  </span>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-sage text-sage">+</span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-base leading-relaxed text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <GuideCTA
          heading="Find healthy breakfast and brunch in NYC"
          body="Browse Grade A-certified whole foods and vegan restaurants across all 5 boroughs — with dietary filters, open-now detection, and hidden gem picks."
          primaryLabel="Search healthy breakfast spots →"
          primaryHref="/search?diet=whole-foods"
          secondaryLabel="Vegan breakfast NYC"
          secondaryHref="/healthy-restaurants/vegan"
        />
      </div>
    </GuideLayout>
  )
}
