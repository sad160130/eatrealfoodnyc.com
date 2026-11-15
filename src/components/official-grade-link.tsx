/**
 * The restaurants table has no CAMIS column. When a numeric CAMIS is passed,
 * the link filters dataset 43nn-pn8j by that id. Otherwise it filters by DBA name.
 */
export function dohmhSourceUrl(input: { name: string; camis?: string | null }) {
  const dataset = "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"
  const camis = input.camis?.trim()
  if (camis && /^\d+$/.test(camis)) {
    return `${dataset}/explore?$where=${encodeURIComponent(`camis='${camis}'`)}`
  }
  const dba = input.name.replace(/'/g, "''")
  return `${dataset}/explore?$where=${encodeURIComponent(`upper(dba)=upper('${dba}')`)}`
}

export default function OfficialGradeLink({
  name,
  camis,
}: {
  name: string
  camis?: string | null
}) {
  return (
    <a
      href={dohmhSourceUrl({ name, camis })}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2"
      style={{ color: "var(--color-jade)" }}
    >
      Official NYC DOHMH inspection grade
    </a>
  )
}
