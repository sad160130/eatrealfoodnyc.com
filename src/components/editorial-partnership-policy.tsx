import Link from "next/link"
import { GENERAL_CONTACT_EMAIL, PRESS_CONTACT_EMAIL } from "@/config/contact"

const FREE_RULES = [
  {
    title: "Listing is free.",
    body: "Any restaurant that meets our inclusion criteria can appear in the directory at no cost. Paying is never a condition of being listed, remaining listed, or having data corrected.",
  },
  {
    title: "Health grades are never for sale.",
    body: "Letter grades, numeric inspection scores, inspection dates, and violation records come from the NYC DOHMH Open Data portal. We do not alter, hide, delay, or soften official inspection data for any restaurant, Partner or not.",
  },
  {
    title: "Default and organic rankings are never for sale.",
    body: "Search results, neighborhood pages, diet-tag pages, hidden-gem lists, Health Scores, and any default sort are determined by data and the published methodology. A Partner does not rank higher in those views because they pay.",
  },
  {
    title: "Dietary tags and hidden-gem status are never for sale.",
    body: "Tags follow the conservative evidence thresholds in these Editorial Standards. Hidden gems are identified algorithmically (rating, review count, operating status). Owners may request a review of a tag or designation; they may not buy one.",
  },
  {
    title: "Reviews are never for sale.",
    body: "The only diner reviews we publish come from real submissions and are reviewed before they go live. We do not publish fake, fabricated, or AI-impersonated reviews, and we do not accept payment for a favorable description.",
  },
]

const DISCLOSURE_RULES = [
  "Plain language. We use “Partner” or “Sponsored” (or “Presented by” on a sponsor unit). We do not use vague labels such as “Recommended,” “Featured,” “Spotlight,” or “Hand-picked” for paid placements.",
  "On the placement itself. The label appears on every paid module, listing card, and sponsor unit — next to the restaurant or brand name, in a contrast and size that a typical reader will notice.",
  "On the listing page. If a restaurant is a current Partner, the listing page says so, in plain language, near the top of the page.",
  "Separation from organic results. Paid modules are visually distinct and labeled. They are not interleaved into the default organic ranking without a label on each paid item.",
  "No implied endorsement of the grade. Partner status is not presented as a health or safety endorsement. The official grade remains the official grade.",
  "Affiliate links. If we later add booking or reservation affiliate links (for example OpenTable or Resy), those links are disclosed, and they do not affect grades, tags, or organic rankings.",
  "This policy is public. A short notice on Partner and sponsor pages points back here.",
]

const PRODUCTS = [
  {
    product: "Partner Listing",
    what: "Labeled upgrade of an eligible restaurant listing, plus placement in labeled Partner modules.",
    label: "Partner",
  },
  {
    product: "Neighborhood or diet-category sponsor",
    what: "Labeled sponsorship of a neighborhood or diet-tag page.",
    label: "Sponsored or Presented by",
  },
  {
    product: "Homepage sponsor",
    what: "Labeled sponsorship of the homepage.",
    label: "Sponsored or Presented by",
  },
  {
    product: "Newsletter sponsor",
    what: "Labeled sponsorship of a future email newsletter, once it exists. Not for sale today.",
    label: "Sponsored",
  },
]

function RuleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  )
}

