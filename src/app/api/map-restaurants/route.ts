import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        business_status: "OPERATIONAL",
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        neighborhood: true,
        borough: true,
        address: true,
        rating: true,
        reviews: true,
        inspection_grade: true,
        dietary_tags: true,
        photo: true,
        is_hidden_gem: true,
        working_hours: true,
        latitude: true,
        longitude: true,
      },
    })

    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error("Map API error:", error)
    return NextResponse.json({ error: "Failed to load map data" }, { status: 500 })
  }
}
