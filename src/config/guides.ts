import { GUIDE_DESCRIPTIONS, guideTitle } from "@/lib/seo-titles"

export interface GuideArticle {
  slug: string
  title: string
  metaTitle: string
  shortTitle: string
  description: string
  category: string
  emoji: string
  readTime: string
  featured: boolean
  publishedDate: string
  /** Copy revision. Sitemap lastmod uses this when the publish date should stay put. */
  updatedDate?: string
  keywords: string[]
  relatedGuides: string[]
  relatedHubPages: Array<{ label: string; href: string }>
}

export const GUIDE_CATEGORIES = [
  "Health & Safety",
  "Dietary Guides",
  "Budget Dining",
  "Neighborhood Guides",
  "Dining Situations",
  "About Our Data",
] as const

export const GUIDES: GuideArticle[] = [
  {
    slug: "nyc-health-grades-explained",
    title: "NYC Restaurant Health Grades Explained — A to C, What They Really Mean",
    metaTitle: guideTitle("nyc-health-grades-explained", "NYC Restaurant Grades"),
    shortTitle: "NYC Health Grades Explained",
    description: "NYC restaurant grades: A is 0–13 points, B is 14–27, and C is 28 or more. What Grade Pending and a Z in the DOHMH data mean.",
    category: "Health & Safety",
    emoji: "🏥",
    readTime: "8 min read",
    featured: true,
    publishedDate: "2026-01-15",
    keywords: ["nyc restaurant health grade", "nyc health inspection grade", "restaurant grade nyc"],
    relatedGuides: ["nyc-restaurant-inspection-process", "hidden-gem-restaurants-nyc", "best-healthy-neighborhoods-nyc"],
    relatedHubPages: [
      { label: "Browse Grade A restaurants", href: "/healthy-restaurants/grade-a" },
      { label: "View health grade map", href: "/map" },
      { label: "Manhattan Grade A restaurants", href: "/nyc/manhattan/healthy-restaurants" },
    ],
  },
  {
    slug: "nyc-restaurant-inspection-process",
    title: "How the NYC Restaurant Inspection Process Works — A Diner's Guide",
    metaTitle: guideTitle("nyc-restaurant-inspection-process", "NYC Inspections"),
    shortTitle: "NYC Restaurant Inspection Process",
    description: "NYC inspects restaurants at least once a year. Under 14 points is a Grade A. A first-visit score of 14 or more is ungraded until reinspection.",
    category: "Health & Safety",
    emoji: "📋",
    readTime: "7 min read",
    featured: false,
    publishedDate: "2026-01-20",
    keywords: ["nyc restaurant inspection", "how restaurant inspections work nyc", "nyc dohmh inspection"],
    relatedGuides: ["nyc-health-grades-explained", "hidden-gem-restaurants-nyc"],
    relatedHubPages: [
      { label: "Search Grade A restaurants", href: "/healthy-restaurants/grade-a" },
      { label: "Neighborhood health comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "vegan-nyc-borough-guide",
    title: "Vegan NYC — A Borough-by-Borough Guide to Plant-Based Dining",
    metaTitle: guideTitle("vegan-nyc-borough-guide", "Vegan Restaurants NYC"),
    shortTitle: "Vegan NYC Guide",
    description: GUIDE_DESCRIPTIONS["vegan-nyc-borough-guide"],
    category: "Dietary Guides",
    emoji: "🌱",
    readTime: "10 min read",
    featured: true,
    publishedDate: "2026-01-25",
    keywords: ["vegan restaurants nyc", "vegan nyc guide", "best vegan restaurants new york city"],
    relatedGuides: ["gluten-free-dining-nyc", "best-healthy-neighborhoods-nyc", "how-eat-healthy-nyc-15-dollars"],
    relatedHubPages: [
      { label: "Browse all vegan restaurants", href: "/healthy-restaurants/vegan" },
      { label: "Vegan restaurants in Manhattan", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Vegan restaurants in Brooklyn", href: "/nyc/brooklyn/healthy-restaurants" },
    ],
  },
  {
    slug: "halal-food-guide-nyc",
    title: "The Complete Halal Food Guide to NYC — Every Borough Covered",
    metaTitle: guideTitle("halal-food-guide-nyc", "Halal Restaurants NYC"),
    shortTitle: "Halal Food Guide NYC",
    description: GUIDE_DESCRIPTIONS["halal-food-guide-nyc"],
    category: "Dietary Guides",
    emoji: "🕌",
    readTime: "9 min read",
    featured: true,
    publishedDate: "2026-02-01",
    keywords: ["halal food nyc", "halal restaurants new york city", "best halal nyc"],
    relatedGuides: ["kosher-dining-nyc-guide", "best-healthy-neighborhoods-nyc", "nyc-health-grades-explained"],
    relatedHubPages: [
      { label: "Browse all halal restaurants", href: "/healthy-restaurants/halal" },
      { label: "Halal in Queens", href: "/nyc/queens/healthy-restaurants" },
      { label: "Halal in the Bronx", href: "/nyc/bronx/healthy-restaurants" },
    ],
  },
  {
    slug: "gluten-free-dining-nyc",
    title: "Gluten-Free Dining in NYC — What You Need to Know Before You Go",
    metaTitle: guideTitle("gluten-free-dining-nyc", "Gluten-Free NYC"),
    shortTitle: "Gluten-Free NYC Guide",
    description: GUIDE_DESCRIPTIONS["gluten-free-dining-nyc"],
    category: "Dietary Guides",
    emoji: "🌾",
    readTime: "8 min read",
    featured: false,
    publishedDate: "2026-02-05",
    keywords: ["gluten free restaurants nyc", "gluten free dining new york", "celiac restaurants nyc"],
    relatedGuides: ["vegan-nyc-borough-guide", "nyc-health-grades-explained", "how-eat-healthy-nyc-15-dollars"],
    relatedHubPages: [
      { label: "Browse gluten-free restaurants", href: "/healthy-restaurants/gluten-free" },
      { label: "Gluten-free in Manhattan", href: "/nyc/manhattan/healthy-restaurants" },
    ],
  },
  {
    slug: "how-eat-healthy-nyc-15-dollars",
    title: "How to Eat Healthy in NYC on $15 a Day — The Practical Guide",
    metaTitle: guideTitle("how-eat-healthy-nyc-15-dollars", "Eat Healthy NYC for $15"),
    shortTitle: "Eat Healthy in NYC on $15",
    description: GUIDE_DESCRIPTIONS["how-eat-healthy-nyc-15-dollars"],
    category: "Budget Dining",
    emoji: "💵",
    readTime: "9 min read",
    featured: false,
    publishedDate: "2026-02-10",
    keywords: ["healthy food nyc cheap", "cheap healthy restaurants nyc", "eat healthy nyc budget"],
    relatedGuides: ["best-healthy-neighborhoods-nyc", "vegan-nyc-borough-guide", "hidden-gem-restaurants-nyc"],
    relatedHubPages: [
      { label: "Browse by diet", href: "/healthy-restaurants" },
      { label: "Hidden gems near you", href: "/guides/hidden-gem-restaurants-nyc" },
      { label: "Browse Queens", href: "/nyc/queens/healthy-restaurants" },
    ],
  },
  {
    slug: "best-healthy-neighborhoods-nyc",
    title: "The Best Healthy Neighborhoods in NYC for Dining Out — Ranked",
    metaTitle: guideTitle("best-healthy-neighborhoods-nyc", "Healthy NYC Neighborhoods"),
    shortTitle: "Best Healthy Neighborhoods NYC",
    description: GUIDE_DESCRIPTIONS["best-healthy-neighborhoods-nyc"],
    category: "Neighborhood Guides",
    emoji: "🗺️",
    readTime: "10 min read",
    featured: true,
    publishedDate: "2026-02-15",
    keywords: ["healthiest neighborhoods nyc", "best neighborhoods nyc healthy food", "nyc neighborhood healthy restaurants"],
    relatedGuides: ["nyc-health-grades-explained", "how-eat-healthy-nyc-15-dollars", "vegan-nyc-borough-guide"],
    relatedHubPages: [
      { label: "Compare all neighborhoods", href: "/nyc/compare" },
      { label: "Manhattan neighborhoods", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Brooklyn neighborhoods", href: "/nyc/brooklyn/healthy-restaurants" },
    ],
  },
  {
    slug: "hidden-gem-restaurants-nyc",
    title: "What Are Hidden Gem Restaurants — and How We Find Them in NYC",
    metaTitle: guideTitle("hidden-gem-restaurants-nyc", "Hidden Gems NYC"),
    shortTitle: "Hidden Gem Restaurants NYC",
    description: GUIDE_DESCRIPTIONS["hidden-gem-restaurants-nyc"],
    category: "About Our Data",
    emoji: "💎",
    readTime: "6 min read",
    featured: false,
    publishedDate: "2026-02-20",
    keywords: ["hidden gem restaurants nyc", "underrated restaurants new york", "best unknown restaurants nyc"],
    relatedGuides: ["nyc-health-grades-explained", "best-healthy-neighborhoods-nyc", "how-eat-healthy-nyc-15-dollars"],
    relatedHubPages: [
      { label: "Browse all hidden gems", href: "/guides/hidden-gem-restaurants-nyc" },
      { label: "Hidden gems near me", href: "/near-me" },
      { label: "Neighborhood comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "kosher-dining-nyc-guide",
    title: "Kosher Dining in NYC — The Complete Borough-by-Borough Guide",
    metaTitle: guideTitle("kosher-dining-nyc-guide", "Kosher Restaurants NYC"),
    shortTitle: "Kosher Dining NYC Guide",
    description: GUIDE_DESCRIPTIONS["kosher-dining-nyc-guide"],
    category: "Dietary Guides",
    emoji: "✡️",
    readTime: "8 min read",
    featured: false,
    publishedDate: "2026-02-25",
    keywords: ["kosher restaurants nyc", "kosher dining new york city", "best kosher nyc"],
    relatedGuides: ["halal-food-guide-nyc", "nyc-health-grades-explained", "best-healthy-neighborhoods-nyc"],
    relatedHubPages: [
      { label: "Browse kosher restaurants", href: "/healthy-restaurants/kosher" },
      { label: "Kosher in Manhattan", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Brooklyn kosher dining", href: "/nyc/brooklyn/healthy-restaurants" },
    ],
  },
  {
    slug: "late-night-healthy-eating-nyc",
    title: "Late Night Healthy Eating in NYC — Where to Go After 10PM",
    metaTitle: guideTitle("late-night-healthy-eating-nyc", "Late Night Healthy NYC"),
    shortTitle: "Late Night Healthy NYC",
    description: "Late-night healthy food in NYC means eating after 10pm. Browse borough hubs for listings that include hours and the NYC health inspection grade.",
    category: "Dining Situations",
    emoji: "🌙",
    readTime: "7 min read",
    featured: false,
    publishedDate: "2026-03-01",
    keywords: ["healthy late night food nyc", "late night healthy restaurants new york", "nyc healthy food open late"],
    relatedGuides: ["best-healthy-neighborhoods-nyc", "how-eat-healthy-nyc-15-dollars", "hidden-gem-restaurants-nyc"],
    relatedHubPages: [
      { label: "Open right now", href: "/search?open=true" },
      { label: "Manhattan late night", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Search open restaurants", href: "/search?open=true&borough=Manhattan" },
    ],
  },
  {
    slug: "seafood-healthy-restaurants-nyc",
    title: "The Best Seafood Restaurants in NYC for Health-Conscious Diners",
    metaTitle: guideTitle("seafood-healthy-restaurants-nyc", "Healthy Seafood NYC"),
    shortTitle: "Healthy Seafood NYC",
    description: GUIDE_DESCRIPTIONS["seafood-healthy-restaurants-nyc"],
    category: "Dietary Guides",
    emoji: "🐟",
    readTime: "9 min read",
    featured: false,
    publishedDate: "2026-04-01",
    keywords: [
      "seafood restaurants nyc",
      "healthy seafood nyc",
      "fish restaurants new york city",
      "best salmon restaurants nyc",
    ],
    relatedGuides: [
      "nyc-health-grades-explained",
      "best-healthy-neighborhoods-nyc",
      "how-eat-healthy-nyc-15-dollars",
    ],
    relatedHubPages: [
      { label: "Whole foods restaurants NYC", href: "/healthy-restaurants/whole-foods" },
      { label: "Healthy restaurants in Manhattan", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Healthy restaurants in Brooklyn", href: "/nyc/brooklyn/healthy-restaurants" },
      { label: "NYC neighborhood health comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "healthy-breakfast-nyc",
    title: "Healthy breakfast in NYC",
    metaTitle: guideTitle("healthy-breakfast-nyc", "Healthy Breakfast NYC"),
    shortTitle: "Healthy Breakfast NYC",
    description: GUIDE_DESCRIPTIONS["healthy-breakfast-nyc"],
    category: "Dining Situations",
    emoji: "🌅",
    readTime: "4 min read",
    featured: false,
    publishedDate: "2026-04-01",
    updatedDate: "2026-11-23",
    keywords: [
      "healthy breakfast nyc",
      "best breakfast restaurants nyc",
      "healthy brunch nyc",
      "whole food breakfast new york",
    ],
    relatedGuides: [
      "nyc-health-grades-explained",
      "best-healthy-neighborhoods-nyc",
      "vegan-nyc-borough-guide",
    ],
    relatedHubPages: [
      { label: "Whole foods restaurants NYC", href: "/healthy-restaurants/whole-foods" },
      { label: "Vegan restaurants NYC", href: "/healthy-restaurants/vegan" },
      { label: "Dairy-free restaurants NYC", href: "/healthy-restaurants/dairy-free" },
      { label: "NYC neighborhood health comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "best-italian-restaurants-nyc",
    title: "Best Italian Restaurants in NYC: Top 10 Ranked",
    metaTitle: "Best Italian Restaurants in NYC: Top 10 Ranked",
    shortTitle: "Best Italian Restaurants NYC",
    description: "The best Italian restaurants in NYC, ranked by current NYC Health Department Grade A scores and violation counts, verified against official DOHMH Open Data.",
    category: "Dining Situations",
    emoji: "🍝",
    readTime: "12 min read",
    featured: true,
    publishedDate: "2026-11-23",
    updatedDate: "2026-11-24",
    keywords: [
      "best italian restaurants in nyc",
      "best italian restaurants nyc",
      "grade a italian restaurants nyc",
    ],
    relatedGuides: [
      "nyc-health-grades-explained",
      "nyc-restaurant-inspection-process",
      "best-pizza-restaurants-nyc",
      "best-healthy-neighborhoods-nyc",
      "hidden-gem-restaurants-nyc",
    ],
    relatedHubPages: [
      { label: "Browse Grade A restaurants", href: "/healthy-restaurants/grade-a" },
      { label: "Manhattan healthy restaurants", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Brooklyn healthy restaurants", href: "/nyc/brooklyn/healthy-restaurants" },
      { label: "Staten Island healthy restaurants", href: "/nyc/staten-island/healthy-restaurants" },
      { label: "Neighborhood health comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "best-pizza-restaurants-nyc",
    title: "Best Pizza Restaurants in NYC (2026): Top 10 Ranked",
    metaTitle: "Best Pizza Restaurants in NYC (2026): Top 10 Ranked",
    shortTitle: "Best Pizza Restaurants NYC",
    description:
      "The best pizza restaurants in NYC, ranked by current NYC Health Department Grade A scores and violation counts, verified against official DOHMH Open Data.",
    category: "Dining Situations",
    emoji: "🍕",
    readTime: "12 min read",
    featured: true,
    publishedDate: "2026-11-24",
    keywords: [
      "best pizza restaurants in nyc",
      "best pizza restaurants nyc",
      "grade a pizza restaurants nyc",
    ],
    relatedGuides: [
      "best-italian-restaurants-nyc",
      "nyc-health-grades-explained",
      "nyc-restaurant-inspection-process",
      "best-healthy-neighborhoods-nyc",
    ],
    relatedHubPages: [
      { label: "Browse Grade A restaurants", href: "/healthy-restaurants/grade-a" },
      { label: "Manhattan healthy restaurants", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Brooklyn healthy restaurants", href: "/nyc/brooklyn/healthy-restaurants" },
      { label: "Queens healthy restaurants", href: "/nyc/queens/healthy-restaurants" },
      { label: "Staten Island healthy restaurants", href: "/nyc/staten-island/healthy-restaurants" },
      { label: "Bronx healthy restaurants", href: "/nyc/bronx/healthy-restaurants" },
      { label: "Neighborhood health comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "grade-a-restaurants-by-borough-nyc",
    title: "Grade A Restaurants by Borough: 3 NYC Matches (2026)",
    metaTitle: "Grade A Restaurants by Borough: 3 NYC Matches (2026)",
    shortTitle: "Grade A by Borough",
    description:
      "Grade A restaurants by borough in NYC, verified November 24, 2026. Three latest DOHMH inspections are Grade A and match the listing.",
    category: "Health & Safety",
    emoji: "A",
    readTime: "9 min read",
    featured: false,
    publishedDate: "2026-11-24",
    keywords: ["grade a restaurants by borough nyc"],
    relatedGuides: [
      "nyc-health-grades-explained",
      "nyc-restaurant-inspection-process",
      "best-italian-restaurants-nyc",
      "best-pizza-restaurants-nyc",
    ],
    relatedHubPages: [
      { label: "Browse Grade A restaurants", href: "/healthy-restaurants/grade-a" },
      { label: "Manhattan healthy restaurants", href: "/nyc/manhattan/healthy-restaurants" },
      { label: "Brooklyn healthy restaurants", href: "/nyc/brooklyn/healthy-restaurants" },
      { label: "Queens healthy restaurants", href: "/nyc/queens/healthy-restaurants" },
      { label: "Bronx healthy restaurants", href: "/nyc/bronx/healthy-restaurants" },
      { label: "Staten Island healthy restaurants", href: "/nyc/staten-island/healthy-restaurants" },
    ],
  },
]

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function getRelatedGuides(slug: string): GuideArticle[] {
  const guide = getGuideBySlug(slug)
  if (!guide) return []
  return guide.relatedGuides.map((s) => getGuideBySlug(s)).filter(Boolean) as GuideArticle[]
}

export function getGuidesByCategory(category: string): GuideArticle[] {
  return GUIDES.filter((g) => g.category === category)
}

export function getFeaturedGuides(): GuideArticle[] {
  return GUIDES.filter((g) => g.featured)
}
