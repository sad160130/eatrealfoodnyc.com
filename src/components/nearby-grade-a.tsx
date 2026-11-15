import Link from "next/link"
import { formatInspectionMonth } from "@/lib/seo-titles"
import type { NearbyGradeA } from "@/lib/nearby-grade-a"

export default function NearbyGradeAList({ name, rows }: { name: string; rows: NearbyGradeA[] }) {
  if (rows.length < 2) return null
  return (
    <section className="mt-10" aria-label={`Grade A restaurants near ${name}`}>
      <h2 className="h2-serif">Grade A restaurants near {name}</h2>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.slug}>
            <Link href={`/restaurants/${row.slug}`} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
              {row.name}
            </Link>
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              {row.miles > 0 ? ` · ${row.miles.toFixed(1)} mi` : ""}
              {" · Grade A"}
              {row.score != null ? ` · score ${row.score}` : ""}
              {formatInspectionMonth(row.inspectionDate) ? ` · ${formatInspectionMonth(row.inspectionDate)}` : ""}
              {row.tags.length > 0 ? ` · ${row.tags.join(", ")}` : ""}
              {row.rating != null && row.rating > 0 ? ` · ${row.rating.toFixed(1)}/5` : ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
