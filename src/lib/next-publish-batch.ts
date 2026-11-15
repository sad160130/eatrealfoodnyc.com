import type { PrismaClient } from "@prisma/client"
import { isDirectoryEligible } from "../config/publishable-types"

// Single source of truth for "the next 100 to publish."
//
// Both list-next-publish-batch.ts (which surfaces the batch for routing)
// and weekly-publish.ts (which flips is_published) MUST select the same
// rows. A drift between the two silently bypasses the routing/approval
// gate by publishing rows the user never reviewed.
//
// Selection contract:
//   - Order: priorityRank desc, then rating desc (deterministic tiebreaker)
//   - Filters: isDirectoryEligible() in publishable-types.ts
//     (type allowlist, name blocklist, catering-only names, known chains, non-food names)
//   - Over-fetch headroom: limit * 5 to absorb filter losses
//   - Only operational, only currently unpublished
//
// Callers that need additional fields can extend the select object via a
// wrapper; the columns selected here are the minimum needed by both
// list-next-publish-batch.ts and weekly-publish.ts.
export async function getNextPublishBatch(
  prisma: PrismaClient,
  limit = 100
) {
  const candidates = await prisma.restaurant.findMany({
    where: {
      is_published: false,
      business_status: "OPERATIONAL",
    },
    orderBy: [
      { priorityRank: "desc" },
      { rating: "desc" },
    ],
    take: limit * 5,
    select: {
      id: true,
      slug: true,
      name: true,
      borough: true,
      neighborhood: true,
      type: true,
      dietary_tags: true,
      rating: true,
      reviews: true,
    },
  })

  return candidates
    .filter((r) => isDirectoryEligible(r))
    .slice(0, limit)
}
