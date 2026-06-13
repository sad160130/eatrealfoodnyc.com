import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Eat Real Food NYC — Healthy Restaurant Directory"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Cream-on-cream editorial OG. The monumental placard on the left is the
 * brand mark — the same DOHMH-inspired signature used everywhere on the
 * site. Wordmark + dek to the right. A hairline stat strip across the
 * bottom names the numbers that back the directory. No emoji, no pills.
 *
 * Font note: next/og's edge runtime makes Georgia loading fragile, so the
 * type stays in the default sans. The plaque, the palette, the hairline
 * rhythm, and the typographic restraint are doing the brand work here.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#F8F6F1",
          padding: "72px",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 600,
            color: "#2D6A4F",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          The NYC healthy restaurant directory
        </div>

        {/* Main row: plaque + wordmark + dek */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "40px",
            marginTop: "44px",
          }}
        >
          {/* The plaque — brand mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "180px",
              height: "180px",
              backgroundColor: "#1B3A2D",
              borderRadius: "10px",
              flexShrink: 0,
              boxShadow: "0 8px 24px rgba(27, 58, 45, 0.18)",
            }}
          >
            {/* Inset cream border — echoing the real placard frame */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "148px",
                height: "148px",
                border: "2px solid rgba(248, 246, 241, 0.22)",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 120,
                  fontWeight: 700,
                  color: "#F8F6F1",
                  letterSpacing: "-4px",
                  lineHeight: 1,
                }}
              >
                A
              </div>
            </div>
          </div>

          {/* Wordmark + dek */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              paddingTop: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 700,
                color: "#1B3A2D",
                letterSpacing: "-3px",
                lineHeight: 0.95,
              }}
            >
              Eat Real Food NYC
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "28px",
                fontSize: 34,
                color: "#1A1A1A",
                lineHeight: 1.35,
                maxWidth: "780px",
                fontWeight: 400,
              }}
            >
              Healthy restaurants in NYC, graded by the city.
            </div>
          </div>
        </div>

        {/* Spacer pushes the stat strip to the bottom */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Hairline + stat strip */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid rgba(27, 58, 45, 0.18)",
            paddingTop: "26px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "44px",
              fontSize: 24,
              color: "#1A1A1A",
              fontWeight: 500,
            }}
          >
            <Stat number="8,835" label="restaurants tracked" />
            <Dot />
            <Stat number="116" label="neighborhoods" />
            <Dot />
            <Stat number="12" label="dietary tags" />
            <Dot />
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#6B7280",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Sourced from NYC DOHMH
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          fontWeight: 700,
          color: "#1B3A2D",
          letterSpacing: "-1px",
        }}
      >
        {number}
      </div>
      <div style={{ display: "flex", fontSize: 18, color: "#6B7280" }}>
        {label}
      </div>
    </div>
  )
}

function Dot() {
  return (
    <div style={{ display: "flex", fontSize: 20, color: "#6B7280" }}>·</div>
  )
}
