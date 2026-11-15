/** Google review text sometimes stores a literal break tag. Show it as a space. */
export function stripReviewMarkup(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&lt;br\s*\/?&gt;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}
