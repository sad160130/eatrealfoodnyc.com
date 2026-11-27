import { dataAsOfSentence, getSiteStats } from "@/lib/site-stats"

export default async function DirectoryAsOf({
  variant = "sentence",
}: {
  variant?: "sentence" | "month" | "date"
}) {
  const stats = await getSiteStats()
  const label = stats.dataAsOfLabel ?? "date not on file"
  if (variant === "month" || variant === "date") return <span>{label}</span>
  return <span>{dataAsOfSentence(stats.dataAsOfLabel).replace(/\.$/, "")}</span>
}
