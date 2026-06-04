import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminOrderById } from "@/features/admin/queries/orders";
import { OrderDetailView } from "@/features/admin/components/orders/order-detail-view";
import { Button } from "@/components/ui/button";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireAdmin();
  const { orderId } = await params;

  const order = await getAdminOrderById(orderId);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">← Back to Orders</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Order {order.orderNumber}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Placed by {order.customer.name}</p>
      </div>

      <OrderDetailView order={order} />
    </div>
  );
}
