export interface ShopItem {
  id: number
  title: string | null
  posterPath: string | null
  releaseDate: string | null
  price: number
  isOwned: boolean
}

export interface ShopItemsMeta {
  totalItems: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
}

export interface ShopItemsResponse {
  items: ShopItem[]
  meta: ShopItemsMeta
}

export interface ShopItemsParams {
  page?: number
  limit?: number
  ownership?: 'all' | 'owned' | 'unowned'
  sortYear?: 'asc' | 'desc'
  genre?: number
  search?: string
}

export interface OwnedAvatar {
  id: number
  title: string | null
  posterPath: string | null
}

export interface PurchaseAvatarRequest {
  movieId: number
}
