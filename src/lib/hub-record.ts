import { formatLongDate } from "@/lib/inspection-dates"
import { latestStamp, listingStamp } from "@/lib/listing-stamp"

export type HubMode = "all" | "grade-a" | "diet"

export interface HubListingLine {
  name: string
  grade: string | null
}

export interface HubRecordInput {
  place: string
  total: number
  gradeA: number
  gradeB?: number
  gradeC?: number
  updated: Date | null
  mode: HubMode
  dietLabel?: string
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function hubStamp(
  rows: Array<{ inspection_date?: string | null; updated_at?: Date | string | null }>
): Date | null {
  return latestStamp(rows.map((row) => listingStamp(row))) ?? null
}

function n(value: number): string {
  return value.toLocaleString("en-US")
}

function noun(value: number, singular: string, plural: string): string {
  return `${n(value)} ${value === 1 ? singular : plural}`
}

export function hubOpening(input: HubRecordInput): string {
  const dateSentence = input.updated
    ? `The newest inspection date or record edit among these listings is ${formatLongDate(input.updated)}.`
    : "None of these listings has a parsed inspection date or an edit date on file."
  if (input.mode === "grade-a") {
    return `${input.place} has ${noun(input.total, "published restaurant", "published restaurants")} whose matched NYC Department of Health and Mental Hygiene grade is A. ${dateSentence} Every restaurant on this page is in that Grade A set. Grade A means under 14 points on the initial inspection or the reinspection. Listings with no letter, a B, a C, or a pending grade are not included. The letter is the city's, not a score this directory assigns.`
  }
  if (input.mode === "diet") {
    const diet = (input.dietLabel ?? "tagged").toLowerCase()
    return `${input.place} has ${noun(input.total, "published restaurant", "published restaurants")} tagged ${diet}. ${noun(input.gradeA, "of those listings has", "of those listings have")} a matched NYC Department of Health and Mental Hygiene Grade A. ${dateSentence} The ${diet} tag is applied only when the restaurant identifies that way or has substantial menu coverage. A missing letter is not counted as Grade A. The letter is the city's inspection grade, not a rating this directory assigns.`
  }
  const gradeB = input.gradeB ?? 0
  const gradeC = input.gradeC ?? 0
  return `${input.place} has ${noun(input.total, "published restaurant listing", "published restaurant listings")} in this directory. ${noun(input.gradeA, "listing has", "listings have")} a matched NYC Department of Health and Mental Hygiene Grade A. ${dateSentence} ${noun(gradeB, "listing has", "listings have")} Grade B and ${noun(gradeC, "listing has", "listings have")} Grade C. A listing with no matched A, B, or C stays in the published count and is not called Grade A. The letter is the city's inspection letter, not a taste rating.`
}

export function hubGradeNote(input: HubRecordInput): string {
  if (input.mode === "grade-a") {
    return "The date above is the latest matched inspection day among these Grade A listings, or the latest edit of a listing when no inspection day is stored. It is not the clock time of this page build."
  }
  const ungraded = Math.max(0, input.total - input.gradeA - (input.gradeB ?? 0) - (input.gradeC ?? 0))
  return `${noun(ungraded, "published listing has", "published listings have")} no matched A, B, or C. Grade A is under 14 points. Grade B is 14 to 27 points on a reinspection. Grade C is 28 points or more. Those bands are the NYC Department of Health and Mental Hygiene letter rules.`
}

export function listingSentence(place: string, listing: HubListingLine): string {
  const grade = listing.grade
  const letter = grade === "A" || grade === "B" || grade === "C"
    ? ` with a matched Grade ${grade}`
    : grade === "Z" || grade === "P"
      ? " with Grade Pending on the matched inspection"
      : " with no matched A, B, or C"
  return `${listing.name} is a published listing in ${place}${letter}.`
}
