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
const guide = getGuideBySlug("gluten-free-dining-nyc")!

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.description,
  alternates: { canonical: getCanonicalUrl(`/guides/${guide.slug}`) },
  robots: { index: true, follow: true },
  openGraph: { title: guide.metaTitle, description: guide.description, type: "article" },
}

const GUIDE_FAQS = [
  {
    question: "What is the difference between gluten-free friendly and dedicated gluten-free?",
    answer: "A gluten-free friendly restaurant offers GF menu options but also prepares food containing gluten in the same kitchen. A dedicated gluten-free restaurant has no gluten-containing ingredients in the entire facility, eliminating the risk of cross-contamination. For celiac diners, dedicated facilities offer the highest level of safety. Our directory notes this distinction when the information is available.",
  },
  {
    question: "How common is cross-contamination at NYC restaurants?",
    answer: "Cross-contamination is a significant concern at any restaurant that serves both gluten-containing and gluten-free items. Shared fryers, cutting boards, prep surfaces, and even airborne flour can introduce gluten into otherwise safe dishes. Studies suggest that up to 30% of restaurant dishes labeled gluten-free may contain detectable gluten. Asking specific questions about preparation methods is essential for celiac diners.",
  },
  {
    question: "Which cuisines are naturally safest for gluten-free diners?",
    answer: "Thai, Vietnamese, Indian, Mexican, and Japanese cuisines tend to have the most naturally gluten-free options because they rely on rice, corn, and potatoes rather than wheat as staple starches. However, soy sauce (which contains wheat) is prevalent in many Asian cuisines, so always ask about specific sauces and marinades. Ethiopian cuisine, which uses teff-based injera, is another naturally GF-friendly option.",
  },
  {
    question: "Do NYC health inspections check for gluten-free compliance?",
    answer: "No. NYC Department of Health inspections evaluate food safety, hygiene, and sanitation — not dietary claims. A restaurant can receive an A health grade while still having cross-contamination risks for gluten-free diners. Health grades and GF safety are two separate considerations. We recommend checking both our health grade information and asking staff directly about GF protocols.",
  },
  {
    question: "Can I trust a restaurant that says gluten-free on the menu?",
    answer: "Not blindly. In the United States, the FDA defines gluten-free as containing fewer than 20 parts per million of gluten, but restaurant enforcement is largely self-policed. Some restaurants take the label very seriously with dedicated prep areas, while others simply omit obvious gluten ingredients without controlling for cross-contamination. Asking the right questions — about shared fryers, separate prep areas, and staff training — is the best way to gauge reliability.",
  },
  {
    question: "Are there any fully gluten-free bakeries in NYC?",
    answer: "Yes. NYC has a small but dedicated community of 100% gluten-free bakeries that produce everything from bread and pastries to cakes and cookies in facilities that never handle wheat flour. These are the safest options for celiac diners looking for baked goods. Several are included in our directory, and we continue to add more as we verify their status.",
  },
]

