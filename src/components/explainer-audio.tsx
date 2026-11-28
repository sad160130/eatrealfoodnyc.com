import { explainerAudioExists, explainerAudioSrc, type ExplainerPage } from "@/lib/explainer-audio"

/**
 * Native audio plus a visible transcript. Rendered only after the MP3 is
 * uploaded to public/audio. The transcript is the narration text, in HTML.
 */
export function ExplainerAudio({
  page,
  transcript,
}: {
  page: ExplainerPage
  transcript: string
}) {
  if (!explainerAudioExists(page)) return null
  const src = explainerAudioSrc(page)
  return (
    <figure className="mt-6 border p-5" style={{ borderColor: "var(--hairline)", backgroundColor: "#fff" }}>
      <figcaption className="eyebrow">AI-narrated explainer</figcaption>
      <audio className="mt-3 w-full" controls preload="none" src={src}>
        <a href={src}>Listen to the AI-narrated explainer</a>
      </audio>
      <div className="mt-4">
        <h2 className="text-base font-semibold" style={{ fontFamily: "Georgia, serif" }}>Transcript</h2>
        {transcript.split(/\n\n+/).map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="mt-2 text-base leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </figure>
  )
}
