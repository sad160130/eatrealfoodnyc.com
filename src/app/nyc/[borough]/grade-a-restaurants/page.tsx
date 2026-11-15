import { notFound } from "next/navigation"
import { GradeAHub, gradeAMetadata } from "@/components/grade-a-hub"
import { boroughNameFromSlug, gradeABoroughCounts } from "@/lib/grade-a"
import { boroughToSlug } from "@/lib/utils"

export const revalidate = 86400

export async function generateStaticParams() {
  const rows = await gradeABoroughCounts()
  return rows.map((row) => ({ borough: boroughToSlug(row.borough) }))
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string }> }) {
  const boroughName = boroughNameFromSlug((await params).borough)
  if (!boroughName) return { title: "Not Found" }
  return gradeAMetadata({ boroughName, page: 1 })
}

export default async function GradeABoroughPage({ params }: { params: Promise<{ borough: string }> }) {
  const boroughName = boroughNameFromSlug((await params).borough)
  if (!boroughName) notFound()
  return <GradeAHub scope={{ boroughName, page: 1 }} />
}
