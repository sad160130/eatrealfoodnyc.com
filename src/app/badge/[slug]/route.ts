import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { badgeKind, badgeSize, inspectionLabel, renderBadgeSvg } from "@/lib/badge"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: raw } = await context.params
  const slug = decodeURIComponent(raw).replace(/\.svg$/i, "")
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, is_published: true },
    select: { inspection_grade: true, inspection_date: true },
  })
  if (!restaurant) {
    return new NextResponse("Not found", { status: 404 })
  }
  const size = badgeSize(request.nextUrl.searchParams.get("size"))
  const theme = request.nextUrl.searchParams.get("theme") === "dark" ? "dark" : "light"
  const kind = badgeKind(restaurant.inspection_grade)
  const svg = renderBadgeSvg({
    kind,
    inspected: kind === "grade-a" ? inspectionLabel(restaurant.inspection_date) : null,
    theme,
    width: size.width,
    height: size.height,
  })
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
