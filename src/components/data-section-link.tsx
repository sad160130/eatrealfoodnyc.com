export function DataSectionLink() {
  return (
    <p className="mt-4 text-base leading-relaxed" style={{ maxWidth: "65ch" }}>
      This page is one report in the{" "}
      <a href="/data" className="font-semibold underline underline-offset-4" style={{ color: "var(--color-jade)" }}>
        NYC restaurant data section
      </a>
      . That section lists the other dated extracts and the published-directory counts, with the inspection date those counts use.
    </p>
  )
}
