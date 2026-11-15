import { notFound } from "next/navigation"
import { GradeAHub, gradeAMetadata } from "@/components/grade-a-hub"
import { GRADE_A_MIN, boroughNameFromSlug, countGradeA, gradeABoroughCounts, gradeAPageCount } from "@/lib/grade-a"
import { boroughToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const rows = await gradeABoroughCounts()
  const params: Array<{ borough: string; page: string }> = []
  for (const row of rows) {
    const pages = gradeAPageCount(row.count)
    for (let page = 2; page <= pages; page++) {
      params.push({ borough: boroughToSlug(row.borough), page: String(page) })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string; page: string }> }) {
  const { borough, page } = await params
  const boroughName = boroughNameFromSlug(borough)
  const pageNumber = Number(page)
  if (!boroughName || !Number.isInteger(pageNumber) || pageNumber < 2) return { title: "Not Found" }
  return gradeAMetadata({ boroughName, page: pageNumber })
}

export default async function GradeABoroughPageN({ params }: { params: Promise<{ borough: string; page: string }> }) {
  const { borough, page } = await params
  const boroughName = boroughNameFromSlug(borough)
  const pageNumber = Number(page)
  if (!boroughName || !Number.isInteger(pageNumber) || pageNumber < 2) notFound()
  const total = await countGradeA({ borough: boroughName })
  if (total < GRADE_A_MIN || pageNumber > gradeAPageCount(total)) notFound()
  return <GradeAHub scope={{ boroughName, page: pageNumber }} />
}
