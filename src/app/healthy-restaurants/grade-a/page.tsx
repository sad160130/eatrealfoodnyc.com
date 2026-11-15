import { GradeAHub, gradeAMetadata } from "@/components/grade-a-hub"

export const revalidate = 86400

export function generateMetadata() {
  return gradeAMetadata({ page: 1 })
}

export default function GradeACityPage() {
  return <GradeAHub scope={{ page: 1 }} />
}
