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
const guide = getGuideBySlug("how-eat-healthy-nyc-15-dollars")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "Is it really possible to eat healthy in NYC for under $15?",
    answer: "Yes. Thousands of NYC restaurants serve nutritious, well-balanced meals for under $15. The key is knowing where to look. Outer-borough neighborhoods — particularly in Queens and the Bronx — offer the best value, and cuisines like Thai, Mexican, Indian, and Middle Eastern consistently deliver generous, healthful portions at budget-friendly prices. Lunch specials, counter-service spots, and hidden gems keep costs down even in Manhattan.",
  },
  {
    question: "Which borough is cheapest for healthy eating?",
    answer: "The Bronx and Queens consistently offer the lowest prices for healthy restaurant meals. Average entree prices in neighborhoods like Jackson Heights, Fordham, and Flushing run 30-40% lower than comparable neighborhoods in Manhattan. Queens also has the highest average restaurant rating in our directory at 4.3 stars, meaning you are not sacrificing quality for affordability.",
  },
  {
    question: "Are hidden gems really better value?",
    answer: "In our data, hidden gems — restaurants with fewer than 200 reviews but high ratings — average 4.6 out of 5 stars compared to 4.2 for the overall directory. Because these restaurants have lower visibility, they often compensate with lower prices and larger portions to attract customers. They represent some of the best value in NYC dining.",
  },
  {
    question: "What are the healthiest cheap cuisines in NYC?",
    answer: "Thai, Vietnamese, Mexican (especially taco shops), Middle Eastern, Indian, and Ethiopian cuisines offer the best combination of nutrition and affordability. These cuisines emphasize vegetables, legumes, whole grains, lean proteins, and complex spice blends rather than expensive ingredients or heavy cream-based sauces. A vegetable curry with rice, a falafel plate, or a bowl of pho can all come in under $12 while delivering excellent nutrition.",
  },
  {
    question: "Do lunch specials really save that much?",
    answer: "Absolutely. Many NYC restaurants offer lunch specials that are 30-50% cheaper than dinner prices for the same dishes. A $22 dinner entree might be available as a $13 lunch special with the same portion size. Indian, Thai, and Japanese restaurants are particularly known for generous lunch combos that include an entree, side, and drink for a fixed price well under $15.",
  },
]

