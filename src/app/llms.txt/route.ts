import { buildLlmsTxt, formatLlmsUpdatedOn } from "@/lib/llms-txt"
import { getPublishedDirectoryCounts } from "@/lib/directory-stats"
import { getDirectorySnapshot } from "@/lib/directory-snapshot"
import { getIndexableDietTags } from "@/lib/diet-hubs"

export const revalidate = 3600

export async function GET() {
  const [counts, snapshot, diets] = await Promise.all([
    getPublishedDirectoryCounts(),
    getDirectorySnapshot(),
    getIndexableDietTags(),
  ])
  const body = buildLlmsTxt({
    published: counts.restaurants,
    gradeA: counts.gradeA,
    letterGraded: counts.letterGraded,
    neighborhoods: counts.neighborhoods,
    newestInspectionLabel: snapshot.latestInspectionLabel,
    updatedOn: formatLlmsUpdatedOn(new Date()),
    dietTags: diets.map((diet) => diet.tag),
  })
  return new Response(body.endsWith("\n") ? body : `${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
