import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

function isMissingSubmissionsTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes("42P01") || /user_submissions/i.test(message) && /does not exist/i.test(message)) {
    return true
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return true
  }
  return false
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  const restaurantSlug = typeof record.restaurantSlug === "string" ? record.restaurantSlug.trim() : ""
  const restaurantName = typeof record.restaurantName === "string" ? record.restaurantName.trim() : ""
  const content = typeof record.content === "string" ? record.content.trim() : ""

  if (!restaurantSlug || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (restaurantSlug.length > 200 || restaurantName.length > 200) {
    return NextResponse.json({ error: "That submission could not be saved" }, { status: 400 })
  }

  if (content.length < 10 || content.length > 280) {
    return NextResponse.json(
      { error: "Experience must be between 10 and 280 characters" },
      { status: 400 }
    )
  }

  if (/https?:\/\//i.test(content)) {
    return NextResponse.json({ error: "Links are not permitted" }, { status: 400 })
  }

  try {
    await prisma.userSubmission.create({
      data: {
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName,
        submission_type: "experience",
        content,
        status: "pending",
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isMissingSubmissionsTable(error)) {
      console.error("user_submissions table is missing. Run: npx tsx src/scripts/create-user-submissions-table.ts --apply")
      return NextResponse.json(
        { error: "Submissions are temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
    console.error("Submission error:", error instanceof Error ? error.message : "unknown")
    return NextResponse.json(
      { error: "Failed to save submission. Please try again." },
      { status: 500 }
    )
  }
}
