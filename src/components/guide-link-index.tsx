import Link from "next/link"

export interface GuideLink {
  href: string
  label: string
}

export default function GuideLinkIndex({
  id = "browse-directory",
  heading,
  intro,
  groups,
}: {
  id?: string
  heading: string
  intro: string
  groups: Array<{ title: string; links: GuideLink[] }>
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="mb-4 text-3xl font-bold text-forest" style={{ fontFamily: "Georgia, serif" }}>
        {heading}
      </h2>
      <p className="mb-6 max-w-3xl text-lg leading-relaxed text-gray-700">{intro}</p>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-sage">{group.title}</h3>
            <ul className="flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="font-medium text-jade underline underline-offset-2 hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
