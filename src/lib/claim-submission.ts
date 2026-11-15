export interface ClaimFields {
  restaurantSlug: string
  name: string
  role: string
  email: string
  phone: string
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

export function claimContent(input: ClaimFields): string {
  return [
    "Claim",
    `Name: ${input.name.trim()}`,
    `Role: ${input.role.trim()}`,
    `Email: ${input.email.trim()}`,
    `Phone: ${input.phone.trim()}`,
  ].join("\n")
}
