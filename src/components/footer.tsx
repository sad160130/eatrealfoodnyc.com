import Link from "next/link"
import Image from "next/image"
import SocialLinks from "@/components/social-links"

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
                width={800}
                height={198}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-3 text-sm text-white/60">
              The Curated Culinary Authority of NYC. Dedicated to uncovering the finest
              health-conscious experiences in the city.
            </p>

            {/* Follow Us */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                FOLLOW US
              </p>
              <div className="space-y-3">
                <a
                  href="https://www.instagram.com/nyc_healthyeats/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Eat Real Food NYC on Instagram"
                  className="group flex items-center gap-3 text-white/50 transition-colors hover:text-[#E1306C]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium leading-none">Instagram</p>
                    <p className="mt-0.5 text-xs text-white/30">@nyc_healthyeats</p>
                  </div>
                </a>
                <a
                  href="https://www.youtube.com/@EatRealFoodNYC"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to Eat Real Food NYC on YouTube"
                  className="group flex items-center gap-3 text-white/50 transition-colors hover:text-[#FF0000]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium leading-none">YouTube</p>
                    <p className="mt-0.5 text-xs text-white/30">@EatRealFoodNYC</p>
                  </div>
                </a>
              </div>
            </div>
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Eat Real Food NYC. All rights reserved.
            <span className="mx-2">&middot;</span>
            <a href="/sitemap.xml" className="text-white/40 transition-colors hover:text-white/60">Sitemap</a>
          </p>
          <SocialLinks variant="footer" showLabels={false} />
        </div>
      </div>
    </footer>
  )
}