export default function BudgetHealthyGuide() {
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
        subtitle="Practical strategies for eating nutritious meals in NYC without breaking the bank."
        stats={[
          { label: "Total restaurants", stat: "8,835" },
          { label: "Queens avg rating", stat: "4.3" },
          { label: "Hidden gems avg", stat: "4.6" },
          { label: "All boroughs", stat: "5" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#is-it-possible", label: "Is it possible?" },
            { href: "#best-cuisines", label: "Best budget cuisines" },
            { href: "#neighborhoods", label: "Cheapest neighborhoods" },
            { href: "#ordering-strategies", label: "Ordering strategies" },
            { href: "#hidden-gems-budget", label: "Hidden gems on a budget" },
            { href: "#by-dietary-need", label: "By dietary need" },
            { href: "#meal-timing", label: "Meal timing tricks" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="is-it-possible" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Is it really possible to eat healthy in NYC for $15?
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The short answer is yes — emphatically. The longer answer requires understanding what &quot;healthy&quot; and &quot;affordable&quot; look like in practice across New York City&apos;s five boroughs. NYC has over 8,800 restaurants in our healthy dining directory alone, and a significant portion of them serve complete, nutritious meals for under $15. The trick is not finding cheap food — that&apos;s easy. The trick is finding cheap food that is also genuinely good for you.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The perception that healthy eating in NYC is expensive comes largely from Manhattan-centric thinking. Yes, a $16 acai bowl in SoHo or a $19 grain bowl in Midtown is overpriced for what you get. But step into a Flushing dumpling shop, a Jackson Heights chaat counter, or an East Harlem taqueria, and you&apos;ll find meals built around vegetables, whole grains, and lean proteins for a fraction of the price. The diversity of NYC&apos;s food scene is its greatest asset for budget-conscious healthy eaters.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Throughout this guide, we&apos;ll cover the best cuisines, neighborhoods, ordering strategies, and timing tricks to consistently eat well in NYC without spending more than $15 per meal. We&apos;ve analyzed data from every restaurant in our directory to bring you recommendations grounded in real numbers, not just anecdotes.
          </p>
        </section>

        <section id="best-cuisines" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best cuisines for budget-friendly healthy eating
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Thai cuisine is arguably the best value-to-nutrition ratio in NYC. A plate of pad thai with vegetables, a green curry with tofu, or a tom yum soup delivers a balanced mix of protein, vegetables, and complex carbohydrates for $10 to $14 at most outer-borough Thai restaurants. The cuisine&apos;s reliance on fresh herbs, lime, chili, and fish sauce means intense flavor without the caloric load of cream or butter-based sauces.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Mexican taco shops and taquerias are another budget champion. Two or three tacos on corn tortillas with grilled chicken or fish, topped with fresh salsa, cilantro, and lime, make a complete meal for $8 to $12. Add a side of black beans for extra protein and fiber, and you&apos;re looking at one of the most nutritionally complete meals available anywhere in the city at that price point. The key is choosing grilled over fried preparations and opting for corn over flour tortillas.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Indian restaurants, particularly those offering lunch buffets or thali combos, deliver extraordinary value. A thali — a combination plate with dal, vegetable curries, rice, and bread — typically costs $10 to $14 and provides a balanced meal with multiple servings of legumes and vegetables. Vegetarian Indian food is especially affordable and nutritious, relying on protein-rich lentils and chickpeas rather than expensive meat.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Middle Eastern cuisine rounds out the top tier. A falafel plate with hummus, salad, and pita costs $8 to $12 at most NYC shawarma and falafel shops. Falafel is made from chickpeas — one of the most nutritious and affordable protein sources available — and the accompanying salads and pickled vegetables add fiber, vitamins, and probiotics. Check our{" "}
            <Link href="/healthy-restaurants/whole-foods" className="font-semibold text-jade hover:text-forest">
              whole-foods focused restaurants
            </Link>{" "}
            for more options built around unprocessed ingredients.
          </p>
        </section>

        <section id="neighborhoods" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Cheapest neighborhoods for healthy eating
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/queens/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Queens
            </Link>{" "}
            is the undisputed champion of affordable healthy eating in NYC. The borough&apos;s incredible ethnic diversity translates directly into culinary diversity at price points that Manhattan cannot match. Jackson Heights leads with South Asian, Tibetan, and Colombian options under $12. Flushing&apos;s massive Chinatown offers hand-pulled noodle soups, steamed dumplings, and vegetable-forward Sichuan dishes for similar prices. Astoria adds Greek, Egyptian, and Brazilian options to the mix.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The{" "}
            <Link href="/nyc/bronx/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Bronx
            </Link>{" "}
            offers the lowest absolute prices in the city. Along the Grand Concourse, in Fordham, and throughout the South Bronx, you&apos;ll find Dominican, Mexican, West African, and Bangladeshi restaurants serving hefty portions for $7 to $12. The Bronx is particularly strong for grilled-chicken based meals — pollo a la brasa (rotisserie chicken) with rice and beans is a staple that&apos;s both healthy and cheap, often running just $8 to $10 for a full plate.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Even in Manhattan, pockets of affordability exist. East Harlem, Chinatown, and parts of the Lower East Side have held onto affordable dining options. The key in Manhattan is avoiding the &quot;wellness&quot; markup — restaurants that charge premium prices for basic healthy ingredients repackaged with trendy branding. A $7 rice bowl from a Chinatown steam table is often more nutritious than a $17 &quot;Buddha bowl&quot; from a branded fast-casual chain. For a data-driven comparison, explore our{" "}
            <Link href="/guides/best-healthy-neighborhoods-nyc" className="font-semibold text-jade hover:text-forest">
              best healthy neighborhoods guide
            </Link>.
          </p>
        </section>

        <section id="ordering-strategies" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Smart ordering strategies
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            How you order matters as much as where you eat. The first rule: skip the drinks. A $3 to $5 beverage adds 25-40% to a $12 meal. Water is free at every NYC restaurant, and it&apos;s the healthiest option anyway. If you want something more interesting, ask for hot water with lemon — most restaurants provide this at no charge.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Appetizers and sides can be meals in themselves. Two vegetable-based appetizers at a Middle Eastern restaurant — say, a hummus plate and a fattoush salad — often cost less than a single entree and provide a more varied, vegetable-heavy meal. At Thai restaurants, a soup and a small rice dish can substitute for a pricier entree. At Indian spots, ordering dal and a vegetable side with rice gives you a complete meal for less than any single meat-based entree.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Counter-service restaurants are systematically cheaper than full-service restaurants for the same quality of food. You&apos;re not paying for a server, the tip expectation is lower (or zero), and the restaurant&apos;s lower labor costs translate into lower prices. Many of NYC&apos;s best healthy restaurants operate as counter-service — you order at a register, take a number, and the food comes to your table or is handed over the counter. Seek these out.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Finally, don&apos;t overlook the power of customization. Most NYC restaurants are happy to modify dishes. Ask for extra vegetables instead of rice, swap fried items for grilled, or request sauce on the side. These small changes cost nothing but can significantly improve the nutritional profile of a budget meal.
          </p>
        </section>

        <section id="hidden-gems-budget" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Hidden gems: the best budget secret
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Our directory identifies nearly 1,000{" "}
            <Link href="/search?hidden_gem=true" className="font-semibold text-jade hover:text-forest">
              hidden gem restaurants
            </Link>{" "}
            across NYC — places with high ratings but relatively few reviews. These restaurants are a budget diner&apos;s best friend, and the data explains why. Hidden gems average 4.6 out of 5 stars compared to 4.2 for the overall directory. They&apos;re concentrated in outer-borough neighborhoods where rent is lower and prices follow suit.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Why are hidden gems more affordable? Lower visibility means lower foot traffic, which means lower rent pressure and less ability to raise prices. These restaurants rely on a smaller but loyal customer base and often compensate with generous portions and competitive pricing. Many are family-run operations where the owner is also the chef, keeping overhead low and quality high.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The best way to find budget hidden gems is to explore neighborhoods you don&apos;t normally visit. Take the subway one or two stops past your usual destination. Walk a block off the main avenue. Look for restaurants with hand-written menus, limited seating, and lines at lunch. These are the places where $10 buys a meal that would cost $22 at a restaurant with better marketing and a social media presence. Use our{" "}
            <Link href="/near-me" className="font-semibold text-jade hover:text-forest">
              near-me finder
            </Link>{" "}
            to discover hidden gems in your area.
          </p>
        </section>

        <section id="by-dietary-need" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Budget eating by dietary need
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Eating on a budget while following a specific diet requires additional strategy, but it&apos;s entirely doable in NYC. For{" "}
            <Link href="/guides/vegan-nyc-borough-guide" className="font-semibold text-jade hover:text-forest">
              vegan diners
            </Link>, the best budget options include Indian restaurants (chana masala, dal, and vegetable curries are among the cheapest items on any menu), falafel shops, and Thai restaurants where tofu-based dishes are typically the least expensive protein option. Avoid &quot;trendy vegan&quot; restaurants that charge premium prices for plant-based food — seek out cuisines that are naturally vegan-friendly instead.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Gluten-free budget eating is trickier because dedicated GF items often carry a surcharge. The workaround is choosing cuisines that are naturally GF rather than restaurants that adapt wheat-based dishes. Rice-based cuisines (Thai, Vietnamese, Indian, Mexican with corn tortillas) let you eat GF without paying a premium. A bowl of pho or a plate of chicken tikka masala with rice is naturally GF and costs the same as any other menu item.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For keto and low-carb dieters, the budget challenge is that protein-heavy dishes tend to cost more than carb-heavy ones. The solution: seek out rotisserie chicken shops in the Bronx and Queens, where a half chicken with salad costs $8 to $10. Shawarma plates (meat only, skip the pita) are another strong option. Greek diners throughout the city serve omelets and grilled meat platters at reasonable prices. The key is building meals around affordable proteins — chicken, eggs, and legumes — rather than expensive cuts of meat.
          </p>
        </section>

        <section id="meal-timing" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Meal timing tricks
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            When you eat matters almost as much as where you eat. Lunch specials are the single biggest money-saving opportunity in NYC dining. Most sit-down restaurants offer lunch combos that are 30-50% cheaper than dinner prices for identical dishes. An Indian lunch special with an entree, rice, naan, and a drink for $12 might cost $20+ if you ordered the same items a la carte at dinner.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Early bird dinner specials, available at some restaurants between 5:00 and 6:30 PM, offer another window of savings. These are more common at full-service restaurants in Manhattan and Brooklyn. The portions are full size, the menu is often the same, and the prices can be 20-30% lower than peak dinner pricing. Check restaurant websites or simply ask when you call ahead.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Weekend brunch, despite its trendy reputation, can be a budget trap — especially when it includes overpriced cocktails. However, some outer-borough restaurants offer excellent weekend lunch specials that serve double duty as brunch. Dim sum in Flushing on a Saturday morning, for example, offers an enormous variety of steamed and veggie-forward small plates for $3 to $5 each, making it easy to assemble a healthy, varied meal for under $15 total.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Late-night hours can also work in your favor — see our{" "}
            <Link href="/guides/late-night-healthy-eating-nyc" className="font-semibold text-jade hover:text-forest">
              late-night healthy eating guide
            </Link>{" "}
            for specific tips on eating well after 10 PM without overspending.
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
          heading="Find affordable healthy restaurants"
          body="Search over 8,800 healthy restaurants across all five NYC boroughs. Filter by price, cuisine, dietary need, and neighborhood to find your perfect budget-friendly meal."
          primaryLabel="Search restaurants →"
          primaryHref="/search"
          secondaryLabel="Hidden gems"
          secondaryHref="/search?hidden_gem=true"
        />
      </div>
    </GuideLayout>
  )
}