export default function EditorialPartnershipPolicy() {
  return (
    <section id="editorial-partnership-policy" className="mb-16 scroll-mt-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">PARTNERSHIPS</p>
      <h2 className="mb-6 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        Editorial &amp; Partnership Policy
      </h2>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-base leading-relaxed text-gray-700">
          Eat Real Food NYC is a free directory of New York City restaurants, built on official NYC
          Department of Health and Mental Hygiene (DOHMH) inspection data and conservative dietary
          tagging. A restaurant never pays to be listed, to receive a health grade, or to move up in
          our default or organic rankings. We may accept clearly labeled Partner listings and
          sponsorships from restaurants and brands that meet the eligibility rules below. Those
          placements are advertising, disclosed as such, and they never change a grade, a Health
          Score, a dietary tag, a hidden-gem designation, or the organic sort order.
        </p>
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        1. What remains free and independent
      </h3>
      <div className="space-y-4">
        {FREE_RULES.map((rule) => (
          <RuleCard key={rule.title} title={rule.title} body={rule.body} />
        ))}
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        2. What a Partner placement is
      </h3>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm leading-relaxed text-gray-700">
          A Partner placement is a paid, optional, clearly labeled advertising product. It is an
          enhancement to an already eligible listing, not a way to buy entry into the directory.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          Partner and sponsor placements may include, depending on the product: a visible Partner or
          Sponsored label on the listing, in designated modules, and on sponsor units; priority or
          reserved placement in clearly labeled Partner or Sponsored modules (for example, “Partner
          restaurants in this neighborhood”), never inside the unlabeled organic list; an upgraded
          listing profile (owner-supplied photos, a short owner description we review for accuracy,
          a current offer or link); and category, neighborhood, borough, homepage, or newsletter
          sponsorships, each marked as sponsorship.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          We will not present a Partner as an editorial pick, a “best of” winner, or an organic top result.
        </p>
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        3. How we disclose
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-700">
        We follow the spirit of the FTC’s Endorsement Guides: a material connection must be clear
        and conspicuous, not buried in fine print. If a format cannot meet these rules, we will not sell it.
      </p>
      <div className="space-y-3">
        {DISCLOSURE_RULES.map((item, index) => (
          <div key={item} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <span className="mt-0.5 flex-shrink-0 text-sm font-bold text-sage">{index + 1}</span>
            <p className="text-sm leading-relaxed text-gray-700">{item}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        4. Who can become a Partner
      </h3>
      <div className="space-y-4">
        <RuleCard
          title="Food safety"
          body="The restaurant must have either a current Grade A from NYC DOHMH, or no current letter grade and no open or current violations in the latest official record we have (for example, a new restaurant that has not yet been graded). A current Grade B, Grade C, pending re-inspection with unresolved violations, or a grade we cannot verify makes the restaurant ineligible. If a live Partner later falls below this standard, we pause or remove the Partner placement until the restaurant is eligible again. The official grade on the listing stays visible throughout."
        />
        <RuleCard
          title="Healthy-directory fit"
          body="The restaurant must reasonably belong in a healthy-eating directory. It should have one or more dietary tags under our conservative tagging rules (for example vegan, vegetarian, halal, kosher, gluten-free, dairy-free, keto, paleo, whole-foods, low-calorie, raw-food, or nut-free), or otherwise meet our published inclusion criteria for healthy or whole-food-oriented dining. Movie theaters, tour companies, catering-only operations, and restaurants that do not fit the directory’s purpose are not eligible, paid or unpaid."
        />
        <RuleCard
          title="Accuracy and conduct"
          body="Owner-supplied copy, photos, and offers must be accurate. We may edit for length, clarity, and policy compliance, and we may refuse copy that overclaims certifications, grades, or health benefits. Partners may not ask us to change, hide, or delay inspection data, Health Scores, tags, or organic rankings. We may decline or end a partnership that would mislead diners or conflict with this policy, and we will refund unused prepaid time if we are the ones who end it for a policy reason. We do not guarantee that every eligible restaurant will be accepted. Inventory may be limited, especially for exclusive category or homepage sponsorships."
        />
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        5. What Partners do not get
      </h3>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <ul className="space-y-2 text-sm leading-relaxed text-gray-700">
          {[
            "A better health grade, score, inspection date, or violation history",
            "A higher Health Score or a change to the Health Score formula",
            "A dietary tag they have not earned under our evidence rules",
            "Hidden-gem status",
            "A higher position in default or organic search, neighborhood, or diet-tag rankings",
            "Removal or softening of negative official data",
            "Fake reviews or paid “favorable descriptions” presented as editorial voice",
            "The right to keep a Partner badge after becoming ineligible",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="flex-shrink-0 text-sage" aria-hidden="true">–</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        6. Advertising products we may offer
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-700">
        Subject to this policy. What each product includes is described on{" "}
        <Link href="/partner-with-us" className="font-semibold text-jade hover:text-forest">
          Partner with us
        </Link>
        . Rates are available on request and are not published on the site. Products may be added
        or retired; this policy still governs them.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-4 font-semibold text-forest">Product</th>
              <th className="px-5 py-4 font-semibold text-forest">What it is</th>
              <th className="px-5 py-4 font-semibold text-forest">Label</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((row) => (
              <tr key={row.product} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4 align-top font-semibold text-forest">{row.product}</td>
                <td className="px-5 py-4 align-top text-gray-700">{row.what}</td>
                <td className="px-5 py-4 align-top text-gray-700">{row.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-4 mt-10 text-2xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        7. Corrections, complaints, and contact
      </h3>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm leading-relaxed text-gray-700">
          Diners, journalists, and restaurant owners can report an error, an unclear disclosure, or
          a policy concern. We will review reports and correct confirmed errors promptly.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          For policy questions, partnership inquiries, or to report a concern, use the{" "}
          <Link href="/contact" className="font-semibold text-jade hover:text-forest">contact page</Link>
          {" "}or{" "}
          <a href={`mailto:${GENERAL_CONTACT_EMAIL}`} className="font-semibold text-jade hover:text-forest">
            {GENERAL_CONTACT_EMAIL}
          </a>
          . Media inquiries:{" "}
          <a href={`mailto:${PRESS_CONTACT_EMAIL}`} className="font-semibold text-jade hover:text-forest">
            {PRESS_CONTACT_EMAIL}
          </a>
          . Partnership inquiries use that same contact until a dedicated inbox is published.
        </p>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-gray-600">
        Paid Partner and sponsor placements are clearly labeled. They never change a health grade,
        a Health Score, or our default rankings.
      </p>
    </section>
  )
}
