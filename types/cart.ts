export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  variantId: string | null;
  variantLabel: string;
  quantity: number;
  price: number;
  stock: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
