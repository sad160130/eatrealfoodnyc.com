import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import type { InspectionWrite } from "@/lib/dohmh-grade"

/** One statement per batch. A replay changes zero rows when the values already match. */
const WRITE_BATCH_SIZE = 50

/**
 * Updates grade, score, and inspection date only. Leaves `updated_at` alone:
 * that column is the publish clock on the homepage, not the inspection date.
 */
export async function applyInspectionWrites(writes: InspectionWrite[]): Promise<number> {
  let written = 0
  for (let offset = 0; offset < writes.length; offset += WRITE_BATCH_SIZE) {
    const batch = writes.slice(offset, offset + WRITE_BATCH_SIZE)
    const values = Prisma.join(
      batch.map(
        (write) =>
          Prisma.sql`(${write.id}::int, ${write.toGrade}::text, ${write.toScore}::int, ${write.toDate}::text)`
      )
    )
    written += await prisma.$executeRaw`
      UPDATE restaurants AS r
      SET
        inspection_grade = v.grade,
        inspection_score = v.score,
        inspection_date = v.inspection_date
      FROM (VALUES ${values}) AS v(id, grade, score, inspection_date)
      WHERE r.id = v.id
        AND (
          r.inspection_grade IS DISTINCT FROM v.grade
          OR r.inspection_score IS DISTINCT FROM v.score
          OR r.inspection_date IS DISTINCT FROM v.inspection_date
        )
    `
  }
  return written
}
