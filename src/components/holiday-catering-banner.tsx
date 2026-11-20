import Link from "next/link"
import { HOLIDAY_CATERING_PATH } from "@/lib/holiday-catering"

/**
 * Seasonal link to the holiday catering landing page.
 * `line` stays one row so the catering form can sit above the fold on a phone.
 */
export default function HolidayCateringBanner({ variant = "card" }: { variant?: "card" | "line" }) {
  if (variant === "line") {
    return (
      <p className="text-sm leading-relaxed">
        <Link
          href={HOLIDAY_CATERING_PATH}
          className="font-semibold underline underline-offset-4"
          style={{ color: "var(--color-jade)" }}
        >
          Holiday party catering in NYC
        </Link>
        <span style={{ color: "var(--color-muted)" }}>
          {" "}
          — Grade A restaurants for group orders. The request is free.
        </span>
      </p>
    )
  }

  return (
    <Link
      href={HOLIDAY_CATERING_PATH}
      className="block max-w-2xl rounded-md border bg-white px-4 py-3"
      style={{ borderColor: "var(--hairline-strong)" }}
    >
      <p className="eyebrow">Holiday season</p>
      <p
        className="mt-1 text-base font-semibold"
        style={{ fontFamily: "Georgia, serif", color: "var(--color-forest)" }}
      >
        Holiday party catering in NYC
      </p>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
        Office holiday catering and Thanksgiving week. Grade A restaurants for group orders. The request is free.
      </p>
    </Link>
  )
}
