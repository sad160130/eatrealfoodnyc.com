import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ComparisonTray from "@/components/comparison-tray"
import { SEO_CONFIG } from "@/config/seo"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B3A2D",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eatrealfoodnyc.com"),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: "%s | Eat Real Food NYC",
  },
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
    url: SEO_CONFIG.siteUrl,
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
  alternates: {
    canonical: "https://www.eatrealfoodnyc.com",
  },
  // Icons handled by Next.js file conventions:
  //   src/app/icon.svg        → favicon
  //   src/app/apple-icon.svg  → apple-touch-icon
  // The legacy PNG variants in /public/ remain as fallbacks for older
  // browsers but the metadata.icons block was removed because it would
  // override the new convention-driven SVG mark.
  manifest: "/site.webmanifest",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <meta name="msapplication-TileColor" content="#1B3A2D" />
      </head>
      <body
        className={`${dmSans.className} antialiased`}
        style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif" }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" role="main" tabIndex={-1} className="pt-16">
          {children}
        </main>
        <Footer />
        <ComparisonTray />
      </body>
    </html>
  )
}
