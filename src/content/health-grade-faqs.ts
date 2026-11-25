/**
 * Search questions for /guides/nyc-health-grades-explained.
 * Answers stay inside the NYC Health Code rules already stated on that guide:
 * A is 0–13, B is 14–27 on a reinspection, C is 28 or more on a reinspection,
 * and Z/P are Grade Pending rather than letters.
 * The borough answer uses the dated citywide file, not directory counts.
 */
import { CITYWIDE_RESTAURANT_GRADES } from "../data/citywide-restaurant-grades"
import { highestGradeABoroughs, percentOneDecimal } from "../lib/citywide-grades"

export const HEALTH_GRADES_LEDE =
  "NYC restaurant grades are the letters the Department of Health and Mental Hygiene posts after a sanitary inspection. A score of 0 to 13 points is an A. A reinspection score of 14 to 27 is a B, and 28 or more is a C. Grade Pending is not a letter. Fewer points is a better grade."

const CITYWIDE = CITYWIDE_RESTAURANT_GRADES

function count(value: number): string {
  return value.toLocaleString("en-US")
}

function boroughGradeAnswer(): string {
  const winners = highestGradeABoroughs(CITYWIDE.boroughs)
  if (winners.length === 0) throw new Error("citywide borough table has no letter grades")
  const detail = (borough: (typeof winners)[number]) =>
    `${count(borough.a)} of ${count(borough.letterGraded)} latest letter-graded inspections (${percentOneDecimal(borough.a, borough.letterGraded)})`
  const who = winners.length === 1
    ? `${winners[0].borough} has the highest share of Grade A restaurants: ${detail(winners[0])}`
    : `${winners.map((borough) => borough.borough).join(" and ")} tie for the highest share of Grade A restaurants: ${winners.map((borough) => `${borough.borough}, ${detail(borough)}`).join("; ")}`
  return `In the NYC DOHMH inspection file pulled on ${CITYWIDE.pulledOnLabel}, ${who}. Citywide, ${count(CITYWIDE.a)} of ${count(CITYWIDE.letterGraded)} latest letter grades are A (${percentOneDecimal(CITYWIDE.a, CITYWIDE.letterGraded)}). That is the city file, not the published listings in this directory. The newest inspection_date in the file is ${CITYWIDE.newestInspectionLabel}.`
}

export const HEALTH_GRADE_FAQS = [
  {
    question: "What does Grade Pending mean in NYC?",
    answer:
      "Grade Pending means the letter grade for the current inspection cycle is still being determined. When a reinspection scores 14 or more and the restaurant is not closed, it receives both the letter-grade card and a Grade Pending card. It posts one of those cards until it has a chance to be heard at the OATH Health Tribunal. A first inspection of 14 or more does not itself issue a Grade Pending card. In the NYC DOHMH open dataset, Z means Grade Pending, and P means Grade Pending issued on re-opening after an initial inspection that resulted in a closure.",
  },
  {
    question: "How often are NYC restaurants inspected?",
    answer:
      "The Department conducts an inspection cycle at least annually at each food service establishment required to post a letter grade. An establishment that scores 14 or more is not put on a one-year wait for the next cycle. The gap depends on the higher of the initial score and the reinspection score.",
  },
  {
    question: "What score is a C in NYC?",
    answer:
      "A C is a score of 28 or more points. The Department issues that letter on the reinspection, not on the first inspection of the cycle. A first-visit score of 28 or more is ungraded, and the reinspection is scheduled no sooner than 7 days later. A later compliance inspection does not change the letter grade for the cycle.",
  },
  {
    question: "Can a restaurant post a different grade?",
    answer:
      "No. A restaurant posts the card the Department of Health and Mental Hygiene issued. It does not choose a different letter. After a reinspection of 14 or more, if the restaurant is not closed, the Department issues both the letter-grade card for that score and a Grade Pending card, and the restaurant posts one of those two until the OATH Health Tribunal hearing. Not posting the issued card is itself a violation.",
  },
  {
    question: "What score is a Grade A in NYC?",
    answer:
      "A Grade A is a score of 0 to 13 points on the initial inspection or the reinspection in that cycle. The restaurant receives an A card and posts it immediately.",
  },
  {
    question: "What score is a B in NYC?",
    answer:
      "A B is a reinspection score of 14 to 27 points. The Department does not issue a B on the first inspection of a cycle. A first-visit score of 14 or more is ungraded, and the reinspection is scheduled no sooner than 7 days later.",
  },
  {
    question: "What does Z mean on a NYC restaurant inspection?",
    answer:
      "Z is not a letter grade. In the DOHMH restaurant inspection dataset, Z means Grade Pending. P means Grade Pending issued on re-opening after an initial inspection that resulted in a closure. N means Not Yet Graded. A, B, and C are the letter grades.",
  },
  {
    question: "What do NYC restaurant grades mean?",
    answer:
      "NYC restaurant grades are letters from a sanitary inspection score. A is 0 to 13 points. B is 14 to 27 points on a reinspection. C is 28 or more points on a reinspection. Grade Pending, including Z or P in the city data, is not a letter.",
  },
  {
    question: "How do I look up a NYC restaurant's grade?",
    answer:
      "Look it up in the city's ABCEats restaurant inspection search at https://a816-health.nyc.gov/ABCEatsRestaurants, or in NYC Open Data dataset 43nn-pn8j at https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j. A published page in this directory also shows the grade, score, and inspection date when a record is matched. The card in the window is the one the restaurant has to post.",
  },
  {
    question: "Which NYC borough has the highest share of Grade A restaurants?",
    answer: boroughGradeAnswer(),
  },
]
