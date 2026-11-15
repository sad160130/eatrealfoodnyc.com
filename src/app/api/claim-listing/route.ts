import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { claimContent, claimHoneypotTripped, validateClaim } from "@/lib/claim-submission"
import { allowNewsletterSignup } from "@/lib/newsletter-rate-limit"
import { notifyClaim } from "@/lib/claim-notify"

function isMissingSubmissionsTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes("42P01") || (/user_submissions/i.test(message) && /does not exist/i.test(message))) {
    return true
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return true
  }
  return false
}

function text(record: Record<string, unknown>, key: string): string {
  return typeof record[key] === "string" ? record[key].trim() : ""
}

function list(record: Record<string, unknown>, key: string): string[] {
  const value = record[key]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || "unknown"
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  if (claimHoneypotTripped(text(record, "company_website"))) {
    return NextResponse.json({ success: true })
  }
  if (!allowNewsletterSignup(`claim:${clientIp(request)}`)) {
    return NextResponse.json({ error: "Too many claims from this network. Please try again later." }, { status: 429 })
  }
  const fields = {
    restaurantSlug: text(record, "restaurantSlug"),
    name: text(record, "name"),
    role: text(record, "role"),
    email: text(record, "email"),
    phone: text(record, "phone"),
    fixes: list(record, "fixes"),
    dietTags: list(record, "dietTags"),
    notes: text(record, "notes"),
  }
  const problem = validateClaim(fields)
  if (problem === "email") {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  if (problem === "phone") {
    return NextResponse.json({ error: "Enter a phone number we can call." }, { status: 400 })
  }
  if (problem) {
    return NextResponse.json({ error: "Name, role, email, and phone are required." }, { status: 400 })
  }

  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { slug: fields.restaurantSlug, is_published: true },
      select: { slug: true, name: true },
    })
    if (!restaurant) {
      return NextResponse.json({ error: "This listing cannot be claimed." }, { status: 404 })
    }
    await prisma.userSubmission.create({
      data: {
        restaurant_slug: restaurant.slug,
        restaurant_name: restaurant.name,
        submission_type: "claim",
        content: claimContent(fields),
        status: "pending",
      },
    })
    try {
      await notifyClaim({
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        content: claimContent(fields),
      })
    } catch {
      console.error("claim notification failed")
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isMissingSubmissionsTable(error)) {
      return NextResponse.json(
        { error: "Claims are temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
    console.error("Claim submission failed")
    return NextResponse.json({ error: "Failed to save the claim. Please try again." }, { status: 500 })
  }
}
