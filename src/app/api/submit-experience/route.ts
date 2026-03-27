import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { restaurantSlug, restaurantName, content } = await request.json()

    if (!restaurantSlug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (content.length < 10 || content.length > 280) {
      return NextResponse.json(
        { error: "Experience must be between 10 and 280 characters" },
        { status: 400 }
      )
    }

    // Basic spam check — no URLs allowed
    if (/https?:\/\//i.test(content)) {
      return NextResponse.json({ error: "Links are not permitted" }, { status: 400 })
    }

    await prisma.$executeRaw`
      INSERT INTO user_submissions (restaurant_slug, restaurant_name, submission_type, content, status)
      VALUES (${restaurantSlug}, ${restaurantName || ""}, 'experience', ${content}, 'pending')
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
  }
}
