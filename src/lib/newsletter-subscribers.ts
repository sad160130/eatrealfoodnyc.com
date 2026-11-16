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
 * Remove the row. If deletion is not possible, leave the row and set confirmed false
 * so a later issue will not include the address.
 */
export async function unsubscribeNewsletterSubscriber(email: string): Promise<"removed" | "error"> {
  try {
    await prisma.newsletterSubscriber.deleteMany({ where: { email } })
    return "removed"
  } catch {
    try {
      await prisma.newsletterSubscriber.updateMany({
        where: { email },
        data: { confirmed: false },
      })
      return "removed"
    } catch {
      console.error("newsletter unsubscribe failed")
      return "error"
    }
  }
}
