import type { Metadata } from "next";
import { getUserOrders } from "@/features/orders/queries";
import { OrderList } from "@/features/orders/components/order-list";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your order history",
  robots: { index: false, follow: false },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status;

  const data = await getUserOrders(page, status);

  return (
    <div>
      <h2 className="text-lg font-semibold">Orders</h2>
      <p className="mt-1 text-sm text-muted-foreground">View and track your orders</p>

      <div className="mt-6">
        <OrderList data={data} />
      </div>
    </div>
  );
}
