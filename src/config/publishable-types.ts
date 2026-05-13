// Allowlist of Google Maps `type` values that qualify as a publishable
// restaurant / food-service venue. Used by list-next-publish-batch.ts to
// filter out non-restaurant entities (clinics, schools, contractors,
// photographers, dietitians, gyms, MLM "nutrition clubs", etc.) that exist
// in the source data and would otherwise be published as "/restaurants/..."
// pages.
//
// Bias toward EXCLUSION when ambiguous. Better to skip a legit bakery this
// week (and add the type later) than publish a plumber as a healthy
// restaurant. Once a type is added here it stays.
//
// Pattern: anything ending in " restaurant" matches by suffix (catches all
// dozens of "X restaurant" variants without enumeration). The explicit set
// below covers everything else.

export const RESTAURANT_TYPE_SUFFIX_PATTERN = /\brestaurant$/i

export const PUBLISHABLE_TYPE_ALLOWLIST = new Set<string>([
  // Generic restaurant-shaped venues
  "Restaurant",
  "Cafe",
  "Coffee shop",
  "Diner",
  "Deli",
  "Bistro",
  "Brasserie",
  "Gastropub",
  "Cafeteria",
  "Steak house",
  "Food court",

  // Shops where food is the primary product
  "Sandwich shop",
  "Juice shop",
  "Bagel shop",
  "Bakery",
  "Pastry shop",
  "Patisserie",
  "Donut shop",
  "Ice cream shop",
  "Frozen yogurt shop",
  "Cake shop",
  "Cupcake shop",
  "Dessert shop",
  "Chinese bakery",
  "Pie shop",
  "Tea house",
  "Açaí shop",
  "Bubble tea store",
  "Salad shop",
  "Chocolate cafe",
  "Tamale shop",
  "Noodle shop",
  "Soba noodle shop",
  "Kebab shop",
  "Vegetarian cafe and deli",
  "Sweets and dessert buffet",
  "Cha chaan teng (Hong Kong-style cafe)",

  // Takeaway / delivery formats
  "Pizza Takeout",
  "Pizza delivery",
  "Sushi takeaway",
  "Indian takeaway",
  "Chinese takeaway",
  "Fried chicken takeaway",

  // Bars and pubs (food-serving venues; many list "Bar" but serve full menus)
  "Bar & grill",
  "Bar",
  "Cocktail bar",
  "Wine bar",
  "Sports bar",
  "Tapas bar",
  "Lounge bar",
  "Beer garden",
  "Beer hall",
  "Tiki bar",
  "Snack bar",
  "Poke bar",
  "Pub",
  "Irish pub",

  // Catering (the user explicitly chose to keep these in the default
  // allowlist; trim later if catering-only operations shouldn't have hub pages)
  "Caterer",
  "Mobile caterer",
  "Catering food and drink supplier",

  // Breweries & brewpubs (typically serve food)
  "Brewery",
  "Brewpub",

  // Live venues that serve food
  "Live music bar",
  "Jazz club",
])

export function isPublishableType(type: string | null): boolean {
  if (!type) return false
  if (PUBLISHABLE_TYPE_ALLOWLIST.has(type)) return true
  return RESTAURANT_TYPE_SUFFIX_PATTERN.test(type)
}

// ──────────────────────────────────────────────────────────────────────────
// Name-based blocklist — second-pass filter on top of the type allowlist
// ──────────────────────────────────────────────────────────────────────────
//
// Some entries pass the type filter because Google Maps tagged them
// "Restaurant" or "Cafe" even though the name signals they are not a
// dining establishment. Three recurring patterns:
//
//   1. Herbalife / MLM "nutrition club" outfits operating as cafes
//   2. Solo nutritionists / dietitians / wellness practitioners listed
//      with their personal name or credential
//   3. Out-of-NYC entries that snuck into the NYC ingest by mistake
//
// Bias toward exclusion. A false positive can be unblocked by edit; a
// false negative ships a wellness clinic onto /restaurants/.
export const NAME_BLOCK_PATTERNS: RegExp[] = [
  // MLM "nutrition club" brands
  /\bherbalife\b/i,
  /\bindependent\s+distributor\b/i,
  /\bnutrition\s+club\b/i,

  // Nutritionists / dietitians / wellness practitioners
  /\bnutrition$/i,        // trailing "Nutrition" — e.g. "I Love Nutrition"
  /^NUTRITION\s/,         // ALL-CAPS leading NUTRITION — MLM brand signature
  /\bwellness\b/i,        // "Wellness In Inwood", "Forest Hills Wellness"
  /\bdietitian/i,
  /\bRDN\b/,              // Registered Dietitian Nutritionist credential

  // Out-of-NYC
  /\s+NJ$/i,              // trailing " NJ"
]

export function isNameBlocked(name: string): boolean {
  return NAME_BLOCK_PATTERNS.some((re) => re.test(name))
}
