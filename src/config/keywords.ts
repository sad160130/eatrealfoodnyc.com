export const HEAD_KEYWORD = "healthy restaurants"
export const BRAND = "Eat Real Food NYC"
export const YEAR = "2026"

export const BOROUGH_KEYWORDS: Record<string, {
  primary: string
  h1: string
  metaTitle: string
  metaDescription: (count: number) => string
  openingLine: string
}> = {
  manhattan: {
    primary: "healthy restaurants in Manhattan",
    h1: "Healthy Restaurants in Manhattan, NYC",
    metaTitle: `Healthy Restaurants in Manhattan, NYC (${YEAR})`,
    metaDescription: (count) => `Find ${count}+ healthy restaurants in Manhattan, NYC — verified with health inspection grades. Filter by vegan, halal, gluten-free, and more.`,
    openingLine: "Manhattan is home to more healthy restaurants per square mile than almost any city on earth.",
  },
  brooklyn: {
    primary: "healthy restaurants in Brooklyn",
    h1: "Healthy Restaurants in Brooklyn, NYC",
    metaTitle: `Healthy Restaurants in Brooklyn, NYC (${YEAR})`,
    metaDescription: (count) => `Find ${count}+ healthy restaurants in Brooklyn, NYC — with verified NYC health inspection grades and 12 dietary filters. From Williamsburg to Park Slope.`,
    openingLine: "Brooklyn has emerged as NYC's most exciting borough for healthy eating, driven by locally sourced ingredients and dietary transparency.",
  },
  queens: {
    primary: "healthy restaurants in Queens",
    h1: "Healthy Restaurants in Queens, NYC",
    metaTitle: `Healthy Restaurants in Queens, NYC (${YEAR})`,
    metaDescription: (count) => `Find ${count}+ healthy restaurants in Queens, NYC — NYC's most diverse borough for healthy dining. Grades across Jackson Heights, Astoria, and more.`,
    openingLine: "Queens is NYC's most ethnically diverse borough, and that diversity translates into one of the city's richest selections of naturally healthy cuisines.",
  },
  bronx: {
    primary: "healthy restaurants in the Bronx",
    h1: "Healthy Restaurants in the Bronx, NYC",
    metaTitle: `Healthy Restaurants in the Bronx, NYC (${YEAR})`,
    metaDescription: (count) => `Find ${count}+ healthy restaurants in the Bronx, NYC — verified with NYC health inspection grades. Caribbean, Latin, and international healthy dining.`,
    openingLine: "The Bronx is home to a growing healthy dining scene anchored by its vibrant Latin and Caribbean food culture.",
  },
  "staten-island": {
    primary: "healthy restaurants in Staten Island",
    h1: "Healthy Restaurants in Staten Island, NYC",
    metaTitle: `Healthy Restaurants in Staten Island, NYC (${YEAR})`,
    metaDescription: (count) => `Find ${count}+ healthy restaurants in Staten Island, NYC — with verified NYC health inspection grades. Italian, Mediterranean, and health-focused dining.`,
    openingLine: "Staten Island's healthy restaurant scene reflects the borough's character, with strong family-friendly health-focused dining.",
  },
}

export function buildNeighborhoodKeywords(neighborhood: string, borough: string) {
  return {
    h1: `Healthy Restaurants in ${neighborhood}, ${borough}`,
    metaTitle: `Healthy Restaurants in ${neighborhood}, ${borough} (${YEAR})`,
    metaDescription: (count: number) => `Find ${count}+ healthy restaurants in ${neighborhood}, ${borough}, NYC — verified with NYC health inspection grades and 12 dietary filters.`,
  }
}

