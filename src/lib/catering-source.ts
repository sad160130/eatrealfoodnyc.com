const SOURCE_TOKEN = /^[a-z][a-z0-9_]{0,31}$/

export function isCateringSource(source: string): boolean {
  return SOURCE_TOKEN.test(source)
}

/**
 * Record `source` on the lead's source_path. catering_leads has no separate
 * source column, so the query param is the record.
 */
export function withCateringSource(sourcePath: string, source: string): string {
  if (!isCateringSource(source)) return sourcePath
  if (!sourcePath.startsWith("/") || sourcePath.startsWith("//") || sourcePath.includes("://")) {
    return sourcePath
  }
  const url = new URL(sourcePath, "https://www.eatrealfoodnyc.com")
  if (url.origin !== "https://www.eatrealfoodnyc.com") return sourcePath
  url.searchParams.set("source", source)
  return `${url.pathname}${url.search}`
}
