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
const guide = getGuideBySlug("seafood-healthy-restaurants-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "What makes a seafood restaurant healthy in NYC?",
    answer: "Four factors distinguish a genuinely health-focused seafood restaurant: sourcing transparency (wild-caught vs farmed, seasonal fish), preparation method (grilled, poached, or raw rather than deep-fried), NYC Department of Health inspection grade (Grade A indicates strong food safety practices), and minimal use of heavy sauces or processing. Restaurants that clearly state their sourcing and preparation approach are typically the most trustworthy choices.",
  },
  {
    question: "Which NYC neighborhoods have the best healthy seafood restaurants?",
    answer: "Manhattan's Midtown and West Village have the highest concentration of quality seafood restaurants. For Japanese-style seafood and sushi, the East Village and Midtown West are standouts. In Brooklyn, Carroll Gardens and DUMBO have well-regarded seafood options. Astoria in Queens has a strong Greek seafood tradition. Use our neighborhood comparison tool to compare health grade rates across neighborhoods.",
  },
  {
    question: "Is sushi a healthy choice at NYC restaurants?",
    answer: "Sushi can be one of the healthiest dining options in NYC when chosen carefully. Lean protein from fish combined with minimal processing makes traditional nigiri and sashimi excellent choices. The key factors are the restaurant's health inspection grade (Grade A is essential for raw fish safety), the quality of fish sourcing, and avoiding heavily processed rolls with excessive cream cheese, tempura, or sugary sauces.",
  },
  {
    question: "How do I verify a NYC seafood restaurant is safe to eat at?",
    answer: "Start with the NYC Department of Health inspection grade — for raw fish, a Grade A inspection is not optional. It indicates the restaurant scored 13 points or fewer across food safety criteria, which is critical when proteins are served raw or lightly cooked. Our directory shows the official grade, score, and inspection date for every listed restaurant.",
  },
  {
    question: "What is the healthiest way to eat seafood at a NYC restaurant?",
    answer: "Grilled, steamed, poached, or raw preparations preserve the most nutritional value and minimise added calories. Omega-3-rich fish like salmon, mackerel, and sardines offer the greatest cardiovascular benefit. Tuna, in both raw and cooked preparations, is an excellent lean protein. Avoid preparations that involve deep-frying, heavy cream sauces, or excessive sodium-based seasonings.",
  },
  {
    question: "Are there halal or kosher seafood restaurants in NYC?",
    answer: "Yes. NYC's large Muslim and Jewish communities have produced a strong selection of halal and kosher seafood restaurants. Kosher seafood restaurants are concentrated on the Upper West Side and in Borough Park, Brooklyn. Halal seafood options are particularly strong in Astoria, Jackson Heights, and Bay Ridge. Use our dietary filters to find certified options near you.",
  },
]

