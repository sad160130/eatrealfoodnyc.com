import { buildRestaurantMetaDescription } from "../lib/restaurant-description"

const havana = buildRestaurantMetaDescription({
  name: "Havana Café",
  type: "Cuban restaurant",
  neighborhood: "Pelham Bay",
  borough: "Bronx",
  dietary_tags: "gluten-free|vegetarian",
  inspection_grade: "A",
  rating: 4.4,
  reviews: 3591,
  price_range: 2,
})

if (!havana.includes("Pelham Bay")) throw new Error("missing neighborhood")
if (!havana.includes("Cuban restaurant")) throw new Error("missing cuisine type")
if (!havana.includes("grade A")) throw new Error("missing grade")
if (!havana.includes("Gluten Free")) throw new Error("missing tag")
if (!havana.includes("4.4/5")) throw new Error("missing rating")
if (havana.includes("healthy restaurant")) throw new Error("should use the stored type")
if (havana.length > 160) throw new Error(`too long: ${havana.length} ${havana}`)

const unrated = buildRestaurantMetaDescription({
  name: "Quiet Spot",
  type: null,
  neighborhood: null,
  borough: "Queens",
  dietary_tags: null,
  inspection_grade: null,
  rating: 0,
  reviews: 0,
})
if (unrated.includes("/5")) throw new Error("unrated listing should not claim a rating")
if (unrated.includes("grade")) throw new Error("missing grade should not be mentioned")
if (!unrated.includes("Queens")) throw new Error(unrated)

console.log(havana)
console.log("restaurant description checks passed")
