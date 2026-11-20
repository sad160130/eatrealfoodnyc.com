"use server"

import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { allowNewsletterSignup } from "@/lib/newsletter-rate-limit"
import { isCateringSource, withCateringSource } from "@/lib/catering-source"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DIETS = ["vegan", "vegetarian", "gluten-free", "kosher", "halal", "nut-free"] as const
const BUDGETS = ["", "under-250", "250-500", "500-1000", "1000-plus"] as const

export type CateringResult = { ok: true } | { ok: false; error: string }

function text(formData: FormData, key: string, max: number): string {
  const value = String(formData.get(key) ?? "").trim()
  return value.slice(0, max)
}

export async function submitCateringLead(formData: FormData): Promise<CateringResult> {
  const name = text(formData, "name", 120)
  const email = text(formData, "email", 254).toLowerCase()
  const phone = text(formData, "phone", 40)
  const eventDate = text(formData, "event_date", 10)
  const place = text(formData, "place", 120)
  const notes = text(formData, "notes", 2000)
  const budget = text(formData, "budget", 20)
  const sourcePath = text(formData, "source_path", 200)
  const source = text(formData, "source", 40)
  const restaurantSlug = text(formData, "restaurant_slug", 200)
  const consent = formData.get("consent") === "yes"
  const headcount = Number(formData.get("headcount"))
  const diets = DIETS.filter((tag) => formData.get(`diet_${tag}`) === "yes")
  const other = formData.get("diet_other") === "yes"

  if (!name || !email || !phone || !eventDate || !place) {
    return { ok: false, error: "Name, email, phone, event date, and a borough or neighborhood are required." }
  }
  if (!EMAIL.test(email)) return { ok: false, error: "Enter a valid email address." }
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 7 || digits.length > 15) return { ok: false, error: "Enter a phone number we can call." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(Date.parse(eventDate))) {
    return { ok: false, error: "Enter an event date." }
  }
  if (!Number.isInteger(headcount) || headcount < 1 || headcount > 5000) {
    return { ok: false, error: "Enter a headcount between 1 and 5,000." }
  }
  if (diets.length === 0 && !other) return { ok: false, error: "Choose at least one dietary need, or Other." }
  if (!consent) return { ok: false, error: "Confirm that we may share this request with restaurants." }
  if (!BUDGETS.includes(budget as (typeof BUDGETS)[number])) {
    return { ok: false, error: "Choose a budget, or leave it blank." }
  }
  if (!sourcePath.startsWith("/") || sourcePath.startsWith("//") || sourcePath.includes("://")) {
    return { ok: false, error: "That request could not be saved." }
  }
  if (source && !isCateringSource(source)) {
    return { ok: false, error: "That request could not be saved." }
  }
  const recordedPath = source ? withCateringSource(sourcePath, source) : sourcePath
  if (recordedPath.length > 200 || recordedPath.length === 0) {
    return { ok: false, error: "That request could not be saved." }
  }

  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!allowNewsletterSignup(`catering:${ip}`)) {
    return { ok: false, error: "Too many requests from this network. Try again in a few minutes." }
  }

  let storedSlug: string | null = null
  if (restaurantSlug) {
    const restaurant = await prisma.restaurant.findFirst({
      where: { slug: restaurantSlug, is_published: true },
      select: { slug: true },
    })
    storedSlug = restaurant?.slug ?? null
  }

  const dietary = [...diets, ...(other ? ["other"] : [])].join(", ")

  try {
    await prisma.cateringLead.create({
      data: {
        name,
        email,
        phone,
        event_date: new Date(`${eventDate}T00:00:00.000Z`),
        headcount,
        place,
        dietary_needs: dietary,
        budget,
        notes,
        restaurant_slug: storedSlug,
        source_path: recordedPath,
        consent: true,
        status: "new",
      },
    })
  } catch {
    console.error("catering lead failed")
    return { ok: false, error: "We couldn't save that request. Please try again." }
  }

  return { ok: true }
}
