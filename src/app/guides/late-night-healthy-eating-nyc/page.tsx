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
const guide = getGuideBySlug("late-night-healthy-eating-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article", url: `${siteUrl}/guides/${guide.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: guide.metaTitle }] },
}

const GUIDE_FAQS = [
  {
    question: "What time counts as late-night dining in NYC?",
    answer: "For the purposes of this guide, late-night dining means eating after 10 PM. While many NYC restaurants close between 9 and 10 PM, a significant number remain open until midnight or later, and some operate 24 hours. Our directory includes working hours data for over 8,700 restaurants, letting you filter for what is genuinely open when you need it.",
  },
  {
    question: "Are late-night restaurants less healthy than daytime options?",
    answer: "Not inherently. Many restaurants serve the same menu all day, so a grilled chicken plate at 11 PM is identical to one at noon. The challenge is that late-night dining culture skews toward comfort food, bars, and delivery — environments that make unhealthy choices easier. This guide focuses on restaurants where you can eat well at any hour without compromising on nutrition.",
  },
  {
    question: "Which borough has the most late-night healthy options?",
    answer: "Manhattan has the highest absolute number of late-night healthy restaurants, concentrated in the East Village, Lower East Side, Koreatown, and parts of Midtown. Queens has strong late-night options in Flushing (where many restaurants serve until midnight or later) and Jackson Heights. Brooklyn's Williamsburg and parts of downtown Brooklyn also maintain good late-night availability.",
  },
  {
    question: "Is delivery a healthy option for late-night meals?",
    answer: "It can be, but delivery introduces challenges. Delivery menus often emphasize dishes that travel well — fried food, heavy sauces, carb-heavy preparations — over lighter options that may not hold up in transit. If you order delivery, look for dishes that are naturally transport-friendly: grain bowls, soups, grilled proteins with rice, and sturdy salads. Avoid anything described as crispy, as it will arrive soggy and is likely fried.",
  },
  {
    question: "How can I find what is open right now?",
    answer: "Our directory includes an open-now filter that uses each restaurant's listed working hours to show you only places currently serving. Visit the search page and toggle the open-now filter to see real-time availability. You can combine this with dietary filters, borough selection, and other criteria to narrow your late-night options to exactly what you need.",
  },
]

export default function LateNightGuide() {
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
        subtitle="The best healthy restaurants open late in NYC. Because eating well should not stop when the sun goes down."
        stats={[
          { label: "With hours data", stat: "8,710" },
          { label: "Open now filter", stat: "Live" },
          { label: "Real-time status", stat: "Yes" },
          { label: "All 5 boroughs", stat: "Yes" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#the-challenge", label: "The challenge" },
            { href: "#what-stays-open", label: "What stays open" },
            { href: "#by-borough", label: "By borough" },
            { href: "#best-options-by-diet", label: "Options by diet" },
            { href: "#how-to-find-them", label: "How to find them" },
            { href: "#delivery-vs-dine-in", label: "Delivery vs. dine-in" },
            { href: "#tips", label: "Tips" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="the-challenge" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            The late-night healthy eating challenge
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City is supposed to be the city that never sleeps, but its healthy restaurant scene takes a pretty solid nap after 10 PM. The majority of health-focused restaurants — salad shops, grain bowl chains, juice bars, organic cafes — close between 8 and 9 PM. What stays open tends to skew toward pizza, diners, bars serving fried appetizers, and the ever-present halal carts. For the night owl, the shift worker, or the late diner who simply does not want to eat dinner at 7 PM, finding a nutritious meal after 10 can feel impossible.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            But it is not impossible. It just requires knowing where to look and, in some cases, adjusting what you order rather than where you eat. NYC has thousands of restaurants that remain open late and serve food that is perfectly healthy — you just need to navigate their menus with intention. A Korean restaurant open until midnight has bibimbap (rice, vegetables, protein) alongside the fried chicken. A late-night Thai spot has tom kha soup alongside the pad see ew. The options exist; they&apos;re just mixed in with less healthy choices.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            This guide covers the landscape of late-night healthy dining in NYC across all five boroughs, with specific strategies for finding good food after the health-food restaurants close their doors. We also cover the delivery question — when it makes sense and when it doesn&apos;t — and provide tips for making the healthiest choices at restaurants that are not explicitly health-focused.
          </p>
        </section>

        <section id="what-stays-open" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            What types of restaurants stay open late
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Understanding which restaurant categories maintain late hours is the first step to eating well after 10 PM. Korean restaurants are among the most reliably late-night-friendly in NYC, with many locations in Koreatown (32nd Street in Manhattan) and Flushing open until midnight or later. Korean cuisine offers excellent healthy options: bibimbap, kimchi jjigae (kimchi stew), grilled meats with vegetable banchan, and tofu soups are all nutritious choices available well into the night.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Chinese restaurants, particularly in Flushing, Chinatown, and Sunset Park, commonly serve until 11 PM or midnight. The healthiest late-night Chinese options include steamed fish, hot-and-sour soup, stir-fried vegetables, and congee (rice porridge). Avoid the American-Chinese staples like General Tso&apos;s chicken and sweet-and-sour pork, which are deep-fried and sugar-heavy, and look instead for dishes from regional Chinese cuisines that emphasize steaming and braising.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Middle Eastern restaurants and halal spots are another late-night mainstay. Many shawarma and kebab restaurants in Astoria, Bay Ridge, and the East Village serve until midnight or 1 AM. Grilled meats, rice, hummus, and fresh salads are standard offerings that travel well into the late hours without any quality compromise. Greek diners — a NYC institution — are often open 24 hours and serve omelets, grilled fish, and salads alongside their more indulgent menu items.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Japanese ramen shops deserve mention as a late-night category with hidden health potential. While ramen is not typically considered diet food, many shops now offer lighter broth options (shio and shoyu over tonkotsu), extra vegetable toppings, and substitutions like zucchini noodles or half-portion noodles. A bowl of miso ramen with extra vegetables and a boiled egg is a warm, satisfying, and reasonably nutritious late-night meal.
          </p>
        </section>

        <section id="by-borough" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Late-night options by borough
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/search?open=true&borough=Manhattan" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>{" "}
            has the most late-night options, concentrated in several key corridors. Koreatown (K-Town) on 32nd Street between Fifth and Broadway is the undisputed king of late-night healthy eating — a half-dozen Korean restaurants serving until 2 AM or later, with bibimbap, grilled meats, and tofu stews available at any hour. The East Village has a strong late-night scene spanning Thai, Japanese, and Middle Eastern restaurants. Chinatown&apos;s restaurants along Mott and Bayard Streets serve late, and several Midtown restaurants near Times Square keep extended hours.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Brooklyn&apos;s late-night healthy options are concentrated in Williamsburg, where several restaurants serve past midnight, and in downtown Brooklyn along Fulton and Atlantic. Bay Ridge&apos;s Middle Eastern restaurants keep late hours, as do several spots along Fifth Avenue in Park Slope. Bedford-Stuyvesant and Crown Heights have a growing number of restaurants with extended hours, though the healthy options thin out after 11 PM.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Queens has perhaps the best late-night value in the city. Flushing&apos;s restaurants — particularly along Main Street and Roosevelt Avenue — serve late, and the food is authentic, affordable, and includes many health-friendly options. Jackson Heights adds South Asian and Latin American late-night options. Astoria&apos;s restaurant scene stays active until 11 PM on weeknights and later on weekends. The Bronx and Staten Island have fewer late-night options, but both have 24-hour diners and a handful of restaurants that stay open past 10 PM. For neighborhood-level analysis, check our{" "}
            <Link href="/guides/best-healthy-neighborhoods-nyc" className="font-semibold text-jade hover:text-forest">
              healthy neighborhoods guide
            </Link>.
          </p>
        </section>

        <section id="best-options-by-diet" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best late-night options by dietary need
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Vegan late-night dining in NYC has improved dramatically in recent years. Several dedicated vegan restaurants in the East Village and Williamsburg serve until 11 PM or midnight. Beyond dedicated spots, Thai restaurants (tofu-based curries and stir-fries), Indian restaurants (chana masala, dal, vegetable biryani), and Middle Eastern spots (falafel, hummus, baba ghanoush) all offer substantial vegan options at late hours. Korean restaurants with their extensive vegetable banchan (side dishes) are another excellent late-night vegan resource.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Gluten-free late-night diners should focus on cuisines that are naturally GF rather than seeking out dedicated GF restaurants, which typically close early. Pho shops (rice noodles), taco spots (corn tortillas), and Korean restaurants (rice-based dishes, ask about soy sauce) are your best bets. Sushi restaurants that stay open late are another option — stick to sashimi and ask for tamari or GF soy sauce. The key is knowing which dishes to order rather than which restaurants to choose.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Keto and low-carb diners actually have an advantage at late-night restaurants. Korean BBQ (grilled meat and vegetables), shawarma plates (skip the pita), grilled fish from Greek diners, and protein-heavy Japanese izakaya dishes all fit low-carb requirements and are widely available after 10 PM. The late-night diner, often maligned, becomes a keto ally when you order omelets, grilled chicken, and steamed vegetables instead of pancakes and fries. See our{" "}
            <Link href="/guides/how-eat-healthy-nyc-15-dollars" className="font-semibold text-jade hover:text-forest">
              budget eating guide
            </Link>{" "}
            for additional tips on keeping costs low while eating well at any hour.
          </p>
        </section>

        <section id="how-to-find-them" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            How to find late-night healthy restaurants
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Our directory&apos;s most powerful tool for late-night diners is the{" "}
            <Link href="/search?open=true" className="font-semibold text-jade hover:text-forest">
              &quot;open now&quot; filter
            </Link>. This feature uses each restaurant&apos;s listed working hours to show you only places that are currently serving food. Combined with dietary filters, borough selection, and rating thresholds, you can find exactly what you need in seconds — whether it&apos;s a vegan spot open in Brooklyn right now or a halal restaurant serving in Queens at midnight.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The{" "}
            <Link href="/near-me" className="font-semibold text-jade hover:text-forest">
              near-me feature
            </Link>{" "}
            is particularly useful for late-night dining, when you may not want to travel far. Enter your location, apply the open-now filter, and see what&apos;s available within walking or short-ride distance. The{" "}
            <Link href="/map" className="font-semibold text-jade hover:text-forest">
              map view
            </Link>{" "}
            gives you a visual representation of open restaurants in your area, making it easy to identify clusters of late-night options.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Beyond our directory, knowing the late-night patterns of specific neighborhoods saves time. Koreatown is reliable past midnight every night. Flushing is strong until 11-12 on weekdays and later on weekends. The East Village is NYC&apos;s most diverse late-night dining neighborhood across cuisines. Jackson Heights maintains a lively late scene on weekends. Learning these patterns lets you head toward the right neighborhood before you start searching for a specific restaurant.
          </p>
        </section>

        <section id="delivery-vs-dine-in" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Delivery vs. dine-in: the late-night trade-off
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Late-night delivery is convenient, but it introduces several challenges for healthy eating. First, delivery menus are often curated for transport durability rather than nutrition — fried food, heavy sauces, and carb-heavy dishes survive delivery better than salads, steamed vegetables, and delicate preparations. Second, the delivery platform interface itself promotes indulgence: photos of cheesy, crispy, sauce-dripping dishes are engineered to trigger cravings, not support disciplined ordering.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Third, there&apos;s a cost issue. Delivery fees, service fees, and tips can add $8 to $15 to the cost of a meal, which may push your total past budget limits even if the food itself is affordable. Dining in or picking up eliminates these extras and gives you the added benefit of seeing the food before you eat it — useful for confirming that your &quot;grilled&quot; chicken is actually grilled and not fried.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            That said, delivery has its place. If the alternative to delivery is eating nothing or raiding the pantry for processed snacks, a delivered bowl of soup and grilled chicken is the better option. The key is ordering deliberately. Decide what you want before opening the app, go directly to that restaurant, and order without browsing. Treat the delivery platform as a tool, not an entertainment experience. Order grain bowls, soups, grilled proteins with rice, and sturdy salads — dishes that maintain their quality after 20 minutes in a bag.
          </p>
        </section>

        <section id="tips" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Tips for eating well late at night
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The first and most important tip: do not arrive starving. When you sit down at 11 PM ravenous, every item on the menu looks appealing and portion control goes out the window. If you know you will be eating late, have a small snack — a handful of nuts, a piece of fruit, a yogurt — around 7 or 8 PM. This takes the edge off your hunger and lets you make a calm, deliberate decision when you finally sit down.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Second, choose restaurants with diverse menus rather than single-concept restaurants. A Korean restaurant with 80 items on the menu gives you choices; a fried chicken shop gives you one. Similarly, a Greek diner with a 10-page menu has omelets and grilled fish alongside the burgers and milkshakes. The more options available, the easier it is to find something nutritious.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Third, drink water before and during your late-night meal. Thirst is commonly mistaken for hunger, especially late at night after a long day. A glass of water before ordering may reduce the size of the meal you actually need. Skip alcohol if health is the priority — it adds empty calories, impairs food judgment, and disrupts sleep quality when consumed late at night.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Finally, consider the following day. A heavy, greasy meal at midnight will affect how you feel the next morning far more than the same meal at noon. Lighter preparations — soups, steamed dishes, grilled proteins, vegetables — digest more easily and interfere less with sleep. This is not about restriction; it&apos;s about choosing the foods that will let you feel good both tonight and tomorrow.
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
          heading="Find what's open right now"
          body="Use our real-time open-now filter to see which healthy restaurants are currently serving across all five NYC boroughs. Filter by cuisine, diet, and neighborhood."
          primaryLabel="Open right now →"
          primaryHref="/search?open=true"
          secondaryLabel="Near me"
          secondaryHref="/near-me"
        />
      </div>
    </GuideLayout>
  )
}
