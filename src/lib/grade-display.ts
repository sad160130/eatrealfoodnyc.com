/**
 * What a diner should see for a DOHMH grade code.
 * A, B, and C stay letters. Z and P are Grade Pending. N and a blank
 * letter are Not Yet Graded. The placard never prints Z, P, or N.
 */
export interface GradePresentation {
  plaque: string
  dataGrade: "" | "A" | "B" | "C"
  ariaLabel: string
  title: string
  explanation: string
}

const LETTERS = {
  A: "Grade A means fewer than 14 points on the initial inspection or the reinspection.",
  B: "Grade B means 14 to 27 points on a reinspection. The first inspection of a cycle does not issue a B.",
  C: "Grade C means 28 or more points on a reinspection.",
} as const

export function presentGrade(grade: string | null | undefined): GradePresentation {
  const code = (grade ?? "").trim().toUpperCase()
  if (code === "A" || code === "B" || code === "C") {
    return {
      plaque: code,
      dataGrade: code,
      ariaLabel: `NYC Department of Health inspection grade ${code}`,
      title: `NYC DOHMH Grade ${code}`,
      explanation: LETTERS[code],
    }
  }
  if (code === "Z" || code === "P") {
    return {
      plaque: "–",
      dataGrade: "",
      ariaLabel: "NYC Department of Health grade pending",
      title: "Grade Pending",
      explanation:
        code === "P"
          ? "Grade Pending means the letter for this inspection cycle is not final. The city dataset uses P for a Grade Pending card issued on re-opening after a closure. It is not a letter grade."
          : "Grade Pending means the letter for this inspection cycle is not final. The city dataset uses Z for Grade Pending. It is not a letter grade in the window.",
    }
  }
  return {
    plaque: "–",
    dataGrade: "",
    ariaLabel: "NYC Department of Health inspection not yet graded",
    title: "Not Yet Graded",
    explanation:
      "Not Yet Graded means the city has not posted an A, B, or C for this listing. A blank letter, or N in the city dataset, is not a passing grade.",
  }
}
