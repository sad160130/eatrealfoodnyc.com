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
const guide = getGuideBySlug("vegan-nyc-borough-guide")!

export const metadata: Metadata = {
  title: guide.metaTitle, description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  { question: "How many vegan restaurants are in NYC?", answer: "Our directory lists over 107 dedicated vegan restaurants across all five NYC boroughs, plus hundreds more that offer significant vegan menus alongside non-vegan options. The number continues to grow as plant-based dining becomes more mainstream in New York City." },
  { question: "Which NYC borough has the most vegan restaurants?", answer: "Manhattan and Brooklyn lead NYC in vegan restaurant density. Manhattan's East Village, West Village, and Lower East Side have the highest concentration. Brooklyn's Williamsburg, Bushwick, and Park Slope follow closely. Queens is emerging as a strong third option with diverse plant-based cuisines." },
  { question: "Is vegan food expensive in NYC?", answer: "Vegan dining in NYC spans all price ranges. Budget-friendly options include falafel shops, Caribbean restaurants with plant-based stews, and Chinese vegetable-forward restaurants. Mid-range vegan restaurants typically cost $15-25 per person. High-end plant-based tasting menus can exceed $100." },
  { question: "What is the difference between vegan and vegetarian restaurants?", answer: "Vegan restaurants use no animal products at all — no meat, dairy, eggs, or honey. Vegetarian restaurants exclude meat and fish but may use dairy, eggs, and honey. In our directory, you can filter by either vegan or vegetarian to find exactly what you need." },
  { question: "Are vegan restaurants in NYC health-graded?", answer: "Yes. Every restaurant in NYC is inspected by the Department of Health regardless of its cuisine type. Vegan restaurants receive the same A, B, or C grades as any other restaurant. Our directory shows the current health grade on every listing." },
  { question: "Can I find vegan restaurants open late in NYC?", answer: "Yes, several vegan restaurants in Manhattan and Brooklyn stay open past 10 PM. Use our Open Now filter to find currently open vegan restaurants, or check our guide to late night healthy eating in NYC for specific recommendations." },
]