export default function GlutenFreeGuide() {
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
        subtitle="How to find genuinely gluten-free restaurants in NYC, what questions to ask about cross-contamination, and which neighborhoods are safest for celiac diners."
        stats={[
          { label: "Verified GF", stat: "47" },
          { label: "Dedicated kitchens", stat: "15" },
          { label: "All health graded", stat: "Yes" },
          { label: "Boroughs covered", stat: "5" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <GuideTOC
          items={[
            { href: "#understanding-gluten-free", label: "Understanding gluten-free" },
            { href: "#nyc-scene", label: "NYC's GF scene" },
            { href: "#questions-to-ask", label: "Questions to ask" },
            { href: "#best-neighborhoods", label: "Best neighborhoods" },
            { href: "#cuisines", label: "Safest cuisines" },
            { href: "#dedicated-restaurants", label: "Dedicated restaurants" },
            { href: "#cross-contamination", label: "Cross-contamination" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <section id="understanding-gluten-free" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Understanding gluten-free dining
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Gluten is a protein found in wheat, barley, rye, and their derivatives. For the estimated 1 in 100 people with celiac disease, consuming even trace amounts triggers an immune response that damages the small intestine. Beyond celiac disease, a growing number of people experience non-celiac gluten sensitivity, which can cause bloating, fatigue, headaches, and digestive discomfort. For both groups, navigating NYC&apos;s restaurant scene requires knowledge and vigilance.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The challenge in NYC is not a lack of options — it&apos;s distinguishing between restaurants that truly understand gluten-free preparation and those that simply remove the bread and call it a day. A plate of grilled chicken over salad might seem safe, but if the chicken was marinated in soy sauce (which typically contains wheat) or grilled on the same surface as a flour-dusted piece of fish, it&apos;s not safe for celiac diners.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Our directory identifies restaurants that offer{" "}
            <Link href="/healthy-restaurants/gluten-free" className="font-semibold text-jade hover:text-forest">
              verified gluten-free options
            </Link>{" "}
            and distinguishes between GF-friendly (offers options but shares kitchen space) and dedicated GF (no gluten in the facility). This distinction matters enormously for celiac diners and is often the first thing to check before making a reservation.
          </p>
        </section>

        <section id="nyc-scene" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            The NYC gluten-free scene
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            New York City has made enormous strides in gluten-free dining over the past decade. What once meant being limited to a handful of specialty restaurants has expanded into a genuine ecosystem. Dedicated gluten-free bakeries, pizzerias that serve GF crusts from separate ovens, and restaurants with detailed allergen protocols are all part of the modern NYC dining landscape.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The driving force behind this expansion is demand. NYC&apos;s health-conscious dining culture, combined with its large population of diners with dietary restrictions, has created a market incentive for restaurants to take gluten-free seriously. Restaurants that once offered a single GF pasta dish now have entire sections of their menus dedicated to gluten-free options, and many train their staff to answer allergen questions knowledgeably.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            That said, the quality and reliability of GF options varies wildly. High-end Manhattan restaurants tend to have the most rigorous allergen protocols, while casual and fast-casual spots may lack the training or kitchen infrastructure to prevent cross-contamination. Outer-borough restaurants — particularly in neighborhoods with immigrant-heavy populations — often offer naturally GF cuisines but may not be familiar with the term or its implications for celiac diners. Always ask, regardless of the setting.
          </p>
        </section>

        <section id="questions-to-ask" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Questions to ask at every restaurant
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The single most important habit for gluten-free diners is asking the right questions. Do not assume that a &quot;GF&quot; label on a menu means the dish is safe for celiac diners. Instead, communicate directly with your server or, ideally, the chef. Start with the most critical question: &quot;Do you have a separate preparation area for gluten-free items?&quot; This immediately tells you whether the kitchen takes cross-contamination seriously.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Follow up with specifics: &quot;Is the fryer shared with breaded items?&quot; Shared fryers are one of the most common contamination vectors — french fries cooked in the same oil as breaded chicken wings are not gluten-free, regardless of what the menu says. Ask about sauces and marinades: many thickened sauces use flour, and soy sauce contains wheat unless it is specifically tamari or a certified GF alternative.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Other essential questions include: &quot;Are your grains cooked in shared water?&quot; (pasta water contaminated with wheat gluten is a hidden risk), &quot;Do you change gloves when preparing GF orders?&quot; and &quot;Has your staff received allergen training?&quot; A restaurant that answers these questions confidently and without irritation is one that takes GF dining seriously. A restaurant that seems confused or dismissive is a red flag, regardless of what&apos;s written on the menu.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For an added layer of assurance, check the restaurant&apos;s{" "}
            <Link href="/guides/nyc-health-grades-explained" className="font-semibold text-jade hover:text-forest">
              NYC health inspection grade
            </Link>. While health grades don&apos;t specifically assess gluten-free protocols, a restaurant that scores well on general food safety is more likely to have strong kitchen discipline overall.
          </p>
        </section>

        <section id="best-neighborhoods" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Best neighborhoods for gluten-free dining
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            <Link href="/nyc/manhattan/healthy-restaurants" className="font-semibold text-jade hover:text-forest">
              Manhattan
            </Link>{" "}
            leads in dedicated GF options, particularly in neighborhoods with high concentrations of health-conscious diners. The West Village, Greenwich Village, and the Upper West Side have the highest density of restaurants with dedicated GF menus or separate preparation areas. The Lower East Side and East Village are also strong, with several all-GF bakeries and cafes that have become neighborhood institutions.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Brooklyn&apos;s Park Slope, Williamsburg, and Brooklyn Heights neighborhoods have embraced GF dining enthusiastically. Several Brooklyn pizzerias now offer GF crusts baked in separate ovens — a meaningful distinction from spots that simply bake GF dough in the same oven as regular pizza, which introduces contamination risk. The borough also hosts multiple dedicated GF bakeries.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Queens and the Bronx offer fewer dedicated GF restaurants but compensate with cuisines that are naturally gluten-free. Thai restaurants in Woodside and Elmhurst serve rice noodle dishes that are inherently GF (though you should always confirm soy sauce ingredients). Indian restaurants throughout Jackson Heights offer rice-based meals and lentil dishes that avoid wheat entirely. The key in these neighborhoods is knowing which cuisines and dishes are naturally safe, then confirming with staff.
          </p>
        </section>

        <section id="cuisines" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Safest cuisines for gluten-free diners
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Not all cuisines are created equal when it comes to gluten-free safety. Thai and Vietnamese cuisines are among the safest because rice noodles, rice paper, and rice itself serve as the primary starches. Pho, pad thai (verify the sauce), banh mi filling (without the bread), and most curries are naturally GF. The main watch item is soy sauce — ask for tamari or fish sauce as alternatives.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Mexican and Latin American cuisines are another strong category. Corn tortillas, rice, beans, grilled meats, salsas, and guacamole are all naturally gluten-free. Be cautious with flour tortillas (obviously), mole sauces (some use bread as a thickener), and anything fried in shared oil. Many NYC taco shops are happy to prepare everything on corn tortillas if you specify.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Ethiopian cuisine is an excellent choice — injera, the spongy flatbread central to every meal, is traditionally made from teff flour, which is naturally gluten-free. However, some NYC Ethiopian restaurants cut costs by mixing teff with wheat flour, so always ask whether their injera is 100% teff. If it is, you&apos;re in for a wonderful and completely safe GF meal.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Japanese cuisine requires more care. While sushi rice is GF, soy sauce is not (unless it&apos;s tamari), tempura is battered with wheat flour, and many Japanese sauces contain mirin or other wheat-derived ingredients. Some NYC Japanese restaurants now carry GF soy sauce, but this is still the exception rather than the rule. See our{" "}
            <Link href="/guides/vegan-nyc-borough-guide" className="font-semibold text-jade hover:text-forest">
              vegan guide
            </Link>{" "}
            for additional plant-based options that are often naturally gluten-free.
          </p>
        </section>

        <section id="dedicated-restaurants" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Dedicated gluten-free restaurants
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For celiac diners, the gold standard is a restaurant or bakery that operates a 100% gluten-free kitchen. In these facilities, there is zero risk of cross-contamination from shared equipment, airborne flour, or staff handling gluten-containing ingredients. NYC currently has roughly 15 fully dedicated GF establishments, ranging from bakeries and cafes to full-service restaurants.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Dedicated GF bakeries have been particularly transformative for the celiac community. For years, gluten-free bread, pastries, and cakes were widely regarded as poor substitutes for their wheat-based counterparts. NYC&apos;s dedicated GF bakeries have changed that perception, producing sourdough loaves, croissants, bagels, and decorated cakes that rival conventional bakeries in both taste and texture.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            The dedicated GF restaurant category also includes several pizzerias, pasta shops, and even a few fast-casual spots. These businesses were typically founded by people with celiac disease or family members of celiac sufferers who understood the need for completely safe dining environments. They tend to be deeply knowledgeable about ingredients and sourcing, making them not just safe but genuinely educational for diners learning to navigate GF eating.
          </p>
        </section>

        <section id="cross-contamination" className="mb-16 scroll-mt-24">
          <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            Understanding cross-contamination risks
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Cross-contamination occurs when gluten-containing foods or ingredients come into contact with gluten-free items during storage, preparation, or cooking. In a busy NYC restaurant kitchen, the opportunities for contamination are numerous: shared cutting boards, shared cooking oils, shared toasters, shared colanders, and even shared serving utensils can all introduce gluten into otherwise safe dishes.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Airborne contamination is another concern that many diners overlook. In kitchens where flour is used regularly — pizza shops, bakeries, pasta-making restaurants — flour particles become airborne and settle on every surface. A salad prepared in a pizza kitchen may technically contain no gluten in its ingredients, but flour dust from the pizza station can compromise it. This is why dedicated GF facilities provide such a meaningful advantage.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            For diners who are sensitive but not celiac, the risk calculus is different. Trace amounts of gluten from shared cooking surfaces may not trigger symptoms for people with non-celiac gluten sensitivity. For these diners, a restaurant with a good GF menu and reasonable kitchen practices may be perfectly adequate. The key is understanding your own sensitivity level and communicating it clearly to restaurant staff. Pair this information with{" "}
            <Link href="/healthy-restaurants/dairy-free" className="font-semibold text-jade hover:text-forest">
              dairy-free options
            </Link>{" "}
            if you also avoid dairy, as many celiac diners have multiple food sensitivities.
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
          heading="Find verified gluten-free restaurants"
          body="Browse 47 verified gluten-free restaurants across NYC, including 15 with dedicated kitchens. Filter by neighborhood, cuisine, and health grade."
          primaryLabel="Browse gluten-free →"
          primaryHref="/healthy-restaurants/gluten-free"
          secondaryLabel="Near me"
          secondaryHref="/near-me"
        />
      </div>
    </GuideLayout>
  )
}
