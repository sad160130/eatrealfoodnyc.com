export const CLAIM_FIXES = ["hours", "photos", "address", "diet tags", "other"] as const
export type ClaimFix = (typeof CLAIM_FIXES)[number]

export const CLAIM_DIET_TAGS = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "keto",
  "paleo",
  "halal",
  "kosher",
  "dairy-free",
  "nut-free",
  "raw-food",
  "whole-foods",
  "low-calorie",
] as const

export interface ClaimFields {
  restaurantSlug: string
  name: string
  role: string
  email: string
  phone: string
  fixes?: string[]
  dietTags?: string[]
  notes?: string
}

export type ClaimError = "missing" | "too_long" | "email" | "phone"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateClaim(input: ClaimFields): ClaimError | null {
  const name = input.name.trim()
  const role = input.role.trim()
  const email = input.email.trim()
  const phone = input.phone.trim()
  const slug = input.restaurantSlug.trim()
  if (!slug || !name || !role || !email || !phone) return "missing"
  if (slug.length > 200 || name.length > 120 || role.length > 80 || email.length > 200 || phone.length > 40) {
    return "too_long"
  }
  if (!EMAIL.test(email)) return "email"
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 7 || digits.length > 15) return "phone"
  return null
}

export function claimHoneypotTripped(value: string): boolean {
  return value.trim().length > 0
}

export function claimContent(input: ClaimFields): string {
  const fixes = (input.fixes ?? []).filter((fix) => (CLAIM_FIXES as readonly string[]).includes(fix))
  const diets = (input.dietTags ?? []).filter((tag) => (CLAIM_DIET_TAGS as readonly string[]).includes(tag))
  const notes = (input.notes ?? "").trim().slice(0, 2000)
  return [
    "Claim",
    `Name: ${input.name.trim()}`,
    `Role: ${input.role.trim()}`,
    `Email: ${input.email.trim()}`,
    `Phone: ${input.phone.trim()}`,
    `Fixes: ${fixes.join(", ") || "none"}`,
    `Diet tags: ${diets.join(", ") || "none"}`,
    `Notes: ${notes || "none"}`,
  ].join("\n")
}
