"use server"

import { headers } from "next/headers"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { allowNewsletterSignup } from "@/lib/newsletter-rate-limit"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type NewsletterResult = { ok: true } | { ok: false; error: string }

function sourcePath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null
  const path = value.trim()
  if (!path.startsWith("/") || path.length > 200) return null
  if (path.includes("://") || /\s/.test(path)) return null
  return path
}

export async function subscribeNewsletter(formData: FormData): Promise<NewsletterResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const consent = formData.get("consent") === "yes"
  const source = sourcePath(formData.get("source_path"))

  if (!consent) return { ok: false, error: "Please confirm you want the weekly email." }
  if (!email || email.length > 254 || !EMAIL.test(email)) {
    return { ok: false, error: "Enter a valid email address." }
  }
  if (!source) return { ok: false, error: "That signup could not be saved." }

  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!allowNewsletterSignup(ip)) {
    return { ok: false, error: "Too many signups from this network. Try again in a few minutes." }
  }

  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        source_path: source,
        confirmed: false,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: true }
    }
    // Vercel runs `prisma generate && next build` and does not apply migrations.
    // A missing newsletter_subscribers table, or any other write failure, returns
    // this message instead of throwing out of the server action.
    console.error("newsletter signup failed")
    return { ok: false, error: "We couldn't save that signup. Please try again." }
  }

  return { ok: true }
}
