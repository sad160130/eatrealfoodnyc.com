import Link from "next/link"

interface GuideCTAProps {
  heading: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export default function GuideCTA({
  heading,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: GuideCTAProps) {
  return (
    <section className="my-12 rounded-2xl bg-forest p-10 text-center">
      <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
        {heading}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-white/60">{body}</p>
      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href={primaryHref}
          className="rounded-xl bg-sage px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-forest"
        >
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
