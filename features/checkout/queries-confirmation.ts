import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Order } from "@/models/order";
import { OrderItem } from "@/models/order-item";

export interface ConfirmationOrderItem {
  name: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ConfirmationData {
  orderNumber: string;
  status: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    area: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: ConfirmationOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

export async function getOrderConfirmation(orderId: string): Promise<ConfirmationData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();

  const order = await Order.findOne({
    _id: orderId,
    user: session.user.id,
  }).lean();

  if (!order) return null;

  const o = order as Record<string, unknown>;
  const addr = o.shippingAddress as Record<string, unknown>;

  const rawItems = await OrderItem.find({ order: orderId }).lean();

  const items: ConfirmationOrderItem[] = rawItems.map((item) => {
    const i = item as Record<string, unknown>;
    return {
      name: i.name as string,
      variantLabel: (i.variantLabel as string) ?? "",
      quantity: i.quantity as number,
      unitPrice: i.unitPrice as number,
      totalPrice: i.totalPrice as number,
    };
  });

  return {
    orderNumber: o.orderNumber as string,
    status: o.status as string,
    shippingAddress: {
      fullName: addr.fullName as string,
      phone: addr.phone as string,
      addressLine1: addr.addressLine1 as string,
      addressLine2: (addr.addressLine2 as string) ?? "",
      area: addr.area as string,
      city: addr.city as string,
      province: addr.province as string,
      postalCode: (addr.postalCode as string) ?? "",
    },
    items,
    subtotal: o.subtotal as number,
    shippingCost: o.shippingCost as number,
    discount: o.discount as number,
    total: o.total as number,
    paymentMethod: o.paymentMethod as string,
  };
}
