import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderDetail } from "@/features/orders/queries";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";

export const metadata: Metadata = {
  title: "Order Details — DollarShop",
  description: "View your order details and tracking status",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderDetail(orderId);

  if (!order) notFound();

  return <OrderDetailView order={order} />;
}
