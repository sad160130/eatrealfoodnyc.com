import { AFFILIATE_IDS } from "@/config/affiliates"

export type ReserveProvider = "opentable" | "google_maps"
export type DeliveryProvider = "doordash" | "uber_eats"

export interface BookingLink {
  provider: ReserveProvider | DeliveryProvider
  label: string
  href: string
}

function withAffiliate(url: string, param: string, id: string): string {
  if (!id) return url
  const next = new URL(url)
  next.searchParams.set(param, id)
  return next.toString()
}

function query(name: string, address: string): string {
  return `${name} ${address}`.trim()
}

export function reserveLinks(name: string, address: string): BookingLink[] {
  const term = query(name, address)
  return [
    {
      provider: "opentable",
      label: "OpenTable",
      href: withAffiliate(
        `https://www.opentable.com/s?term=${encodeURIComponent(term)}`,
        "ref",
        AFFILIATE_IDS.opentable
      ),
    },
    {
      provider: "google_maps",
      label: "Google Maps",
      href: withAffiliate(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`reserve a table ${term}`)}`,
        "utm_campaign",
        AFFILIATE_IDS.googleMaps
      ),
    },
  ]
}

export function deliveryLinks(name: string, address: string): BookingLink[] {
  const term = query(name, address)
  return [
    {
      provider: "doordash",
      label: "DoorDash",
      href: withAffiliate(
        `https://www.doordash.com/search/store/${encodeURIComponent(name)}`,
        "ref",
        AFFILIATE_IDS.doordash
      ),
    },
    {
      provider: "uber_eats",
      label: "Uber Eats",
      href: withAffiliate(
        `https://www.ubereats.com/search?q=${encodeURIComponent(term)}`,
        "ref",
        AFFILIATE_IDS.uberEats
      ),
    },
  ]
}
