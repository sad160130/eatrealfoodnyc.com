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
    metaTitle: "NYC Restaurant Health Grades — A, B, C Explained",
    shortTitle: "NYC Health Grades Explained",
    description: "What Grade A, B, and C really mean, how the NYC inspection process works, and what every diner should know before eating out.",
    category: "Health & Safety",
    emoji: "🏥",
    readTime: "8 min read",
    featured: true,
    publishedDate: "2026-01-15",
    keywords: ["nyc restaurant health grade", "nyc health inspection grade", "restaurant grade nyc"],
    relatedGuides: ["nyc-restaurant-inspection-process", "hidden-gem-restaurants-nyc", "best-healthy-neighborhoods-nyc"],
    relatedHubPages: [
      { label: "Browse Grade A restaurants", href: "/search?grade=A" },
      { label: "View health grade map", href: "/map" },
      { label: "Manhattan Grade A restaurants", href: "/nyc/manhattan/healthy-restaurants" },
    ],
  },
  {
    slug: "nyc-restaurant-inspection-process",
    title: "How the NYC Restaurant Inspection Process Works — A Diner's Guide",
    metaTitle: "NYC Restaurant Inspections — How It Works",
    shortTitle: "NYC Restaurant Inspection Process",
    description: "A step-by-step breakdown of how NYC restaurants are inspected, what happens when they fail, and how to read an inspection report.",
    category: "Health & Safety",
    emoji: "📋",
    readTime: "7 min read",
    featured: false,
    publishedDate: "2026-01-20",
    keywords: ["nyc restaurant inspection", "how restaurant inspections work nyc", "nyc dohmh inspection"],
    relatedGuides: ["nyc-health-grades-explained", "hidden-gem-restaurants-nyc"],
    relatedHubPages: [
      { label: "Search Grade A restaurants", href: "/search?grade=A" },
      { label: "Neighborhood health comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "vegan-nyc-borough-guide",
    title: "Vegan NYC — A Borough-by-Borough Guide to Plant-Based Dining",
    metaTitle: "Vegan NYC Restaurants — Borough-by-Borough Guide",
    shortTitle: "Vegan NYC Guide",
    description: "The definitive guide to vegan dining across all five NYC boroughs. Best neighborhoods, what to expect, and how to find the most committed plant-based kitchens.",
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
    metaTitle: "Halal Restaurants NYC — Complete Guide (2026)",
    shortTitle: "Halal Food Guide NYC",
    description: "Where to find the best halal restaurants in NYC, which neighborhoods have the highest concentration, and what to know about halal certification in New York.",
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
    metaTitle: "Gluten-Free Restaurants NYC — What to Know",
    shortTitle: "Gluten-Free NYC Guide",
    description: "How to find genuinely gluten-free restaurants in NYC, what questions to ask about cross-contamination, and which neighborhoods are safest for celiac diners.",
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
    metaTitle: "Eat Healthy in NYC for $15 — Practical Guide",
    shortTitle: "Eat Healthy in NYC on $15",
    description: "Practical strategies for eating nutritious meals in New York City without breaking the bank. Best cheap healthy restaurants, neighborhoods, and ordering strategies.",
    category: "Budget Dining",
    emoji: "💵",
    readTime: "9 min read",
    featured: false,
    publishedDate: "2026-02-10",
    keywords: ["healthy food nyc cheap", "cheap healthy restaurants nyc", "eat healthy nyc budget"],
    relatedGuides: ["best-healthy-neighborhoods-nyc", "vegan-nyc-borough-guide", "hidden-gem-restaurants-nyc"],
    relatedHubPages: [
      { label: "Search by price range", href: "/search" },
      { label: "Hidden gems near you", href: "/search?hidden_gem=true" },
      { label: "Browse Queens", href: "/nyc/queens/healthy-restaurants" },
    ],
  },
  {
    slug: "best-healthy-neighborhoods-nyc",
    title: "The Best Healthy Neighborhoods in NYC for Dining Out — Ranked",
    metaTitle: "Healthiest NYC Neighborhoods for Dining — Ranked",
    shortTitle: "Best Healthy Neighborhoods NYC",
    description: "Which NYC neighborhoods have the highest concentration of healthy restaurants, best health inspection grades, and most dietary diversity. Data-driven rankings across all five boroughs.",
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
    metaTitle: "Hidden Gem Restaurants NYC — How We Find Them",
    shortTitle: "Hidden Gem Restaurants NYC",
    description: "How we identify underrated, exceptional restaurants in NYC that most people walk past every day. Our algorithm, our criteria, and why low review counts are sometimes a very good sign.",
    category: "About Our Data",
    emoji: "💎",
    readTime: "6 min read",
    featured: false,
    publishedDate: "2026-02-20",
    keywords: ["hidden gem restaurants nyc", "underrated restaurants new york", "best unknown restaurants nyc"],
    relatedGuides: ["nyc-health-grades-explained", "best-healthy-neighborhoods-nyc", "how-eat-healthy-nyc-15-dollars"],
    relatedHubPages: [
      { label: "Browse all hidden gems", href: "/search?hidden_gem=true" },
      { label: "Hidden gems near me", href: "/near-me" },
      { label: "Neighborhood comparison", href: "/nyc/compare" },
    ],
  },
  {
    slug: "kosher-dining-nyc-guide",
    title: "Kosher Dining in NYC — The Complete Borough-by-Borough Guide",
    metaTitle: "Kosher Restaurants NYC — Borough-by-Borough Guide",
    shortTitle: "Kosher Dining NYC Guide",
    description: "Where to find kosher restaurants across all five NYC boroughs, how kosher certification works, and which neighborhoods have the strongest kosher dining scenes.",
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
    metaTitle: "Late Night Healthy Eating NYC — Where to Go",
    shortTitle: "Late Night Healthy NYC",
    description: "The best healthy restaurants open late in New York City, organized by borough and dietary need. Because eating well should not stop when the sun goes down.",
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
    metaTitle: "Best Seafood Restaurants in NYC — Health Guide 2026",
    shortTitle: "Healthy Seafood NYC",
    description: "Where to find the best healthy seafood in New York City — from tuna and salmon to halibut and fish tacos. Every restaurant verified with NYC health inspection grades.",
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
