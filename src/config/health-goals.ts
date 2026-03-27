export interface HealthGoal {
  id: string
  label: string
  emoji: string
  description: string
  tags: string[]
  searchParams: string
}

export const HEALTH_GOALS: HealthGoal[] = [
  {
    id: "building-muscle",
    label: "Building Muscle",
    emoji: "🏋️",
    description: "High protein, whole food restaurants",
    tags: ["halal", "whole-foods", "paleo"],
    searchParams: "diet=halal&diet=whole-foods&diet=paleo",
  },
  {
    id: "going-plant-based",
    label: "Going Plant-Based",
    emoji: "🌿",
    description: "Vegan and vegetarian focused kitchens",
    tags: ["vegan", "vegetarian"],
    searchParams: "diet=vegan&diet=vegetarian",
  },
  {
    id: "weight-management",
    label: "Weight Management",
    emoji: "⚖️",
    description: "Low calorie, portion-conscious dining",
    tags: ["low-calorie", "whole-foods"],
    searchParams: "diet=low-calorie&diet=whole-foods",
  },
  {
    id: "managing-allergies",
    label: "Managing Allergies",
    emoji: "🩺",
    description: "Gluten-free, nut-free and dairy-free kitchens",
    tags: ["gluten-free", "nut-free", "dairy-free"],
    searchParams: "diet=gluten-free&diet=nut-free&diet=dairy-free",
  },
  {
    id: "clean-eating",
    label: "Clean Eating",
    emoji: "🧘",
    description: "Raw, organic and whole ingredient restaurants",
    tags: ["raw-food", "whole-foods"],
    searchParams: "diet=raw-food&diet=whole-foods",
  },
  {
    id: "religious-dietary",
    label: "Religious Dietary Needs",
    emoji: "🕌",
    description: "Halal and kosher certified restaurants",
    tags: ["halal", "kosher"],
    searchParams: "diet=halal&diet=kosher",
  },
]
