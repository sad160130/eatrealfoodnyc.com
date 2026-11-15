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

// Types that name a food business without ending in the word "restaurant"
// ("Japanese steakhouse", "Southern restaurant (US)").
const PUBLISHABLE_TYPE_PATTERN = /\b(restaurant|steakhouse|gastropub|pizzeria|taqueria|trattoria|osteria|izakaya)\b/i

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

  // (Catering types removed from the allowlist — catering-only operations
  // are not sit-down dining destinations and do not belong in a healthy
  // restaurant directory. See NAME_BLOCK_PATTERNS below for the parallel
  // name-level guard that catches Restaurant-typed entries with catering names.)

  // Breweries & brewpubs (typically serve food)
  "Brewery",
  "Brewpub",

  // Live venues that serve food
  "Live music bar",
  "Jazz club",
])

export function isPublishableType(type: string | null): boolean {
  if (!type) return false
  const trimmed = type.trim()
  if (PUBLISHABLE_TYPE_ALLOWLIST.has(trimmed)) return true
  return PUBLISHABLE_TYPE_PATTERN.test(trimmed)
}

// ──────────────────────────────────────────────────────────────────────────
// Name-based blocklist — second-pass filter on top of the type allowlist
// ──────────────────────────────────────────────────────────────────────────
//
// Some entries pass the type filter because Google Maps tagged them
// "Restaurant" or "Cafe" even though the name signals they are not a
// dining establishment. Four recurring patterns:
//
//   1. Herbalife / MLM "nutrition club" outfits operating as cafes
//   2. Solo nutritionists / dietitians / wellness practitioners listed
//      with their personal name or credential
//   3. Out-of-NYC entries that snuck into the NYC ingest by mistake
//   4. Catering / private-chef businesses (not sit-down dining destinations)
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

  // Private-chef and meal-prep services (not sit-down dining)
  /\bchef\s+services\b/i, // "Private Chef Services NYC"
  /\bprivate\s+chef\b/i,
  /\bmeal\s+prep\b/i,     // pre-emptive — meal-prep services aren't sit-down

  // Out-of-NYC
  /\s+NJ$/i,              // trailing " NJ"
]

export function isNameBlocked(name: string): boolean {
  return NAME_BLOCK_PATTERNS.some((re) => re.test(name))
}

// A catering business, not a restaurant that also caters.
// "Karahi King Restaurant & Catering" and bagel shops stay. "Cedar Star Catering" does not.
const CATERING_NAME = /\bcater(?:ing|er|ers)\b/i
const CATERING_KEEP = /\b(bagel|deli|restaurant|cafe|café|bakery|pizza|diner|bistro|grill)\b/i

export function isCateringOnlyName(name: string): boolean {
  if (!CATERING_NAME.test(name)) return false
  return !CATERING_KEEP.test(name)
}

/**
 * National chains that are not a fit for a healthy-restaurant directory.
 * Independent businesses that merely share a word show up in the dry-run
 * report and can be removed from this list before --apply.
 */
export const CHAIN_BLOCK_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Denny's", pattern: /\bdenny'?s\b/i },
  { label: "Applebee's", pattern: /\bapplebee'?s\b/i },
  { label: "IHOP", pattern: /\bihop\b/i },
  { label: "McDonald's", pattern: /\bmcdonald'?s\b/i },
  { label: "Burger King", pattern: /\bburger\s+king\b/i },
  { label: "Wendy's", pattern: /\bwendy'?s\b/i },
  { label: "Taco Bell", pattern: /\btaco\s+bell\b/i },
  { label: "KFC", pattern: /\bkfc\b/i },
  { label: "Pizza Hut", pattern: /\bpizza\s+hut\b/i },
  { label: "Domino's", pattern: /\bdomino'?s\b/i },
  { label: "Dunkin'", pattern: /\bdunkin'?\b/i },
  { label: "Popeyes", pattern: /\bpopeyes\b/i },
  { label: "Subway", pattern: /\bsubway\b/i },
  { label: "Buffalo Wild Wings", pattern: /\bbuffalo\s+wild\s+wings\b/i },
  { label: "Chick-fil-A", pattern: /\bchick-fil-a\b/i },
  { label: "Five Guys", pattern: /\bfive\s+guys\b/i },
  { label: "Papa John's", pattern: /\bpapa\s+john'?s\b/i },
  { label: "Little Caesars", pattern: /\blittle\s+caesars\b/i },
  { label: "White Castle", pattern: /\bwhite\s+castle\b/i },
  { label: "Checkers", pattern: /\bcheckers\b/i },
  { label: "Rally's", pattern: /\brally'?s\b/i },
]

export const NON_FOOD_NAME_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "cinema", pattern: /\b(drafthouse|cinema|cinemas|movie\s+theat(?:er|re)|multiplex)\b/i },
  { label: "tour", pattern: /\b(sightseeing|tour\s+agency|tour\s+operator|walking\s+tours?|food\s+tours?|tours)\b/i },
]

export interface ListingIdentity {
  name: string
  type: string | null
}

export interface Ineligibility {
  code: "missing-type" | "type-not-allowed" | "name-blocked" | "catering" | "chain" | "non-food"
  detail: string
}

export function ineligibilityReasons(row: ListingIdentity): Ineligibility[] {
  const reasons: Ineligibility[] = []
  if (!row.type || !row.type.trim()) {
    reasons.push({ code: "missing-type", detail: "no Google Maps type" })
  } else if (!isPublishableType(row.type)) {
    reasons.push({ code: "type-not-allowed", detail: row.type.trim() })
  }
  if (isNameBlocked(row.name)) {
    reasons.push({ code: "name-blocked", detail: "name matches the block list" })
  }
  if (isCateringOnlyName(row.name)) {
    reasons.push({ code: "catering", detail: "catering business" })
  }
  const chain = CHAIN_BLOCK_PATTERNS.find((entry) => entry.pattern.test(row.name))
  if (chain) reasons.push({ code: "chain", detail: chain.label })
  const nonFood = NON_FOOD_NAME_PATTERNS.find((entry) => entry.pattern.test(row.name))
  if (nonFood) reasons.push({ code: "non-food", detail: nonFood.label })
  return reasons
}

export function isDirectoryEligible(row: ListingIdentity): boolean {
  return ineligibilityReasons(row).length === 0
}
