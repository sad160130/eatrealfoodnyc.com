import { prisma } from "@/lib/db"

export async function confirmNewsletterSubscriber(email: string): Promise<"confirmed" | "missing" | "error"> {
  try {
    const updated = await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { confirmed: true },
    })
    return updated.count > 0 ? "confirmed" : "missing"
  } catch {
    console.error("newsletter confirm failed")
    return "error"
  }
}

/**
 * Keep the row and set confirmed false so the next issue skips the address.
 * If the update cannot run, delete the row instead. A missing row is still
 * treated as unsubscribed: there is nothing left to mail.
 */
export async function unsubscribeNewsletterSubscriber(email: string): Promise<"removed" | "error"> {
  try {
    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { confirmed: false },
    })
    return "removed"
  } catch {
    try {
      await prisma.newsletterSubscriber.deleteMany({ where: { email } })
      return "removed"
    } catch {
      console.error("newsletter unsubscribe failed")
      return "error"
    }
  }
}
