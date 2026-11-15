import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { claimContent, validateClaim } from "@/lib/claim-submission"

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

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  const fields = {
    restaurantSlug: text(record, "restaurantSlug"),
    name: text(record, "name"),
    role: text(record, "role"),
    email: text(record, "email"),
    phone: text(record, "phone"),
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
