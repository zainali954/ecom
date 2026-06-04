export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  isActive: boolean;
  emailVerified: string | null;
  createdAt: string;
}

export interface AdminUsersPageData {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent: string | null;
  parentName: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoriesPageData {
  categories: AdminCategory[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: { url: string; alt: string; sortOrder: number }[];
  category: { id: string; name: string };
  type: "simple" | "variable";
  basePrice: number;
  salePrice: number | null;
  sku: string;
  attributes: {
    attributeId: string;
    attributeName: string;
    values: { id: string; value: string }[];
  }[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  tags: string[];
  variantCount: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductsPageData {
  products: AdminProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminProductVariant {
  id: string;
  attributes: {
    attributeId: string;
    attributeName: string;
    valueId: string;
    value: string;
  }[];
  price: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
}

export interface AdminInventoryItem {
  id: string;
  product: { id: string; name: string; slug: string; type: "simple" | "variable" };
  variant: {
    id: string;
    attributes: { attributeName: string; value: string }[];
  } | null;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInventoryPageData {
  items: AdminInventoryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: { id: string; name: string; email: string };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  itemCount: number;
  notes: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: string;
  name: string;
  sku: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId: string | null;
}

export interface AdminOrdersPageData {
  orders: AdminOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCouponsPageData {
  coupons: AdminCoupon[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AttributeOption {
  id: string;
  name: string;
  slug: string;
  affectsPrice: boolean;
  affectsStock: boolean;
  affectsSku: boolean;
  values: { id: string; value: string; slug: string }[];
}
