import { weekdayOpening } from "@/lib/breakfast-hours"
import { parseDietaryTags } from "@/lib/utils"

export interface GuideLink {
  href: string
  label: string
}

const TAG_GUIDES: Record<string, GuideLink> = {
  seafood: { href: "/guides/seafood-healthy-restaurants-nyc", label: "healthy seafood restaurants in NYC" },
  halal: { href: "/guides/halal-food-guide-nyc", label: "halal food in NYC" },
  kosher: { href: "/guides/kosher-dining-nyc-guide", label: "kosher dining in NYC" },
  vegan: { href: "/guides/vegan-nyc-borough-guide", label: "vegan restaurants in NYC" },
  "gluten-free": { href: "/guides/gluten-free-dining-nyc", label: "gluten-free dining in NYC" },
}

/**
 * Cuisine and hours links for a listing. Italian, pizza, Ethiopian, Peruvian,
 * and bagels come from the cuisine type or, for Peruvian, the listing name.
 * Seafood, halal, kosher, vegan, and
 * gluten-free come from tags, with seafood also matched on the cuisine type.
 * Breakfast is a listing open by 8:00 AM on every weekday. Flushing is the
 * directory neighborhood in Queens.
 */
export function listingGuideLinks(input: {
  type: string | null
  name?: string | null
  dietaryTags: string | null
  workingHours: string | null
  neighborhood?: string | null
  borough?: string | null
}): GuideLink[] {
  const links: GuideLink[] = []
  const seen = new Set<string>()
  const add = (link: GuideLink) => {
    if (seen.has(link.href)) return
    seen.add(link.href)
    links.push(link)
  }
  const type = input.type ?? ""
  const name = input.name ?? ""
  if (/\bitalian\b/i.test(type)) {
    add({ href: "/guides/best-italian-restaurants-nyc", label: "best Italian restaurants in NYC" })
  }
  if (/\bpizza\b/i.test(type)) {
    add({ href: "/guides/best-pizza-restaurants-nyc", label: "best pizza restaurants in NYC" })
  }
  if (/\bethiopian\b/i.test(type)) {
    add({ href: "/guides/ethiopian-restaurants-nyc", label: "Ethiopian restaurants NYC" })
  }
  if (/\bperuvian\b/i.test(type) || /\bperuvian\b/i.test(name)) {
    add({ href: "/guides/peruvian-restaurants-nyc", label: "peruvian restaurants nyc" })
  }
  if (/\bbagels?\b|\bpretzels?\b|bagels\/pretzels/i.test(type)) {
    add({ href: "/guides/best-bagels-nyc", label: "best bagels in NYC" })
  }
  if (/\bseafood\b/i.test(type)) add(TAG_GUIDES.seafood)
  const tags = parseDietaryTags(input.dietaryTags)
  for (const tag of ["seafood", "halal", "kosher", "vegan", "gluten-free"]) {
    if (tags.includes(tag)) add(TAG_GUIDES[tag])
  }
  if (weekdayOpening(input.workingHours)) {
    add({ href: "/guides/healthy-breakfast-nyc", label: "healthy breakfast in NYC" })
  }
  const neighborhood = (input.neighborhood ?? "").trim().toLowerCase()
  const borough = (input.borough ?? "").trim().toLowerCase()
  if (neighborhood === "flushing" && borough === "queens") {
    add({ href: "/guides/best-restaurants-flushing", label: "Grade A restaurants in Flushing" })
  }
  return links
}
