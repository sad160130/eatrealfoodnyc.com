import https from "https"

const SITE = "https://www.eatrealfoodnyc.com"

const PAGES_TO_CHECK = [
  "/",
  "/nyc/manhattan/healthy-restaurants",
  "/nyc/queens/healthy-restaurants",
  "/healthy-restaurants/vegan",
  "/healthy-restaurants/halal",
  "/restaurants/essen",
  "/guides/nyc-health-grades-explained",
  "/about",
]

function fetchPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ""
        res.on("data", (chunk) => {
          data += chunk
        })
        res.on("end", () => resolve(data))
      })
      .on("error", reject)
  })
}

function extractCanonical(html: string): string | null {
  const match = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)
  return match ? match[1] : null
}

async function verifyCanonicals() {
  console.log("\n=== CANONICAL URL VERIFICATION ===\n")
  console.log(`Expected base: ${SITE}\n`)

  let allGood = true

  for (const path of PAGES_TO_CHECK) {
    const url = `${SITE}${path}`
    try {
      const html = await fetchPage(url)
      const canonical = extractCanonical(html)

      const expectedCanonical = path === "/" ? SITE : `${SITE}${path}`

      const isCorrect = canonical === expectedCanonical

      if (!isCorrect) allGood = false

      console.log(`${isCorrect ? "✅" : "❌"} ${path}`)
      if (!isCorrect) {
        console.log(`   Expected:  ${expectedCanonical}`)
        console.log(`   Got:       ${canonical ?? "MISSING"}`)
        console.log()
      }
    } catch {
      console.log(`❌ ${path} — FETCH ERROR`)
      allGood = false
    }
  }

  // Verify sitemap.xml uses www URLs
  console.log("\n--- Sitemap & Robots ---")
  try {
    const sitemap = await fetchPage(`${SITE}/sitemap.xml`)
    const hasWwwUrls = sitemap.includes("https://www.eatrealfoodnyc.com")
    const hasNonWwwUrls = sitemap.includes("https://eatrealfoodnyc.com") && !sitemap.includes("https://www.eatrealfoodnyc.com")
    const hasLocalhostUrls = sitemap.includes("localhost")

    if (hasWwwUrls && !hasNonWwwUrls && !hasLocalhostUrls) {
      console.log("✅ /sitemap.xml — all URLs use https://www.eatrealfoodnyc.com")
    } else {
      allGood = false
      if (hasLocalhostUrls) console.log("❌ /sitemap.xml — contains localhost URLs!")
      if (hasNonWwwUrls) console.log("❌ /sitemap.xml — contains non-www URLs!")
    }
  } catch {
    console.log("❌ /sitemap.xml — FETCH ERROR")
    allGood = false
  }

  // Verify robots.txt points to www sitemap
  try {
    const robots = await fetchPage(`${SITE}/robots.txt`)
    const expectedSitemapLine = `Sitemap: https://www.eatrealfoodnyc.com/sitemap.xml`
    const hasSitemap = robots.includes(expectedSitemapLine)
    const hasLocalhostSitemap = robots.includes("localhost")

    if (hasSitemap && !hasLocalhostSitemap) {
      console.log("✅ /robots.txt — Sitemap points to https://www.eatrealfoodnyc.com/sitemap.xml")
    } else {
      allGood = false
      if (hasLocalhostSitemap) console.log("❌ /robots.txt — contains localhost reference!")
      if (!hasSitemap) console.log(`❌ /robots.txt — missing or wrong Sitemap directive (expected: ${expectedSitemapLine})`)
    }
  } catch {
    console.log("❌ /robots.txt — FETCH ERROR")
    allGood = false
  }

  console.log()
  if (allGood) {
    console.log(
      "✅ All canonicals are correct — submit sitemap to Google Search Console"
    )
  } else {
    console.log("❌ Canonical mismatches found — fix before submitting to Google")
  }
}

verifyCanonicals().catch(console.error)
