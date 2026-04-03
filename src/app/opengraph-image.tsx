import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Eat Real Food NYC — Healthy Restaurant Directory"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1B3A2D",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            The Curated NYC Dining Authority
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Eat Real Food NYC
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#A3B18A",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.5,
            }}
          >
            8,835 healthy restaurants across all 5 boroughs — verified with NYC health inspection grades
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            {["Vegan", "Halal", "Gluten-Free", "Kosher", "Keto"].map((tag) => (
              <div
                key={tag}
                style={{
                  backgroundColor: "rgba(163,177,138,0.25)",
                  color: "#A3B18A",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
