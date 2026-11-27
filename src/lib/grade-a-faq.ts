const ABCEATS_LOOKUP = "https://a816-health.nyc.gov/ABCEatsRestaurants"
const GRADES_GUIDE = "https://www.eatrealfoodnyc.com/guides/nyc-health-grades-explained"

/** Exact question for the Grade A hub FAQ. Citywide has no place clause. */
export function gradeAListQuestion(scope: { boroughName?: string; neighborhoodName?: string }): string {
  const place = scope.neighborhoodName ?? scope.boroughName
  if (place) return `Which NYC restaurants have an A grade in ${place}?`
  return "Which NYC restaurants have an A grade?"
}

/**
 * `total` is countGradeA(): published operational rows in this directory
 * whose matched NYC DOHMH grade is A. It is not a city-file total.
 */
export function gradeAListAnswer(total: number, place: string): string {
  const count = total.toLocaleString("en-US")
  return `${count} published operational restaurants in this directory have a matched NYC Department of Health and Mental Hygiene Grade A in ${place}. That count is this directory, not every inspected restaurant in ${place}. The city’s complete lookup is ABCEats at ${ABCEATS_LOOKUP}. What an A means is on the NYC health grades guide at ${GRADES_GUIDE}.`
}