export default function SeafoodGuide() {
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
        subtitle="New York City's coastline and port history have made seafood central to the city's food culture for centuries. This is where to find the best of it — safely, transparently, and without guesswork."
        stats={[
          { stat: "3,254", label: "Grade A restaurants in our directory" },
          { stat: "8,835", label: "Total NYC restaurants tracked" },
          { stat: "5", label: "Boroughs with verified listings" },
          { stat: "36.8%", label: "Health inspection grade coverage" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC items={[
          { href: "#why-seafood", label: "Why seafood is central to NYC's healthy dining scene" },
          { href: "#what-to-look-for", label: "What to look for in a healthy seafood restaurant" },
          { href: "#key-dishes", label: "Key healthy seafood dishes in NYC restaurants" },
          { href: "#by-borough", label: "Best boroughs for healthy seafood" },
          { href: "#grade-a", label: "Why the health grade matters especially for seafood" },
          { href: "#dietary", label: "Halal, kosher, and other dietary options" },
          { href: "#faq", label: "Frequently asked questions" },
        ]} />

        {/* Section 1 */}
        <section id="why-seafood" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Why seafood is central to NYC&apos;s healthy dining scene
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City&apos;s relationship with seafood is as old as the city itself. Long before
            farm-to-table became a restaurant category, NYC was a fishing and trading port where
            fresh fish arrived daily. That history has shaped the city&apos;s restaurant culture in ways
            that still show up on menus today.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For health-conscious diners, seafood represents one of the most nutritionally complete
            choices available in New York&apos;s restaurant scene. Wild-caught fish like salmon, tuna,
            and halibut are dense with omega-3 fatty acids, lean protein, and micronutrients that
            are difficult to obtain elsewhere in equivalent quantities. When prepared simply —
            grilled, poached, or served raw — seafood dishes are among the lowest-calorie,
            highest-nutrient meals available at a restaurant table.
          </p>

          {/* Tone shift — conversational aside */}
          <div className="my-6 border-l-4 border-sage pl-5">
            <p className="text-base italic text-gray-600">
              The real challenge in NYC isn&apos;t finding a seafood restaurant — there are thousands.
              It&apos;s figuring out which ones handle raw fish properly. That&apos;s where the city&apos;s
              health inspection data becomes your best friend.
            </p>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            The{" "}
            <Link href="/search?grade=A" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              Grade A filter in our directory
            </Link>{" "}
            gives health-conscious diners a genuine edge when choosing where to eat seafood safely.
          </p>
        </section>

        {/* Section 2 */}
        <section id="what-to-look-for" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What to look for in a healthy seafood restaurant
          </h2>
          <div className="space-y-4">
            {[
              {
                signal: "Grade A NYC health inspection",
                detail: "For any restaurant serving raw or lightly cooked fish, the NYC Department of Health inspection grade is non-negotiable. Grade A means 13 points or fewer on the inspection — the highest standard. For sushi, sashimi, crudo, and tartare, do not compromise on this.",
                icon: "🏥",
              },
              {
                signal: "Sourcing transparency",
                detail: "Restaurants that state their sourcing — wild-caught Atlantic salmon, day-boat scallops, local striped bass — are signalling pride in ingredient quality. Menus that don't mention sourcing at all are worth approaching with caution.",
                icon: "🎣",
              },
              {
                signal: "Simple preparation methods",
                detail: "The healthiest seafood preparations are the simplest: grilled, poached en papillote, steamed, or served raw with citrus and seasoning. Heavy cream sauces, batter frying, and processed accompaniments add calories without nutritional benefit.",
                icon: "🍋",
              },
              {
                signal: "Community rating consistency",
                detail: "A restaurant with a 4.5-star rating across 500+ reviews has earned that consistency through repeat visits. For seafood specifically, freshness is the most common complaint when a restaurant is underperforming.",
                icon: "⭐",
              },
            ].map(item => (
              <div key={item.signal} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="mt-0.5 flex-shrink-0 text-2xl">{item.icon}</span>
                <div>
                  <h3 className="mb-1 text-base font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {item.signal}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Key dishes (topical bridge to expired domain recipe pages) */}
        <section id="key-dishes" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Key healthy seafood dishes to look for in NYC restaurants
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-700">
            These are the seafood dishes most frequently found on NYC&apos;s health-focused menus
            and what to look for when ordering each one.
          </p>

          <div className="space-y-6">
            {[
              {
                dish: "Tuna Niçoise",
                description: "A composed salad of seared or raw tuna with green beans, olives, hard-boiled eggs, and a vinaigrette. One of the most nutritionally complete dishes available at a NYC restaurant — lean protein, healthy fats, and complex vegetables in a single plate. Look for sushi-grade tuna and house-made dressing rather than bottled.",
                healthNote: "High protein, omega-3s, minimal added calories. One of the best lunch options at health-focused NYC bistros.",
                dietary: "Whole foods, dairy-free options available",
              },
              {
                dish: "Salmon en Papillote",
                description: "Salmon baked in parchment with seasonal vegetables — a French technique that preserves moisture and nutrition without added fat. The parchment-steaming method locks in omega-3s and keeps preparation clean. NYC's French-influenced bistros and farm-to-table restaurants do this particularly well with sustainably sourced Atlantic or Pacific salmon.",
                healthNote: "One of the highest omega-3 concentrations of any dish. Excellent for cardiovascular health.",
                dietary: "Whole foods, gluten-free options available",
              },
              {
                dish: "Fish Tacos",
                description: "Grilled or lightly seasoned white fish — halibut, mahi-mahi, or tilapia — in corn tortillas with fresh slaw and citrus. NYC's Mexican and Californian-influenced restaurants have elevated fish tacos from fast food to health-conscious street food. The key differentiator is grilled vs fried fish and corn vs flour tortillas.",
                healthNote: "Lean protein with complex carbohydrates. Nutritionally excellent when grilled and not battered.",
                dietary: "Gluten-free (corn tortilla versions), dairy-free",
              },
              {
                dish: "Salmon Salads",
                description: "Roasted, poached, or raw salmon over greens with seasonal accompaniments — radish, apple, citrus dressings. NYC's salad-focused health restaurants have made salmon salads a lunchtime staple that balances convenience with genuine nutrition. Look for wild-caught rather than farmed salmon for better omega-3 profiles.",
                healthNote: "High protein, omega-3s, micronutrient-dense. Among the most nutritionally complete lunch options in NYC.",
                dietary: "Whole foods, gluten-free, dairy-free",
              },
              {
                dish: "Halibut",
                description: "Pacific halibut is one of the leanest and cleanest-tasting fish available at NYC restaurants. Its mild flavour and firm texture make it suitable for grilled with herbs, en papillote with vegetables, or lightly seared with a citrus reduction. Very low in fat while being high in quality protein and selenium.",
                healthNote: "Extremely lean, high in selenium and B vitamins. Ideal for low-calorie, high-protein dining.",
                dietary: "Whole foods, gluten-free, dairy-free",
              },
            ].map(item => (
              <div key={item.dish} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-forest/5 px-6 py-4">
                  <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {item.dish}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-jade">{item.dietary}</p>
                </div>
                <div className="p-6">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">{item.description}</p>
                  <div className="flex items-start gap-2 rounded-xl bg-sage/5 p-3">
                    <span className="flex-shrink-0 text-sage">✓</span>
                    <p className="text-xs font-medium text-jade">{item.healthNote}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pattern break — honest aside after dish cards */}
          <div className="mt-8 rounded-xl bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-600">
              <strong className="text-forest">A note on these dishes:</strong> We picked them because
              they&apos;re the seafood items you&apos;ll most commonly find on health-focused menus across NYC.
              They&apos;re also dishes where preparation method makes the biggest difference — the same
              tuna niçoise can be 400 calories or 800 depending on how it&apos;s assembled.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="by-borough" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best boroughs for healthy seafood in NYC
          </h2>

          {/* Data table — format rotation */}
          <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-forest text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Borough</th>
                  <th className="px-4 py-3 text-left font-semibold">Best Neighborhoods</th>
                  <th className="px-4 py-3 text-left font-semibold">Standout Style</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold">Manhattan</td>
                  <td className="px-4 py-3">West Village, East Village, Midtown West</td>
                  <td className="px-4 py-3">French bistro, sushi, raw bar</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold">Brooklyn</td>
                  <td className="px-4 py-3">Carroll Gardens, DUMBO, Williamsburg</td>
                  <td className="px-4 py-3">Farm-to-table, seasonal fish</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold">Queens</td>
                  <td className="px-4 py-3">Astoria, Flushing</td>
                  <td className="px-4 py-3">Greek whole fish, seafood hot pot</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold">Bronx</td>
                  <td className="px-4 py-3">City Island, South Bronx</td>
                  <td className="px-4 py-3">Caribbean seafood, whole snapper</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Staten Island</td>
                  <td className="px-4 py-3">North Shore, Tottenville</td>
                  <td className="px-4 py-3">Italian seafood, frutti di mare</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            {[
              {
                borough: "Manhattan",
                slug: "manhattan",
                desc: "The most concentrated healthy seafood scene in the city. Midtown West and the West Village have the highest density of quality fish restaurants. The East Village is the hub for health-focused Japanese seafood and sushi. Murray Hill and the Upper East Side have strong French seafood bistro traditions.",
              },
              {
                borough: "Brooklyn",
                slug: "brooklyn",
                desc: "Carroll Gardens, DUMBO, and Williamsburg have developed strong seafood-focused restaurant scenes. Brooklyn's farm-to-table movement has produced a number of fish-forward restaurants that source regionally and change menus with the seasons.",
              },
              {
                borough: "Queens",
                slug: "queens",
                desc: "Astoria's Greek community has produced some of the most authentic and health-conscious seafood restaurants in NYC — whole grilled fish, octopus, and fresh shellfish prepared simply with olive oil and lemon. Flushing's seafood hot pot and noodle restaurants offer excellent, clean preparations.",
              },
              {
                borough: "The Bronx",
                slug: "bronx",
                desc: "City Island is the Bronx's seafood stronghold — a small island community with a strip of waterfront restaurants serving fresh, simply prepared fish. Caribbean seafood traditions elsewhere in the borough produce some of the most nutritionally straightforward preparations in the city.",
              },
              {
                borough: "Staten Island",
                slug: "staten-island",
                desc: "Staten Island's Italian American community has maintained a strong tradition of simply prepared seafood — frutti di mare, whole branzino, and classic Italian seafood dishes prepared without unnecessary elaboration.",
              },
            ].map(item => (
              <div key={item.borough} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
                    {item.borough}
                  </h3>
                  <Link
                    href={`/nyc/${item.slug}/healthy-restaurants`}
                    className="flex-shrink-0 rounded-xl border border-sage/30 px-3 py-1.5 text-xs font-semibold text-jade transition-colors hover:border-jade"
                  >
                    Browse {item.borough} restaurants →
                  </Link>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section id="grade-a" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Why the health inspection grade matters especially for seafood
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Raw and undercooked seafood carries a higher food safety risk than most other
            restaurant foods. Temperature control, cross-contamination prevention, and sourcing
            from approved suppliers are the three most critical factors — and all three are
            evaluated in the NYC Department of Health inspection.
          </p>
          <div className="mb-6 rounded-2xl border border-amber/20 bg-amber/5 p-6">
            <p className="mb-2 text-base font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
              The NYC DOHMH inspection standard for seafood specifically evaluates:
            </p>
            <ul className="space-y-2">
              {[
                "Cold holding temperatures for raw fish (must be maintained at 41°F or below)",
                "Sourcing from NYC-approved suppliers with proper documentation",
                "Cross-contamination prevention between raw fish and ready-to-eat foods",
                "Proper thawing procedures for frozen fish",
                "Staff handling practices for raw seafood",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 flex-shrink-0 text-amber">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tone shift */}
          <div className="mb-6 border-l-4 border-sage pl-5">
            <p className="text-base italic text-gray-600">
              Put simply: if you&apos;re eating raw fish, a Grade A isn&apos;t a nice-to-have. It&apos;s the
              minimum. The inspection specifically checks cold-holding temperatures for raw
              proteins — the single biggest factor in whether your sashimi is safe.
            </p>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            Use the{" "}
            <Link href="/search?grade=A" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              Grade A filter
            </Link>{" "}
            in our directory to find restaurants that meet the highest food safety standard.
            Read our full guide to{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-medium text-jade underline underline-offset-2 hover:text-forest">
              how NYC restaurant health grades work
            </Link>{" "}
            for the complete breakdown.
          </p>
        </section>

        {/* Section 6 */}
        <section id="dietary" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Halal, kosher, and other dietary options at NYC seafood restaurants
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            NYC&apos;s diverse religious and dietary communities have created a strong market for
            certified seafood restaurants across multiple dietary traditions.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                label: "Halal Seafood",
                desc: "Halal-certified seafood restaurants are concentrated in Astoria, Jackson Heights, and Bay Ridge. Seafood is generally considered halal across most Islamic jurisprudence, but certification provides additional assurance around preparation and cross-contamination.",
                href: "/healthy-restaurants/halal",
              },
              {
                label: "Kosher Seafood",
                desc: "Kosher seafood is restricted to fish with fins and scales — no shellfish. NYC's Upper West Side and Brooklyn kosher restaurant scenes have strong fin-fish options. Kosher certification from a recognised authority is clearly displayed in our listings.",
                href: "/healthy-restaurants/kosher",
              },
              {
                label: "Gluten-Free Seafood",
                desc: "Fish is naturally gluten-free, but preparation methods (batters, sauces, cross-contamination) can introduce gluten. Look for restaurants with dedicated gluten-free kitchen protocols, not just gluten-free menu labels.",
                href: "/healthy-restaurants/gluten-free",
              },
              {
                label: "Dairy-Free Seafood",
                desc: "Simply prepared fish dishes are naturally dairy-free. The most common dairy additions in seafood preparation are butter-based sauces. Asian and Mediterranean preparations tend to be naturally dairy-free by tradition.",
                href: "/healthy-restaurants/dairy-free",
              },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-sage/30 hover:shadow-md"
              >
                <h3 className="mb-2 text-base font-bold text-forest transition-colors group-hover:text-jade" style={{ fontFamily: "Georgia, serif" }}>
                  {item.label}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
                <p className="mt-3 text-xs font-semibold text-jade">Browse {item.label.toLowerCase()} restaurants →</p>
              </Link>
            ))}
          </div>
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
          heading="Find healthy seafood restaurants in NYC"
          body="Browse our directory of Grade A-certified NYC restaurants and filter by whole foods, halal, kosher, or gluten-free to find the right seafood spot for you."
          primaryLabel="Search restaurants →"
          primaryHref="/search?grade=A"
          secondaryLabel="How health grades work"
          secondaryHref="/guides/nyc-health-grades-explained"
        />
      </div>
    </GuideLayout>
  )
}
