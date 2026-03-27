import Link from "next/link"
import { GuideArticle } from "@/config/guides"

interface GuideHeroProps {
  guide: GuideArticle
  subtitle: string
  stats?: Array<{ stat: string; label: string }>
}

export default function GuideHero({ guide, subtitle, stats }: GuideHeroProps) {
  return (
    <div className="bg-forest px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
          <Link href="/" className="transition-colors hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/guides" className="transition-colors hover:text-white">Guides</Link>
          <span>/</span>
          <span className="text-white/80">{guide.shortTitle}</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-sage">{guide.category}</span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/50">{guide.readTime}</span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/50">
            Published {new Date(guide.publishedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <span className="text-white/30">·</span>
          <span className="rounded-full bg-sage/20 px-2 py-0.5 text-xs font-medium text-sage">
            Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>

        <h1
          className="text-4xl font-bold leading-tight text-white md:text-5xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {guide.title}
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">{subtitle}</p>

        {stats && stats.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-sage">{item.stat}</p>
                <p className="mt-1 text-xs leading-tight text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