export const DIET_KEYWORDS: Record<string, {
  h1: string
  metaTitle: string
  metaDescription: (count: number) => string
  openingH2: string
}> = {
  vegan: { h1: "Vegan Restaurants in NYC", metaTitle: `Best Vegan Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ vegan restaurants in NYC — health inspection grades, neighbourhood filtering, and hidden gems across all 5 boroughs.`, openingH2: "All Vegan Restaurants in New York City" },
  vegetarian: { h1: "Vegetarian Restaurants in NYC", metaTitle: `Best Vegetarian Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ vegetarian restaurants in NYC across all 5 boroughs. Verified with NYC health inspection grades and neighbourhood filtering.`, openingH2: "All Vegetarian Restaurants in New York City" },
  "gluten-free": { h1: "Gluten-Free Restaurants in NYC", metaTitle: `Best Gluten-Free Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ gluten-free restaurants in NYC — dedicated GF kitchens and GF-friendly menus across all 5 boroughs with health inspection grades.`, openingH2: "All Gluten-Free Restaurants in New York City" },
  halal: { h1: "Halal Restaurants in NYC", metaTitle: `Best Halal Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ halal restaurants in NYC — certified and self-identified halal dining across all 5 boroughs with NYC health inspection grades.`, openingH2: "All Halal Restaurants in New York City" },
  kosher: { h1: "Kosher Restaurants in NYC", metaTitle: `Best Kosher Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ kosher restaurants in NYC — certified kosher dining across Manhattan, Brooklyn, and all 5 boroughs with health inspection grades.`, openingH2: "All Kosher Restaurants in New York City" },
  "dairy-free": { h1: "Dairy-Free Restaurants in NYC", metaTitle: `Best Dairy-Free Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ dairy-free restaurants in NYC across all 5 boroughs. Verified with NYC health inspection grades and dietary filters.`, openingH2: "All Dairy-Free Restaurants in New York City" },
  keto: { h1: "Keto-Friendly Restaurants in NYC", metaTitle: `Best Keto Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ keto-friendly restaurants in NYC. Low-carb dining across all 5 boroughs with NYC health inspection grades.`, openingH2: "All Keto-Friendly Restaurants in New York City" },
  paleo: { h1: "Paleo-Friendly Restaurants in NYC", metaTitle: `Best Paleo Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ paleo-friendly restaurants in NYC — whole food dining across all 5 boroughs with NYC health inspection data.`, openingH2: "All Paleo-Friendly Restaurants in New York City" },
  "whole-foods": { h1: "Whole Foods Restaurants in NYC", metaTitle: `Best Whole Foods Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ whole foods restaurants in NYC — unprocessed dining across all 5 boroughs with health inspection grades.`, openingH2: "All Whole Foods Restaurants in New York City" },
  "low-calorie": { h1: "Low-Calorie Restaurants in NYC", metaTitle: `Best Low-Calorie Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ low-calorie restaurants in NYC — portion-conscious dining across all 5 boroughs with health inspection grades.`, openingH2: "All Low-Calorie Restaurants in New York City" },
  "raw-food": { h1: "Raw Food Restaurants in NYC", metaTitle: `Best Raw Food Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ raw food restaurants in NYC — living food and raw vegan dining across all 5 boroughs with health grades.`, openingH2: "All Raw Food Restaurants in New York City" },
  "nut-free": { h1: "Nut-Free Restaurants in NYC", metaTitle: `Best Nut-Free Restaurants in NYC (${YEAR})`, metaDescription: (c) => `Find ${c}+ nut-free restaurants in NYC — nut-free kitchens across all 5 boroughs with NYC health inspection grades.`, openingH2: "All Nut-Free Restaurants in New York City" },
}

export const HOMEPAGE_KEYWORDS = {
  title: "Healthy Restaurants NYC — Find & Filter | Eat Real Food",
  metaDescription: "NYC's most trusted healthy restaurant directory. 8,835 restaurants across all 5 boroughs — every listing verified with NYC health inspection grades. Filter by vegan, halal, gluten-free, kosher, and 8 more dietary needs.",
  subtitle: "The only NYC healthy restaurant directory built on verified NYC Department of Health inspection grades. Search by neighbourhood, dietary need, or health grade.",
}

export const SEARCH_KEYWORDS = {
  defaultH1: (total: number) => `${total.toLocaleString()} Healthy Restaurants in NYC`,
  boroughH1: (borough: string, total: number) => `${total.toLocaleString()} Healthy Restaurants in ${borough}`,
  dietH1: (diet: string, total: number) => `${total.toLocaleString()} ${diet} Restaurants in NYC`,
  openNowH1: (total: number) => `${total.toLocaleString()} Healthy Restaurants Open Now`,
}