export default function VeganNYCGuide() {
  return (
    <GuideLayout guide={guide}>
      <FAQSchema faqs={GUIDE_FAQS} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, author: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl }, publisher: { "@type": "Organization", name: "Eat Real Food NYC", url: siteUrl }, datePublished: guide.publishedDate, dateModified: new Date().toISOString().split("T")[0], mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/guides/${guide.slug}` } }) }} />

      <GuideHero guide={guide} subtitle="The definitive guide to vegan dining across all five NYC boroughs. Best neighborhoods, what to expect, and how to find the most committed plant-based kitchens." stats={[
        { stat: "107+", label: "Vegan restaurants" },
        { stat: "5", label: "Boroughs covered" },
        { stat: "12", label: "Dietary filters" },
        { stat: "All", label: "Health graded" },
      ]} />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC items={[
          { href: "#why-nyc-vegan", label: "Why NYC is one of the best cities for vegan dining" },
          { href: "#manhattan", label: "Manhattan's vegan scene" },
          { href: "#brooklyn", label: "Brooklyn's vegan scene" },
          { href: "#queens", label: "Queens vegan options" },
          { href: "#bronx-staten-island", label: "Bronx and Staten Island" },
          { href: "#what-to-look-for", label: "How to tell if a restaurant is genuinely vegan" },
          { href: "#price-guide", label: "Vegan dining across price ranges" },
          { href: "#faq", label: "Frequently asked questions" },
        ]} />

        <section id="why-nyc-vegan" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Why NYC is one of the best cities for vegan dining</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">New York City has emerged as one of the world&apos;s premier destinations for plant-based dining. The city&apos;s extraordinary cultural diversity means that vegan food in NYC is not limited to salads and smoothie bowls — it draws from dozens of global culinary traditions, from Ethiopian injera platters to Szechuan mapo tofu to Jamaican ital stew.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">The sheer density of restaurants in NYC creates fierce competition that drives quality upward. Vegan restaurants in New York cannot survive on novelty alone — they must deliver food that is genuinely excellent. This competitive pressure has produced a vegan dining scene that rivals or exceeds any other city on the planet.</p>
          <p className="text-lg leading-relaxed text-gray-700">You can <Link href="/healthy-restaurants/vegan" className="font-semibold text-jade hover:text-forest">browse all vegan restaurants</Link> in our directory, each with health inspection grades and dietary tags verified against our database. For those who eat both vegan and <Link href="/healthy-restaurants/vegetarian" className="font-semibold text-jade hover:text-forest">vegetarian food</Link>, we track both categories separately.</p>
        </section>

        <section id="manhattan" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Manhattan&apos;s vegan scene</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Manhattan is the epicenter of NYC vegan dining. The East Village alone contains more dedicated vegan restaurants per block than most entire cities. The Lower East Side and West Village follow closely, with a mix of fast-casual spots and fine-dining establishments that happen to serve no animal products at all.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Midtown Manhattan offers fewer dedicated vegan restaurants but has strong options for plant-based lunch — critical for the weekday office crowd. Harlem and the Upper West Side have seen significant growth in vegan offerings over the past three years, particularly in the fast-casual segment.</p>
          <p className="text-lg leading-relaxed text-gray-700">Explore <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">all healthy restaurants in Manhattan</Link> and filter by vegan tag to see the full landscape. Many Manhattan neighborhoods also excel in <Link href="/guides/gluten-free-dining-nyc" className="font-semibold text-jade hover:text-forest">gluten-free dining</Link>, and the two dietary needs overlap frequently.</p>
        </section>

        {/* Pattern break — conversational aside */}
        <div className="mb-16 border-l-4 border-sage pl-5">
          <p className="text-base italic text-gray-600">
            A quick observation from building this directory: Manhattan gets the credit, but
            Brooklyn is where the most <em>interesting</em> vegan food is happening right now.
            The creativity gap has been closing for years and in 2026 it&apos;s basically gone.
          </p>
        </div>

        <section id="brooklyn" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Brooklyn&apos;s vegan scene</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Brooklyn&apos;s vegan scene is arguably the most creative in the city. Williamsburg and Bushwick have become testing grounds for experimental plant-based concepts — from vegan butcher shops to plant-based sushi bars to fully vegan bakeries producing pastries that rival traditional French patisseries.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Park Slope and Prospect Heights cater to the family dining market with vegan-friendly restaurants that serve both plant-based and conventional menus. Crown Heights has seen a surge in Caribbean-inspired vegan restaurants drawing from the neighborhood&apos;s West Indian heritage, where Ital cooking — a plant-based tradition rooted in Rastafarian culture — has deep roots.</p>
          <p className="text-lg leading-relaxed text-gray-700">Browse <Link href="/nyc/brooklyn/healthy-restaurants" className="font-semibold text-jade hover:text-forest">all healthy restaurants in Brooklyn</Link> to find vegan options across every neighborhood.</p>
        </section>

        <section id="queens" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Queens vegan options</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Queens is NYC&apos;s most ethnically diverse borough, and that diversity translates into some of the most interesting vegan options in the city. Jackson Heights offers South Asian vegetarian restaurants where the majority of the menu happens to be vegan — think chana masala, aloo gobi, and dosa platters made without dairy.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">Flushing&apos;s Chinese and East Asian restaurants include Buddhist vegetarian establishments serving entirely plant-based menus using traditional techniques. Astoria&apos;s Mediterranean restaurants frequently feature naturally vegan mezze spreads — hummus, baba ganoush, tabbouleh, and stuffed grape leaves.</p>
          <p className="text-lg leading-relaxed text-gray-700">Check out <Link href="/nyc/queens/healthy-restaurants" className="font-semibold text-jade hover:text-forest">healthy restaurants in Queens</Link>. For budget-conscious vegan diners, Queens often offers better value than Manhattan — see our guide on <Link href="/guides/how-eat-healthy-nyc-15-dollars" className="font-semibold text-jade hover:text-forest">eating healthy in NYC on $15 a day</Link>.</p>
        </section>

        {/* Data callout — breaks the h2/p/p/p rhythm with a different format */}
        <div className="mb-16 grid grid-cols-3 gap-4 rounded-2xl bg-forest p-6 text-center text-white">
          <div>
            <p className="text-2xl font-bold text-sage">107+</p>
            <p className="mt-1 text-xs text-white/60">Vegan-tagged restaurants in our directory</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-sage">5</p>
            <p className="mt-1 text-xs text-white/60">Boroughs covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-sage">$8–$80</p>
            <p className="mt-1 text-xs text-white/60">Price range per meal</p>
          </div>
        </div>

        <section id="bronx-staten-island" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Bronx and Staten Island vegan dining</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">The Bronx vegan scene is growing rapidly, driven by a health-conscious movement in neighborhoods like Mott Haven and the South Bronx. Several juice bars and plant-based cafes have opened in the past two years, and the borough&apos;s West African and Caribbean restaurants frequently offer hearty vegan-friendly options.</p>
          <p className="text-lg leading-relaxed text-gray-700">Staten Island has the fewest dedicated vegan restaurants of any NYC borough, but the situation is improving. Several restaurants on the North Shore now offer plant-based menus, and the borough&apos;s Sri Lankan restaurants — a Staten Island specialty — include many naturally vegan dishes.</p>
        </section>

        <section id="what-to-look-for" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>How to tell if a restaurant is genuinely vegan</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">There is an important distinction between a &quot;vegan restaurant&quot; and a restaurant that &quot;offers vegan options.&quot; A dedicated vegan restaurant serves no animal products at all — there is zero risk of cross-contamination with meat, dairy, or eggs because those ingredients are not in the kitchen.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">A restaurant that offers vegan options may prepare plant-based dishes on the same surfaces, in the same oil, and with the same utensils used for animal products. For most vegans this is perfectly acceptable, but for those with severe dairy allergies or strict ethical commitments, the distinction matters.</p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">In our directory, restaurants tagged as &quot;vegan&quot; explicitly identify themselves as offering significant vegan options. We recommend checking the restaurant&apos;s website or calling ahead if you need to confirm that the kitchen is 100% plant-based.</p>
          <div className="rounded-xl bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-600">
              <strong className="text-forest">The honest version:</strong> Most &quot;vegan-friendly&quot;
              restaurants use the same grill, same fryer, same prep surfaces. If that&apos;s fine with you,
              great — the options are vast. If cross-contamination is a real concern (allergies, not
              just preference), stick to the dedicated spots. There are enough of them in NYC that
              you won&apos;t feel limited.
            </p>
          </div>
        </section>

        <section id="price-guide" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Vegan dining across price ranges</h2>
          <div className="space-y-4">
            {[
              { range: "$ — Under $15", desc: "Falafel carts, Caribbean vegan stews, Chinese Buddhist vegetarian, South Indian dosa counters. Queens and the Bronx offer the best value at this price point.", color: "bg-green-50 border-green-100" },
              { range: "$$ — $15-30", desc: "The largest category. Includes dedicated vegan restaurants in the East Village and Williamsburg, vegan-friendly Mediterranean in Astoria, and plant-based Mexican in Sunset Park.", color: "bg-sage/10 border-sage/20" },
              { range: "$$$ — $30-60", desc: "Upscale vegan dining rooms in Manhattan and Brooklyn. Multi-course plant-based menus, craft cocktail pairings, and designed dining experiences.", color: "bg-amber/10 border-amber/20" },
              { range: "$$$$ — $60+", desc: "Fine-dining plant-based tasting menus. These restaurants compete directly with the best conventional restaurants in the city and frequently appear on national best-of lists.", color: "bg-forest/5 border-forest/20" },
            ].map((item) => (
              <div key={item.range} className={`rounded-2xl border p-5 ${item.color}`}>
                <h3 className="font-bold text-forest">{item.range}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>Frequently asked questions</h2>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {GUIDE_FAQS.map((faq, i) => (
              <div key={i} className={`border-b border-gray-100 ${i === GUIDE_FAQS.length - 1 ? "border-b-0" : ""}`}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 hover:bg-gray-50">
                    <span className="pr-4 text-base font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>{faq.question}</span>
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-sage text-sage group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-6"><p className="text-base leading-relaxed text-gray-600">{faq.answer}</p></div>
                </details>
              </div>
            ))}
          </div>
        </section>

        <GuideCTA heading="Browse every vegan restaurant in NYC" body="Our directory shows all verified vegan restaurants with health grades, dietary tags, and neighborhood filters." primaryLabel="Browse vegan restaurants →" primaryHref="/healthy-restaurants/vegan" secondaryLabel="Find vegan near me" secondaryHref="/near-me" />
      </div>
    </GuideLayout>
  )
}
