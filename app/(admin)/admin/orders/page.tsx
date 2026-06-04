import { requireAdmin } from "@/lib/admin-guard";
import { getAdminOrders } from "@/features/admin/queries/orders";
import { OrderTable } from "@/features/admin/components/orders/order-table";
import { OrderFilters } from "@/features/admin/components/orders/order-filters";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const data = await getAdminOrders(page, params.search, params.status, params.paymentStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage and track customer orders</p>
      </div>

      <OrderFilters />
      <OrderTable data={data} />
    </div>
  );
}
