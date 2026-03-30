import Link from "next/link"

interface ContextualLinksProps {
  intro?: string
  links: Array<[string, string]>
  className?: string
}

export default function ContextualLinks({ intro, links, className = "" }: ContextualLinksProps) {
  if (links.length === 0) return null

  return (
    <div className={`text-sm leading-relaxed text-gray-600 ${className}`}>
      {intro && <span>{intro} </span>}
      {links.map(([anchor, href], i) => (
        <span key={href}>
          <Link href={href} className="font-medium text-jade underline underline-offset-2 transition-colors hover:text-forest">
            {anchor}
          </Link>
          {i < links.length - 2 && ", "}
          {i === links.length - 2 && ", and "}
          {i === links.length - 1 && "."}
        </span>
      ))}
    </div>
  )
}
