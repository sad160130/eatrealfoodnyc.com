"use server"

import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { allowNewsletterSignup } from "@/lib/newsletter-rate-limit"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type WaitlistResult = { ok: true } | { ok: false; error: string }

export async function joinDataWaitlist(formData: FormData): Promise<WaitlistResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const plan = formData.get("plan") === "yearly" ? "yearly" : "monthly"
  if (!email || email.length > 254 || !EMAIL.test(email)) {
    return { ok: false, error: "Enter a valid email address." }
  }

  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!allowNewsletterSignup(`data-waitlist:${ip}`)) {
    return { ok: false, error: "Too many requests from this network. Try again in a few minutes." }
  }

  try {
    await prisma.userSubmission.create({
      data: {
        restaurant_slug: "nyc-restaurant-compliance-weekly",
        restaurant_name: "NYC Restaurant Compliance Weekly",
        submission_type: "data_waitlist",
        content: [`Early access`, `Email: ${email}`, `Plan: ${plan}`].join("\n"),
        status: "pending",
      },
    })
  } catch {
    console.error("data waitlist failed")
    return { ok: false, error: "We couldn't save that request. Please try again." }
  }

  return { ok: true }
}
