import { prisma } from "@/lib/db"
import { softRead } from "@/lib/db-fallback"
import { presentGrade } from "@/lib/grade-display"
import { formatLongDate, parseInspectionDate } from "@/lib/inspection-dates"

const MIN_PEERS = 5

interface InspectionRestaurant {
  id: number
  slug: string
  name: string
  borough: string | null
  neighborhood: string | null
  type: string | null
  inspection_grade: string | null
  inspection_score: number | null
  inspection_date: string | null
}

function variantIndex(slug: string, count: number) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 33 + slug.charCodeAt(i)) >>> 0
  return hash % count
}

function comparisonSentence(
  name: string,
  score: number,
  label: string,
  average: number,
  peers: number,
  variant: number
) {
  const avg = Math.round(average * 10) / 10
  const delta = Math.round(Math.abs(score - avg) * 10) / 10
  const direction = score < avg ? "lower" : score > avg ? "higher" : "the same"
  if (direction === "the same") {
    const lines = [
      `${name}'s score of ${score} matches the ${avg} average across ${peers} other graded restaurants ${label}.`,
      `Across ${peers} other graded restaurants ${label}, the average score is ${avg}, the same figure on ${name}'s record.`,
      `The ${peers} other graded restaurants ${label} also average a score of ${avg}.`,
    ]
    return lines[variant % lines.length]
  }
  const lines = [
    `Among ${peers} other graded restaurants ${label}, the average inspection score is ${avg}. ${name}'s score of ${score} is ${delta} points ${direction}.`,
    `${name} scored ${score}. That is ${delta} points ${direction} than the ${avg} average for ${peers} other graded restaurants ${label}.`,
    `The average score ${label} is ${avg}, from ${peers} other graded restaurants. ${name}'s ${score} sits ${delta} points ${direction}.`,
  ]
  return lines[variant % lines.length]
}

async function peerAverage(where: {
  borough?: string
  neighborhood?: string
  type?: string
  id: { not: number }
}) {
  // A comparison line is optional. A connection failure drops it, not the page.
  return softRead("inspection peer average", () => queryPeerAverage(where), null)
}

async function queryPeerAverage(where: {
  borough?: string
  neighborhood?: string
  type?: string
  id: { not: number }
}) {
  const result = await prisma.restaurant.aggregate({
    where: {
      ...where,
      is_published: true,
      business_status: "OPERATIONAL",
      inspection_score: { not: null },
    },
    _avg: { inspection_score: true },
    _count: { inspection_score: true },
  })
  const peers = result._count.inspection_score
  const average = result._avg.inspection_score
  if (peers < MIN_PEERS || average == null) return null
  return { peers, average }
}

/**
 * One inspection record per restaurant is all the database stores.
 * Grade history and violation categories are omitted because those fields
 * are not in the joined data. Nothing here is inferred from the letter grade.
 */
export default async function InspectionRecord({ restaurant }: { restaurant: InspectionRestaurant }) {
  const gradeView = presentGrade(restaurant.inspection_grade)
  const grade = gradeView.dataGrade || null
  const score = restaurant.inspection_score
  const parsed = parseInspectionDate(restaurant.inspection_date)
  if (!grade && score == null && !parsed) return null

  const variant = variantIndex(restaurant.slug, 3)
  const [neighborhoodPeers, cuisinePeers] = await Promise.all([
    score != null && restaurant.neighborhood && restaurant.borough
      ? peerAverage({
          borough: restaurant.borough,
          neighborhood: restaurant.neighborhood,
          id: { not: restaurant.id },
        })
      : Promise.resolve(null),
    score != null && restaurant.type
      ? peerAverage({ type: restaurant.type, id: { not: restaurant.id } })
      : Promise.resolve(null),
  ])

  const when = parsed
    ? ` on ${formatLongDate(parsed)}`
    : ""
  const gradeBit = grade ? `Grade ${grade}` : gradeView.title
  const scoreBit = score != null ? `score ${score}` : null
  const recordBits = [gradeBit, scoreBit].filter(Boolean).join(", ")

  const openings = [
    `${restaurant.name}'s latest NYC DOHMH inspection on file${when} shows ${recordBits}. Lower scores are better.`,
    `The NYC DOHMH record we have for ${restaurant.name}${when} is ${recordBits}.`,
    parsed
      ? `Inspected ${formatLongDate(parsed)}, ${restaurant.name} has ${recordBits} on the NYC DOHMH record we store.`
      : `The NYC DOHMH record we store for ${restaurant.name} is ${recordBits}. No inspection date is attached.`,
  ]

  const comparisons: string[] = []
  if (score != null && neighborhoodPeers && restaurant.neighborhood) {
    comparisons.push(
      comparisonSentence(
        restaurant.name,
        score,
        `in ${restaurant.neighborhood}`,
        neighborhoodPeers.average,
        neighborhoodPeers.peers,
        variant
      )
    )
  }
  if (score != null && cuisinePeers && restaurant.type) {
    comparisons.push(
      comparisonSentence(
        restaurant.name,
        score,
        `listed as ${restaurant.type}`,
        cuisinePeers.average,
        cuisinePeers.peers,
        variant + 1
      )
    )
  }

  return (
    <section aria-label="Inspection record">
      <p className="eyebrow">NYC DOHMH</p>
      <h2 className="h2-serif mt-2">Inspection record</h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed" style={{ color: "var(--color-text)", maxWidth: "65ch" }}>
        <p>{openings[variant]} This is the most recent inspection we hold. We do not store earlier visits, so we cannot show a trend.</p>
        {comparisons.map((sentence) => (
          <p key={sentence}>{sentence}</p>
        ))}
        {parsed && (
          <p>
            Last inspection date on file: <time dateTime={parsed.toISOString().slice(0, 10)}>{formatLongDate(parsed)}</time>.
          </p>
        )}
      </div>
    </section>
  )
}
