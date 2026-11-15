import { formatInspectionMonth, parseStoredDate } from "./freshness"

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function finish(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim()
  return cleaned.endsWith(".") ? cleaned : `${cleaned}.`
}

/** Keep a factual sentence inside 25–45 words by adding or dropping optional clauses. */
export function fitCapsule(required: string, optional: string[]): string {
  let text = finish(required)
  for (const clause of optional) {
    if (wordCount(text) >= 25) break
    const next = finish(`${text.replace(/\.$/, "")}. ${clause.replace(/\.$/, "")}`)
    if (wordCount(next) <= 45) text = next
  }
  while (wordCount(text) > 45 && text.includes(". ")) {
    text = finish(text.slice(0, text.lastIndexOf(". ")))
  }
  return text
}

export function restaurantCapsule(input: {
  name: string
  neighborhood: string | null
  borough: string | null
  grade: string | null
  score: number | null
  inspectionDate: string | null
  tags: string[]
  address: string | null
  type: string | null
}) {
  const place = [input.neighborhood, input.borough].filter(Boolean).join(", ") || "New York City"
  const month = formatInspectionMonth(input.inspectionDate)
  const grade = input.grade?.trim() || null
  let required: string
  if (grade && input.score != null && month) {
    required = `${input.name} in ${place} holds NYC DOHMH Grade ${grade} (score ${input.score}, inspected ${month})`
  } else if (grade && month) {
    required = `${input.name} in ${place} holds NYC DOHMH Grade ${grade}, inspected ${month}`
  } else if (grade && input.score != null) {
    required = `${input.name} in ${place} holds NYC DOHMH Grade ${grade}, score ${input.score}`
  } else if (grade) {
    required = `${input.name} in ${place} holds NYC DOHMH Grade ${grade}`
  } else {
    required = `${input.name} in ${place} has no NYC DOHMH grade matched on this listing`
  }
  const optional: string[] = []
  if (input.tags.length > 0) optional.push(`It is tagged ${input.tags.slice(0, 3).join(", ")}`)
  if (input.address) optional.push(`The address on file is ${input.address}`)
  if (input.type) optional.push(`The listed cuisine is ${input.type}`)
  if (!grade && input.score == null && !month) {
    optional.push("No inspection score or inspection date is stored either")
  }
  return fitCapsule(required, optional)
}

export function neighborhoodCapsule(input: {
  neighborhood: string
  count: number
  graded: number
  gradeA: number
  latestMonth: string | null
  tagged: number
}) {
  const asOf = input.latestMonth ? ` Data as of ${input.latestMonth}` : ""
  const required = input.graded > 0
    ? `Of ${input.graded} graded restaurants in ${input.neighborhood}, ${input.gradeA} hold NYC DOHMH Grade A.${asOf}`
    : `${input.neighborhood} has ${input.count} published restaurants in this directory. None has a matched NYC DOHMH grade`
  const optional = [
    `${input.count} restaurants are published here in total`,
    input.tagged > 0 ? `${input.tagged} of those listings carry at least one dietary tag` : "None of the published listings carries a dietary tag",
  ]
  return fitCapsule(required, optional)
}

export function dietCapsule(input: {
  label: string
  count: number
  gradeA: number
  gradeB: number
  gradeC: number
  latestMonth: string | null
}) {
  const graded = input.gradeA + input.gradeB + input.gradeC
  const asOf = input.latestMonth ? ` Data as of ${input.latestMonth}` : ""
  const required = graded > 0
    ? `${input.count} ${input.label.toLowerCase()} restaurants are published in NYC. ${graded} have a NYC DOHMH letter grade: ${input.gradeA} A, ${input.gradeB} B, and ${input.gradeC} C.${asOf}`
    : `${input.count} ${input.label.toLowerCase()} restaurants are published in NYC. None has a matched NYC DOHMH letter grade`
  return fitCapsule(required, [
    "A letter is shown only when a DOHMH record is matched to the listing",
  ])
}

export function inspectionFact(raw: string | null) {
  return parseStoredDate(raw)?.iso ?? null
}
