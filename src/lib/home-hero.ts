/** Citywide Grade A hub. Matches gradeACityPath() for page 1. */
export const HOME_HERO_GRADE_A_PATH = "/healthy-restaurants/grade-a"

export interface HomeHeroCopyInput {
  published: number
  gradeA: number
  /** Long date from the directory snapshot, or null when no inspection date is on file. */
  latestInspectionLabel: string | null
}

export interface HomeHeroCopy {
  headingLead: string
  headingRest: string
  subhead: string
  ctaLabel: string
  ctaHref: string
  showGradeMark: boolean
}

function count(value: number): string {
  return value.toLocaleString("en-US")
}

/**
 * Homepage hero copy. Counts and the inspection date are passed in from the
 * same published-listing queries the rest of the homepage already renders.
 * A missing date is omitted. A zero Grade A count does not claim one exists.
 */
export function homeHeroCopy(input: HomeHeroCopyInput): HomeHeroCopy {
  const published = count(input.published)
  const gradeA = count(input.gradeA)
  const dateSentence = input.latestInspectionLabel
    ? ` The newest inspection date on a published listing is ${input.latestInspectionLabel}.`
    : ""

  if (input.gradeA > 0) {
    return {
      headingLead: "Healthy restaurants in NYC",
      headingRest: "with a city Grade A.",
      subhead: `${gradeA} of ${published} published listings hold a NYC Department of Health Grade A.${dateSentence}`,
      ctaLabel: "Find a Grade A restaurant",
      ctaHref: HOME_HERO_GRADE_A_PATH,
      showGradeMark: true,
    }
  }

  return {
    headingLead: "Healthy restaurants in NYC",
    headingRest: "graded when the city has a record.",
    subhead: `${published} published listings. A NYC Department of Health grade is shown only when an inspection record is matched.${dateSentence}`,
    ctaLabel: "Browse healthy restaurants",
    ctaHref: "/search",
    showGradeMark: false,
  }
}
