const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const SVG_PATH = path.join(__dirname, "../public/favicon.svg")
const PUBLIC_DIR = path.join(__dirname, "../public")

async function generateFavicons() {
  console.log("Generating favicons from favicon.svg...\n")

  const svgBuffer = fs.readFileSync(SVG_PATH)

  const sizes = [
    { size: 16, output: "favicon-16x16.png" },
    { size: 32, output: "favicon-32x32.png" },
    { size: 48, output: "favicon-48x48.png" },
    { size: 96, output: "favicon-96x96.png" },
    { size: 180, output: "apple-touch-icon.png" },
    { size: 192, output: "android-chrome-192x192.png" },
    { size: 512, output: "android-chrome-512x512.png" },
  ]

  for (const { size, output } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC_DIR, output))
    console.log(`✅ Generated ${output} (${size}x${size})`)
  }

  // favicon.ico — use 32x32 PNG (browsers accept PNG-encoded ICOs)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, "favicon.ico"))
  console.log("✅ Generated favicon.ico (32x32)")

  console.log("\n✅ All favicons generated successfully")
}

generateFavicons().catch((err) => {
  console.error("❌ Error:", err)
  process.exit(1)
})
