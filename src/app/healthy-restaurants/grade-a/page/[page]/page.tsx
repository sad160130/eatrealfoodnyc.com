import { notFound } from "next/navigation"
import { GradeAHub, gradeAMetadata } from "@/components/grade-a-hub"
import { countGradeA, gradeAPageCount } from "@/lib/grade-a"

export const revalidate = 86400

export async function generateStaticParams() {
  const total = await countGradeA({})
  const pages = gradeAPageCount(total)
  return Array.from({ length: Math.max(0, pages - 1) }, (_, index) => ({ page: String(index + 2) }))
}

export function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  return params.then(({ page }) => {
    const pageNumber = Number(page)
    if (!Number.isInteger(pageNumber) || pageNumber < 2) return { title: "Not Found" }
    return gradeAMetadata({ page: pageNumber })
  })
}

export default async function GradeACityPageN({ params }: { params: Promise<{ page: string }> }) {
  const pageNumber = Number((await params).page)
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound()
  return <GradeAHub scope={{ page: pageNumber }} />
}
