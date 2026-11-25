import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ComparisonTray from "@/components/comparison-tray"
import { SEO_CONFIG } from "@/config/seo"
import SiteSchema from "@/components/site-schema"
import { loadNavDietTags } from "@/lib/diet-hub-index"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  // The automatic fallback is local("Arial") plus size-adjust. iOS has no
  // Arial, and WebKit can then paint the whole page with zero-size glyphs:
  // the cream canvas looks blank. system-ui is San Francisco on iPhone.
  adjustFontFallback: false,
  variable: "--font-dm-sans",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B3A2D",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eatrealfoodnyc.com"),
  title: "Healthy Restaurants NYC | Eat Real Food NYC",
  description: SEO_CONFIG.defaultDescription,
  applicationName: SEO_CONFIG.siteName,
  authors: [{ name: "Eat Real Food NYC", url: "https://www.eatrealfoodnyc.com" }],
  keywords: [
    "healthy restaurants NYC",
    "NYC restaurant health grades",
    "vegan restaurants New York",
    "halal restaurants NYC",
    "gluten free restaurants NYC",
    "healthy food New York City",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SEO_CONFIG.siteName,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [{ url: SEO_CONFIG.ogImage, width: 1200, height: 630, alt: "Eat Real Food NYC Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    site: SEO_CONFIG.twitterHandle,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [SEO_CONFIG.ogImage],
  },
  // Canonical and og:url are set per page. A value here is inherited by
  // every route that does not override it, including the 404 page.
  // Icons handled by Next.js file conventions:
  //   src/app/icon.svg        → favicon
  //   src/app/apple-icon.svg  → apple-touch-icon
  // The legacy PNG variants in /public/ remain as fallbacks for older
  // browsers but the metadata.icons block was removed because it would
  // override the new convention-driven SVG mark.
  manifest: "/site.webmanifest",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const diets = await loadNavDietTags()
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="msapplication-TileColor" content="#1B3A2D" />
        {/* Restaurant photos all load from googleusercontent.com. Preconnect
            saves ~150-300ms of TCP+TLS handshake before the first image
            request; dns-prefetch is a fallback for browsers that ignore the
            preconnect hint. */}
        <link
          rel="preconnect"
          href="https://lh3.googleusercontent.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://lh3.googleusercontent.com"
        />
      </head>
      <body
        className={`${dmSans.className} antialiased`}
        style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
          backgroundColor: "#F8F6F1",
          color: "#1A1A1A",
        }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <SiteSchema />
        <Header diets={diets} />
        <main id="main-content" role="main" tabIndex={-1} className="pt-16">
          {children}
        </main>
        <Footer />
        <ComparisonTray />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
