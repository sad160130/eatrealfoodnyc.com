/**
 * The old per-restaurant inspection lookup returns 404. A numeric CAMIS
 * filters dataset 43nn-pn8j. Otherwise the link filters that dataset by DBA name.
 */
const DATASET = "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j"

export function dohmhSourceUrl(input: { name: string; camis?: string | null }) {
  const camis = input.camis?.trim()
  if (camis && /^\d+$/.test(camis)) {
    return `${DATASET}/explore?$where=${encodeURIComponent(`camis='${camis}'`)}`
  }
  const dba = input.name.replace(/'/g, "''")
  return `${DATASET}/explore?$where=${encodeURIComponent(`upper(dba)=upper('${dba}')`)}`
}
