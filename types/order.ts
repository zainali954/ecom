export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderItemDetail {
  id: string;
  name: string;
  sku: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSlug: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    alternatePhone: string;
    province: string;
    city: string;
    area: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    landmark: string;
  };
  items: OrderItemDetail[];
}

export interface OrdersPageData {
  orders: OrderSummary[];
  total: number;
  page: number;
  totalPages: number;
}
