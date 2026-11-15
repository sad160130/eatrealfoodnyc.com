import { formatLongDate, parseInspectionDate } from "@/lib/inspection-dates"
import { letterGrade } from "@/lib/seo-titles"
import { parseDietaryTags, parseWorkingHours } from "@/lib/utils"
import type { NearbyGradeA } from "@/lib/nearby-grade-a"

export function restaurantFaqs(input: {
  name: string
  grade: string | null
  score: number | null
  inspectionDate: string | null
  address: string | null
  neighborhood: string | null
  borough: string | null
  dietaryTags: string | null
  workingHours: string | null
  rating: number | null
  reviews: number | null
  dataMonth: string
  nearby: NearbyGradeA[]
}): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []
  const grade = letterGrade(input.grade)
  const parsed = parseInspectionDate(input.inspectionDate)
  const when = parsed ? formatLongDate(parsed) : null
  faqs.push({
    question: `What is ${input.name}'s NYC health inspection grade?`,
    answer: grade
      ? `Grade ${grade}${when ? `, from its ${when} NYC DOHMH inspection` : ""}${input.score != null ? ` (score ${input.score})` : ""}.`
      : `No letter grade is matched to this listing as of ${input.dataMonth}.`,
  })
  if (when) {
    faqs.push({
      question: `When was ${input.name} last inspected?`,
      answer: `${when}. That is the latest inspection we hold.`,
    })
  }
  if (input.score != null) {
    const band = input.score <= 13 ? "A" : input.score <= 27 ? "B" : "C"
    faqs.push({
      question: `What does a score of ${input.score} mean?`,
      answer: `${input.score} is in the ${band} band. A covers 0–13 points, B 14–27, and C 28 or more.`,
    })
  }
  for (const tag of parseDietaryTags(input.dietaryTags).slice(0, 3)) {
    faqs.push({
      question: `Is ${input.name} ${tag}?`,
      answer: `Yes. We tag it ${tag} because the restaurant identifies that way or has substantial menu coverage.${tag === "gluten-free" ? " A health grade does not measure cross-contact." : ""}`,
    })
  }
  if (input.address) {
    faqs.push({
      question: `Where is ${input.name}?`,
      answer: [input.address, input.neighborhood, input.borough].filter(Boolean).join(", ") + ".",
    })
  }
  const hours = parseWorkingHours(input.workingHours)
  if (hours.length > 0) {
    faqs.push({
      question: `What are ${input.name}'s hours?`,
      answer: `${hours.map((row) => `${row.day} ${row.hours}`).join("; ")}. Hours are as listed; confirm before visiting.`,
    })
  }
  if (input.rating != null && input.rating > 0 && (input.reviews ?? 0) > 0) {
    faqs.push({
      question: `How is ${input.name} rated?`,
      answer: `${input.rating.toFixed(1)}/5 from ${input.reviews} Google reviews.`,
    })
  }
  if (input.nearby.length >= 2) {
    faqs.push({
      question: `Which Grade A restaurants are near ${input.name}?`,
      answer: input.nearby
        .slice(0, 3)
        .map((row) => `${row.name}${row.miles > 0 ? ` (${row.miles.toFixed(1)} mi)` : ""}`)
        .join(", ") + ".",
    })
  }
  return faqs.length >= 3 ? faqs : []
}
