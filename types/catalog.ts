export interface CatalogSearchParams {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  image?: string;
  categorySlug: string;
  categoryName: string;
  createdAt: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  parent: string | null;
}

export interface ProductListResult {
  products: CatalogProduct[];
  pagination: PaginationMeta;
}

export interface FilterCategory {
  name: string;
  slug: string;
  productCount: number;
}
