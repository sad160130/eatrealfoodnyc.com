import fs from "node:fs"
import path from "node:path"

export type ExplainerPage = "data" | "grade-a"

export function explainerAudioSrc(page: ExplainerPage): string {
  return `/audio/${page}-explainer.mp3`
}

/** True only when the MP3 is in public/audio. Missing files skip the player. */
export function explainerAudioExists(page: ExplainerPage): boolean {
  const file = path.join(process.cwd(), "public", "audio", `${page}-explainer.mp3`)
  return fs.existsSync(file)
}
