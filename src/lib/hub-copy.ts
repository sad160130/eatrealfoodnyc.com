export type HubFaq = { question: string; answer: string }

function n(value: number) {
  return value.toLocaleString("en-US")
}

function share(part: number, whole: number) {
  if (whole <= 0) return null
  return `${Math.round((part / whole) * 100)}%`
}

export function placeIntro(input: {
  place: string
  borough?: string
  count: number
  gradeA: number
  gradeB: number
  gradeC: number
  latestMonth: string | null
  diets: Array<{ label: string; count: number }>
  neighborhoodCount?: number
}): string[] {
  const where = input.borough ? `${input.place}, ${input.borough}` : input.place
  const graded = input.gradeA + input.gradeB + input.gradeC
  const paragraphs: string[] = []
  const first: string[] = []
  if (input.count < 5) {
    first.push(`${where} has ${n(input.count)} published ${input.count === 1 ? "listing" : "listings"} in this directory. The set is small, and the page stays in the index because the count comes from published rows.`)
  } else {
    first.push(`${where} has ${n(input.count)} published healthy restaurants in this directory.`)
  }
  if (graded > 0) {
    const aShare = share(input.gradeA, graded)
    first.push(`${n(input.gradeA)} of ${n(graded)} with an A, B, or C hold Grade A${aShare ? ` (${aShare})` : ""}. ${n(input.gradeB)} hold Grade B and ${n(input.gradeC)} hold Grade C.`)
  } else {
    first.push("None of these published listings has a matched A, B, or C.")
  }
  if (input.latestMonth) first.push(`The newest inspection date on file is ${input.latestMonth}.`)
  if (input.neighborhoodCount && input.neighborhoodCount > 0) {
    first.push(`The listings sit in ${n(input.neighborhoodCount)} ${input.neighborhoodCount === 1 ? "neighborhood" : "neighborhoods"}.`)
  }
  paragraphs.push(first.join(" "))

  const diets = input.diets.filter((diet) => diet.count >= 3).slice(0, 3)
  if (diets.length > 0) {
    paragraphs.push(`Tags with at least 3 listings: ${diets.map((diet) => `${n(diet.count)} ${diet.label.toLowerCase()}`).join(", ")}. A tag is applied only when the restaurant identifies that way or has substantial menu coverage.`)
  }
  return paragraphs
}

export function placeFaqs(input: {
  place: string
  borough?: string
  count: number
  gradeA: number
  graded: number
  topNeighborhood?: { name: string; count: number } | null
  diets: Array<{ label: string; count: number }>
}): HubFaq[] {
  const where = input.borough ? `${input.place}, ${input.borough}` : input.place
  const faqs: HubFaq[] = [
    {
      question: `How many healthy restaurants are listed in ${where}?`,
      answer: `${n(input.count)} published restaurants are listed in ${where}.`,
    },
  ]
  if (input.graded > 0 && input.gradeA > 0) {
    const aShare = share(input.gradeA, input.graded)
    faqs.push({
      question: `How many restaurants in ${input.place} hold Grade A?`,
      answer: `${n(input.gradeA)} of ${n(input.graded)} listings with an A, B, or C hold Grade A${aShare ? ` (${aShare} of graded listings)` : ""}. Listings without a letter are not counted as Grade A.`,
    })
  }
  if (input.topNeighborhood && input.topNeighborhood.count > 0) {
    faqs.push({
      question: `Which ${input.place} neighborhood has the most published listings?`,
      answer: `${input.topNeighborhood.name} has ${n(input.topNeighborhood.count)} published listings, the most of any neighborhood in ${input.place} in this directory.`,
    })
  }
  for (const diet of input.diets.filter((diet) => diet.count > 0).slice(0, 3)) {
    faqs.push({
      question: `How many ${diet.label.toLowerCase()} restaurants are listed in ${input.place}?`,
      answer: `${n(diet.count)} published ${diet.count === 1 ? "listing carries" : "listings carry"} the ${diet.label.toLowerCase()} tag in ${input.place}.`,
    })
  }
  return faqs
}

export function dietIntro(input: {
  label: string
  place: string
  count: number
  gradeA: number
  graded: number
}): string {
  const name = input.label.toLowerCase()
  const size = input.count < 5
    ? `This directory lists ${n(input.count)} ${name} ${input.count === 1 ? "restaurant" : "restaurants"} in ${input.place}. That is a small published set, and the page stays indexed because the count is computed from those rows.`
    : `This directory lists ${n(input.count)} ${name} restaurants in ${input.place}.`
  const grades = input.graded > 0
    ? ` ${n(input.gradeA)} of ${n(input.graded)} with an A, B, or C hold Grade A.`
    : " None of them has a matched A, B, or C."
  return `${size}${grades} A missing grade is not counted as Grade A.`
}

export function dietFaqs(input: {
  label: string
  place: string
  count: number
  gradeA: number
  graded: number
  topBorough?: { name: string; count: number } | null
  topNeighborhood?: { name: string; borough: string; count: number } | null
  policy: string
}): HubFaq[] {
  const name = input.label.toLowerCase()
  const faqs: HubFaq[] = [
    {
      question: `How many ${name} restaurants are listed in ${input.place}?`,
      answer: `${n(input.count)} ${name} restaurants are published in ${input.place}. ${input.graded > 0 ? `${n(input.gradeA)} of ${n(input.graded)} with a letter grade hold Grade A.` : "None has a matched A, B, or C."}`,
    },
  ]
  if (input.topBorough && input.topBorough.count > 0) {
    faqs.push({
      question: `Which borough has the most listed ${name} restaurants?`,
      answer: `${input.topBorough.name} has ${n(input.topBorough.count)}, the most of the five boroughs in this directory.`,
    })
  }
  if (input.topNeighborhood && input.topNeighborhood.count > 0) {
    faqs.push({
      question: `Which neighborhood has the most listed ${name} restaurants?`,
      answer: `${input.topNeighborhood.name} in ${input.topNeighborhood.borough} has ${n(input.topNeighborhood.count)} published ${name} listings, the most of any neighborhood in this set.`,
    })
  }
  faqs.push({
    question: `What does the ${name} tag mean?`,
    answer: input.policy,
  })
  return faqs
}
