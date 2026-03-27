"use client"

import Link from "next/link"
import { HEALTH_GOALS } from "@/config/health-goals"

export default function EatForYourGoal() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">
              PERSONALISED DISCOVERY
            </p>
            <h2
              className="text-4xl font-bold text-forest"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Eat for your goal
            </h2>
            <p className="mt-3 max-w-lg text-base" style={{ color: "var(--color-muted)" }}>
              Tell us what you are working towards. We will show you the restaurants built around it.
            </p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HEALTH_GOALS.map((goal) => (
            <Link
              key={goal.id}
              href={`/search?${goal.searchParams}`}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:border-sage hover:shadow-lg"
              style={{ backgroundColor: "var(--color-cream)" }}
            >
              {/* Decorative background circle on hover */}
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-sage/10 transition-colors duration-300 group-hover:bg-sage/20" />

              {/* Content */}
              <div className="relative z-10">
                <span className="text-4xl">{goal.emoji}</span>
                <h3
                  className="mt-3 text-lg font-bold text-forest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {goal.label}
                </h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {goal.description}
                </p>

                {/* Tag chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {goal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-jade"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-jade transition-all group-hover:gap-2">
                  Find restaurants
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
