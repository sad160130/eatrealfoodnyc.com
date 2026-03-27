export interface Restaurant {
  id: number
  name: string
  slug: string
  type: string | null
  borough: string | null
  neighborhood: string | null
  address: string
  street: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  reviews: number | null
  price_range: number | null
  dietary_tags: string | null
  inspection_grade: string | null
  inspection_date: string | null
  inspection_score: number | null
  description: string | null
  phone: string | null
  website: string | null
  working_hours: string | null
  photo: string | null
  street_view: string | null
  business_status: string | null
  is_hidden_gem: boolean
  created_at: string | Date
  updated_at: string | Date
}

export interface SearchResponse {
  restaurants: Restaurant[]
  total: number
  page: number
  totalPages: number
}

export type DietaryTag =
  | 'vegan' | 'vegetarian' | 'gluten-free' | 'keto' | 'paleo'
  | 'halal' | 'kosher' | 'dairy-free' | 'nut-free' | 'raw-food'
  | 'whole-foods' | 'low-calorie'
