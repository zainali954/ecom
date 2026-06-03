export interface ProductImage {
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProductAttributeDetail {
  id: string;
  name: string;
  slug: string;
  affectsPrice: boolean;
  affectsStock: boolean;
  values: ProductAttributeValueDetail[];
}

export interface ProductAttributeValueDetail {
  id: string;
  value: string;
  slug: string;
}

export interface ProductVariantDetail {
  id: string;
  attributes: {
    attributeId: string;
    attributeSlug: string;
    valueId: string;
    valueSlug: string;
    value: string;
  }[];
  price: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  type: "simple" | "variable";
  basePrice: number;
  salePrice: number | null;
  sku: string;
  tags: string[];
  attributes: ProductAttributeDetail[];
  variants: ProductVariantDetail[];
  stock: number;
}
