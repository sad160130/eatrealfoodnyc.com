import { getDirectorySnapshot } from "@/lib/directory-snapshot"

export default async function DirectoryAsOf({
  variant = "sentence",
}: {
  variant?: "sentence" | "month"
}) {
  const snapshot = await getDirectorySnapshot()
  // Same newest inspection date the footer prints in full.
  const label = snapshot.latestInspectionMonth ?? "date not recorded"
  if (variant === "month") return <span>{label}</span>
  return <span>Listings updated {label}</span>
}
