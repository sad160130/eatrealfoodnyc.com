import { dohmhSourceUrl } from "@/lib/dohmh-source-url"

export { dohmhSourceUrl }

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
