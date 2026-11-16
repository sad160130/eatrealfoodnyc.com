"use server"

import { after } from "next/server"
import { headers } from "next/headers"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { sendNewsletterConfirmation } from "@/lib/newsletter-mail"
import { allowNewsletterConfirmResend, allowNewsletterSignup, releaseNewsletterConfirmResend } from "@/lib/newsletter-rate-limit"
import { isNewsletterEmail } from "@/lib/newsletter-token"

export type NewsletterResult =
  | { ok: true; status: "confirm" | "already" }
  | { ok: false; error: string }

function sourcePath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null
  const path = value.trim()
  if (!path.startsWith("/") || path.length > 200) return null
  if (path.includes("://") || /\s/.test(path)) return null
  return path
}

function queueConfirmation(email: string, releaseSlotOnSkip: boolean) {
  try {
    after(async () => {
      try {
        const result = await sendNewsletterConfirmation(email)
        if (releaseSlotOnSkip && result === "skipped") releaseNewsletterConfirmResend(email)
      } catch {
        console.error("newsletter confirm email failed")
        if (releaseSlotOnSkip) releaseNewsletterConfirmResend(email)
      }
    })
  } catch {
    console.error("newsletter confirm email failed")
    if (releaseSlotOnSkip) releaseNewsletterConfirmResend(email)
  }
}

export async function subscribeNewsletter(formData: FormData): Promise<NewsletterResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const consent = formData.get("consent") === "yes"
  const source = sourcePath(formData.get("source_path"))

  if (!consent) return { ok: false, error: "Please confirm you want the weekly email." }
  if (!isNewsletterEmail(email)) return { ok: false, error: "Enter a valid email address." }
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
      try {
        const existing = await prisma.newsletterSubscriber.findUnique({
          where: { email },
          select: { confirmed: true },
        })
        if (existing?.confirmed) return { ok: true, status: "already" }
        if (allowNewsletterConfirmResend(email)) queueConfirmation(email, true)
      } catch {
        console.error("newsletter duplicate lookup failed")
      }
      return { ok: true, status: "confirm" }
    }
    // Vercel runs `prisma generate && next build` and does not apply migrations.
    // A missing newsletter_subscribers table, or any other write failure, returns
    // this message instead of throwing out of the server action.
    console.error("newsletter signup failed")
    return { ok: false, error: "We couldn't save that signup. Please try again." }
  }

  queueConfirmation(email, false)
  return { ok: true, status: "confirm" }
}
