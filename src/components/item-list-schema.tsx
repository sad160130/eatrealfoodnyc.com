interface ListItem {
  name: string
  url: string
  position: number
}

interface ItemListSchemaProps {
  items: ListItem[]
  name: string
  description: string
}

export default function ItemListSchema({ items, name, description }: ItemListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
