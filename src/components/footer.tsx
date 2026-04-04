import Link from "next/link"
import Image from "next/image"

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

function boroughToSlug(borough: string): string {
  return borough.toLowerCase().replace(/ /g, "-")
}

export default function Footer() {
  return (
    <footer className="bg-forest py-16 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Col 1 */}
          <div>
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Eat Real Food NYC"
                width={375}
                height={277}
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-3 text-sm text-white/60">
              The Curated Culinary Authority of NYC. Dedicated to uncovering the finest
              health-conscious experiences in the city.
            </p>
          </div>

          {/* Col 2 — Geography */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              GEOGRAPHY
            </p>
            <ul className="mt-4 space-y-2">
              {BOROUGHS.map((b) => (
                <li key={b}>
                  <Link
                    href={`/nyc/${boroughToSlug(b)}/healthy-restaurants`}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Dietary */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              DIETARY
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Vegan", "Vegetarian", "Gluten-Free", "Halal", "Kosher", "Dairy-Free",
                "Keto", "Paleo", "Whole Foods", "Low Calorie", "Raw Food", "Nut-Free",
              ].map((d) => (
                <li key={d}>
                  <Link
                    href={`/healthy-restaurants/${d.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              COMPANY
            </p>
            <ul className="mt-4 space-y-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Data", href: "/about/our-data" },
                { label: "Editorial Standards", href: "/about/editorial-standards" },
                { label: "Meet the Team", href: "/about/team" },
                { label: "Dining Guides", href: "/guides" },
                { label: "Contact", href: "/contact" },
                { label: "Press", href: "/press" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Tools */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              TOOLS
            </p>
            <ul className="mt-4 space-y-2">
              {[
                { label: "Interactive Map", href: "/map" },
                { label: "Compare Neighborhoods", href: "/nyc/compare" },
                { label: "Open Right Now", href: "/search?open=true" },
                { label: "Hidden Gems", href: "/search?hidden_gem=true" },
                { label: "Grade A Only", href: "/search?grade=A" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} Eat Real Food NYC. All rights reserved.
          <span className="mx-2">&middot;</span>
          <a href="/sitemap.xml" className="text-white/40 transition-colors hover:text-white/60">Sitemap</a>
        </div>
      </div>
    </footer>
  )
}
