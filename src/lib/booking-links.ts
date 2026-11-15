export type ReserveProvider = "opentable" | "google_maps"
export type DeliveryProvider = "doordash" | "uber_eats"

export interface BookingLink {
  provider: ReserveProvider | DeliveryProvider
  label: string
  href: string
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
      href: `https://www.opentable.com/s?term=${encodeURIComponent(term)}`,
    },
    {
      provider: "google_maps",
      label: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`reserve a table ${term}`)}`,
    },
  ]
}

export function deliveryLinks(name: string, address: string): BookingLink[] {
  const term = query(name, address)
  return [
    {
      provider: "doordash",
      label: "DoorDash",
      href: `https://www.doordash.com/search/store/${encodeURIComponent(name)}`,
    },
    {
      provider: "uber_eats",
      label: "Uber Eats",
      href: `https://www.ubereats.com/search?q=${encodeURIComponent(term)}`,
    },
  ]
}
