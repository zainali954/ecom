import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { OrderItem } from "@/models/order-item";
import type { AdminOrder, AdminOrderItem, AdminOrdersPageData } from "@/types/admin";

const ORDERS_PER_PAGE = 15;

export async function getAdminOrders(
  page = 1,
  search?: string,
  status?: string,
  paymentStatus?: string,
): Promise<AdminOrdersPageData> {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "shippingAddress.fullName": { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (paymentStatus && paymentStatus !== "all") {
    filter.paymentStatus = paymentStatus;
  }

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
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
    countMap.set(String(ic._id), ic.count);
  }

  const orders: AdminOrder[] = docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    const user = d.user as Record<string, unknown> | null;
    const addr = d.shippingAddress as Record<string, unknown>;
    const oid = String(d._id);

    return {
      id: oid,
      orderNumber: d.orderNumber as string,
      customer: user
        ? {
            id: String(user._id),
            name: (user.name as string) ?? "",
            email: (user.email as string) ?? "",
          }
        : { id: "", name: "Deleted User", email: "" },
      status: d.status as AdminOrder["status"],
      paymentMethod: (d.paymentMethod as string) ?? "cod",
      paymentStatus: (d.paymentStatus as AdminOrder["paymentStatus"]) ?? "pending",
      subtotal: (d.subtotal as number) ?? 0,
      shippingCost: (d.shippingCost as number) ?? 0,
      discount: (d.discount as number) ?? 0,
      total: (d.total as number) ?? 0,
      itemCount: countMap.get(oid) ?? 0,
      notes: (d.notes as string) ?? "",
      shippingAddress: {
        fullName: (addr?.fullName as string) ?? "",
        phone: (addr?.phone as string) ?? "",
        alternatePhone: (addr?.alternatePhone as string) ?? "",
        province: (addr?.province as string) ?? "",
        city: (addr?.city as string) ?? "",
        area: (addr?.area as string) ?? "",
        addressLine1: (addr?.addressLine1 as string) ?? "",
        addressLine2: (addr?.addressLine2 as string) ?? "",
        postalCode: (addr?.postalCode as string) ?? "",
        landmark: (addr?.landmark as string) ?? "",
      },
      createdAt: d.createdAt
        ? new Date(d.createdAt as string).toISOString()
        : new Date().toISOString(),
      updatedAt: d.updatedAt
        ? new Date(d.updatedAt as string).toISOString()
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

export async function getAdminOrderById(
  orderId: string,
): Promise<(AdminOrder & { items: AdminOrderItem[] }) | null> {
  await connectDB();

  const doc = await Order.findById(orderId).populate("user", "name email").lean();

  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  const user = d.user as Record<string, unknown> | null;
  const addr = d.shippingAddress as Record<string, unknown>;

  const itemDocs = await OrderItem.find({ order: orderId }).lean();

  const items: AdminOrderItem[] = itemDocs.map((item) => {
    const i = item as Record<string, unknown>;
    return {
      id: String(i._id),
      name: (i.name as string) ?? "",
      sku: (i.sku as string) ?? "",
      variantLabel: (i.variantLabel as string) ?? "",
      quantity: (i.quantity as number) ?? 0,
      unitPrice: (i.unitPrice as number) ?? 0,
      totalPrice: (i.totalPrice as number) ?? 0,
      productId: i.product ? String(i.product) : null,
    };
  });

  return {
    id: String(d._id),
    orderNumber: d.orderNumber as string,
    customer: user
      ? {
          id: String(user._id),
          name: (user.name as string) ?? "",
          email: (user.email as string) ?? "",
        }
      : { id: "", name: "Deleted User", email: "" },
    status: d.status as AdminOrder["status"],
    paymentMethod: (d.paymentMethod as string) ?? "cod",
    paymentStatus: (d.paymentStatus as AdminOrder["paymentStatus"]) ?? "pending",
    subtotal: (d.subtotal as number) ?? 0,
    shippingCost: (d.shippingCost as number) ?? 0,
    discount: (d.discount as number) ?? 0,
    total: (d.total as number) ?? 0,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    notes: (d.notes as string) ?? "",
    shippingAddress: {
      fullName: (addr?.fullName as string) ?? "",
      phone: (addr?.phone as string) ?? "",
      alternatePhone: (addr?.alternatePhone as string) ?? "",
      province: (addr?.province as string) ?? "",
      city: (addr?.city as string) ?? "",
      area: (addr?.area as string) ?? "",
      addressLine1: (addr?.addressLine1 as string) ?? "",
      addressLine2: (addr?.addressLine2 as string) ?? "",
      postalCode: (addr?.postalCode as string) ?? "",
      landmark: (addr?.landmark as string) ?? "",
    },
    createdAt: d.createdAt
      ? new Date(d.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: d.updatedAt
      ? new Date(d.updatedAt as string).toISOString()
      : new Date().toISOString(),
    items,
  };
}
