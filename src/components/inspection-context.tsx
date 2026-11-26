import Link from "next/link"
import { listingGuideLinks } from "@/lib/listing-guide-links"
import {
  FOOD_SAFETY_SENTENCE,
  boroughGradeShare,
  boroughTopGuide,
  placeGradeShare,
  type GradeShareLink,
} from "@/lib/nta-grade-share"

const linkClass = "underline underline-offset-4"
const linkStyle = { color: "var(--color-jade)" }

function ShareSentence({ share }: { share: GradeShareLink }) {
  return (
    <p>
      <Link href={share.href} className={linkClass} style={linkStyle}>
        {share.place}
      </Link>
      {`: ${share.share} of letter-graded restaurants hold an A (citywide ${share.citywide}). ${FOOD_SAFETY_SENTENCE} NYC Open Data 43nn-pn8j, record date ${share.recordDate}.`}
    </p>
  )
}

export function InspectionContext({
  neighborhood,
  borough,
  type,
  dietaryTags,
  workingHours,
}: {
  neighborhood: string | null
  borough: string | null
  type: string | null
  dietaryTags: string | null
  workingHours: string | null
}) {
  const share = placeGradeShare(neighborhood, borough)
  const guides = listingGuideLinks({ type, dietaryTags, workingHours, neighborhood, borough })
  return (
    <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--color-text)", maxWidth: "62ch", lineHeight: 1.55 }}>
      {share ? <ShareSentence share={share} /> : null}
      <p>
        Read{" "}
        <Link href="/guides/nyc-health-grades-explained" className={linkClass} style={linkStyle}>
          what the letter grade means
        </Link>
        {guides.length > 0 ? (
          <>
            {". Related guides: "}
            {guides.map((guide, index) => (
              <span key={guide.href}>
                {index > 0 ? ", " : ""}
                <Link href={guide.href} className={linkClass} style={linkStyle}>
                  {guide.label}
                </Link>
              </span>
            ))}
            .
          </>
        ) : (
          "."
        )}
      </p>
    </div>
  )
}

export function BoroughGradeContext({ borough }: { borough: string }) {
  const share = boroughGradeShare(borough)
  if (!share) return null
  const top = boroughTopGuide(borough)
  return (
    <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--color-text)", maxWidth: "62ch", lineHeight: 1.55 }}>
      <ShareSentence share={share} />
      <p>
        <Link href="/guides/grade-a-restaurants-by-borough-nyc" className={linkClass} style={linkStyle}>
          Grade A restaurants by borough
        </Link>
        {" · "}
        <Link href={top.href} className={linkClass} style={linkStyle}>
          {top.label}
        </Link>
      </p>
      {borough === "Queens" ? (
        <p>
          <Link href="/guides/best-restaurants-flushing" className={linkClass} style={linkStyle}>
            Grade A restaurants in Flushing
          </Link>
          {" are counted from the latest NYC inspection file for the Flushing NTA."}
        </p>
      ) : null}
    </div>
  )
}

export function NeighborhoodGradeContext({
  neighborhood,
  borough,
}: {
  neighborhood: string
  borough: string
}) {
  const share = placeGradeShare(neighborhood, borough)
  if (!share) return null
  const flushing = neighborhood.trim().toLowerCase() === "flushing" && borough.trim().toLowerCase() === "queens"
  return (
    <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--color-text)", maxWidth: "62ch", lineHeight: 1.55 }}>
      <ShareSentence share={share} />
      {flushing ? (
        <p>
          <Link href="/guides/best-restaurants-flushing" className={linkClass} style={linkStyle}>
            Grade A restaurants in Flushing
          </Link>
          {" uses the Flushing NTA and the current inspection file."}
        </p>
      ) : null}
    </div>
  )
}
