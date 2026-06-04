import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Order } from "@/models/order";
import { OrderItem } from "@/models/order-item";
import type { OrderSummary, OrderDetail, OrdersPageData, OrderItemDetail } from "@/types/order";

const ORDERS_PER_PAGE = 10;

export async function getUserOrders(page = 1, status?: string): Promise<OrdersPageData> {
  const session = await auth();
  if (!session?.user?.id) return { orders: [], total: 0, page: 1, totalPages: 0 };

  await connectDB();

  const filter: Record<string, unknown> = { user: session.user.id };
  if (status && status !== "all") {
    filter.status = status;
  }

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * ORDERS_PER_PAGE)
      .limit(ORDERS_PER_PAGE)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const orderIds = docs.map((d) => d._id);
  const itemCounts = await OrderItem.aggregate([
    { $match: { order: { $in: orderIds } } },
    { $group: { _id: "$order", count: { $sum: "$quantity" } } },
  ]);

  const countMap = new Map<string, number>();
  for (const ic of itemCounts) {
    countMap.set(String(ic._id), ic.count as number);
  }

  const orders: OrderSummary[] = docs.map((doc) => {
    const id = String(doc._id);
    return {
      id,
      orderNumber: doc.orderNumber as string,
      status: doc.status as OrderSummary["status"],
      paymentStatus: doc.paymentStatus as OrderSummary["paymentStatus"],
      paymentMethod: doc.paymentMethod as string,
      total: doc.total as number,
      itemCount: countMap.get(id) ?? 0,
      createdAt: (doc as Record<string, unknown>).createdAt
        ? new Date((doc as Record<string, unknown>).createdAt as string).toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / ORDERS_PER_PAGE),
  };
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();

  const doc = await Order.findOne({ _id: orderId, user: session.user.id }).lean();
  if (!doc) return null;

  const o = doc as Record<string, unknown>;
  const addr = o.shippingAddress as Record<string, unknown>;

  const rawItems = await OrderItem.find({ order: orderId }).populate("product", "slug").lean();

  const items: OrderItemDetail[] = rawItems.map((item) => {
    const i = item as Record<string, unknown>;
    const product = i.product as Record<string, unknown> | null;
    return {
      id: String(i._id),
      name: i.name as string,
      sku: (i.sku as string) ?? "",
      variantLabel: (i.variantLabel as string) ?? "",
      quantity: i.quantity as number,
      unitPrice: i.unitPrice as number,
      totalPrice: i.totalPrice as number,
      productSlug: product?.slug ? (product.slug as string) : null,
    };
  });

  return {
    id: String(doc._id),
    orderNumber: o.orderNumber as string,
    status: o.status as OrderDetail["status"],
    paymentMethod: o.paymentMethod as string,
    paymentStatus: o.paymentStatus as OrderDetail["paymentStatus"],
    subtotal: o.subtotal as number,
    shippingCost: o.shippingCost as number,
    discount: o.discount as number,
    total: o.total as number,
    notes: (o.notes as string) ?? "",
    createdAt: o.createdAt
      ? new Date(o.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: o.updatedAt
      ? new Date(o.updatedAt as string).toISOString()
      : new Date().toISOString(),
    shippingAddress: {
      fullName: addr.fullName as string,
      phone: addr.phone as string,
      alternatePhone: (addr.alternatePhone as string) ?? "",
      province: addr.province as string,
      city: addr.city as string,
      area: addr.area as string,
      addressLine1: addr.addressLine1 as string,
      addressLine2: (addr.addressLine2 as string) ?? "",
      postalCode: (addr.postalCode as string) ?? "",
      landmark: (addr.landmark as string) ?? "",
    },
    items,
  };
}
